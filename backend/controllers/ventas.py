from flask import request, jsonify
from database.connection import dbConnection

# ======================= REGISTRAR VENTA ======================= #
def registrar_venta():
    data = request.json
    connection = None
    cursor = None
    
    try:
        connection, err = dbConnection()
        if connection is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Iniciar transacción
        connection.autocommit = False
        cursor = connection.cursor()

        try:
            # 1. Calcular el monto total basado en los detalles
            monto_total = 0.0
            detalles_venta = data.get('Detalle_venta', [])
            
            for detalle in detalles_venta:
                cantidad = float(detalle.get('Cantidad', 0))
                precio_paquete = float(detalle.get('Precio_paquete', 0))
                subtotal = cantidad * precio_paquete
                monto_total += subtotal

            # 2. Query CORREGIDO para insertar venta
            query = """
            INSERT INTO Ventas (
                ID_cliente, 
                Codigo_vendedor, 
                Fecha_salida, 
                Numero_DTE, 
                NIT_cliente, 
                Nombre_factura, 
                Tipo_pago, 
                Monto_total,
                Estado_cobro, 
                Estado_venta
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                data.get('ID_cliente'),
                data.get('Codigo_vendedor'),
                data.get('Fecha_salida'),
                data.get('Numero_DTE'),         
                data.get('NIT_cliente'),        
                data.get('Nombre_factura'),     
                data.get('Tipo_pago'),
                monto_total,  # ¡MONTO TOTAL CALCULADO!
                data.get('Estado_cobro', 'PENDIENTE'),
                data.get('Estado_venta', 'PENDIENTE')
            )

            cursor.execute(query, values)
            id_venta = cursor.lastrowid  # Obtener el ID de la venta recién insertada
            
            print(f"Venta insertada con ID: {id_venta}, Monto total: {monto_total}")

            # 3. Insertar detalles de venta con cálculo de Total
            detalles_insertados = []
            for detalle in detalles_venta:
                cantidad = float(detalle.get('Cantidad', 0))
                precio_paquete = float(detalle.get('Precio_paquete', 0))
                total_detalle = cantidad * precio_paquete  # Calcular total del detalle
                
                query_detalle = """
                INSERT INTO Detalle_venta (
                    ID_venta, 
                    Codigo_producto, 
                    Producto, 
                    Cantidad, 
                    Cantidad_unidades, 
                    Precio_paquete, 
                    Total,
                    Observaciones
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                values_detalle = (
                    id_venta,
                    detalle.get('Codigo_producto'),
                    detalle.get('Producto'),
                    detalle.get('Cantidad'),
                    detalle.get('Cantidad_unidades'),
                    precio_paquete,
                    total_detalle,  # ¡TOTAL DEL DETALLE CALCULADO!
                    detalle.get('Observaciones', '')
                )
                
                cursor.execute(query_detalle, values_detalle)
                
                detalles_insertados.append({
                    'codigo_producto': detalle.get('Codigo_producto'),
                    'cantidad': cantidad,
                    'precio_paquete': precio_paquete,
                    'total': total_detalle
                })

            # Confirmar transacción
            connection.commit()

            return jsonify({
                'message': 'Venta registrada exitosamente',
                'detalles': {
                    'id_venta': id_venta,
                    'monto_total': monto_total,
                    'total_productos': len(detalles_insertados),
                    'productos': detalles_insertados
                }
            }), 201

        except Exception as e:
            connection.rollback()
            raise e

    except Exception as ex:
        return jsonify({'message': f'Error al registrar la venta: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# ======================= CONSULTAR VENTAS ======================= #
def consultar_ventas():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Obtener todas las ventas
        query_ventas = "SELECT * FROM Ventas"
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query_ventas)
        ventas = cursor.fetchall()

        # Para cada venta, obtener su detalle
        for venta in ventas:
            query_detalle = """
                SELECT * FROM Detalle_venta WHERE ID_venta = %s
            """
            cursor.execute(query_detalle, (venta['ID_venta'],))
            detalles = cursor.fetchall()
            venta['detalle'] = detalles

        cursor.close()
        mydb.close()

        return jsonify(ventas), 200

    except Exception as ex:
        return jsonify({'message': f'Error al consultar las ventas: {ex}'}), 500
    
# ======================= ANULAR VENTA ======================= #
def anular_venta(id_venta):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        UPDATE Ventas
        SET Estado_venta = 'Anulada'
        WHERE ID_venta = %s
        """
        
        cursor = mydb.cursor()
        cursor.execute(query, (id_venta,))
        mydb.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Venta no encontrada o ya anulada'}), 404
        
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Venta anulada exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al anular la venta: {ex}'}), 500
    

# ======================= CONSULTAR VENTA POR ID ======================= #
def consultar_venta_por_id(id_venta):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query_venta = "SELECT * FROM Ventas WHERE ID_venta = %s"
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query_venta, (id_venta,))
        venta = cursor.fetchone()

        if not venta:
            return jsonify({'message': 'Venta no encontrada'}), 404

        # Obtener el detalle de la venta
        query_detalle = """
            SELECT * FROM Detalle_venta WHERE ID_venta = %s
        """
        cursor.execute(query_detalle, (id_venta,))
        detalles = cursor.fetchall()
        venta['detalle'] = detalles

        cursor.close()
        mydb.close()

        return jsonify(venta), 200

    except Exception as ex:
        return jsonify({'message': f'Error al consultar la venta: {ex}'}), 500