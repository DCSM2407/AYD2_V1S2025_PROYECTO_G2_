
# 📋 Documentación de Endpoints: Módulo Vendedores

## 1. Obtener todos los vendedores
**GET**  
`http://localhost:5000/api/vendedores`

---

## 2. Obtener vendedor por código
**GET**  
`http://localhost:5000/api/vendedores/1`

**Respuesta esperada:**
```json
{
  "Codigo_vendedor": 1,
  "Nombres": "Juan",
  "Apellidos": "Pérez",
  "Telefono": "5555-1234",
  "Direccion": "Zona 1, Guatemala",
  "Porcentaje_comision": 10.0
}
```

---

## 3. Crear nuevo vendedor
**POST**  
`http://localhost:5000/api/vendedores`

**Ejemplo:**
```json
{
  "Nombres": "Carlos",
  "Apellidos": "García",
  "Telefono": "4422-8877",
  "Direccion": "Mixco, Guatemala",
  "Porcentaje_comision": 12.5
}
```

**Respuesta esperada:**
```json
{
  "message": "Vendedor creado exitosamente",
  "Codigo_vendedor": 5
}
```

---

## 4. Actualizar vendedor
**PUT**  
`http://localhost:5000/api/vendedores/5`

**Ejemplo:**
```json
{
  "Nombres": "Carlos",
  "Apellidos": "García Ramírez",
  "Telefono": "4422-8877",
  "Direccion": "Zona 3, Mixco",
  "Porcentaje_comision": 15
}
```

**Respuesta esperada:**
```json
{ "message": "Vendedor actualizado exitosamente" }
```

---

## 5. Eliminar vendedor
**DELETE**  
`http://localhost:5000/api/vendedores/5`

**Respuesta esperada:**
```json
{ "message": "Vendedor eliminado correctamente" }
```

---

## 6. Buscar vendedores por nombre o apellido
**GET**  
`http://localhost:5000/api/vendedores/search?q=Carlos`

**Respuesta esperada:**
```json
[
  {
    "Codigo_vendedor": 3,
    "Nombres": "Carlos",
    "Apellidos": "Ramírez",
    "Telefono": "4411-3322",
    "Direccion": "Villa Nueva",
    "Porcentaje_comision": 11.5
  }
]
```

---

## 7. Buscar vendedores por rango de comisión
**GET**  
`http://localhost:5000/api/vendedores/comision?min=10&max=20`

---

## 8. Verificar si existe vendedor por código
**GET**  
`http://localhost:5000/api/vendedores/1/exists`

**Respuesta esperada:**
```json
{ "exists": true }
```

---

## 9. Obtener top vendedores por comisión
**GET**  
`http://localhost:5000/api/vendedores/top-comision?limit=5`

---

## 10. Obtener estadísticas de comisiones
**GET**  
`http://localhost:5000/api/vendedores/estadisticas`

**Respuesta esperada:**
```json
{
  "total_vendedores": 10,
  "promedio_comision": 12.4,
  "min_comision": 5,
  "max_comision": 20,
  "sin_comision": 0
}
```
