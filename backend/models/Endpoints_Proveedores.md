
# Documentación de Endpoints - Módulo de Proveedores (API Flask)

Este documento describe los endpoints disponibles para gestionar proveedores en la API.

---

## 1. Obtener todos los proveedores
**GET** `/api/proveedores`

**Respuesta esperada (200):**
```json
[
  {
    "ID_proveedor": "PRV001",
    "Nombre_proveedor": "Proveedor Ejemplo",
    "NIT_proveedor": "1234567-8",
    "Pais_origen": "Guatemala",
    "Contacto": "juan.perez@ejemplo.com",
    "Direccion": "Zona 1, Ciudad",
    "Telefono": "5555-5555"
  },
  ...
]
```

---

## 2. Obtener proveedor por ID
**GET** `/api/proveedores/<id>`

**Ejemplo:** `/api/proveedores/PRV001`

**Respuesta esperada (200):**
```json
{
  "ID_proveedor": "PRV001",
  "Nombre_proveedor": "Proveedor Ejemplo",
  ...
}
```

---

## 3. Crear nuevo proveedor
**POST** `/api/proveedores`

**Cuerpo JSON:**
```json
{
  "ID_proveedor": "PRV002",
  "Nombre_proveedor": "Nuevo Proveedor",
  "NIT_proveedor": "9876543-1",
  "Pais_origen": "México",
  "Contacto": "ana.gomez@proveedor.com",
  "Direccion": "Colonia Reforma",
  "Telefono": "4444-4444"
}
```

**Respuesta (201):**
```json
{ "message": "Proveedor creado exitosamente" }
```

---

## 4. Actualizar proveedor
**PUT** `/api/proveedores/<id>`

**Ejemplo:** `/api/proveedores/PRV002`

**Cuerpo JSON:** (mismos campos que en creación)

**Respuesta (200):**
```json
{ "message": "Proveedor actualizado exitosamente" }
```

---

## 5. Eliminar proveedor
**DELETE** `/api/proveedores/<id>`

**Ejemplo:** `/api/proveedores/PRV002`

**Respuesta (200):**
```json
{ "message": "Proveedor eliminado correctamente" }
```

---

## 6. Buscar por país de origen
**GET** `/api/proveedores/pais/<pais_origen>`

**Ejemplo:** `/api/proveedores/pais/Guatemala`

**Respuesta (200):**
Listado de proveedores cuyo país de origen es el indicado.

---

## 7. Buscar proveedor por NIT
**GET** `/api/proveedores/nit/<nit>`

**Ejemplo:** `/api/proveedores/nit/1234567-8`

**Respuesta (200):**
Proveedor con ese NIT.

---

## 8. Búsqueda por nombre o correo
**GET** `/api/proveedores/search?q=palabra_clave`

**Ejemplo:** `/api/proveedores/search?q=juan`

**Respuesta (200):**
Listado de proveedores que coinciden con el nombre o correo.

---

## 9. Verificar si existe proveedor por ID
**GET** `/api/proveedores/<id>/exists`

**Ejemplo:** `/api/proveedores/PRV001/exists`

**Respuesta (200):**
```json
{ "exists": true }
```

---

## 10. Obtener lista de países únicos
**GET** `/api/proveedores/paises`

**Respuesta (200):**
```json
[
  { "Pais_origen": "Guatemala" },
  { "Pais_origen": "México" }
]
```

---

## 11. Verificar existencia de NIT
**GET** `/api/proveedores/nit/<nit>/exists`

**Ejemplo:** `/api/proveedores/nit/1234567-8/exists`

**Respuesta (200):**
```json
{ "exists": true }
```

---

## Notas
- Todos los endpoints devuelven errores con mensajes claros en caso de fallos.
- Los endpoints deben ser consumidos desde un cliente compatible (como Postman, Axios, Fetch, etc.).
