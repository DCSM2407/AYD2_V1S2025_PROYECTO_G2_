from flask import request, jsonify
from database.connection import dbConnection

# ======================= REGISTRAR PAGO ======================= #
def create_pago():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)

        # 1. Obtener información de la venta
        query_venta = "SELECT Monto_total FROM Ventas WHERE ID_venta = %s"
        cursor.execute(query_venta, (data['ID_venta'],))
        venta = cursor.fetchone()

        if venta is None:
            cursor.close()
            mydb.close()
            return jsonify({'message': 'Venta no encontrada'}), 404

        monto_total = float(venta['Monto_total'])

        # 2. Calcular total abonado hasta ahora
        query_pagos = "SELECT IFNULL(SUM(Monto_abono), 0) AS TotalAbonado FROM Pagos WHERE ID_venta = %s"
        cursor.execute(query_pagos, (data['ID_venta'],))
        pagos = cursor.fetchone()
        total_abonado = float(pagos['TotalAbonado'])

        # 3. Calcular nuevo total abonado y saldo
        nuevo_total_abonado = total_abonado + float(data['Monto_abono'])
        nuevo_saldo = monto_total - nuevo_total_abonado

        # 4. Determinar nuevos estados
        if nuevo_saldo <= 0:
            nuevo_estado_venta = 'Pagada'
            nuevo_estado_cobro = 'Pagado'  # ¡NUEVO CAMPO!
            nuevo_saldo = 0.0  
        elif nuevo_total_abonado == 0:
            nuevo_estado_venta = 'Pendiente'
            nuevo_estado_cobro = 'Pendiente'  # ¡NUEVO CAMPO!
        else:
            nuevo_estado_venta = 'Parcial'
            nuevo_estado_cobro = 'Parcial'  # ¡NUEVO CAMPO!

        # 5. Insertar el nuevo pago
        query_insert_pago = """
            INSERT INTO Pagos (ID_venta, Numero_recibo, Fecha_pago, Banco, No_cuenta, No_transferencia, Monto_abono, Saldo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values_pago = (
            data['ID_venta'],
            data['Numero_recibo'],
            data['Fecha_pago'],
            data['Banco'],
            data['No_cuenta'],
            data.get('No_transferencia'),
            data['Monto_abono'],
            nuevo_saldo
        )
        cursor.execute(query_insert_pago, values_pago)

        # 6. Actualizar AMBOS estados de la venta
        query_update_venta = """
            UPDATE Ventas 
            SET Estado_venta = %s, Estado_cobro = %s 
            WHERE ID_venta = %s
        """
        cursor.execute(query_update_venta, (nuevo_estado_venta, nuevo_estado_cobro, data['ID_venta']))

        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({
            'message': 'Pago registrado y estados de venta actualizados correctamente',
            'detalles': {
                'monto_total': monto_total,
                'total_abonado': nuevo_total_abonado,
                'nuevo_saldo': nuevo_saldo,
                'estado_venta': nuevo_estado_venta,
                'estado_cobro': nuevo_estado_cobro
            }
        }), 201

    except Exception as ex:
        return jsonify({'message': f'Error al registrar pago: {ex}'}), 400

# ======================= ACTUALIZAR PAGO ======================= #
def update_pago(id_pago):
    data = request.json
    connection = None
    cursor = None
    
    try:
        # Validaciones básicas
        if not data:
            return jsonify({'error': 'No se proporcionaron datos para actualizar'}), 400

        connection, err = dbConnection()
        if err or connection is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Iniciar transacción
        connection.autocommit = False
        cursor = connection.cursor(dictionary=True)

        try:
            # 1. Verificar que el pago existe y obtener información actual
            query_pago_actual = """
            SELECT p.*, v.Monto_total, v.Estado_venta, v.Estado_cobro
            FROM Pagos p
            INNER JOIN Ventas v ON p.ID_venta = v.ID_venta
            WHERE p.ID_pago = %s
            """
            cursor.execute(query_pago_actual, (id_pago,))
            pago_actual = cursor.fetchone()

            if not pago_actual:
                connection.rollback()
                return jsonify({'message': 'Pago no encontrado'}), 404

            # 2. VALIDACIÓN PRINCIPAL: Verificar si el saldo es 0 (completamente pagado)
            if float(pago_actual['Saldo']) == 0:
                connection.rollback()
                return jsonify({
                    'error': 'No se puede editar este pago',
                    'motivo': 'La venta ya fue pagada completamente (Saldo = 0)',
                    'saldo_actual': float(pago_actual['Saldo']),
                    'estado_venta': pago_actual['Estado_venta']
                }), 403  # 403 Forbidden

            # 3. Calcular el total abonado SIN este pago específico
            query_otros_pagos = """
            SELECT IFNULL(SUM(Monto_abono), 0) AS TotalOtrosPagos 
            FROM Pagos 
            WHERE ID_venta = %s AND ID_pago != %s
            """
            cursor.execute(query_otros_pagos, (pago_actual['ID_venta'], id_pago))
            otros_pagos = cursor.fetchone()
            total_otros_pagos = float(otros_pagos['TotalOtrosPagos'])

            # 4. Validar el nuevo monto de abono
            nuevo_monto_abono = float(data.get('Monto_abono', pago_actual['Monto_abono']))
            monto_total_venta = float(pago_actual['Monto_total'])
            
            nuevo_total_abonado = total_otros_pagos + nuevo_monto_abono
            
            if nuevo_total_abonado > monto_total_venta:
                connection.rollback()
                return jsonify({
                    'error': 'El monto actualizado excede el total de la venta',
                    'detalles': {
                        'monto_total_venta': monto_total_venta,
                        'otros_pagos': total_otros_pagos,
                        'nuevo_monto_propuesto': nuevo_monto_abono,
                        'maximo_permitido': monto_total_venta - total_otros_pagos
                    }
                }), 400

            # 5. Calcular nuevo saldo y estados
            nuevo_saldo = monto_total_venta - nuevo_total_abonado
            
            if nuevo_saldo <= 0:
                nuevo_estado_venta = 'PAGADA'
                nuevo_estado_cobro = 'PAGADO'
                nuevo_saldo = 0.0
            elif nuevo_total_abonado == 0:
                nuevo_estado_venta = 'PENDIENTE'
                nuevo_estado_cobro = 'PENDIENTE'
            else:
                nuevo_estado_venta = 'PARCIAL'
                nuevo_estado_cobro = 'PARCIAL'

            # 6. Actualizar el pago
            query_update_pago = """
            UPDATE Pagos SET 
                Numero_recibo = %s,
                Fecha_pago = %s,
                Banco = %s,
                No_cuenta = %s,
                No_transferencia = %s,
                Monto_abono = %s,
                Saldo = %s
            WHERE ID_pago = %s
            """
            
            values_update = (
                data.get('Numero_recibo', pago_actual['Numero_recibo']),
                data.get('Fecha_pago', pago_actual['Fecha_pago']),
                data.get('Banco', pago_actual['Banco']),
                data.get('No_cuenta', pago_actual['No_cuenta']),
                data.get('No_transferencia', pago_actual['No_transferencia']),
                nuevo_monto_abono,
                nuevo_saldo,
                id_pago
            )
            
            cursor.execute(query_update_pago, values_update)

            # 7. Actualizar estados de la venta
            query_update_venta = """
            UPDATE Ventas 
            SET Estado_venta = %s, Estado_cobro = %s 
            WHERE ID_venta = %s
            """
            cursor.execute(query_update_venta, (nuevo_estado_venta, nuevo_estado_cobro, pago_actual['ID_venta']))

            # Confirmar transacción
            connection.commit()

            return jsonify({
                'message': 'Pago actualizado correctamente',
                'detalles': {
                    'id_pago': id_pago,
                    'id_venta': pago_actual['ID_venta'],
                    'monto_anterior': float(pago_actual['Monto_abono']),
                    'monto_nuevo': nuevo_monto_abono,
                    'saldo_anterior': float(pago_actual['Saldo']),
                    'saldo_nuevo': nuevo_saldo,
                    'estado_venta': nuevo_estado_venta,
                    'estado_cobro': nuevo_estado_cobro
                }
            }), 200

        except Exception as e:
            connection.rollback()
            raise e

    except ValueError as ve:
        return jsonify({'error': f'Error en los datos numéricos: {str(ve)}'}), 400
    except Exception as ex:
        return jsonify({'message': f'Error al actualizar pago: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



# ======================= OBTENER TODOS LOS PAGOS ======================= #
def get_all_pagos():
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        # Usar dictionary=True para obtener diccionarios con claves
        cursor = mydb.cursor(dictionary=True)
        
        # Query con doble JOIN: Pagos -> Ventas -> Clientes
        query = """
        SELECT 
            p.ID_pago,
            p.ID_venta,
            p.Numero_recibo,
            p.Fecha_pago,
            p.Banco,
            p.No_cuenta,
            p.No_transferencia,
            p.Monto_abono,
            p.Saldo,
            v.ID_cliente,
            v.Monto_total,
            v.Estado_cobro,
            v.Estado_venta,
            v.Fecha_venta,
            v.Nombre_factura,
            v.NIT_cliente,
            COALESCE(c.Nombre_Contacto, c.Nombre_Negocio, v.Nombre_factura, 'Sin nombre') as Nombre_cliente
        FROM Pagos p
        INNER JOIN Ventas v ON p.ID_venta = v.ID_venta
        LEFT JOIN Clientes c ON v.ID_cliente = c.ID_cliente
        ORDER BY p.Fecha_pago DESC, p.ID_pago DESC
        """
        
        cursor.execute(query)
        pagos = cursor.fetchall()
        
        # Formatear fechas para mejor legibilidad
        for pago in pagos:
            # Formatear fecha de pago (DATETIME)
            if pago['Fecha_pago']:
                try:
                    pago['Fecha_pago'] = pago['Fecha_pago'].strftime('%Y-%m-%d %H:%M:%S')
                except:
                    pago['Fecha_pago'] = str(pago['Fecha_pago'])
            
            # Formatear fecha de venta (DATE)
            if pago['Fecha_venta']:
                try:
                    pago['Fecha_venta'] = pago['Fecha_venta'].strftime('%Y-%m-%d')
                except:
                    pago['Fecha_venta'] = str(pago['Fecha_venta'])
            
            # Formatear montos para mejor presentación
            try:
                pago['Monto_abono'] = float(pago['Monto_abono']) if pago['Monto_abono'] is not None else 0.0
                pago['Saldo'] = float(pago['Saldo']) if pago['Saldo'] is not None else 0.0
                pago['Monto_total'] = float(pago['Monto_total']) if pago['Monto_total'] is not None else 0.0
            except (ValueError, TypeError):
                pago['Monto_abono'] = 0.0
                pago['Saldo'] = 0.0
                pago['Monto_total'] = 0.0
        
        return jsonify(pagos), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener los pagos: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

# ======================= OBTENER PAGO POR ID ======================= #
def get_pago_by_id(id_pago):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        query = """
        SELECT 
            p.*,
            v.Monto_total,
            v.Estado_venta,
            v.Fecha_venta
        FROM Pagos p
        INNER JOIN Ventas v ON p.ID_venta = v.ID_venta
        WHERE p.ID_pago = %s
        """
        
        cursor.execute(query, (id_pago,))
        pago = cursor.fetchone()
        
        if pago:
            # Formatear fechas y montos
            if pago['Fecha_pago']:
                pago['Fecha_pago'] = pago['Fecha_pago'].strftime('%Y-%m-%d %H:%M:%S')
            if pago['Fecha_venta']:
                pago['Fecha_venta'] = pago['Fecha_venta'].strftime('%Y-%m-%d %H:%M:%S')
            
            pago['Monto_abono'] = float(pago['Monto_abono'])
            pago['Saldo'] = float(pago['Saldo'])
            pago['Monto_total'] = float(pago['Monto_total'])
            
            return jsonify(pago), 200
        else:
            return jsonify({'message': 'Pago no encontrado'}), 404
            
    except Exception as ex:
        return jsonify({'message': f'Error al obtener el pago: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

# ======================= OBTENER PAGOS POR VENTA ======================= #
def get_pagos_by_venta(id_venta):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        query = """
        SELECT 
            p.*,
            v.Monto_total,
            v.Estado_venta,
            v.Fecha_venta
        FROM Pagos p
        INNER JOIN Ventas v ON p.ID_venta = v.ID_venta
        WHERE p.ID_venta = %s
        ORDER BY p.Fecha_pago DESC
        """
        
        cursor.execute(query, (id_venta,))
        pagos = cursor.fetchall()
        
        # Formatear fechas y montos
        for pago in pagos:
            if pago['Fecha_pago']:
                pago['Fecha_pago'] = pago['Fecha_pago'].strftime('%Y-%m-%d %H:%M:%S')
            if pago['Fecha_venta']:
                pago['Fecha_venta'] = pago['Fecha_venta'].strftime('%Y-%m-%d %H:%M:%S')
            pago['Monto_abono'] = float(pago['Monto_abono'])
            pago['Saldo'] = float(pago['Saldo'])
            pago['Monto_total'] = float(pago['Monto_total'])
        
        return jsonify(pagos), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener pagos de la venta: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()
