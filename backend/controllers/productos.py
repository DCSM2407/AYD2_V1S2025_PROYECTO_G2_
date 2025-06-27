from flask import request, jsonify
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS PRODUCTOS ======================= #
def get_all_productos():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT p.Codigo_producto, c.Nombre_producto, p.Unidad_medida, 
               p.Unidades_por_fardo, p.Cantidad_total
        FROM Productos p
        JOIN Catalogo_Productos c ON p.Codigo_producto = c.Codigo_producto
        """

        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query)
        productos = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(productos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener productos: {ex}'}), 500


# ======================= OBTENER PRODUCTO POR CÓDIGO ======================= #
def get_producto_by_codigo(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT p.Codigo_producto, c.Nombre_producto, p.Unidad_medida, 
               p.Unidades_por_fardo, p.Cantidad_total
        FROM Productos p
        JOIN Catalogo_Productos c ON p.Codigo_producto = c.Codigo_producto
        WHERE p.Codigo_producto = %s
        """

        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (codigo,))
        producto = cursor.fetchone()
        cursor.close()
        mydb.close()

        if producto:
            return jsonify(producto), 200
        else:
            return jsonify({'message': 'Producto no encontrado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al obtener producto: {ex}'}), 500


# ======================= CREAR PRODUCTO ======================= #
def create_producto():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()

        # Insertar en Catalogo_Productos
        cursor.execute("INSERT INTO Catalogo_Productos (Codigo_producto, Nombre_producto) VALUES (%s, %s)", (
            data['Codigo_producto'],
            data['Nombre_producto']
        ))

        # Insertar en Productos
        cursor.execute("""
            INSERT INTO Productos (Codigo_producto, Unidad_medida, Unidades_por_fardo, Cantidad_total)
            VALUES (%s, %s, %s, %s)
        """, (
            data['Codigo_producto'],
            data['Unidad_medida'],
            data['Unidades_por_fardo'],
            data['Cantidad_total']
        ))

        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Producto creado exitosamente'}), 201

    except Exception as ex:
        return jsonify({'message': f'Error al crear producto: {ex}'}), 400


# ======================= ACTUALIZAR PRODUCTO ======================= #
def update_producto(codigo):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()

        # Actualizar Catalogo_Productos
        cursor.execute("UPDATE Catalogo_Productos SET Nombre_producto = %s WHERE Codigo_producto = %s", (
            data['Nombre_producto'],
            codigo
        ))

        # Actualizar Productos
        cursor.execute("""
            UPDATE Productos SET Unidad_medida = %s, Unidades_por_fardo = %s, Cantidad_total = %s
            WHERE Codigo_producto = %s
        """, (
            data['Unidad_medida'],
            data['Unidades_por_fardo'],
            data['Cantidad_total'],
            codigo
        ))

        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Producto actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar producto: {ex}'}), 400


# ======================= ELIMINAR PRODUCTO ======================= #
def delete_producto(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("DELETE FROM Productos WHERE Codigo_producto = %s", (codigo,))
        cursor.execute("DELETE FROM Catalogo_Productos WHERE Codigo_producto = %s", (codigo,))
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Producto eliminado correctamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al eliminar producto: {ex}'}), 400


# ======================= BUSCAR PRODUCTOS POR NOMBRE ======================= #
def search_productos_by_nombre():
    nombre = request.args.get('nombre')
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        query = """
        SELECT p.Codigo_producto, c.Nombre_producto, p.Unidad_medida, 
               p.Unidades_por_fardo, p.Cantidad_total
        FROM Productos p
        JOIN Catalogo_Productos c ON p.Codigo_producto = c.Codigo_producto
        WHERE c.Nombre_producto LIKE %s
        """
        cursor.execute(query, (f"%{nombre}%",))
        productos = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(productos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al buscar productos: {ex}'}), 500

# ======================= LISTAR PRODUCTOS DEL CATÁLOGO ======================= #
def get_catalogo_productos():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT Codigo_producto, Nombre_producto FROM Catalogo_Productos")
        productos = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(productos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener el catálogo de productos: {ex}'}), 500

# ======================= VERIFICAR SI EXISTE PRODUCTO POR CÓDIGO ======================= #
def check_producto_exists(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("SELECT 1 FROM Productos WHERE Codigo_producto = %s", (codigo,))
        existe = cursor.fetchone() is not None
        cursor.close()
        mydb.close()

        return jsonify({'existe': existe}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar producto: {ex}'}), 500

# ======================= LISTAR PRODUCTOS CON STOCK BAJO ======================= #
def get_productos_stock_bajo():
    limite = request.args.get('limite', default=100, type=int)
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT p.Codigo_producto, c.Nombre_producto, p.Cantidad_total
        FROM Productos p
        JOIN Catalogo_Productos c ON p.Codigo_producto = c.Codigo_producto
        WHERE p.Cantidad_total < %s
        """

        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (limite,))
        productos = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(productos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener productos con stock bajo: {ex}'}), 500

# ======================= BUSCAR PRODUCTOS POR UNIDAD DE MEDIDA ======================= #
def get_productos_por_unidad(unidad):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT p.Codigo_producto, c.Nombre_producto, p.Unidad_medida, p.Unidades_por_fardo, p.Cantidad_total
        FROM Productos p
        JOIN Catalogo_Productos c ON p.Codigo_producto = c.Codigo_producto
        WHERE p.Unidad_medida = %s
        """

        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (unidad,))
        productos = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(productos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al buscar productos por unidad: {ex}'}), 500

