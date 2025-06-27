// src/components/Forms/ProductosForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import

const ProductosForm = () => {
  const [productos, setProductos] = useState([])
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    medida: '',
    unidadesPorMedida: '',
    cantidadTotal: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockBajo, setStockBajo] = useState([])

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllProductos()
    fetchProductosStockBajo()
  }, [])

  // ======================= OBTENER TODOS LOS PRODUCTOS ======================= //
  const fetchAllProductos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      setProductos(data)
    } catch (error) {
      console.error('Error al obtener productos:', error)
      alert('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  // ======================= CREAR PRODUCTO ======================= //
  const createProducto = async (productoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear producto')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al crear producto:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ACTUALIZAR PRODUCTO ======================= //
  const updateProducto = async (codigo, productoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar producto')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ELIMINAR PRODUCTO ======================= //
  const deleteProducto = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${codigo}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar producto')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR PRODUCTO POR CÓDIGO ======================= //
  const fetchProductoByCodigo = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/${codigo}`)
      
      if (!response.ok) {
        throw new Error('Producto no encontrado')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al buscar producto:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR PRODUCTOS POR NOMBRE ======================= //
  const searchProductosByNombre = async (nombre) => {
    if (!nombre.trim()) {
      fetchAllProductos()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`)
      
      if (response.ok) {
        const data = await response.json()
        setProductos(data)
      } else {
        setProductos([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  // ======================= VERIFICAR EXISTENCIA DE PRODUCTO ======================= //
  const checkProductoExists = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/existe/${codigo}`)
      
      if (!response.ok) {
        throw new Error('Error al verificar producto')
      }
      
      const data = await response.json()
      return data.existe
    } catch (error) {
      console.error('Error al verificar producto:', error)
      return false
    }
  }

  // ======================= OBTENER PRODUCTOS CON STOCK BAJO ======================= //
  const fetchProductosStockBajo = async (limite = 100) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/stock/bajo?limite=${limite}`)
      
      if (response.ok) {
        const data = await response.json()
        setStockBajo(data)
      }
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error)
    }
  }

  // ======================= OBTENER CATÁLOGO DE PRODUCTOS ======================= //
  const fetchCatalogoProductos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/catalogo`)
      
      if (response.ok) {
        const data = await response.json()
        setProductos(data)
      }
    } catch (error) {
      console.error('Error al obtener catálogo:', error)
    } finally {
      setLoading(false)
    }
  }

  // ======================= MANEJADORES DE EVENTOS ======================= //
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    // Validar campos obligatorios
    if (!formData.codigo || !formData.nombre || !formData.medida) {
      alert('Por favor complete los campos obligatorios: Código, Nombre y Medida')
      return
    }

    setLoading(true)

    try {
      // Preparar datos para enviar
      const productoData = {
        Codigo_producto: formData.codigo,
        Nombre_producto: formData.nombre,
        Unidad_medida: formData.medida,
        Unidades_por_fardo: parseInt(formData.unidadesPorMedida) || 0,
        Cantidad_total: parseInt(formData.cantidadTotal) || 0
      }

      let result

      if (editingId) {
        // Actualizar producto existente
        result = await updateProducto(editingId, productoData)
      } else {
        // Verificar si el código ya existe antes de crear
        const exists = await checkProductoExists(formData.codigo)
        if (exists) {
          alert('Ya existe un producto con este código')
          setLoading(false)
          return
        }
        
        // Crear nuevo producto
        result = await createProducto(productoData)
      }

      if (result.success) {
        alert(result.message)
        handleCancel()
        fetchAllProductos() // Recargar la lista
        fetchProductosStockBajo() // Actualizar stock bajo
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (producto) => {
    setFormData({
      codigo: producto.Codigo_producto,
      nombre: producto.Nombre_producto,
      medida: producto.Unidad_medida || '',
      unidadesPorMedida: producto.Unidades_por_fardo ? producto.Unidades_por_fardo.toString() : '',
      cantidadTotal: producto.Cantidad_total ? producto.Cantidad_total.toString() : ''
    })
    setEditingId(producto.Codigo_producto)
  }

  const handleDelete = async (codigo) => {
    const producto = productos.find(p => p.Codigo_producto === codigo)
    if (window.confirm(`¿Está seguro de eliminar el producto "${producto.Nombre_producto}"?`)) {
      setLoading(true)
      
      const result = await deleteProducto(codigo)
      
      if (result.success) {
        alert(result.message)
        fetchAllProductos()
        fetchProductosStockBajo()
        if (editingId === codigo) {
          handleCancel()
        }
      } else {
        alert(result.error)
      }
      
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      codigo: '',
      nombre: '',
      medida: '',
      unidadesPorMedida: '',
      cantidadTotal: ''
    })
    setEditingId(null)
  }

  const handleSearch = async () => {
    if (!formData.codigo) {
      alert('Ingrese un código para buscar')
      return
    }

    setLoading(true)
    const result = await fetchProductoByCodigo(formData.codigo)
    
    if (result.success) {
      handleEdit(result.data)
      alert('Producto encontrado')
    } else {
      alert('Producto no encontrado')
    }
    
    setLoading(false)
  }

  const handleSearchByName = async () => {
    await searchProductosByNombre(searchTerm)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>PRODUCTOS</h2>
        <div className="form-actions">
          <Button 
            onClick={handleSave}
            variant={editingId ? "warning" : "success"}
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '⏳' : '💾'} {editingId ? 'Actualizar' : 'Guardar'}
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="secondary"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {editingId ? '❌ Cancelar Edición' : '🔄 Limpiar'}
          </Button>
        </div>
      </div>

      {editingId && (
        <div className="editing-banner">
          <span className="editing-icon">✏️</span>
          <span>Editando producto: <strong>{formData.nombre}</strong></span>
        </div>
      )}

      {/* Búsqueda por nombre */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de producto..."
            className="search-input"
          />
          <Button 
            onClick={handleSearchByName}
            variant="info"
            size="medium"
            disabled={loading}
          >
            🔍 Buscar
          </Button>
          <Button 
            onClick={fetchAllProductos}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
          <Button 
            onClick={fetchCatalogoProductos}
            variant="success"
            size="medium"
            disabled={loading}
          >
            📖 Catálogo
          </Button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>CÓDIGO *</label>
          <div className="input-with-search">
            <input 
              type="text" 
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              placeholder="Código del producto"
              disabled={loading || editingId}
              required
            />
            <Button 
              onClick={handleSearch}
              variant="info"
              size="small"
              disabled={loading}
              className="search-btn-custom"
            >
              🔍
            </Button>
          </div>
        </div>

        <div className="form-group span-2">
          <label>NOMBRE *</label>
          <input 
            type="text" 
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Nombre del producto"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>UNIDAD DE MEDIDA *</label>
          <select
            name="medida"
            value={formData.medida}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="FARDO">FARDO</option>
            <option value="PAQUETE">PAQUETE</option>
            <option value="UNIDAD">UNIDAD</option>
            <option value="CAJA">CAJA</option>
            <option value="SACO">SACO</option>
            <option value="ROLLO">ROLLO</option>
            <option value="METRO">METRO</option>
          </select>
        </div>

        <div className="form-group">
          <label>UNIDADES POR FARDO</label>
          <input 
            type="number" 
            name="unidadesPorMedida"
            value={formData.unidadesPorMedida}
            onChange={handleInputChange}
            placeholder="Cantidad por fardo"
            min="0"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>CANTIDAD TOTAL</label>
          <input 
            type="number" 
            name="cantidadTotal"
            value={formData.cantidadTotal}
            onChange={handleInputChange}
            placeholder="Stock total"
            min="0"
            disabled={loading}
          />
        </div>
      </div>

      {/* Alerta de stock bajo */}
      {stockBajo.length > 0 && (
        <div className="stock-bajo-alert">
          <h4>⚠️ Productos con Stock Bajo ({stockBajo.length})</h4>
          <div className="stock-bajo-list">
            {stockBajo.slice(0, 5).map((producto) => (
              <span key={producto.Codigo_producto} className="stock-bajo-item">
                {producto.Nombre_producto}: {producto.Cantidad_total}
              </span>
            ))}
            {stockBajo.length > 5 && <span className="more-items">+{stockBajo.length - 5} más</span>}
          </div>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="products-table">
        <h3>LISTA DE PRODUCTOS ({productos.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando productos...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>PRODUCTO</th>
                <th>UNIDAD MEDIDA</th>
                <th>UNIDADES/FARDO</th>
                <th>STOCK TOTAL</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr 
                  key={producto.Codigo_producto}
                  className={editingId === producto.Codigo_producto ? 'editing-row' : ''}
                >
                  <td>{producto.Codigo_producto}</td>
                  <td>{producto.Nombre_producto}</td>
                  <td>
                    <span className="medida-badge">{producto.Unidad_medida || 'N/A'}</span>
                  </td>
                  <td>{producto.Unidades_por_fardo || 0}</td>
                  <td>
                    <span className={`stock-badge ${producto.Cantidad_total < 100 ? 'bajo' : 'normal'}`}>
                      {producto.Cantidad_total || 0}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(producto)}
                        variant="edit"
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(producto.Codigo_producto)}
                        variant="delete"
                        size="xs"
                        disabled={loading}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">📦</span>
                      <p>No hay productos registrados</p>
                      <small>Agregue su primer producto usando el formulario</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProductosForm
