from flask import jsonify
from database.connection import dbConnection

# ======================= OBTENER TODOS LOS ROLES ======================= #
def get_all_roles():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT ID_rol, Nombre_rol FROM Roles")
        roles = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(roles), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener roles: {ex}'}), 500
