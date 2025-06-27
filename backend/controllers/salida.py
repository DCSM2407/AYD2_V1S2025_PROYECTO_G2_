import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
from flask import request, jsonify
from database.connection import dbConnection

# ======================= OBTENER VENTAS PENDIENTES DE SALIDA ======================= #
def get_ventas_pendientes_salida():
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        # Query corregido con manejo de valores NULL
        query = """
        SELECT 
            v.ID_venta,
            v.Fecha_venta,
            v.ID_cliente,
            v.Nombre_factura,
            COALESCE(v.Monto_total, 0) as Monto_total,
            COALESCE(v.Estado_venta, 'PENDIENTE') as Estado_venta,
            COALESCE(v.Estado_cobro, 'PENDIENTE') as Estado_cobro,
            COUNT(dv.ID_detalle) as Total_productos
        FROM Ventas v
        LEFT JOIN Detalle_venta dv ON v.ID_venta = dv.ID_venta
        WHERE COALESCE(v.Estado_venta, 'PENDIENTE') != 'COMPLETADA'
        GROUP BY v.ID_venta
        ORDER BY v.Fecha_venta DESC
        """
        
        cursor.execute(query)
        ventas = cursor.fetchall()
        
        # Formatear datos con manejo seguro de valores NULL
        for venta in ventas:
            # Manejo seguro de fechas
            if venta['Fecha_venta'] is not None:
                try:
                    venta['Fecha_venta'] = venta['Fecha_venta'].strftime('%Y-%m-%d')
                except:
                    venta['Fecha_venta'] = str(venta['Fecha_venta'])
            else:
                venta['Fecha_venta'] = None
            
            # Manejo seguro de montos
            try:
                venta['Monto_total'] = float(venta['Monto_total']) if venta['Monto_total'] is not None else 0.0
            except (ValueError, TypeError):
                venta['Monto_total'] = 0.0
        
        return jsonify(ventas), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener ventas pendientes: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

# ======================= OBTENER PRODUCTOS DE UNA VENTA (CORREGIDA) ======================= #
def get_productos_venta(id_venta):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        # Verificar que la venta existe y no está completada
        query_venta = """
        SELECT 
            ID_venta, 
            COALESCE(Estado_venta, 'PENDIENTE') as Estado_venta, 
            ID_cliente, 
            Nombre_factura, 
            COALESCE(Monto_total, 0) as Monto_total, 
            Fecha_venta
        FROM Ventas 
        WHERE ID_venta = %s AND COALESCE(Estado_venta, 'PENDIENTE') != 'COMPLETADA'
        """
        cursor.execute(query_venta, (id_venta,))
        venta = cursor.fetchone()
        
        if not venta:
            return jsonify({'message': 'Venta no encontrada o ya está completada'}), 404
        
        # Query SIN campos de precio - solo información básica del producto
        query_productos = """
        SELECT 
            -- Información del detalle de venta (sin precios)
            dv.ID_detalle,
            dv.Codigo_producto,
            dv.Cantidad,
            dv.Cantidad_unidades,
            dv.Observaciones,
            
            -- Información de la tabla Productos (stock)
            COALESCE(p.Cantidad_total, 0) as Stock_disponible,
            
            -- Información de la tabla Catalogo_Productos (nombre oficial)
            COALESCE(cp.Nombre_producto, dv.Producto, 'Sin nombre') as Nombre_producto
            
        FROM Detalle_venta dv
        INNER JOIN Productos p ON dv.Codigo_producto = p.Codigo_producto
        LEFT JOIN Catalogo_Productos cp ON dv.Codigo_producto = cp.Codigo_producto
        WHERE dv.ID_venta = %s
        ORDER BY dv.ID_detalle
        """
        cursor.execute(query_productos, (id_venta,))
        productos = cursor.fetchall()
        
        # Formatear datos con manejo seguro
        if venta['Fecha_venta'] is not None:
            try:
                venta['Fecha_venta'] = venta['Fecha_venta'].strftime('%Y-%m-%d')
            except:
                venta['Fecha_venta'] = str(venta['Fecha_venta'])
        
        venta['Monto_total'] = float(venta['Monto_total']) if venta['Monto_total'] is not None else 0.0
        
        # Formatear productos SIN campos de precios
        productos_formateados = []
        for producto in productos:
            producto_formateado = {
                'ID_detalle': producto['ID_detalle'],
                'Codigo_producto': producto['Codigo_producto'],
                'Nombre_producto': producto['Nombre_producto'],  # Del catálogo
                'Cantidad': producto['Cantidad'],
                'Cantidad_unidades': producto['Cantidad_unidades'],
                'Stock_disponible': producto['Stock_disponible'],  # De tabla Productos
                'Observaciones': producto['Observaciones']
            }
            
            productos_formateados.append(producto_formateado)
        
        return jsonify({
            'venta': venta,
            'productos': productos_formateados
        }), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener productos de la venta: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

# ======================= GENERAR SALIDA DE PRODUCTOS ======================= #
def generar_salida(id_venta):
    connection = None
    cursor = None
    
    try:
        connection, err = dbConnection()
        if err or connection is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503

        # Iniciar transacción
        connection.autocommit = False
        cursor = connection.cursor(dictionary=True)

        try:
            # 1. Verificar que la venta existe y no está completada
            query_venta = """
            SELECT ID_venta, Estado_venta, ID_cliente, Nombre_factura, Monto_total
            FROM Ventas 
            WHERE ID_venta = %s
            """
            cursor.execute(query_venta, (id_venta,))
            venta = cursor.fetchone()
            
            if not venta:
                connection.rollback()
                return jsonify({'message': 'Venta no encontrada'}), 404
            
            if venta['Estado_venta'] == 'COMPLETADA':
                connection.rollback()
                return jsonify({'message': 'La venta ya está completada'}), 400

            # 2. Query para obtener productos con información de fardos
            query_productos = """
            SELECT 
                dv.Codigo_producto,
                dv.Producto,
                dv.Cantidad as Cantidad_fardos,
                dv.Cantidad_unidades as Unidades_totales,
                COALESCE(p.Cantidad_total, 0) as Stock_actual,
                COALESCE(cp.Nombre_producto, dv.Producto, 'Sin nombre') as Nombre_producto_catalogo
            FROM Detalle_venta dv
            INNER JOIN Productos p ON dv.Codigo_producto = p.Codigo_producto
            LEFT JOIN Catalogo_Productos cp ON dv.Codigo_producto = cp.Codigo_producto
            WHERE dv.ID_venta = %s
            """
            cursor.execute(query_productos, (id_venta,))
            productos = cursor.fetchall()
            
            if not productos:
                connection.rollback()
                return jsonify({'message': 'No se encontraron productos en esta venta'}), 404

            # 3. Validar stock disponible usando Cantidad_unidades (total de unidades)
            productos_sin_stock = []
            for producto in productos:
                stock_actual = producto['Stock_actual'] or 0
                unidades_requeridas = producto['Unidades_totales'] or 0
                
                if stock_actual < unidades_requeridas:
                    productos_sin_stock.append({
                        'codigo': producto['Codigo_producto'],
                        'nombre': producto['Nombre_producto_catalogo'],
                        'stock_disponible': stock_actual,
                        'unidades_requeridas': unidades_requeridas,
                        'fardos_solicitados': producto['Cantidad_fardos']
                    })
            
            if productos_sin_stock:
                connection.rollback()
                return jsonify({
                    'error': 'Stock insuficiente para completar la salida',
                    'productos_sin_stock': productos_sin_stock
                }), 400

            # 4. Actualizar stock usando Cantidad_unidades (total de unidades)
            productos_actualizados = []
            productos_stock_limitado = []
            
            for producto in productos:
                stock_actual = producto['Stock_actual'] or 0
                unidades_totales = producto['Unidades_totales'] or 0
                cantidad_fardos = producto['Cantidad_fardos'] or 0
                nuevo_stock = stock_actual - unidades_totales
                
                query_update_stock = """
                UPDATE Productos 
                SET Cantidad_total = %s 
                WHERE Codigo_producto = %s
                """
                cursor.execute(query_update_stock, (nuevo_stock, producto['Codigo_producto']))
                
                productos_actualizados.append({
                    'codigo_producto': producto['Codigo_producto'],
                    'nombre_producto': producto['Nombre_producto_catalogo'],
                    'cantidad_fardos': cantidad_fardos,
                    'unidades_por_fardo': unidades_totales // cantidad_fardos if cantidad_fardos > 0 else 0,
                    'unidades_totales_salida': unidades_totales,
                    'stock_anterior': stock_actual,
                    'stock_nuevo': nuevo_stock
                })
                
                # Verificar stock limitado
                if nuevo_stock <= 20:
                    productos_stock_limitado.append({
                        'codigo_producto': producto['Codigo_producto'],
                        'nombre_producto': producto['Nombre_producto_catalogo'],
                        'stock_actual': nuevo_stock
                    })

            # 5. ¡CAMBIO AQUÍ! - Actualizar estado de la venta a COMPLETADA y fecha de salida con fecha y hora actual
            query_update_venta = """
            UPDATE Ventas 
            SET Estado_venta = 'COMPLETADA', Fecha_salida = NOW()
            WHERE ID_venta = %s
            """
            cursor.execute(query_update_venta, (id_venta,))

            # Confirmar transacción
            connection.commit()

            # 6. Enviar correos de stock limitado
            if productos_stock_limitado:
                try:
                    emails_gerentes = get_emails_gerentes()
                    
                    if emails_gerentes:
                        for producto_limitado in productos_stock_limitado:
                            for email_gerente in emails_gerentes:
                                enviar_correo_stock_limitado(
                                    codigo_producto=producto_limitado['codigo_producto'],
                                    nombre_producto=producto_limitado['nombre_producto'],
                                    cantidad_actual=producto_limitado['stock_actual'],
                                    cantidad_minima=100,
                                    email_destino=email_gerente
                                )
                        
                        print(f"Correos de stock limitado enviados para {len(productos_stock_limitado)} productos a {len(emails_gerentes)} gerentes")
                    else:
                        print("No se encontraron emails de gerentes para enviar alertas de stock")
                        
                except Exception as email_error:
                    print(f"Error al enviar correos de stock limitado: {email_error}")

            # Obtener la fecha y hora actual para mostrar en la respuesta
            from datetime import datetime
            fecha_salida_actual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            return jsonify({
                'message': 'Salida generada exitosamente',
                'detalles': {
                    'id_venta': id_venta,
                    'cliente': venta['ID_cliente'],
                    'nombre_factura': venta['Nombre_factura'],
                    'monto_total': float(venta['Monto_total']) if venta['Monto_total'] else 0.0,
                    'fecha_salida': fecha_salida_actual,  # ¡AGREGADO!
                    'productos_actualizados': productos_actualizados,
                    'total_productos': len(productos_actualizados),
                    'productos_stock_limitado': len(productos_stock_limitado),
                    'correos_enviados': len(productos_stock_limitado) > 0
                }
            }), 200

        except Exception as e:
            connection.rollback()
            raise e

    except Exception as ex:
        return jsonify({'message': f'Error al generar salida: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# ======================= OBTENER HISTORIAL DE SALIDAS ======================= #
def get_historial_salidas():
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        # Query mejorado con manejo de valores NULL
        query = """
        SELECT 
            v.ID_venta,
            v.Fecha_venta,
            v.Fecha_salida,
            v.ID_cliente,
            v.Nombre_factura,
            COALESCE(v.Monto_total, 0) as Monto_total,
            v.Estado_venta,
            v.Estado_cobro,
            COUNT(dv.ID_detalle) as Total_productos
        FROM Ventas v
        LEFT JOIN Detalle_venta dv ON v.ID_venta = dv.ID_venta
        WHERE v.Estado_venta = 'COMPLETADA'
        GROUP BY v.ID_venta, v.Fecha_venta, v.Fecha_salida, v.ID_cliente, 
                 v.Nombre_factura, v.Monto_total, v.Estado_venta, v.Estado_cobro
        ORDER BY v.Fecha_salida DESC, v.Fecha_venta DESC
        LIMIT 100
        """
        
        cursor.execute(query)
        salidas = cursor.fetchall()
        
        # Formatear datos con manejo seguro de NULL
        salidas_formateadas = []
        for salida in salidas:
            salida_formateada = {
                'ID_venta': salida['ID_venta'],
                'ID_cliente': salida['ID_cliente'] or 'N/A',
                'Nombre_factura': salida['Nombre_factura'] or 'Sin nombre',
                'Estado_venta': salida['Estado_venta'],
                'Estado_cobro': salida['Estado_cobro'] or 'N/A',
                'Total_productos': salida['Total_productos'] or 0
            }
            
            # Manejo seguro de fechas
            try:
                if salida['Fecha_venta'] is not None:
                    salida_formateada['Fecha_venta'] = salida['Fecha_venta'].strftime('%Y-%m-%d')
                else:
                    salida_formateada['Fecha_venta'] = None
            except:
                salida_formateada['Fecha_venta'] = 'Fecha inválida'
            
            try:
                if salida['Fecha_salida'] is not None:
                    salida_formateada['Fecha_salida'] = salida['Fecha_salida'].strftime('%Y-%m-%d')
                else:
                    salida_formateada['Fecha_salida'] = None
            except:
                salida_formateada['Fecha_salida'] = 'Fecha inválida'
            
            # Manejo seguro de monto
            try:
                salida_formateada['Monto_total'] = float(salida['Monto_total']) if salida['Monto_total'] is not None else 0.0
            except (ValueError, TypeError):
                salida_formateada['Monto_total'] = 0.0
            
            salidas_formateadas.append(salida_formateada)
        
        return jsonify(salidas_formateadas), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al obtener historial de salidas: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

# ======================= VERIFICAR STOCK ANTES DE SALIDA (CORREGIDA) ======================= #
def verificar_stock_venta(id_venta):
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            return jsonify({'message': f'Error de conexión: {err}'}), 503
        
        cursor = mydb.cursor(dictionary=True)
        
        # Query con manejo explícito de valores NULL
        query = """
        SELECT 
            dv.Codigo_producto,
            COALESCE(dv.Cantidad_unidades, 0) as Cantidad_requerida,
            COALESCE(dv.Producto, 'Sin nombre') as Nombre_producto,
            COALESCE(cp.Cantidad_total, 0) as Stock_disponible,
            CASE 
                WHEN COALESCE(cp.Cantidad_total, 0) >= COALESCE(dv.Cantidad_unidades, 0) THEN 'DISPONIBLE'
                ELSE 'INSUFICIENTE'
            END as Estado_stock
        FROM Detalle_venta dv
        INNER JOIN Productos cp ON dv.Codigo_producto = cp.Codigo_producto
        WHERE dv.ID_venta = %s
        """
        cursor.execute(query, (id_venta,))
        productos = cursor.fetchall()
        
        # Verificar si se encontraron productos
        if not productos:
            return jsonify({
                'message': 'No se encontraron productos para esta venta',
                'stock_suficiente': False,
                'productos': []
            }), 404
        
        # Validación adicional con manejo seguro
        try:
            stock_suficiente = all(p['Estado_stock'] == 'DISPONIBLE' for p in productos if p['Estado_stock'] is not None)
        except Exception:
            stock_suficiente = False
        
        # Formatear datos para asegurar consistencia
        productos_formateados = []
        for producto in productos:
            producto_formateado = {
                'Codigo_producto': producto['Codigo_producto'] or 'N/A',
                'Cantidad_requerida': int(producto['Cantidad_requerida']) if producto['Cantidad_requerida'] is not None else 0,
                'Nombre_producto': producto['Nombre_producto'] or 'Sin nombre',
                'Stock_disponible': int(producto['Stock_disponible']) if producto['Stock_disponible'] is not None else 0,
                'Estado_stock': producto['Estado_stock'] or 'DESCONOCIDO'
            }
            productos_formateados.append(producto_formateado)
        
        return jsonify({
            'stock_suficiente': stock_suficiente,
            'productos': productos_formateados,
            'total_productos': len(productos_formateados)
        }), 200
        
    except Exception as ex:
        return jsonify({'message': f'Error al verificar stock: {ex}'}), 500
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

def get_emails_gerentes():
    """Obtener correos de usuarios con ID_rol 1 o 3"""
    mydb = None
    cursor = None
    try:
        mydb, err = dbConnection()
        if err or mydb is None:
            print(f'Error de conexión al obtener correos: {err}')
            return []
        
        cursor = mydb.cursor(dictionary=True)
        
        # Query para obtener correos de gerentes con ID_rol 1 o 3
        query = """
        SELECT Correo
        FROM Usuarios
        WHERE ID_rol IN (1, 3)
        AND Correo IS NOT NULL
        AND Correo != ''
        """
        
        cursor.execute(query)
        usuarios = cursor.fetchall()
        
        correos = [usuario['Correo'] for usuario in usuarios if usuario['Correo']]
        return correos
        
    except Exception as ex:
        print(f'Error al obtener correos de gerentes: {ex}')
        return []
    finally:
        if cursor:
            cursor.close()
        if mydb:
            mydb.close()

def enviar_correo_stock_limitado(codigo_producto, nombre_producto, cantidad_actual, cantidad_minima, email_destino):
        
        smtp_server = "smtp.gmail.com" 
        smtp_port = 587
        email_usuario = "impocomgua@gmail.com"
        email_password = "olfoxdvewbvnoebs"
        
        # Crear el mensaje con soporte para imágenes
        mensaje = MIMEMultipart("related")
        mensaje['From'] = email_usuario
        mensaje['To'] = email_destino
        mensaje['Subject'] = f"Imporcomgua - Stock Limitado {codigo_producto}"
        
        # Crear el contenedor HTML
        msg_alternative = MIMEMultipart("alternative")
        mensaje.attach(msg_alternative)
        
        # Cuerpo del correo en HTML con imagen
        cuerpo_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
            <!-- Logo de la empresa -->
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo_imporcomgua" alt="Logo Imporcomgua" style="max-width: 450px; height: auto;">
            </div>
            
            <h2 style="color: #d32f2f; text-align: center;">⚠️ Alerta de Stock Limitado</h2>
            
            <p style="font-size: 16px;">Estimado/a,</p>
            
            <p style="font-size: 14px;">Le informamos que el siguiente producto tiene stock limitado:</p>
            
            <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 14px;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 12px; font-weight: bold;">Código del producto:</td>
                    <td style="padding: 12px;">{codigo_producto}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold;">Nombre del producto:</td>
                    <td style="padding: 12px;">{nombre_producto}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 12px; font-weight: bold;">Cantidad actual en inventario:</td>
                    <td style="padding: 12px; color: red; font-weight: bold; font-size: 16px;">{cantidad_actual}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold;">Cantidad mínima sugerida para reposición:</td>
                    <td style="padding: 12px; color: green; font-weight: bold;">{cantidad_minima}</td>
                </tr>
            </table>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #856404; font-weight: bold; margin: 0;">
                    📦 Se recomienda realizar la reposición correspondiente.
                </p>
            </div>
            
            <p style="font-size: 14px; margin-top: 30px;">
                Saludos cordiales,<br>
                <strong>Equipo Imporcomgua</strong>
            </p>
            
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666; text-align: center;">
                Este es un mensaje automático del sistema de inventario de Imporcomgua
            </p>
        </body>
        </html>
        """
        
        # Adjuntar el HTML
        msg_alternative.attach(MIMEText(cuerpo_html, 'html'))
        
        # Adjuntar la imagen (asegúrate de tener el archivo logo.png en la misma carpeta)
        ruta_imagen = "banner.png"  # Cambia por la ruta de tu logo
        if os.path.exists(ruta_imagen):
            with open(ruta_imagen, 'rb') as f:
                img_data = f.read()
            imagen = MIMEImage(img_data)
            imagen.add_header('Content-ID', '<logo_imporcomgua>')
            mensaje.attach(imagen)
        else:
            print(f"Advertencia: No se encontró la imagen en {ruta_imagen}")
        
        try:
            # Conectar al servidor y enviar
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(email_usuario, email_password)
            texto = mensaje.as_string()
            server.sendmail(email_usuario, email_destino, texto)
            server.quit()
            print(f"Correo con imagen enviado exitosamente para el producto {codigo_producto}")
        except Exception as e:
            print(f"Error al enviar correo: {e}")
