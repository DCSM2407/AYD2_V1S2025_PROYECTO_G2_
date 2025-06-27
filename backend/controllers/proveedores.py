from flask import request, jsonify
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS PROVEEDORES ======================= #
def get_all_proveedores():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Proveedores")
        proveedores = cursor.fetchall()
        cursor.close()
        mydb.close()
        return jsonify(proveedores), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener los proveedores: {ex}'}), 500


# ======================= OBTENER PROVEEDOR POR ID ======================= #
def get_proveedor_by_id(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Proveedores WHERE ID_proveedor = %s", (id,))
        proveedor = cursor.fetchone()
        cursor.close()
        mydb.close()

        if proveedor:
            return jsonify(proveedor), 200
        else:
            return jsonify({'message': 'Proveedor no encontrado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al obtener proveedor: {ex}'}), 500


# ======================= CREAR PROVEEDOR ======================= #
def create_proveedor():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        INSERT INTO Proveedores (ID_proveedor, Nombre_proveedor, NIT_proveedor, 
            Pais_origen, Contacto, Direccion, Telefono)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['ID_proveedor'],
            data['Nombre_proveedor'],
            data['NIT_proveedor'],
            data['Pais_origen'],
            data.get('Contacto'),
            data.get('Direccion'),
            data.get('Telefono')
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Proveedor creado exitosamente'}), 201

    except Exception as ex:
        return jsonify({'message': f'Error al crear proveedor: {ex}'}), 400


# ======================= ACTUALIZAR PROVEEDOR ======================= #
def update_proveedor(id):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        UPDATE Proveedores SET
            Nombre_proveedor = %s,
            NIT_proveedor = %s,
            Pais_origen = %s,
            Contacto = %s,
            Direccion = %s,
            Telefono = %s
        WHERE ID_proveedor = %s
        """
        values = (
            data['Nombre_proveedor'],
            data['NIT_proveedor'],
            data['Pais_origen'],
            data.get('Contacto'),
            data.get('Direccion'),
            data.get('Telefono'),
            id
        )

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Proveedor actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar proveedor: {ex}'}), 400


# ======================= ELIMINAR PROVEEDOR ======================= #
def delete_proveedor(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("DELETE FROM Proveedores WHERE ID_proveedor = %s", (id,))
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Proveedor eliminado correctamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al eliminar proveedor: {ex}'}), 400


# ======================= BUSCAR PROVEEDORES POR PAÍS ======================= #
def get_proveedores_by_pais(pais_origen):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Proveedores WHERE Pais_origen = %s", (pais_origen,))
        proveedores = cursor.fetchall()
        cursor.close()
        mydb.close()

        if proveedores:
            return jsonify(proveedores), 200
        else:
            return jsonify({'message': 'No se encontraron proveedores en el país especificado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar por país: {ex}'}), 500


# ======================= BUSCAR PROVEEDOR POR NIT ======================= #
def get_proveedor_by_nit(nit):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Proveedores WHERE NIT_proveedor = %s", (nit,))
        proveedor = cursor.fetchone()
        cursor.close()
        mydb.close()

        if proveedor:
            return jsonify(proveedor), 200
        else:
            return jsonify({'message': 'Proveedor no encontrado con ese NIT'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al buscar por NIT: {ex}'}), 500


# ======================= BUSCAR POR NOMBRE O CONTACTO ======================= #
def search_proveedores_by_nombre():
    palabra_clave = request.args.get('q', '')  # ?q=valor
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT * FROM Proveedores
        WHERE Nombre_proveedor LIKE %s OR Contacto LIKE %s
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


# ======================= VERIFICAR EXISTENCIA DE PROVEEDOR ======================= #
def check_proveedor_exists(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("SELECT COUNT(*) FROM Proveedores WHERE ID_proveedor = %s", (id,))
        exists = cursor.fetchone()[0] > 0
        cursor.close()
        mydb.close()

        return jsonify({'exists': exists}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar proveedor: {ex}'}), 500


# ======================= OBTENER PAÍSES ÚNICOS ======================= #
def get_paises_proveedores():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT DISTINCT Pais_origen FROM Proveedores ORDER BY Pais_origen")
        paises = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(paises), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener países: {ex}'}), 500


# ======================= VERIFICAR NIT ÚNICO ======================= #
def check_nit_exists(nit, exclude_id=None):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        if exclude_id:
            query = "SELECT COUNT(*) FROM Proveedores WHERE NIT_proveedor = %s AND ID_proveedor != %s"
            cursor = mydb.cursor()
            cursor.execute(query, (nit, exclude_id))
        else:
            query = "SELECT COUNT(*) FROM Proveedores WHERE NIT_proveedor = %s"
            cursor = mydb.cursor()
            cursor.execute(query, (nit,))
        
        exists = cursor.fetchone()[0] > 0
        cursor.close()
        mydb.close()

        return jsonify({'exists': exists}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar NIT: {ex}'}), 500
