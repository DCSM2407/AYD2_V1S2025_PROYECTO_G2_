from flask import request, jsonify
from database.connection import dbConnection



# ======================= LOGIN DE USUARIO ======================= #
def login_usuario():
    data = request.json
    
    # Validar que se proporcionen los datos necesarios
    if not data or 'Correo' not in data or 'Contrasena' not in data:
        return jsonify({'message': 'Correo y contraseña son requeridos'}), 400
    
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Buscar usuario por correo y contraseña
        query = """
        SELECT u.ID_usuario, u.Correo, r.Nombre_rol AS Rol
        FROM Usuarios u
        JOIN Roles r ON u.ID_rol = r.ID_rol
        WHERE u.Correo = %s AND u.Contrasena = %s
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (data['Correo'], data['Contrasena']))
        usuario = cursor.fetchone()
        cursor.close()
        mydb.close()

        if usuario:
            # Login exitoso
            return jsonify({
                'message': 'Login exitoso',
                'usuario': {
                    'ID_usuario': usuario['ID_usuario'],
                    'Correo': usuario['Correo'],
                    'Rol': usuario['Rol']
                }
            }), 200
        else:
            # Credenciales incorrectas
            return jsonify({'message': 'Correo o contraseña incorrectos'}), 401

    except Exception as ex:
        return jsonify({'message': f'Error en el login: {ex}'}), 500

# ======================= OBTENER TODOS LOS USUARIOS ======================= #
def get_all_usuarios():
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT u.ID_usuario, u.Correo, r.Nombre_rol AS Rol
        FROM Usuarios u
        JOIN Roles r ON u.ID_rol = r.ID_rol
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query)
        usuarios = cursor.fetchall()
        cursor.close()
        mydb.close()

        return jsonify(usuarios), 200

    except Exception as ex:
        return jsonify({'message': f'Error al obtener usuarios: {ex}'}), 500

# ======================= OBTENER USUARIO POR ID ======================= #
def get_usuario_by_id(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT u.ID_usuario, u.Correo, r.Nombre_rol AS Rol
        FROM Usuarios u
        JOIN Roles r ON u.ID_rol = r.ID_rol
        WHERE u.ID_usuario = %s
        """
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (id,))
        usuario = cursor.fetchone()
        cursor.close()
        mydb.close()

        if usuario:
            return jsonify(usuario), 200
        else:
            return jsonify({'message': 'Usuario no encontrado'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error al obtener usuario: {ex}'}), 500

# ======================= CREAR USUARIO ======================= #
def create_usuario():
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = "INSERT INTO Usuarios (Correo, Contrasena, ID_rol) VALUES (%s, %s, %s)"
        values = (data['Correo'], data['Contrasena'], data['ID_rol'])

        cursor = mydb.cursor()
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Usuario creado exitosamente'}), 201

    except Exception as ex:
        return jsonify({'message': f'Error al crear usuario: {ex}'}), 400

# ======================= ACTUALIZAR USUARIO ======================= #
# ======================= ACTUALIZAR USUARIO ======================= #
def update_usuario(id):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        
        # Si se envía el nombre del rol, obtener el ID
        if 'Rol' in data:
            cursor.execute("SELECT ID_rol FROM Roles WHERE Nombre_rol = %s", (data['Rol'],))
            rol = cursor.fetchone()
            if rol is None:
                return jsonify({'message': 'Rol no válido'}), 400
            id_rol = rol[0]
        elif 'ID_rol' in data:
            id_rol = data['ID_rol']
        else:
            return jsonify({'message': 'Rol es requerido'}), 400

        # Construir query dinámicamente
        update_fields = []
        values = []
        
        if 'Correo' in data:
            update_fields.append("Correo = %s")
            values.append(data['Correo'])
        
        if 'Contrasena' in data:
            update_fields.append("Contrasena = %s")
            values.append(data['Contrasena'])
        
        update_fields.append("ID_rol = %s")
        values.append(id_rol)
        values.append(id)  # Para el WHERE

        query = f"UPDATE Usuarios SET {', '.join(update_fields)} WHERE ID_usuario = %s"
        
        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Usuario actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar usuario: {ex}'}), 400

'''def update_usuario(id):
    data = request.json
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Suponiendo que ya tienes una función para obtener el ID del rol por nombre
        cursor = mydb.cursor()
        cursor.execute("SELECT ID_rol FROM Roles WHERE Nombre_rol = %s", (data['Rol'],))
        rol = cursor.fetchone()
        if rol is None:
            return jsonify({'message': 'Rol no válido'}), 400

        query = """
        UPDATE Usuarios
        SET Correo = %s, Contrasena = %s, ID_rol = %s
        WHERE ID_usuario = %s
        """
        values = (
            data['Correo_electronico'],
            "123456",  # Reemplaza con valor real o lógica de actualización
            rol[0],
            id
        )

        cursor.execute(query, values)
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Usuario actualizado exitosamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al actualizar usuario: {ex}'}), 400
'''
# ======================= ELIMINAR USUARIO ======================= #
def delete_usuario(id):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("DELETE FROM Usuarios WHERE ID_usuario = %s", (id,))
        mydb.commit()
        cursor.close()
        mydb.close()

        return jsonify({'message': 'Usuario eliminado correctamente'}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al eliminar usuario: {ex}'}), 400

# ======================= BUSCAR USUARIO POR CORREO ======================= #
def search_usuarios():
    q = request.args.get('q', '')
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        query = """
        SELECT u.ID_usuario, u.Correo, r.Nombre_rol AS Rol
        FROM Usuarios u
        JOIN Roles r ON u.ID_rol = r.ID_rol
        WHERE u.Correo LIKE %s
        """
        like_value = f"%{q}%"
        cursor = mydb.cursor(dictionary=True)
        cursor.execute(query, (like_value,))
        resultados = cursor.fetchall()
        cursor.close()
        mydb.close()

        if resultados:
            return jsonify(resultados), 200
        else:
            return jsonify({'message': 'No se encontraron usuarios'}), 404

    except Exception as ex:
        return jsonify({'message': f'Error en búsqueda: {ex}'}), 500

# ======================= VERIFICAR EXISTENCIA DE USUARIO ======================= #
def check_usuario_exists(id_usuario):
    try:
        mydb, err = dbConnection()
        if mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        cursor = mydb.cursor()
        cursor.execute("SELECT COUNT(*) FROM Usuarios WHERE ID_usuario = %s", (id_usuario,))
        exists = cursor.fetchone()[0] > 0
        cursor.close()
        mydb.close()

        return jsonify({'existe': exists}), 200

    except Exception as ex:
        return jsonify({'message': f'Error al verificar usuario: {ex}'}), 500
