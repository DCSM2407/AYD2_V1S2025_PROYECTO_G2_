// src/components/Forms/SalidaInventarioForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import

const SalidaInventarioForm = () => {
  const [formData, setFormData] = useState({
    searchClient: '',
    fechaSalida: new Date().toISOString().split('T')[0],
    observaciones: ''
  })

  // Estados para datos de la API
  const [ventasPendientes, setVentasPendientes] = useState([])
  const [productosVenta, setProductosVenta] = useState([])
  const [historialSalidas, setHistorialSalidas] = useState([])
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [stockVerificado, setStockVerificado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStock, setLoadingStock] = useState(false)
  const [salidaGuardada, setSalidaGuardada] = useState(false)

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchVentasPendientes()
    fetchHistorialSalidas()
  }, [])

  // ======================= OBTENER VENTAS PENDIENTES DE SALIDA ======================= //
  const fetchVentasPendientes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/salidas/ventas-pendientes`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      setVentasPendientes(data)
    } catch (error) {
      console.error('Error al obtener ventas pendientes:', error)
      alert('Error al cargar las ventas pendientes de salida')
    } finally {
      setLoading(false)
    }
  }

  // ======================= OBTENER PRODUCTOS DE UNA VENTA ======================= //
  const fetchProductosVenta = async (idVenta) => {
    setLoadingStock(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/salidas/venta/${idVenta}/productos`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      setProductosVenta(data.productos || [])
    } catch (error) {
      console.error('Error al obtener productos de la venta:', error)
      alert('Error al cargar los productos de la venta')
      setProductosVenta([])
    } finally {
      setLoadingStock(false)
    }
  }

  // ======================= VERIFICAR STOCK DE UNA VENTA ======================= //
  const verificarStockVenta = async (idVenta) => {
    setLoadingStock(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/salidas/venta/${idVenta}/verificar-stock`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      setStockVerificado(data)
      return data
    } catch (error) {
      console.error('Error al verificar stock:', error)
      alert('Error al verificar el stock')
      return null
    } finally {
      setLoadingStock(false)
    }
  }

  // ======================= GENERAR SALIDA DE INVENTARIO ======================= //
  const generarSalida = async (idVenta) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/salidas/venta/${idVenta}/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          observaciones: formData.observaciones
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al generar salida')
      }

      return {
        success: true,
        message: result.message,
        detalles: result.detalles
      }
    } catch (error) {
      console.error('Error al generar salida:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= OBTENER HISTORIAL DE SALIDAS ======================= //
  const fetchHistorialSalidas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/salidas/historial`)

      if (response.ok) {
        const data = await response.json()
        setHistorialSalidas(data)
      }
    } catch (error) {
      console.error('Error al obtener historial de salidas:', error)
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

  const handleVentaSelect = async (venta) => {
    setSelectedVenta(venta)
    setSalidaGuardada(false)

    // Cargar productos y verificar stock automáticamente
    await Promise.all([
      fetchProductosVenta(venta.ID_venta),
      verificarStockVenta(venta.ID_venta)
    ])
  }

  const handleSave = async () => {
    if (!selectedVenta) {
      alert('Debe seleccionar una venta')
      return
    }

    // Verificar stock antes de generar salida
    if (stockVerificado && !stockVerificado.stock_suficiente) {
      const productosInsuficientes = stockVerificado.productos.filter(p => p.Estado_stock === 'INSUFICIENTE')
      const confirmar = window.confirm(
        `Hay productos sin stock suficiente:\n${productosInsuficientes.map(p => `- ${p.Nombre_producto}: Disponible ${p.Stock_disponible}, Requerido ${p.Cantidad_requerida}`).join('\n')}\n\n¿Desea continuar de todas formas?`
      )
      if (!confirmar) return
    }

    setLoading(true)

    try {
      const result = await generarSalida(selectedVenta.ID_venta)

      if (result.success) {
        setSalidaGuardada(true)
        alert(`${result.message}\nProductos actualizados: ${result.detalles?.total_productos || 0}`)
        fetchVentasPendientes() // Recargar ventas pendientes
        fetchHistorialSalidas() // Recargar historial
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setSalidaGuardada(false)
    console.log('Modo edición activado')
  }

  const handleCancel = () => {
    if (window.confirm('¿Está seguro de cancelar? Se perderán todos los datos.')) {
      setSelectedVenta(null)
      setFormData({
        searchClient: '',
        fechaSalida: new Date().toISOString().split('T')[0],
        observaciones: ''
      })
      setProductosVenta([])
      setStockVerificado(null)
      setSalidaGuardada(false)
    }
  }

  const handleNew = () => {
    setSelectedVenta(null)
    setFormData({
      searchClient: '',
      fechaSalida: new Date().toISOString().split('T')[0],
      observaciones: ''
    })
    setProductosVenta([])
    setStockVerificado(null)
    setSalidaGuardada(false)
  }

  const handleSearch = () => {
    console.log('Buscando:', formData.searchClient)
    // La búsqueda se maneja automáticamente con el filtro
  }

  const handlePrint = () => {
    if (selectedVenta) {
      console.log('Imprimiendo salida de inventario')
      window.print()
    }
  }

  const handleExport = () => {
    if (selectedVenta) {
      console.log('Exportando datos de salida')
      // Implementar lógica de exportación
    }
  }

  // Filtrar ventas basado en búsqueda
  const filteredVentas = ventasPendientes.filter(venta =>
    venta.Cliente?.toLowerCase().includes(formData.searchClient.toLowerCase()) ||
    venta.ID_venta.toString().includes(formData.searchClient)
  )

  const calcularTotal = () => {
    return productosVenta.reduce((total, producto) =>
      total + parseFloat(producto.Subtotal || 0), 0
    ).toFixed(2)
  }

  const getEstadoStockColor = (estado) => {
    return estado === 'DISPONIBLE' ? 'suficiente' : 'insuficiente'
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>SALIDA DE INVENTARIO</h2>
        <div className="form-actions">
          <Button
            onClick={handleSave}
            variant={salidaGuardada ? "warning" : "success"}
            size="medium"
            disabled={loading || !selectedVenta}
            className="flex items-center gap-2"
          >
            {loading ? '⏳' : '💾'} {salidaGuardada ? 'Actualizar' : 'Registrar Salida'}
          </Button>

          <Button
            onClick={handleEdit}
            variant="info"
            size="medium"
            disabled={loading || !salidaGuardada}
            className="flex items-center gap-2"
          >
            ✏️ Editar
          </Button>

          <Button
            onClick={handleNew}
            variant="secondary"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            📄 Nueva Salida
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="medium"
            disabled={loading || !selectedVenta}
            className="flex items-center gap-2"
          >
            🖨️ Imprimir
          </Button>

          <Button
            onClick={handleExport}
            variant="ghost"
            size="medium"
            disabled={loading || !selectedVenta}
            className="flex items-center gap-2"
          >
            📊 Exportar
          </Button>

          <Button
            onClick={handleCancel}
            variant="danger"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            ❌ Cancelar
          </Button>
        </div>
      </div>

      {salidaGuardada && (
        <div className="success-banner">
          <span className="success-icon">✅</span>
          <span>Salida de inventario registrada exitosamente</span>
          <span className="success-details">
            Venta: {selectedVenta?.ID_venta} | Cliente: {selectedVenta?.Cliente}
          </span>
        </div>
      )}

      <div className="salida-search-section">
        <div className="form-group">
          <label>BUSCAR VENTA O CLIENTE</label>
          <div className="input-with-search">
            <input
              type="text"
              name="searchClient"
              value={formData.searchClient}
              onChange={handleInputChange}
              placeholder="Buscar por cliente o ID de venta..."
              disabled={loading}
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

        {formData.searchClient && (
          <div className="search-results-info">
            <span className="results-count">
              {filteredVentas.length} resultado(s) encontrado(s)
            </span>
            <Button
              onClick={() => setFormData(prev => ({ ...prev, searchClient: '' }))}
              variant="ghost"
              size="xs"
            >
              ❌ Limpiar
            </Button>
          </div>
        )}
      </div>

      <div className="ventas-table-container">
        <h3>VENTAS PENDIENTES DE SALIDA ({filteredVentas.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando ventas pendientes...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table className="ventas-table">
            <thead>
              <tr>
                <th>ID VENTA</th>
                <th>FECHA VENTA</th>
                <th>CLIENTE</th>
                <th>MONTO TOTAL</th>
                <th>ESTADO VENTA</th>
                <th>TOTAL PRODUCTOS</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.length > 0 ? (
                filteredVentas.map((venta) => (
                  <tr
                    key={venta.ID_venta}
                    className={`${selectedVenta?.ID_venta === venta.ID_venta ? 'selected-row' : ''} ${loading ? 'disabled-row' : ''}`}
                    onClick={() => !loading && handleVentaSelect(venta)}
                  >
                    <td>{venta.ID_venta}</td>
                    <td>{venta.Fecha_venta}</td>
                    <td>{venta.Cliente}</td>
                    <td>Q{parseFloat(venta.Monto_total).toFixed(2)}</td>
                    <td>
                      <span className={`estado-badge ${venta.Estado_venta.toLowerCase()}`}>
                        {venta.Estado_venta}
                      </span>
                    </td>
                    <td>{venta.Total_productos}</td>
                    <td>
                      {selectedVenta?.ID_venta === venta.ID_venta ? (
                        <span className="status-badge selected">Seleccionada</span>
                      ) : (
                        <span className="status-badge available">Disponible</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">🔍</span>
                      <p>No se encontraron ventas</p>
                      <small>No hay ventas pendientes de salida</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verificación de Stock */}
      {selectedVenta && stockVerificado && (
        <div className="stock-verification">
          <div className={`stock-card ${stockVerificado.stock_suficiente ? 'suficiente' : 'insuficiente'}`}>
            <h4>Verificación de Stock</h4>
            <div className="stock-status">
              <span className={`status-icon ${stockVerificado.stock_suficiente ? 'success' : 'warning'}`}>
                {stockVerificado.stock_suficiente ? '✅' : '⚠️'}
              </span>
              <span className="status-text">
                {stockVerificado.stock_suficiente ?
                  'Stock suficiente para todos los productos' :
                  'Hay productos con stock insuficiente'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedVenta && (
        <div className="productos-venta-container">
          <h3>PRODUCTOS DE LA VENTA: {selectedVenta.ID_venta}</h3>
          <div className="venta-info-card">
            <div className="venta-details">
              <div className="detail-item">
                <span className="label">Cliente:</span>
                <span className="value">{selectedVenta.Cliente}</span>
              </div>
              <div className="detail-item">
                <span className="label">Fecha Venta:</span>
                <span className="value">{selectedVenta.Fecha_venta}</span>
              </div>
              <div className="detail-item">
                <span className="label">Estado:</span>
                <span className="value">{selectedVenta.Estado_venta}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total:</span>
                <span className="value total">Q{selectedVenta.Monto_total}</span>
              </div>
            </div>
          </div>

          {loadingStock && (
            <div className="loading-indicator">
              <p>⏳ Cargando productos y verificando stock...</p>
            </div>
          )}

          {productosVenta.length > 0 && (
            <div className="table-wrapper">
              <table className="productos-venta-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>PRODUCTO</th>
                    <th>CANTIDAD</th>
                    <th>CANTIDAD UNIDADES</th>
                    <th>STOCK DISPONIBLE</th>
                    <th>ESTADO STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {productosVenta.map((producto, index) => {
                    const stockInfo = stockVerificado?.productos?.find(p => p.Codigo_producto === producto.Codigo_producto)
                    return (
                      <tr key={index}>
                        <td>{producto.Codigo_producto}</td>
                        <td>{producto.Nombre_producto}</td>
                        <td>
                          <span className="cantidad-badge">{producto.Cantidad}</span>
                        </td>
                        <td>
                          <span className="unidades-badge">{producto.Cantidad_unidades || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="stock-badge">
                            {stockInfo?.Stock_disponible || producto.Stock_disponible}
                          </span>
                        </td>
                        <td>
                          <span className={`estado-stock ${getEstadoStockColor(stockInfo?.Estado_stock || 'DISPONIBLE')}`}>
                            {stockInfo?.Estado_stock === 'DISPONIBLE' ? '✅ Suficiente' : '⚠️ Insuficiente'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="5"><strong>TOTAL GENERAL:</strong></td>
                    <td className="total-amount"><strong>Q{calcularTotal()}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="fecha-salida-section">
        <div className="form-group">
          <label>FECHA SALIDA BODEGA *</label>
          <input
            type="date"
            name="fechaSalida"
            value={formData.fechaSalida}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>OBSERVACIONES</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows={3}
            placeholder="Observaciones sobre la salida..."
            disabled={loading}
          />
        </div>

        {selectedVenta && (
          <div className="salida-summary">
            <h4>Resumen de Salida</h4>
            <p>Venta: <strong>{selectedVenta.ID_venta}</strong></p>
            <p>Cliente: <strong>{selectedVenta.Cliente}</strong></p>
            <p>Fecha de Salida: <strong>{formData.fechaSalida}</strong></p>
            <p>Total Productos: <strong>{productosVenta.length}</strong></p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="salidas-stats">
        <div className="stats-card">
          <h4>Estadísticas de Salidas</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Ventas Pendientes:</span>
              <span className="stat-value">{ventasPendientes.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Salidas Completadas:</span>
              <span className="stat-value">{historialSalidas.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE HISTORIAL DE SALIDAS */}
      <div className="salidas-table">
        <h3>HISTORIAL DE SALIDAS ({historialSalidas.length})</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID VENTA</th>
                <th>FECHA VENTA</th>
                <th>CLIENTE</th>
                <th>MONTO TOTAL</th>
                <th>ESTADO</th>
                <th>TOTAL PRODUCTOS</th>
              </tr>
            </thead>
            <tbody>
              {historialSalidas.map((salida) => (
                <tr key={salida.ID_venta}>
                  <td>{salida.ID_venta}</td>
                  <td>{salida.Fecha_venta}</td>
                  <td>{salida.ID_cliente}</td>
                  <td>{parseFloat(salida.Monto_total).toFixed(2)}</td>
                  <td>
                    <span className="estado-badge completada">
                      {salida.Estado_venta}
                    </span>
                  </td>
                  <td>{salida.Total_productos}</td>
                </tr>
              ))}
              {historialSalidas.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <p>No hay salidas registradas</p>
                      <small>Las salidas aparecerán aquí una vez generadas</small>
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

export default SalidaInventarioForm
