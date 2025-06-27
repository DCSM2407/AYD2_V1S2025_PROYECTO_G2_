import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
import pytest
import json

@pytest.fixture
def client():
    app.testing = True
    with app.test_client() as client:
        yield client

# Prueba 1: Login exitoso con usuario real
def test_login_exitoso(client):
    datos = {
        "Correo": "gerente.general@empresa.com",
        "Contrasena": "123456"
    }
    respuesta = client.post("/api/usuarios/login", data=json.dumps(datos), content_type="application/json")
    assert respuesta.status_code == 200
    assert b"Login exitoso" in respuesta.data

# Prueba 2: Login con contraseña incorrecta
def test_login_contrasena_mala(client):
    datos = {
        "Correo": "gerente.general@empresa.com",
        "Contrasena": "clave_incorrecta"
    }
    respuesta = client.post("/api/usuarios/login", data=json.dumps(datos), content_type="application/json")
    assert respuesta.status_code == 401
    assert b"Correo" in respuesta.data

# Prueba 3: Login con campos vacíos
def test_login_vacio(client):
    datos = {}
    respuesta = client.post("/api/usuarios/login", data=json.dumps(datos), content_type="application/json")
    assert respuesta.status_code == 400
    assert b"Correo" in respuesta.data

# Prueba 4: Obtener todos los usuarios
def test_get_usuarios(client):
    respuesta = client.get("/api/usuarios")
    assert respuesta.status_code == 200
    assert isinstance(json.loads(respuesta.data), list)

# Prueba 5: Buscar un usuario inexistente por ID
def test_get_usuario_inexistente(client):
    respuesta = client.get("/api/usuarios/999999")
    assert respuesta.status_code in [404, 500]
