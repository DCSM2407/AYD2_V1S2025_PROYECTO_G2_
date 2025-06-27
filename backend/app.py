# ======================== IMPORTACIONES ======================== #
from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from config import config
from controllers import clientes, productos,proveedores, vendedores, importaciones, ventas, pagos, salida
from controllers import ubicacion
from controllers import usuarios, roles

# ===================== VARIABLES GLOBALES ====================== #
dev_config = config['development']()
db = config['database']()

app = Flask(__name__)
CORS(app)

# ===================== CONEXIÓN A MySQL ======================== #
def dbConnection():
    try:
        mydb = mysql.connector.connect(
            host=db.host,
            user=db.user,
            password=db.password,
            database=db.database
        )
        return mydb, None
    except Exception as ex:
        return None, ex

# ============================ RUTAS ============================ #

# Ruta raíz
@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Servidor Python de IMPORCOMGUA funcionando'}), 200

# Ruta de error 404
def rutaNoEncontrada(error):
    return jsonify({'message': 'La página no existe'}), 404

@app.route('/test-db', methods=['GET'])
def test_db():
    mydb, err = dbConnection()
    if err:
        return jsonify({'error': f'No se pudo conectar: {err}'}), 500
    else:
        mydb.close()
        return jsonify({'message': '✅ Conexión exitosa con la base de datos'}), 200

# Rutas para CRUD de Clientes
app.add_url_rule('/api/clientes', view_func=clientes.get_all_clientes, methods=['GET'])
app.add_url_rule('/api/clientes/<id>', view_func=clientes.get_cliente_by_id, methods=['GET'])
app.add_url_rule('/api/clientes', view_func=clientes.create_cliente, methods=['POST'])
app.add_url_rule('/api/clientes/<id>', view_func=clientes.update_cliente, methods=['PUT'])
app.add_url_rule('/api/clientes/<id>', view_func=clientes.delete_cliente, methods=['DELETE'])
app.add_url_rule('/api/clientes/municipio/<int:cod_municipio>', view_func=clientes.get_clientes_by_municipio, methods=['GET'])
app.add_url_rule('/api/clientes/departamento/<cod_departamento>', view_func=clientes.get_clientes_by_departamento, methods=['GET'])
app.add_url_rule('/api/clientes/search', view_func=clientes.search_clientes_by_nombre, methods=['GET'])  # ?q=texto
app.add_url_rule('/api/clientes/<id>/exists', view_func=clientes.check_cliente_exists, methods=['GET'])

# Rutas para CRUD de Productos
app.add_url_rule('/api/productos', view_func=productos.get_all_productos, methods=['GET'])
app.add_url_rule('/api/productos/<codigo>', view_func=productos.get_producto_by_codigo, methods=['GET'])
app.add_url_rule('/api/productos', view_func=productos.create_producto, methods=['POST'])
app.add_url_rule('/api/productos/<codigo>', view_func=productos.update_producto, methods=['PUT'])
app.add_url_rule('/api/productos/<codigo>', view_func=productos.delete_producto, methods=['DELETE'])
app.add_url_rule('/api/productos/buscar', view_func=productos.search_productos_by_nombre, methods=['GET'])
app.add_url_rule('/api/productos/catalogo', view_func=productos.get_catalogo_productos, methods=['GET'])
app.add_url_rule('/api/productos/existe/<codigo>', view_func=productos.check_producto_exists, methods=['GET'])
app.add_url_rule('/api/productos/stock/bajo', view_func=productos.get_productos_stock_bajo, methods=['GET'])
app.add_url_rule('/api/productos/unidad/<int:unidad>', view_func=productos.get_productos_por_unidad, methods=['GET'])

# Rutas para CRUD de Proveedores
app.add_url_rule('/api/proveedores', view_func=proveedores.get_all_proveedores, methods=['GET'])
app.add_url_rule('/api/proveedores/<id>', view_func=proveedores.get_proveedor_by_id, methods=['GET'])
app.add_url_rule('/api/proveedores', view_func=proveedores.create_proveedor, methods=['POST'])
app.add_url_rule('/api/proveedores/<id>', view_func=proveedores.update_proveedor, methods=['PUT'])
app.add_url_rule('/api/proveedores/<id>', view_func=proveedores.delete_proveedor, methods=['DELETE'])
app.add_url_rule('/api/proveedores/pais/<pais_origen>', view_func=proveedores.get_proveedores_by_pais, methods=['GET'])
app.add_url_rule('/api/proveedores/nit/<nit>', view_func=proveedores.get_proveedor_by_nit, methods=['GET'])
app.add_url_rule('/api/proveedores/search', view_func=proveedores.search_proveedores_by_nombre, methods=['GET'])  # ?q=texto
app.add_url_rule('/api/proveedores/<id>/exists', view_func=proveedores.check_proveedor_exists, methods=['GET'])
app.add_url_rule('/api/proveedores/paises', view_func=proveedores.get_paises_proveedores, methods=['GET'])
app.add_url_rule('/api/proveedores/nit/<nit>/exists', view_func=proveedores.check_nit_exists, methods=['GET'])

# Rutas para CRUD de Vendedores
app.add_url_rule('/api/vendedores', view_func=vendedores.get_all_vendedores, methods=['GET'])
app.add_url_rule('/api/vendedores/<int:codigo>', view_func=vendedores.get_vendedor_by_codigo, methods=['GET'])
app.add_url_rule('/api/vendedores', view_func=vendedores.create_vendedor, methods=['POST'])
app.add_url_rule('/api/vendedores/<int:codigo>', view_func=vendedores.update_vendedor, methods=['PUT'])
app.add_url_rule('/api/vendedores/<int:codigo>', view_func=vendedores.delete_vendedor, methods=['DELETE'])
app.add_url_rule('/api/vendedores/search', view_func=vendedores.search_vendedores_by_nombre, methods=['GET'])  # ?q=texto
app.add_url_rule('/api/vendedores/<int:codigo>/exists', view_func=vendedores.check_vendedor_exists, methods=['GET'])
app.add_url_rule('/api/vendedores/comision', view_func=vendedores.get_vendedores_by_comision_range, methods=['GET'])  # ?min=5&max=15
app.add_url_rule('/api/vendedores/top-comision', view_func=vendedores.get_top_vendedores_comision, methods=['GET'])  # ?limit=5
app.add_url_rule('/api/vendedores/estadisticas', view_func=vendedores.get_estadisticas_comisiones, methods=['GET'])

# Rutas para CRUD de Importaciones
app.add_url_rule('/api/importaciones', view_func=importaciones.get_all_importaciones, methods=['GET'])
app.add_url_rule('/api/importaciones/<id>', view_func=importaciones.get_importacion_by_id, methods=['GET'])
app.add_url_rule('/api/importaciones', view_func=importaciones.create_importacion, methods=['POST'])
#app.add_url_rule('/api/importaciones/<id>', view_func=importaciones.update_importacion, methods=['PUT'])
#app.add_url_rule('/api/importaciones/<id>', view_func=importaciones.delete_importacion, methods=['DELETE'])
app.add_url_rule('/api/importaciones/proveedor/<id_proveedor>', view_func=importaciones.get_importaciones_by_proveedor, methods=['GET'])
#app.add_url_rule('/api/importaciones/producto/<codigo_producto>', view_func=importaciones.get_importaciones_by_producto, methods=['GET'])
#app.add_url_rule('/api/importaciones/search', view_func=importaciones.search_importaciones_by_contenedor, methods=['GET'])  # ?q=texto
#app.add_url_rule('/api/importaciones/<id>/exists', view_func=importaciones.check_importacion_exists, methods=['GET'])

# Rutas para CRUD de Ventas
app.add_url_rule('/api/ventas/registrar', view_func=ventas.registrar_venta, methods=['POST'])
app.add_url_rule('/api/ventas', view_func=ventas.consultar_ventas, methods=['GET'])
app.add_url_rule('/api/ventas/anular/<int:id_venta>', view_func=ventas.anular_venta, methods=['PUT'])

# Rutas para CRUD de Pagos 
app.add_url_rule('/api/pagos', view_func=pagos.create_pago, methods=['POST'])
app.add_url_rule('/api/pagos/<id_pago>', view_func=pagos.update_pago, methods=['PUT'])
app.add_url_rule('/api/pagos', view_func=pagos.get_all_pagos, methods=['GET'])
app.add_url_rule('/api/pagos/<id_pago>', view_func=pagos.get_pago_by_id, methods=['GET'])

# Rutas para Salidas de Productos
app.add_url_rule('/api/salidas/ventas-pendientes', view_func=salida.get_ventas_pendientes_salida, methods=['GET'])
app.add_url_rule('/api/salidas/venta/<id_venta>/productos', view_func=salida.get_productos_venta, methods=['GET'])
app.add_url_rule('/api/salidas/venta/<id_venta>/generar', view_func=salida.generar_salida, methods=['POST'])
app.add_url_rule('/api/salidas/historial', view_func=salida.get_historial_salidas, methods=['GET'])
app.add_url_rule('/api/salidas/venta/<id_venta>/verificar-stock', view_func=salida.verificar_stock_venta, methods=['GET'])
# Rutas para Departamentos
app.add_url_rule('/api/departamentos', view_func=ubicacion.get_departamentos, methods=['GET'])
app.add_url_rule('/api/departamentos/<cod_departamento>', view_func=ubicacion.get_departamento_by_id, methods=['GET'])
app.add_url_rule('/api/departamentos/search', view_func=ubicacion.search_departamentos_by_nombre, methods=['GET'])  # ?q=texto

# Rutas para Municipios
app.add_url_rule('/api/municipios', view_func=ubicacion.get_municipios, methods=['GET'])
app.add_url_rule('/api/municipios/<int:cod_municipio>', view_func=ubicacion.get_municipio_by_id, methods=['GET'])
app.add_url_rule('/api/municipios/departamento/<cod_departamento>', view_func=ubicacion.get_municipios_by_departamento, methods=['GET'])
app.add_url_rule('/api/municipios/search', view_func=ubicacion.search_municipios_by_nombre, methods=['GET'])  # ?q=texto

# USUARIOS
app.add_url_rule('/api/usuarios', 'get_all_usuarios', usuarios.get_all_usuarios, methods=['GET'])
app.add_url_rule('/api/usuarios/<id>', 'get_usuario_by_id', usuarios.get_usuario_by_id, methods=['GET'])
app.add_url_rule('/api/usuarios', 'create_usuario', usuarios.create_usuario, methods=['POST'])
app.add_url_rule('/api/usuarios/<id>', 'update_usuario', usuarios.update_usuario, methods=['PUT'])
app.add_url_rule('/api/usuarios/<id>', 'delete_usuario', usuarios.delete_usuario, methods=['DELETE'])
app.add_url_rule('/api/usuarios/search', 'search_usuarios', usuarios.search_usuarios, methods=['GET'])
app.add_url_rule('/api/usuarios/<id_usuario>/exists', 'check_usuario_exists', usuarios.check_usuario_exists, methods=['GET'])
app.add_url_rule('/api/usuarios/login', 'login_usuario', usuarios.login_usuario, methods=['POST'])

# ROLES
app.add_url_rule('/api/roles', 'get_all_roles', roles.get_all_roles, methods=['GET'])

# =============== INICIALIZACIÓN DEL SERVIDOR ================== #
if __name__ == '__main__':
    app.config.from_object(dev_config)
    app.register_error_handler(404, rutaNoEncontrada)
    print(f'Servidor corriendo en puerto {dev_config.PORT}')
    app.run(port=dev_config.PORT, debug=dev_config.DEBUG)
