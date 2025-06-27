// src/components/Forms/VentasForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // CORREGIDO: era '../iu/Button'

const VentasForm = () => {
  const [formData, setFormData] = useState({
    idCliente: '',
    codigoVendedor: '',
    fechaVenta: new Date().toISOString().split('T')[0],
    fechaSalida: '',
    numeroDTE: '',
    nitCliente: '',
    nombreFactura: '',
    tipoPago: '',
    montoTotal: '',
    estadoCobro: 'Pendiente',
    estadoVenta: 'Activa'
  })

  // Estados para datos de la API
  const [clientes, setClientes] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [ventas, setVentas] = useState([])
  const [productosVenta, setProductosVenta] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [selectedVendedor, setSelectedVendedor] = useState(null)
  const [loading, setLoading] = useState(false)

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchVentas()
    fetchClientes()
    fetchVendedores()
    fetchProductos()
  }, [])

  // NUEVO: useEffect para recalcular total automáticamente
  useEffect(() => {
    if (productosVenta.length > 0) {
      const total = productosVenta.reduce((sum, producto) => {
        const subtotal = parseFloat(producto.subtotal) || 0
        return sum + subtotal
      }, 0)
      
      setFormData(prev => ({
        ...prev,
        montoTotal: total.toFixed(2)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        montoTotal: '0.00'
      }))
    }
  }, [productosVenta])

  // ======================= OBTENER DATOS DE APIS ======================= //
  const fetchVentas = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/ventas`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      setVentas(data)
    } catch (error) {
      console.error('Error al obtener ventas:', error)
      alert('Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes`)
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error)
    }
  }

  const fetchVendedores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores`)
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
      }
    } catch (error) {
      console.error('Error al obtener vendedores:', error)
    }
  }

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`)
      if (response.ok) {
        const data = await response.json()
        // Transformar productos para que coincidan con el formato esperado
        const productosTransformados = data.map(producto => ({
          id: producto.Codigo_producto,
          codigo: producto.Codigo_producto,
          nombre: producto.Nombre_producto,
          precio: producto.Precio_unitario || 0,
          stock: producto.Cantidad_total || 0,
          unidadesPorFardo: producto.Unidades_por_fardo || 1
        }))
        setProductosDisponibles(productosTransformados)
      }
    } catch (error) {
      console.error('Error al obtener productos:', error)
    }
  }

  // ======================= REGISTRAR VENTA ======================= //
  const registrarVenta = async (ventaData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ventas/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar venta')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al registrar venta:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ANULAR VENTA ======================= //
  const anularVenta = async (idVenta) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ventas/anular/${idVenta}`, {
        method: 'PUT'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al anular venta')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al anular venta:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= MANEJADORES DE EVENTOS ======================= //
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-llenar datos del cliente
    if (name === 'idCliente') {
      const cliente = clientes.find(c => c.ID_cliente === value)
      if (cliente) {
        setSelectedCliente(cliente)
        setFormData(prev => ({
          ...prev,
          nitCliente: cliente.NIT || '',
          nombreFactura: cliente.Nombre_Contacto || ''
        }))
      }
    }

    // Auto-llenar datos del vendedor
    if (name === 'codigoVendedor') {
      const vendedor = vendedores.find(v => v.Codigo_vendedor === parseInt(value))
      setSelectedVendedor(vendedor)
    }
  }

  // FUNCIÓN CORREGIDA: agregarProducto
  const agregarProducto = (producto) => {
    const productoExistente = productosVenta.find(p => p.id === producto.id)
    
    if (productoExistente) {
      if (productoExistente.cantidad < producto.stock) {
        setProductosVenta(prevProductos => {
          const nuevosProductos = prevProductos.map(p =>
            p.id === producto.id
              ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio }
              : p
          )
          return nuevosProductos
        })
      } else {
        alert('No hay suficiente stock disponible')
      }
    } else {
      const nuevoProducto = {
        ...producto,
        cantidad: 1,
        subtotal: producto.precio,
        precioOriginal: producto.precio
      }
      
      setProductosVenta(prevProductos => [...prevProductos, nuevoProducto])
    }
  }

  // FUNCIÓN CORREGIDA: removerProducto
  const removerProducto = (id) => {
    setProductosVenta(prevProductos => prevProductos.filter(p => p.id !== id))
  }

  // FUNCIÓN CORREGIDA: actualizarCantidad
  const actualizarCantidad = (id, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 0
    const producto = productosDisponibles.find(p => p.id === id)
    
    if (!producto) {
      alert('Producto no encontrado')
      return
    }
    
    if (cantidad <= 0) {
      removerProducto(id)
      return
    }
    
    if (cantidad > producto.stock) {
      alert(`No hay suficiente stock disponible. Stock máximo: ${producto.stock}`)
      return
    }

    setProductosVenta(prevProductos => 
      prevProductos.map(p =>
        p.id === id
          ? { ...p, cantidad: cantidad, subtotal: cantidad * p.precio }
          : p
      )
    )
  }

  // FUNCIÓN CORREGIDA: actualizarPrecio
  const actualizarPrecio = (id, nuevoPrecio) => {
    const precio = parseFloat(nuevoPrecio) || 0
    
    setProductosVenta(prevProductos =>
      prevProductos.map(p =>
        p.id === id
          ? { ...p, precio: precio, subtotal: p.cantidad * precio }
          : p
      )
    )
  }

  // FUNCIÓN CORREGIDA: calcularTotal (simplificada)
  const calcularTotal = () => {
    const total = productosVenta.reduce((sum, producto) => {
      const subtotal = parseFloat(producto.subtotal) || 0
      return sum + subtotal
    }, 0)
    
    console.log('Total calculado:', total.toFixed(2)) // Debug
    
    setFormData(prev => ({
      ...prev,
      montoTotal: total.toFixed(2)
    }))
  }

  // FUNCIÓN CORREGIDA: handleSave
  const handleSave = async () => {
    // Validar campos obligatorios
    if (!formData.idCliente || !formData.codigoVendedor || !formData.tipoPago) {
      alert('Por favor complete los campos obligatorios: Cliente, Vendedor y Tipo de Pago')
      return
    }

    if (productosVenta.length === 0) {
      alert('Debe agregar al menos un producto a la venta')
      return
    }

    setLoading(true)

    try {
      // CORREGIDO: Agregar Monto_total al objeto ventaData
      const ventaData = {
        ID_cliente: formData.idCliente,
        Codigo_vendedor: parseInt(formData.codigoVendedor),
        Fecha_salida: formData.fechaSalida || null,
        Numero_DTE: formData.numeroDTE || null,
        NIT_cliente: formData.nitCliente,
        Nombre_factura: formData.nombreFactura,
        Tipo_pago: formData.tipoPago,
        Estado_venta: formData.estadoVenta,
        Monto_total: parseFloat(formData.montoTotal) || 0, // AGREGADO: Monto total
        Detalle_venta: productosVenta.map(producto => ({
          Codigo_producto: producto.codigo,
          Producto: producto.nombre,
          Cantidad: producto.cantidad,
          Cantidad_unidades: producto.cantidad * producto.unidadesPorFardo,
          Precio_paquete: producto.precio,
          Observaciones: null
        }))
      }

      console.log('Datos enviados a la API:', ventaData) // Debug

      const result = await registrarVenta(ventaData)

      if (result.success) {
        alert(result.message)
        handleCancel()
        fetchVentas() // Recargar la lista
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnular = async (idVenta) => {
    const venta = ventas.find(v => v.ID_venta === idVenta)
    if (window.confirm(`¿Está seguro de anular la venta "${venta.Numero_DTE || `ID: ${venta.ID_venta}`}"?`)) {
      setLoading(true)
      
      const result = await anularVenta(idVenta)
      
      if (result.success) {
        alert(result.message)
        fetchVentas() // Recargar la lista
      } else {
        alert(result.error)
      }
      
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      idCliente: '',
      codigoVendedor: '',
      fechaVenta: new Date().toISOString().split('T')[0],
      fechaSalida: '',
      numeroDTE: '',
      nitCliente: '',
      nombreFactura: '',
      tipoPago: '',
      montoTotal: '',
      estadoCobro: 'Pendiente',
      estadoVenta: 'Activa'
    })
    setEditingId(null)
    setSelectedCliente(null)
    setSelectedVendedor(null)
    setProductosVenta([])
  }

  const generarNumeroDTE = () => {
    const ultimoNumero = ventas.length > 0 
      ? Math.max(...ventas.map(v => {
          const match = v.Numero_DTE?.match(/DTE-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
      : 0
    
    const nuevoNumero = ultimoNumero + 1
    setFormData(prev => ({
      ...prev,
      numeroDTE: `DTE-${String(nuevoNumero).padStart(3, '0')}`
    }))
  }

  const calcularTotalVentas = () => {
    const total = ventas.reduce((total, venta) => {
      // Asegurarse de que montoTotal sea un número válido
      const monto = parseFloat(venta.Monto_total) || 0
      return total + monto
    }, 0)
    
    // Verificar que el total sea un número válido antes de usar toFixed
    return isNaN(total) ? '0.00' : total.toFixed(2)
  }

  const calcularComisionVendedor = () => {
    if (!selectedVendedor || !formData.montoTotal) return '0.00'
    
    const monto = parseFloat(formData.montoTotal) || 0
    const porcentaje = parseFloat(selectedVendedor.Porcentaje_comision) || 0
    const comision = (monto * porcentaje) / 100
    
    return comision.toFixed(2)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>VENTAS</h2>
        <div className="form-actions">
          <Button 
            onClick={handleSave}
            variant="success"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '⏳' : '💾'} Registrar Venta
          </Button>
          
          <Button 
            onClick={generarNumeroDTE}
            variant="info"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            📄 Generar DTE
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="secondary"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            🔄 Nueva Venta
          </Button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>CLIENTE *</label>
          <select
            name="idCliente"
            value={formData.idCliente}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((cliente) => (
              <option key={cliente.ID_cliente} value={cliente.ID_cliente}>
                {cliente.Nombre_Contacto} - {cliente.Nombre_Negocio || 'Sin negocio'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>VENDEDOR *</label>
          <select
            name="codigoVendedor"
            value={formData.codigoVendedor}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar vendedor...</option>
            {vendedores.map((vendedor) => (
              <option key={vendedor.Codigo_vendedor} value={vendedor.Codigo_vendedor}>
                {vendedor.Nombres} {vendedor.Apellidos} ({vendedor.Porcentaje_comision || 0}%)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>FECHA VENTA</label>
          <input
            type="date"
            name="fechaVenta"
            value={formData.fechaVenta}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>FECHA SALIDA</label>
          <input
            type="date"
            name="fechaSalida"
            value={formData.fechaSalida}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NÚMERO DTE</label>
          <input
            type="text"
            name="numeroDTE"
            value={formData.numeroDTE}
            onChange={handleInputChange}
            placeholder="Número de DTE"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NIT CLIENTE</label>
          <input
            type="text"
            name="nitCliente"
            value={formData.nitCliente}
            onChange={handleInputChange}
            placeholder="NIT del cliente"
            readOnly={selectedCliente}
            className={selectedCliente ? 'readonly-input' : ''}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NOMBRE FACTURA</label>
          <input
            type="text"
            name="nombreFactura"
            value={formData.nombreFactura}
            onChange={handleInputChange}
            placeholder="Nombre para facturación"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>TIPO PAGO *</label>
          <select
            name="tipoPago"
            value={formData.tipoPago}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Contado">Contado</option>
            <option value="Credito">Crédito</option>
          </select>
        </div>

        <div className="form-group">
          <label>ESTADO VENTA</label>
          <select
            name="estadoVenta"
            value={formData.estadoVenta}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="Activa">Activa</option>
            <option value="Completada">Completada</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        <div className="form-group">
          <label>MONTO TOTAL</label>
          <input
            type="number"
            name="montoTotal"
            value={formData.montoTotal}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            readOnly
            className="readonly-input"
          />
        </div>
      </div>

      {/* Selección de Productos */}
      <div className="productos-selection">
        <h3>AGREGAR PRODUCTOS A LA VENTA</h3>
        <div className="productos-grid">
          {productosDisponibles.map((producto) => (
            <div key={producto.id} className="producto-card">
              <div className="producto-info">
                <h4>{producto.nombre}</h4>
                <p>Código: {producto.codigo}</p>
                <p>Precio: Q{producto.precio.toFixed(2)}</p>
                <p>Stock: {producto.stock}</p>
                <p>Unidades/Fardo: {producto.unidadesPorFardo}</p>
              </div>
              <Button
                onClick={() => agregarProducto(producto)}
                variant="success"
                size="small"
                disabled={loading || producto.stock === 0}
              >
                + Agregar
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Productos en la venta - MEJORADO */}
      {productosVenta.length > 0 && (
        <div className="productos-venta">
          <h3>PRODUCTOS EN LA VENTA</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>PRODUCTO</th>
                  <th>PRECIO UNITARIO</th>
                  <th>CANTIDAD</th>
                  <th>SUBTOTAL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {productosVenta.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>
                      <div className="precio-input-group">
                        <span className="currency-symbol">Q</span>
                        <input
                          type="number"
                          value={producto.precio}
                          onChange={(e) => actualizarPrecio(producto.id, e.target.value)}
                          min="0"
                          step="0.01"
                          className={`precio-input ${producto.precio !== producto.precioOriginal ? 'modified' : ''}`}
                          disabled={loading}
                          placeholder="0.00"
                          title={producto.precio !== producto.precioOriginal ? 
                            `Precio original: Q${producto.precioOriginal?.toFixed(2)}` : 
                            'Precio del producto'
                          }
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={producto.cantidad}
                        onChange={(e) => {
                          const valor = e.target.value
                          // Permitir valores vacíos temporalmente para mejor UX
                          if (valor === '') {
                            return
                          }
                          actualizarCantidad(producto.id, valor)
                        }}
                        onBlur={(e) => {
                          // Al perder el foco, asegurar que hay un valor válido
                          const valor = parseInt(e.target.value) || 1
                          if (valor !== producto.cantidad) {
                            actualizarCantidad(producto.id, valor)
                          }
                        }}
                        min="1"
                        max={producto.stock}
                        className="cantidad-input"
                        disabled={loading}
                        placeholder="1"
                      />
                      <small className="stock-info">Máx: {producto.stock}</small>
                    </td>
                    <td>
                      <span className="subtotal-display">
                        Q{producto.subtotal.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <Button
                        onClick={() => removerProducto(producto.id)}
                        variant="delete"
                        size="xs"
                        disabled={loading}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="4"><strong>TOTAL:</strong></td>
                  <td><strong>Q{formData.montoTotal}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Información de comisión */}
      {selectedVendedor && formData.montoTotal && (
        <div className="comision-info">
          <div className="comision-card">
            <h4>Información de Comisión</h4>
            <p>Vendedor: <strong>{selectedVendedor.Nombres} {selectedVendedor.Apellidos}</strong></p>
            <p>Porcentaje: <strong>{selectedVendedor.Porcentaje_comision || 0}%</strong></p>
            <p>Comisión: <strong>Q{calcularComisionVendedor()}</strong></p>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="ventas-stats">
        <div className="stats-card">
          <h4>Estadísticas de Ventas</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Ventas:</span>
              <span className="stat-value">{ventas.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monto Total:</span>
              <span className="stat-value">Q{calcularTotalVentas()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ventas Pendientes:</span>
              <span className="stat-value">{ventas.filter(v => v.Estado_cobro === 'Pendiente').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE VENTAS */}
      <div className="ventas-table">
        <h3>HISTORIAL DE VENTAS ({ventas.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando ventas...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>DTE</th>
                <th>CLIENTE</th>
                <th>VENDEDOR</th>
                <th>FECHA VENTA</th>
                <th>TIPO PAGO</th>
                <th>ESTADO COBRO</th>
                <th>ESTADO VENTA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.ID_venta}>
                  <td>{venta.ID_venta}</td>
                  <td>{venta.Numero_DTE || 'N/A'}</td>
                  <td>{venta.Nombre_factura || 'N/A'}</td>
                  <td>Código: {venta.Codigo_vendedor}</td>
                  <td>{venta.Fecha_venta}</td>
                  <td>
                    <span className={`tipo-pago-badge ${venta.Tipo_pago?.toLowerCase()}`}>
                      {venta.Tipo_pago}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${venta.Estado_cobro?.toLowerCase()}`}>
                      {venta.Estado_cobro}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge ${venta.Estado_venta?.toLowerCase()}`}>
                      {venta.Estado_venta}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {venta.Estado_venta !== 'Anulada' && (
                        <Button 
                          onClick={() => handleAnular(venta.ID_venta)}
                          variant="warning"
                          size="xs"
                          disabled={loading}
                        >
                          ❌ Anular
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">💰</span>
                      <p>No hay ventas registradas</p>
                      <small>Registre su primera venta seleccionando cliente y productos</small>
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

export default VentasForm
