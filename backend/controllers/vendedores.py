from flask import request, jsonify
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS VENDEDORES ======================= #
def get_all_vendedores():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Vendedores")
        vendedores = cursor.fetchall()
        cursor.close()
        mydb.close()
        return jsonify(vendedores), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener los vendedores: {ex}'}), 500


# ======================= OBTENER VENDEDOR POR CÓDIGO ======================= #
def get_vendedor_by_codigo(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Vendedores WHERE Codigo_vendedor = %s", (codigo,))
        vendedor = cursor.fetchone()
        cursor.close()
        mydb.close()

        if vendedor:
            return jsonify(vendedor), 200
        else:
            return jsonify({'message': 'Vendedor no encontrado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al obtener vendedor: {ex}'}), 500


# ======================= CREAR VENDEDOR ======================= #
def create_vendedor():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        INSERT INTO Vendedores (Nombres, Apellidos, Telefono, Direccion, Porcentaje_comision)
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['Nombres'],
            data['Apellidos'],
            data.get('Telefono'),
            data.get('Direccion'),
            data.get('Porcentaje_comision')
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        
        # Obtener el ID generado automáticamente
        nuevo_codigo = cursor.lastrowid
        cursor.close()
        mydb.close()

        return jsonify({
            'message': 'Vendedor creado exitosamente',
            'Codigo_vendedor': nuevo_codigo
        }), 201

    except Exception as ex:
        return jsonify({'message': f'Error al crear vendedor: {ex}'}), 400


# ======================= ACTUALIZAR VENDEDOR ======================= #
def update_vendedor(codigo):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        UPDATE Vendedores SET
            Nombres = %s,
            Apellidos = %s,
            Telefono = %s,
            Direccion = %s,
            Porcentaje_comision = %s
        WHERE Codigo_vendedor = %s
        """
        values = (
            data['Nombres'],
            data['Apellidos'],
            data.get('Telefono'),
            data.get('Direccion'),
            data.get('Porcentaje_comision'),
            codigo
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Vendedor actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar vendedor: {ex}'}), 400


# ======================= ELIMINAR VENDEDOR ======================= #
def delete_vendedor(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("DELETE FROM Vendedores WHERE Codigo_vendedor = %s", (codigo,))
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Vendedor eliminado correctamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al eliminar vendedor: {ex}'}), 400


# ======================= BUSCAR VENDEDORES POR NOMBRE ======================= #
def search_vendedores_by_nombre():
    palabra_clave = request.args.get('q', '')  # ?q=valor
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT * FROM Vendedores
        WHERE Nombres LIKE %s OR Apellidos LIKE %s
        """
        like_value = f"%{palabra_clave}%"
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (like_value, like_value))
        resultados = cursor.fetchall()
        cursor.close()
        mydb.close()

        if resultados:
            return jsonify(resultados), 200
        else:
            return jsonify({'message': 'No se encontraron coincidencias'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error en búsqueda: {ex}'}), 500


# ======================= BUSCAR POR RANGO DE COMISIÓN ======================= #
def get_vendedores_by_comision_range():
    min_comision = request.args.get('min', 0)
    max_comision = request.args.get('max', 100)
    
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT * FROM Vendedores
        WHERE Porcentaje_comision BETWEEN %s AND %s
        ORDER BY Porcentaje_comision DESC
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (min_comision, max_comision))
        vendedores = cursor.fetchall()
        cursor.close()
        mydb.close()

        if vendedores:
            return jsonify(vendedores), 200
        else:
            return jsonify({'message': 'No se encontraron vendedores en ese rango de comisión'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar por comisión: {ex}'}), 500


# ======================= VERIFICAR EXISTENCIA DE VENDEDOR ======================= #
def check_vendedor_exists(codigo):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("SELECT COUNT(*) FROM Vendedores WHERE Codigo_vendedor = %s", (codigo,))
        exists = cursor.fetchone()[0] > 0
        cursor.close()
        mydb.close()

        return jsonify({'exists': exists}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar vendedor: {ex}'}), 500


# ======================= OBTENER VENDEDORES CON MAYOR COMISIÓN ======================= #
def get_top_vendedores_comision():
    limit = request.args.get('limit', 10)
    
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT * FROM Vendedores
        WHERE Porcentaje_comision IS NOT NULL
        ORDER BY Porcentaje_comision DESC
        LIMIT %s
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (limit,))
        vendedores = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(vendedores), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener top vendedores: {ex}'}), 500


# ======================= ESTADÍSTICAS DE COMISIONES ======================= #
def get_estadisticas_comisiones():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT 
            COUNT(*) as total_vendedores,
            AVG(Porcentaje_comision) as promedio_comision,
            MIN(Porcentaje_comision) as min_comision,
            MAX(Porcentaje_comision) as max_comision,
            COUNT(CASE WHEN Porcentaje_comision IS NULL THEN 1 END) as sin_comision
        FROM Vendedores
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query)
        estadisticas = cursor.fetchone()
        cursor.close()
        mydb.close()

        return jsonify(estadisticas), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener estadísticas: {ex}'}), 500
