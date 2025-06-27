
# 📘 Documentación de Endpoints - Clientes y Productos

---

## 🧍 CLIENTES

---

### 1. Crear cliente

**Método:** POST  
**URL:** `http://localhost:5000/api/clientes`

#### Ejemplo de cuerpo JSON - Cliente 1
```json
{
  "ID_cliente": "CL001",
  "Cod_departamento": "01",
  "Cod_municipio": 1,
  "Numero_Cliente": "12345678",
  "Nombre_Contacto": "Carlos Pérez",
  "Nombre_Negocio": "Distribuidora El Buen Precio",
  "Direccion": "Zona 1, Guatemala",
  "NIT": 12345678,
  "Encargado_bodega": "Lucía Gómez",
  "Telefono": "5555-5555",
  "Tipo_venta_autorizado": "Contado",
  "Observaciones": "Cliente frecuente"
}
```

(Se incluyen ejemplos para CL002, CL004, CL005 con sus respectivos datos...)

---

### 2. Obtener todos los clientes

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes`

#### Respuesta esperada:
```json
[
  {
    "ID_cliente": "CL001",
    ...
  },
  ...
]
```

---

### 3. Obtener cliente por ID

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes/CL001`

---

### 4. Actualizar cliente

**Método:** PUT  
**URL:** `http://localhost:5000/api/clientes/CL002`

#### Cuerpo JSON:
```json
{
  "Cod_departamento": "02",
  "Cod_municipio": 2,
  "Numero_Cliente": "0002",
  "Nombre_Contacto": "María López",
  "Nombre_Negocio": "Super Tienda Mixco",
  "Direccion": "Zona 5, Mixco",
  "NIT": 88991122,
  "Encargado_bodega": "Carlos Ramírez",
  "Telefono": "4210-9876",
  "Tipo_venta_autorizado": "Crédito",
  "Observaciones": "Dirección actualizada"
}
```

---

### 5. Eliminar cliente

**Método:** DELETE  
**URL:** `http://localhost:5000/api/clientes/CL005`

---

### 6. Buscar clientes por municipio

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes/municipio/1`

---

### 7. Buscar clientes por departamento

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes/departamento/01`

---

### 8. Buscar clientes por nombre/contacto/negocio

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes/search?q=Mixco`

---

### 9. Verificar existencia de cliente por ID

**Método:** GET  
**URL:** `http://localhost:5000/api/clientes/CL001/exists`

---

## 📦 PRODUCTOS

---

### 1. Crear producto

**Método:** POST  
**URL:** `http://localhost:5000/api/productos`

#### Ejemplo de producto:
```json
{
  "Codigo_producto": "PR001",
  "Nombre_producto": "Aceite Ideal",
  "Unidad_medida": 12,
  "Unidades_por_fardo": 24,
  "Cantidad_total": 120
}
```

---

### 2. Obtener todos los productos

**Método:** GET  
**URL:** `http://localhost:5000/api/productos`

---

### 3. Obtener producto por código

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/PR001`

---

### 4. Actualizar producto

**Método:** PUT  
**URL:** `http://localhost:5000/api/productos/PR001`

#### Cuerpo JSON:
```json
{
  "Nombre_producto": "Aceite Ideal Premium",
  "Unidad_medida": 12,
  "Unidades_por_fardo": 30,
  "Cantidad_total": 150
}
```

---

### 5. Eliminar producto

**Método:** DELETE  
**URL:** `http://localhost:5000/api/productos/PR001`

---

### 6. Buscar productos por nombre

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/buscar?nombre=aceite`

---

### 7. Obtener catálogo de productos

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/catalogo`

---

### 8. Verificar existencia de producto

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/existe/PR001`

---

### 9. Productos con stock bajo

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/stock/bajo?limite=150`

---

### 10. Buscar productos por unidad de medida

**Método:** GET  
**URL:** `http://localhost:5000/api/productos/unidad/12`
