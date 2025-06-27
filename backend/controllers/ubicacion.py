from flask import jsonify, request
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS DEPARTAMENTOS ======================= #
def get_departamentos():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Departamentos")
        departamentos = cursor.fetchall()
        cursor.close()
        mydb.close()
        return jsonify(departamentos), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener departamentos: {ex}'}), 500

# ======================= OBTENER TODOS LOS MUNICIPIOS ======================= #
def get_municipios():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Municipios")
        municipios = cursor.fetchall()
        cursor.close()
        mydb.close()
        return jsonify(municipios), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener municipios: {ex}'}), 500

# ======================= OBTENER MUNICIPIOS POR DEPARTAMENTO ======================= #
def get_municipios_by_departamento(cod_departamento):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Municipios WHERE Cod_departamento = %s", (cod_departamento,))
        municipios = cursor.fetchall()
        cursor.close()
        mydb.close()

        if municipios:
            return jsonify(municipios), 200
        else:
            return jsonify({'message': 'No se encontraron municipios para este departamento'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar municipios: {ex}'}), 500

# ======================= OBTENER DEPARTAMENTO POR ID ======================= #
def get_departamento_by_id(cod_departamento):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Departamentos WHERE Cod_departamento = %s", (cod_departamento,))
        departamento = cursor.fetchone()
        cursor.close()
        mydb.close()
        if departamento:
            return jsonify(departamento), 200
        else:
            return jsonify({'message': 'Departamento no encontrado'}), 404
    except Exception as ex:
        return jsonify({'message': f'Error al obtener departamento: {ex}'}), 500

# ======================= OBTENER MUNICIPIO POR ID ======================= #
def get_municipio_by_id(cod_municipio):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Municipios WHERE Cod_municipio = %s", (cod_municipio,))
        municipio = cursor.fetchone()
        cursor.close()
        mydb.close()
        if municipio:
            return jsonify(municipio), 200
        else:
            return jsonify({'message': 'Municipio no encontrado'}), 404
    except Exception as ex:
        return jsonify({'message': f'Error al obtener municipio: {ex}'}), 500

# ======================= BUSCAR MUNICIPIOS POR NOMBRE ======================= #
def search_municipios_by_nombre():
    nombre = request.args.get('q', '')
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        cursor = mydb.cursor(dictionary=True)
        query = "SELECT * FROM Municipios WHERE Descripcion LIKE %s"
        cursor.execute(query, (f"%{nombre}%",))
        resultados = cursor.fetchall()
        cursor.close()
        mydb.close()
        if resultados:
            return jsonify(resultados), 200
        else:
            return jsonify({'message': 'No se encontraron municipios'}), 404
    except Exception as ex:
        return jsonify({'message': f'Error en búsqueda: {ex}'}), 500

# ======================= BUSCAR DEPARTAMENTOS POR NOMBRE ======================= #
def search_departamentos_by_nombre():
    nombre = request.args.get('q', '')
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        cursor = mydb.cursor(dictionary=True)
        query = "SELECT * FROM Departamentos WHERE Descripcion LIKE %s"
        cursor.execute(query, (f"%{nombre}%",))
        resultados = cursor.fetchall()
        cursor.close()
        mydb.close()
        if resultados:
            return jsonify(resultados), 200
        else:
            return jsonify({'message': 'No se encontraron departamentos'}), 404
    except Exception as ex:
        return jsonify({'message': f'Error en búsqueda: {ex}'}), 500
