
# API de Importaciones - Ejemplos de Uso

Este documento contiene ejemplos de cómo utilizar cada una de las rutas disponibles para el manejo de importaciones.

---

## 1. Obtener todas las importaciones

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones`

**Ejemplo con curl:**
```bash
curl http://localhost:5000/api/importaciones
```

---

## 2. Obtener importación por ID

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones/1`

**Ejemplo con curl:**
```bash
curl http://localhost:5000/api/importaciones/1
```

---

## 3. Crear nueva importación

**Método:** POST  
**URL:** `http://localhost:5000/api/importaciones`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "ID_proveedor": "PROV001",
  "Codigo_producto": "PROD001",
  "Fecha_ingreso": "2025-06-21",
  "Producto": "Café en grano",
  "Cantidad_fardos": 100,
  "Unidades_por_fardo": 24,
  "Unidades_totales": 2400,
  "No_contenedor": "CONT123456GT",
  "No_duca": "DUCA987654321",
  "Fecha_duca": "2025-06-20",
  "No_duca_rectificada": "DUCA987654321-R",
  "Fecha_duca_rectificada": "2025-06-21",
  "Observaciones": "Importación urgente"
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:5000/api/importaciones   -H "Content-Type: application/json"   -d @importacion.json
```

---

## 4. Actualizar una importación

**Método:** PUT  
**URL:** `http://localhost:5000/api/importaciones/1`  
**Body:** (mismo formato que el POST)

**Ejemplo con curl:**
```bash
curl -X PUT http://localhost:5000/api/importaciones/1   -H "Content-Type: application/json"   -d @importacion.json
```

---

## 5. Eliminar una importación

**Método:** DELETE  
**URL:** `http://localhost:5000/api/importaciones/1`

**Ejemplo con curl:**
```bash
curl -X DELETE http://localhost:5000/api/importaciones/1
```

---

## 6. Obtener importaciones por ID de proveedor

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones/proveedor/PROV001`

**Ejemplo con curl:**
```bash
curl http://localhost:5000/api/importaciones/proveedor/PROV001
```

---

## 7. Obtener importaciones por código de producto

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones/producto/PROD001`

**Ejemplo con curl:**
```bash
curl http://localhost:5000/api/importaciones/producto/PROD001
```

---

## 8. Buscar importaciones por número de contenedor (con texto parcial)

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones/search?q=CONT123`

**Ejemplo con curl:**
```bash
curl "http://localhost:5000/api/importaciones/search?q=CONT123"
```

---

## 9. Verificar si existe una importación

**Método:** GET  
**URL:** `http://localhost:5000/api/importaciones/1/exists`

**Ejemplo con curl:**
```bash
curl http://localhost:5000/api/importaciones/1/exists
```
