from flask import request, jsonify
from database.connection import dbConnection


def get_all_importaciones():
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        # ¡CLAVE! Usar dictionary=True para obtener diccionarios
        cursor = mydb.cursor(dictionary=True)
        
        # Query con JOIN para obtener nombres de proveedor y producto
        query = """
        SELECT 
            i.ID_importacion,
            i.ID_proveedor,
            i.Codigo_producto,
            i.Fecha_ingreso,
            i.Producto,
            i.Cantidad_fardos,
            i.Unidades_por_fardo,
            i.Unidades_totales,
            i.No_contenedor,
            i.No_duca,
            i.Fecha_duca,
            i.No_duca_rectificada,
            i.Fecha_duca_rectificada,
            i.Observaciones,
            p.Nombre_proveedor,
            pr.Nombre_producto
        FROM Importaciones i
        LEFT JOIN Proveedores p ON i.ID_proveedor = p.ID_proveedor
        LEFT JOIN Catalogo_Productos pr ON i.Codigo_producto = pr.Codigo_producto
        ORDER BY i.Fecha_ingreso DESC
        """
        
        cursor.execute(query)
        importaciones = cursor.fetchall()
        
        # Formatear fechas para mejor legibilidad
        for importacion in importaciones:
            if importacion['Fecha_ingreso']:
                importacion['Fecha_ingreso'] = importacion['Fecha_ingreso'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca']:
                importacion['Fecha_duca'] = importacion['Fecha_duca'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca_rectificada']:
                importacion['Fecha_duca_rectificada'] = importacion['Fecha_duca_rectificada'].strftime('%Y-%m-%d')
        
        return jsonify(importaciones), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener las importaciones: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

def get_importacion_by_id(id):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        query = """
        SELECT 
            i.*,
            p.Nombre_proveedor,
            pr.Nombre_producto
        FROM Importaciones i
        LEFT JOIN Proveedores p ON i.ID_proveedor = p.ID_proveedor
        LEFT JOIN Catalogo_Productos pr ON i.Codigo_producto = pr.Codigo_producto
        WHERE i.ID_importacion = %s
        """
        
        cursor.execute(query, (id,))
        importacion = cursor.fetchone()
        
        if importacion:
            # Formatear fechas
            if importacion['Fecha_ingreso']:
                importacion['Fecha_ingreso'] = importacion['Fecha_ingreso'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca']:
                importacion['Fecha_duca'] = importacion['Fecha_duca'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca_rectificada']:
                importacion['Fecha_duca_rectificada'] = importacion['Fecha_duca_rectificada'].strftime('%Y-%m-%d')
            
            return jsonify(importacion), 200
        else:
            return jsonify({'message': 'Importación no encontrada'}), 404
            
    except Exception as ex:
        return jsonify({'message': f'Error al obtener la importación: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

def get_importaciones_by_proveedor(id_proveedor):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        query = """
        SELECT 
            i.*,
            p.Nombre_proveedor,
            pr.Nombre_producto
        FROM Importaciones i
        LEFT JOIN Proveedores p ON i.ID_proveedor = p.ID_proveedor
        LEFT JOIN Catalogo_Productos pr ON i.Codigo_producto = pr.Codigo_producto
        WHERE i.ID_proveedor = %s
        ORDER BY i.Fecha_ingreso DESC
        """
        
        cursor.execute(query, (id_proveedor,))
        importaciones = cursor.fetchall()
        
        # Formatear fechas
        for importacion in importaciones:
            if importacion['Fecha_ingreso']:
                importacion['Fecha_ingreso'] = importacion['Fecha_ingreso'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca']:
                importacion['Fecha_duca'] = importacion['Fecha_duca'].strftime('%Y-%m-%d')
            if importacion['Fecha_duca_rectificada']:
                importacion['Fecha_duca_rectificada'] = importacion['Fecha_duca_rectificada'].strftime('%Y-%m-%d')
        
        return jsonify(importaciones), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener importaciones por proveedor: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

def create_importacion():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        
        # Validaciones básicas
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        required_fields = ['ID_proveedor', 'Codigo_producto', 'Fecha_ingreso', 'Cantidad_fardos', 'Unidades_por_fardo']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es requerido'}), 400
        
        connection, err = dbConnection()
        if err or connection is None:
            return jsonify({'error': f'Error de conexión: {err}'}), 503
        
        cursor = connection.cursor()
        
        # Calcular unidades totales de esta importación
        cantidad_fardos = int(data.get('Cantidad_fardos'))
        unidades_por_fardo = int(data.get('Unidades_por_fardo'))
        unidades_totales_importacion = cantidad_fardos * unidades_por_fardo
        
        # 1. Insertar la nueva importación
        query_insert = """
        INSERT INTO Importaciones (
            ID_proveedor, Codigo_producto, Fecha_ingreso, Producto,
            Cantidad_fardos, Unidades_por_fardo, Unidades_totales,
            No_contenedor, No_duca, Fecha_duca, No_duca_rectificada,
            Fecha_duca_rectificada, Observaciones
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values_insert = (
            data.get('ID_proveedor'),
            data.get('Codigo_producto'),
            data.get('Fecha_ingreso'),
            data.get('Producto'),
            cantidad_fardos,
            unidades_por_fardo,
            unidades_totales_importacion,  # Usar el valor calculado
            data.get('No_contenedor'),
            data.get('No_duca'),
            data.get('Fecha_duca'),
            data.get('No_duca_rectificada'),
            data.get('Fecha_duca_rectificada'),
            data.get('Observaciones')
        )
        
        cursor.execute(query_insert, values_insert)
        
        # 2. Actualizar la cantidad total en la tabla de productos
        # Primero verificamos si el producto existe
        query_check_product = """
        SELECT Cantidad_total FROM Productos 
        WHERE Codigo_producto = %s
        """
        cursor.execute(query_check_product, (data.get('Codigo_producto'),))
        producto_result = cursor.fetchone()
        
        if producto_result:
            # El producto existe, actualizamos la cantidad
            cantidad_actual = producto_result[0] if producto_result[0] is not None else 0
            nueva_cantidad = cantidad_actual + unidades_totales_importacion
            
            query_update_product = """
            UPDATE Productos 
            SET Cantidad_total = %s 
            WHERE Codigo_producto = %s
            """
            cursor.execute(query_update_product, (nueva_cantidad, data.get('Codigo_producto')))
            
            mensaje_producto = f"Inventario actualizado: {cantidad_actual} + {unidades_totales_importacion} = {nueva_cantidad} unidades"
        else:
            # El producto no existe, podríamos crearlo o mostrar advertencia
            mensaje_producto = f"Advertencia: El producto {data.get('Codigo_producto')} no existe en el catálogo"
        
        # Confirmar todas las transacciones
        connection.commit()
        
        return jsonify({
            'message': 'Importación creada exitosamente',
            'detalles': {
                'unidades_importadas': unidades_totales_importacion,
                'inventario': mensaje_producto
            }
        }), 201
        
    except ValueError as ve:
        if connection:
            connection.rollback()
        return jsonify({'error': f'Error en los datos numéricos: {str(ve)}'}), 400
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'error': f'Error de base de datos: {str(e)}'}), 503
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
