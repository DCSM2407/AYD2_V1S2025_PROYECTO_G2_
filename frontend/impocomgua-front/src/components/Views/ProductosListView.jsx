// src/components/Views/ProductosListView.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import
import { usePermissions } from '../hooks/usePermissions' // Corregido la ruta

const ProductosListView = () => {
  const { getProductCatalogPermissions, userRole } = usePermissions()
  const permissions = getProductCatalogPermissions()
  
  // Estados para productos de la API
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    ordenarPor: 'nombre'
  })

  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [vistaActual, setVistaActual] = useState('grid')

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchCatalogoProductos()
  }, [])

  // Filtrar productos cuando cambien los filtros
  useEffect(() => {
    filtrarProductos()
  }, [filtros, productos])

  // ======================= OBTENER CATÁLOGO DE PRODUCTOS ======================= //
  const fetchCatalogoProductos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transformar datos de la API al formato esperado - SIN CATEGORÍA
      const productosTransformados = data.map(producto => ({
        id: producto.Codigo_producto,
        codigo: producto.Codigo_producto,
        nombre: producto.Nombre_producto,
        medida: producto.Unidad_medida || 'N/A',
        unidadesPorMedida: producto.Unidades_por_fardo || 0,
        precioUnitario: producto.Precio_unitario || 0,
        stock: producto.Cantidad_total || 0,
        stockMinimo: producto.Stock_minimo || 10,
        proveedor: producto.Proveedor || 'Sin proveedor',
        fechaIngreso: producto.Fecha_ingreso || new Date().toISOString().split('T')[0],
        estado: determinarEstado(producto.Cantidad_total, producto.Stock_minimo)
      }))
      
      setProductos(productosTransformados)
    } catch (error) {
      console.error('Error al obtener catálogo:', error)
      alert('Error al cargar el catálogo de productos')
    } finally {
      setLoading(false)
    }
  }

  // ======================= BUSCAR PRODUCTOS POR NOMBRE ======================= //
  const searchProductosByNombre = async (nombre) => {
    if (!nombre.trim()) {
      fetchCatalogoProductos()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`)
      
      if (response.ok) {
        const data = await response.json()
        const productosTransformados = data.map(producto => ({
          id: producto.Codigo_producto,
          codigo: producto.Codigo_producto,
          nombre: producto.Nombre_producto,
          medida: producto.Unidad_medida || 'N/A',
          unidadesPorMedida: producto.Unidades_por_fardo || 0,
          precioUnitario: producto.Precio_unitario || 0,
          stock: producto.Cantidad_total || 0,
          stockMinimo: producto.Stock_minimo || 10,
          proveedor: producto.Proveedor || 'Sin proveedor',
          fechaIngreso: producto.Fecha_ingreso || new Date().toISOString().split('T')[0],
          estado: determinarEstado(producto.Cantidad_total, producto.Stock_minimo)
        }))
        setProductos(productosTransformados)
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

  // ======================= OBTENER PRODUCTOS CON STOCK BAJO ======================= //
  const fetchProductosStockBajo = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos/stock/bajo`)
      
      if (response.ok) {
        const data = await response.json()
        const productosTransformados = data.map(producto => ({
          id: producto.Codigo_producto,
          codigo: producto.Codigo_producto,
          nombre: producto.Nombre_producto,
          medida: producto.Unidad_medida || 'N/A',
          unidadesPorMedida: producto.Unidades_por_fardo || 0,
          precioUnitario: producto.Precio_unitario || 0,
          stock: producto.Cantidad_total || 0,
          stockMinimo: producto.Stock_minimo || 10,
          proveedor: producto.Proveedor || 'Sin proveedor',
          fechaIngreso: producto.Fecha_ingreso || new Date().toISOString().split('T')[0],
          estado: 'Stock Bajo'
        }))
        setProductos(productosTransformados)
      }
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error)
    } finally {
      setLoading(false)
    }
  }

  // ======================= FUNCIONES AUXILIARES ======================= //
  const determinarEstado = (stock, stockMinimo) => {
    if (stock === 0) return 'Agotado'
    if (stock <= stockMinimo) return 'Stock Bajo'
    return 'Disponible'
  }

  const filtrarProductos = () => {
    let productosFiltrados = [...productos]

    if (filtros.busqueda) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        producto.proveedor.toLowerCase().includes(filtros.busqueda.toLowerCase())
      )
    }

    if (filtros.estado && filtros.estado !== '') {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.estado === filtros.estado
      )
    }

    productosFiltrados.sort((a, b) => {
      switch (filtros.ordenarPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre)
        case 'codigo':
          return a.codigo.localeCompare(b.codigo)
        case 'precio':
          return a.precioUnitario - b.precioUnitario
        case 'stock':
          return b.stock - a.stock
        case 'fecha':
          return new Date(b.fechaIngreso) - new Date(a.fechaIngreso)
        default:
          return 0
      }
    })

    setProductosFiltrados(productosFiltrados)
  }

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      ordenarPor: 'nombre'
    })
  }

  const handleBusqueda = async () => {
    await searchProductosByNombre(filtros.busqueda)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'disponible'
      case 'Stock Bajo':
        return 'stock-bajo'
      case 'Agotado':
        return 'agotado'
      default:
        return 'default'
    }
  }

  const exportarDatos = () => {
    const csvContent = [
      ['Código', 'Nombre', 'Stock', 'Precio', 'Estado'], // SIN CATEGORÍA
      ...productosFiltrados.map(p => [
        p.codigo, p.nombre, p.stock, p.precioUnitario, p.estado
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'catalogo_productos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRoleClass = (role) => {
    switch (role) {
      case 'Gerencia General':
        return 'role-gerencia'
      case 'Gerente de Inventario':
        return 'role-inventario'
      case 'Gerente de Ventas y Finanzas':
        return 'role-ventas'
      default:
        return 'role-default'
    }
  }

  // Estados sin categorías
  const estados = ['Disponible', 'Stock Bajo', 'Agotado']

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>CATÁLOGO DE PRODUCTOS</h2>
        <div className="user-role-indicator">
          <span className={`role-badge ${getRoleClass(userRole)}`}>
            {userRole}
          </span>
        </div>
        <div className="form-actions">
          {permissions.canExport && (
            <Button 
              onClick={exportarDatos}
              variant="success"
              size="medium"
              disabled={loading}
              className="flex items-center gap-2"
            >
              📊 Exportar CSV
            </Button>
          )}
          
          <Button 
            onClick={() => setVistaActual(vistaActual === 'grid' ? 'table' : 'grid')}
            variant="info"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {vistaActual === 'grid' ? '📋 Vista Tabla' : '🔲 Vista Grid'}
          </Button>
          
          <Button 
            onClick={limpiarFiltros}
            variant="outline"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            🔄 Limpiar Filtros
          </Button>

          <Button 
            onClick={fetchProductosStockBajo}
            variant="warning"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            ⚠️ Stock Bajo
          </Button>
        </div>
      </div>

      {/* Mostrar permisos del usuario */}
      <div className="permissions-info">
        <div className="permissions-card">
          <h4>Permisos para {userRole}</h4>
          <div className="permissions-list">
            <span className={`permission-item ${permissions.canView ? 'allowed' : 'denied'}`}>
              👁️ Ver productos
            </span>
            <span className={`permission-item ${permissions.canEdit ? 'allowed' : 'denied'}`}>
              ✏️ Editar productos
            </span>
            <span className={`permission-item ${permissions.canDelete ? 'allowed' : 'denied'}`}>
              🗑️ Eliminar productos
            </span>
            <span className={`permission-item ${permissions.canExport ? 'allowed' : 'denied'}`}>
              📊 Exportar datos
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-productos">
        <div className="stats-grid">
          <div className="stat-card disponible">
            <h4>Productos Disponibles</h4>
            <span className="stat-number">
              {productosFiltrados.filter(p => p.estado === 'Disponible').length}
            </span>
          </div>
          <div className="stat-card stock-bajo">
            <h4>Stock Bajo</h4>
            <span className="stat-number">
              {productosFiltrados.filter(p => p.estado === 'Stock Bajo').length}
            </span>
          </div>
          <div className="stat-card agotado">
            <h4>Agotados</h4>
            <span className="stat-number">
              {productosFiltrados.filter(p => p.estado === 'Agotado').length}
            </span>
          </div>
          <div className="stat-card total">
            <h4>Total Productos</h4>
            <span className="stat-number">{productosFiltrados.length}</span>
          </div>
        </div>
      </div>

      {/* Filtros - SIN CATEGORÍA */}
      <div className="filtros-section">
        <div className="filtros-grid">
          <div className="form-group">
            <label>BUSCAR</label>
            <div className="search-input-group">
              <input
                type="text"
                name="busqueda"
                value={filtros.busqueda}
                onChange={handleFiltroChange}
                placeholder="Buscar por nombre, código o proveedor..."
                disabled={loading}
              />
              <Button 
                onClick={handleBusqueda}
                variant="info"
                size="small"
                disabled={loading}
              >
                🔍
              </Button>
            </div>
          </div>

          <div className="form-group">
            <label>ESTADO</label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ORDENAR POR</label>
            <select
              name="ordenarPor"
              value={filtros.ordenarPor}
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="nombre">Nombre</option>
              <option value="codigo">Código</option>
              {(permissions.canEdit || userRole === 'Gerente de Ventas y Finanzas') && (
                <option value="precio">Precio</option>
              )}
              <option value="stock">Stock</option>
              <option value="fecha">Fecha Ingreso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botón para recargar catálogo */}
      <div className="reload-section">
        <Button 
          onClick={fetchCatalogoProductos}
          variant="primary"
          size="medium"
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? '⏳ Cargando...' : '🔄 Recargar Catálogo'}
        </Button>
      </div>

      {/* Resultados */}
      <div className="resultados-header">
        <h3>PRODUCTOS ENCONTRADOS ({productosFiltrados.length})</h3>
      </div>

      {loading && (
        <div className="loading-indicator">
          <p>⏳ Cargando catálogo de productos...</p>
        </div>
      )}

      {/* Vista Grid - SIN CATEGORÍA */}
      {vistaActual === 'grid' && !loading && (
        <div className="productos-grid">
          {productosFiltrados.map(producto => (
            <div key={producto.id} className="producto-card">
              <div className="producto-header">
                <span className="producto-codigo">{producto.codigo}</span>
                <span className={`estado-badge ${getEstadoColor(producto.estado)}`}>
                  {producto.estado}
                </span>
              </div>
              
              <div className="producto-info">
                <h4>{producto.nombre}</h4>
                
                <div className="producto-detalles">
                  <div className="detalle-item">
                    <span>Medida:</span>
                    <span>{producto.medida}</span>
                  </div>
                  <div className="detalle-item">
                    <span>Unidades/Medida:</span>
                    <span>{producto.unidadesPorMedida}</span>
                  </div>
                  <div className="detalle-item">
                    <span>Stock:</span>
                    <span className={`stock ${producto.stock <= producto.stockMinimo ? 'bajo' : ''}`}>
                      {producto.stock}
                    </span>
                  </div>
                </div>
                
                {(userRole === 'Gerencia General' || userRole === 'Gerente de Inventario') && (
                  <p className="proveedor">📦 {producto.proveedor}</p>
                )}
                
                <div className="producto-fecha">
                  Ingreso: {producto.fechaIngreso}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Tabla - SIN CATEGORÍA */}
      {vistaActual === 'table' && !loading && (
        <div className="productos-table">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>NOMBRE</th>
                  <th>MEDIDA</th>
                  {(permissions.canEdit || userRole === 'Gerente de Ventas y Finanzas') && <th>PRECIO</th>}
                  <th>STOCK</th>
                  {(userRole === 'Gerencia General' || userRole === 'Gerente de Inventario') && <th>PROVEEDOR</th>}
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(producto => (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.medida} ({producto.unidadesPorMedida})</td>
                    {(permissions.canEdit || userRole === 'Gerente de Ventas y Finanzas') && (
                      <td className="precio">Q{producto.precioUnitario.toFixed(2)}</td>
                    )}
                    <td className={`stock ${producto.stock <= producto.stockMinimo ? 'bajo' : ''}`}>
                      {producto.stock}
                    </td>
                    {(userRole === 'Gerencia General' || userRole === 'Gerente de Inventario') && (
                      <td>{producto.proveedor}</td>
                    )}
                    <td>
                      <span className={`estado-badge ${getEstadoColor(producto.estado)}`}>
                        {producto.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {productosFiltrados.length === 0 && !loading && (
        <div className="no-resultados">
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No se encontraron productos</h3>
            <p>Intente ajustar los filtros de búsqueda o recargar el catálogo</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductosListView
