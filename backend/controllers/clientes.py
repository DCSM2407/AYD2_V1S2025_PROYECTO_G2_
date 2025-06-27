from flask import request, jsonify
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS CLIENTES ======================= #
def get_all_clientes():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Clientes")
        clientes = cursor.fetchall()
        cursor.close()
        mydb.close()
        return jsonify(clientes), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener los clientes: {ex}'}), 500


# ======================= OBTENER CLIENTE POR ID ======================= #
def get_cliente_by_id(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("select c.*,m.descripcion Municipio from Clientes c inner join Municipios m on c.cod_municipio = m.cod_municipio  where id_cliente =  %s", (id,))
        cliente = cursor.fetchone()
        cursor.close()
        mydb.close()

        if cliente:
            return jsonify(cliente), 200
        else:
            return jsonify({'message': 'Cliente no encontrado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al obtener cliente: {ex}'}), 500


# ======================= CREAR CLIENTE ======================= #
def create_cliente():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        INSERT INTO Clientes (ID_cliente, Cod_departamento, Cod_municipio, Numero_Cliente,
            Nombre_Contacto, Nombre_Negocio, Direccion, NIT, Encargado_bodega,
            Telefono, Tipo_venta_autorizado, Observaciones)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['ID_cliente'],
            data['Cod_departamento'],
            data['Cod_municipio'],
            data['Numero_Cliente'],
            data.get('Nombre_Contacto'),
            data.get('Nombre_Negocio'),
            data.get('Direccion'),
            data.get('NIT'),
            data.get('Encargado_bodega'),
            data.get('Telefono'),
            data.get('Tipo_venta_autorizado'),
            data.get('Observaciones'),
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Cliente creado exitosamente'}), 201

    except Exception as ex:
        return jsonify({'message': f'Error al crear cliente: {ex}'}), 400


# ======================= ACTUALIZAR CLIENTE ======================= #
def update_cliente(id):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        UPDATE Clientes SET
            Cod_departamento = %s,
            Cod_municipio = %s,
            Numero_Cliente = %s,
            Nombre_Contacto = %s,
            Nombre_Negocio = %s,
            Direccion = %s,
            NIT = %s,
            Encargado_bodega = %s,
            Telefono = %s,
            Tipo_venta_autorizado = %s,
            Observaciones = %s
        WHERE ID_cliente = %s
        """
        values = (
            data['Cod_departamento'],
            data['Cod_municipio'],
            data['Numero_Cliente'],
            data.get('Nombre_Contacto'),
            data.get('Nombre_Negocio'),
            data.get('Direccion'),
            data.get('NIT'),
            data.get('Encargado_bodega'),
            data.get('Telefono'),
            data.get('Tipo_venta_autorizado'),
            data.get('Observaciones'),
            id
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Cliente actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar cliente: {ex}'}), 400


# ======================= ELIMINAR CLIENTE ======================= #
def delete_cliente(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("DELETE FROM Clientes WHERE ID_cliente = %s", (id,))
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Cliente eliminado correctamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al eliminar cliente: {ex}'}), 400

# ======================= BUSCAR CLIENTES POR MUNICIPIO ======================= #
def get_clientes_by_municipio(cod_municipio):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Clientes WHERE Cod_municipio = %s", (cod_municipio,))
        clientes = cursor.fetchall()
        cursor.close()
        mydb.close()

        if clientes:
            return jsonify(clientes), 200
        else:
            return jsonify({'message': 'No se encontraron clientes en el municipio especificado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar por municipio: {ex}'}), 500

# ======================= BUSCAR CLIENTES POR DEPARTAMENTO ======================= #
def get_clientes_by_departamento(cod_departamento):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Clientes WHERE Cod_departamento = %s", (cod_departamento,))
        clientes = cursor.fetchall()
        cursor.close()
        mydb.close()

        if clientes:
            return jsonify(clientes), 200
        else:
            return jsonify({'message': 'No se encontraron clientes en el departamento especificado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar por departamento: {ex}'}), 500

# ======================= BUSCAR POR NOMBRE, CONTACTO O NEGOCIO ======================= #
def search_clientes_by_nombre():
    palabra_clave = request.args.get('q', '')  # ?q=valor
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT * FROM Clientes
        WHERE Nombre_Contacto LIKE %s OR Nombre_Negocio LIKE %s
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

# ======================= VERIFICAR EXISTENCIA DE CLIENTE ======================= #
def check_cliente_exists(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("SELECT COUNT(*) FROM Clientes WHERE ID_cliente = %s", (id,))
        exists = cursor.fetchone()[0] > 0
        cursor.close()
        mydb.close()

        return jsonify({'exists': exists}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar cliente: {ex}'}), 500
