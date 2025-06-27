// src/components/Forms/PagosForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // CORREGIDO: era '../iu/Button'

const PagosForm = () => {
  const [formData, setFormData] = useState({
    idVenta: '',
    numeroRecibo: '',
    fechaPago: '',
    banco: '',
    noCuenta: '',
    noTransferencia: '',
    montoAbono: '',
    saldo: ''
  })

  // Estados para datos de la API
  const [ventasDisponibles, setVentasDisponibles] = useState([])
  const [pagos, setPagos] = useState([])
  const [pagosOriginales, setPagosOriginales] = useState([]) // NUEVO: datos originales
  const [editingId, setEditingId] = useState(null)
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  // NUEVOS ESTADOS PARA FILTROS
  const [filtros, setFiltros] = useState({
    cliente: '',
    banco: '',
    fechaDesde: '',
    fechaHasta: ''
  })

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchVentasPendientes()
    fetchAllPagos()
  }, [])

  // NUEVO: Aplicar filtros cuando cambien (comentado para aplicación manual)
  /*
  useEffect(() => {
    aplicarFiltros()
  }, [filtros, pagosOriginales])
  */

  // ======================= FUNCIONES DE FILTRADO ======================= //
  const aplicarFiltros = () => {
    let pagosFiltrados = [...pagosOriginales]

    // Filtrar por nombre de cliente
    if (filtros.cliente) {
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.Nombre_cliente?.toLowerCase().includes(filtros.cliente.toLowerCase())
      )
    }

    // Filtrar por banco
    if (filtros.banco) {
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.Banco?.toLowerCase().includes(filtros.banco.toLowerCase())
      )
    }

    // Filtrar por fecha desde
    if (filtros.fechaDesde) {
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.Fecha_pago >= filtros.fechaDesde
      )
    }

    // Filtrar por fecha hasta
    if (filtros.fechaHasta) {
      pagosFiltrados = pagosFiltrados.filter(pago => 
        pago.Fecha_pago <= filtros.fechaHasta
      )
    }

    setPagos(pagosFiltrados)
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
      cliente: '',
      banco: '',
      fechaDesde: '',
      fechaHasta: ''
    })
    setPagos(pagosOriginales)
  }

  // NUEVA FUNCIÓN: Aplicar filtros manualmente
  const aplicarFiltrosManual = () => {
    aplicarFiltros()
  }

  // ======================= OBTENER TODOS LOS PAGOS CORREGIDO ======================= //
  const fetchAllPagos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/pagos`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Pagos originales de la API:', data) // DEBUG
      
      // CORREGIDO: Si la API ya devuelve el nombre del cliente, usarlo directamente
      const pagosConClientes = data.map(pago => ({
        ...pago,
        Nombre_cliente: pago.Nombre_cliente || 'Cliente no encontrado'
      }))
      
      console.log('Pagos procesados:', pagosConClientes) // DEBUG
      
      setPagosOriginales(pagosConClientes) // Guardar datos originales
      setPagos(pagosConClientes)
    } catch (error) {
      console.error('Error al obtener pagos:', error)
      alert('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  // ======================= RESTO DE FUNCIONES (sin cambios significativos) ======================= //
  const fetchVentasPendientes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/ventas`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Ventas recibidas de la API:', data)
      
      const ventasPendientes = data.filter(venta => {
        const estadoCobro = venta.Estado_cobro?.toUpperCase()
        const estadoVenta = venta.Estado_venta?.toUpperCase()
        
        return (estadoCobro === 'PENDIENTE' || 
                estadoCobro === 'PARCIAL' || 
                estadoVenta === 'PENDIENTE' ||
                estadoVenta === 'ACTIVA') &&
               estadoVenta !== 'ANULADA' &&
               estadoVenta !== 'PAGADA'
      }).map(venta => {
        const montoTotal = parseFloat(venta.Monto_total) || 0
        const saldoPendiente = calcularSaldoPendiente(venta.ID_venta, montoTotal)
        
        return {
          id: venta.ID_venta,
          numeroVenta: venta.Numero_DTE || `VTA-${venta.ID_venta}`,
          cliente: venta.Nombre_factura || 'Cliente sin nombre',
          fechaVenta: venta.Fecha_venta,
          montoTotal: montoTotal,
          saldoPendiente: saldoPendiente,
          estado: determinarEstadoPago(montoTotal, saldoPendiente),
          estadoOriginal: venta.Estado_cobro || 'Pendiente'
        }
      })
      
      console.log('Ventas pendientes filtradas:', ventasPendientes)
      setVentasDisponibles(ventasPendientes)
    } catch (error) {
      console.error('Error al obtener ventas:', error)
      alert('Error al cargar las ventas pendientes')
    } finally {
      setLoading(false)
    }
  }

  // ======================= RESTO DE FUNCIONES EXISTENTES ======================= //
  const calcularSaldoPendiente = (idVenta, montoTotal) => {
    const pagosVenta = pagos.filter(pago => pago.ID_venta === idVenta)
    const totalPagado = pagosVenta.reduce((total, pago) => total + parseFloat(pago.Monto_abono), 0)
    return montoTotal - totalPagado
  }

  const determinarEstadoPago = (montoTotal, saldoPendiente) => {
    if (saldoPendiente <= 0) return 'PAGADA'
    if (saldoPendiente === montoTotal) return 'PENDIENTE'
    if (saldoPendiente < montoTotal) return 'PARCIAL'
    return 'PENDIENTE'
  }

  const createPago = async (pagoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pagos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pagoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear pago')
      }

      return { 
        success: true, 
        message: result.message,
        nuevoSaldo: result.Nuevo_saldo,
        estadoVenta: result.Estado_venta
      }
    } catch (error) {
      console.error('Error al crear pago:', error)
      return { success: false, error: error.message }
    }
  }

  const updatePago = async (idPago, pagoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pagos/${idPago}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pagoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar pago')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar pago:', error)
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

    if (name === 'montoAbono' && selectedVenta) {
      const montoAbono = parseFloat(value) || 0
      const nuevoSaldo = selectedVenta.saldoPendiente - montoAbono
      setFormData(prev => ({
        ...prev,
        saldo: nuevoSaldo.toFixed(2)
      }))
    }
  }

  const handleVentaSelect = (venta) => {
    setSelectedVenta(venta)
    setFormData(prev => ({
      ...prev,
      idVenta: venta.id.toString(),
      saldo: venta.saldoPendiente.toFixed(2),
      montoAbono: '',
      fechaPago: new Date().toISOString().split('T')[0]
    }))
  }

  const handleSave = async () => {
    if (!formData.idVenta || !formData.numeroRecibo || !formData.fechaPago || !formData.montoAbono) {
      alert('Por favor complete los campos obligatorios: Venta, Número de Recibo, Fecha de Pago y Monto de Abono')
      return
    }

    const montoAbono = parseFloat(formData.montoAbono)
    if (montoAbono <= 0) {
      alert('El monto de abono debe ser mayor a 0')
      return
    }

    if (selectedVenta && montoAbono > selectedVenta.saldoPendiente) {
      alert('El monto de abono no puede ser mayor al saldo pendiente')
      return
    }

    setLoading(true)

    try {
      const pagoData = {
        ID_venta: parseInt(formData.idVenta),
        Numero_recibo: formData.numeroRecibo,
        Fecha_pago: formData.fechaPago,
        Banco: formData.banco || null,
        No_cuenta: formData.noCuenta || null,
        No_transferencia: formData.noTransferencia || null,
        Monto_abono: montoAbono
      }

      let result

      if (editingId) {
        result = await updatePago(editingId, pagoData)
      } else {
        result = await createPago(pagoData)
      }

      if (result.success) {
        if (result.nuevoSaldo !== undefined) {
          alert(`${result.message}\nNuevo saldo: Q${result.nuevoSaldo}\nEstado: ${result.estadoVenta}`)
        } else {
          alert(result.message)
        }
        handleCancel()
        fetchVentasPendientes()
        fetchAllPagos()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (pago) => {
    setFormData({
      idVenta: pago.ID_venta.toString(),
      numeroRecibo: pago.Numero_recibo,
      fechaPago: pago.Fecha_pago,
      banco: pago.Banco || '',
      noCuenta: pago.No_cuenta || '',
      noTransferencia: pago.No_transferencia || '',
      montoAbono: pago.Monto_abono.toString(),
      saldo: pago.Saldo.toString()
    })
    
    const venta = ventasDisponibles.find(v => v.id === pago.ID_venta)
    setSelectedVenta(venta)
    setEditingId(pago.ID_pago)
  }

  const handleDelete = (id) => {
    const pago = pagos.find(p => p.ID_pago === id)
    if (window.confirm(`¿Está seguro de eliminar el pago con recibo "${pago.Numero_recibo}"?`)) {
      alert('Función de eliminación pendiente de implementar en la API')
    }
  }

  const handleCancel = () => {
    setFormData({
      idVenta: '',
      numeroRecibo: '',
      fechaPago: '',
      banco: '',
      noCuenta: '',
      noTransferencia: '',
      montoAbono: '',
      saldo: ''
    })
    setEditingId(null)
    setSelectedVenta(null)
  }

  const calcularTotalPagos = () => {
    const total = pagos.reduce((total, pago) => {
      const monto = parseFloat(pago.Monto_abono) || 0
      return total + monto
    }, 0)
    
    return isNaN(total) ? '0.00' : total.toFixed(2)
  }

  const generarNumeroRecibo = () => {
    const ultimoNumero = pagos.length > 0 
      ? Math.max(...pagos.map(p => {
          const match = p.Numero_recibo?.match(/REC-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
      : 0
    
    const nuevoNumero = ultimoNumero + 1
    setFormData(prev => ({
      ...prev,
      numeroRecibo: `REC-${String(nuevoNumero).padStart(3, '0')}`
    }))
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>PAGOS</h2>
        <div className="form-actions">
          <Button 
            onClick={handleSave}
            variant={editingId ? "warning" : "success"}
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '⏳' : '💾'} {editingId ? 'Actualizar Pago' : 'Registrar Pago'}
          </Button>
          
          <Button 
            onClick={generarNumeroRecibo}
            variant="info"
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            🧾 Generar Recibo
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
          <span>Editando pago: <strong>{formData.numeroRecibo}</strong></span>
        </div>
      )}

     

      {/* Selección de Venta */}
      <div className="ventas-selection">
        <div className="ventas-header">
          <h3>SELECCIONAR VENTA PARA PAGO</h3>
          <div className="ventas-summary">
            <span className="summary-item pendientes">
              Pendientes: {ventasDisponibles.filter(v => v.estado === 'PENDIENTE').length}
            </span>
            <span className="summary-item parciales">
              Parciales: {ventasDisponibles.filter(v => v.estado === 'PARCIAL').length}
            </span>
            <span className="summary-item total">
              Total: {ventasDisponibles.length}
            </span>
          </div>
        </div>

        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando ventas pendientes...</p>
          </div>
        )}

        <div className="estado-filters">
          <button 
            className={`filter-btn ${filtroEstado === 'TODOS' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('TODOS')}
          >
            Todos ({ventasDisponibles.length})
          </button>
          <button 
            className={`filter-btn pendiente ${filtroEstado === 'PENDIENTE' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('PENDIENTE')}
          >
            Pendientes ({ventasDisponibles.filter(v => v.estado === 'PENDIENTE').length})
          </button>
          <button 
            className={`filter-btn parcial ${filtroEstado === 'PARCIAL' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('PARCIAL')}
          >
            Parciales ({ventasDisponibles.filter(v => v.estado === 'PARCIAL').length})
          </button>
        </div>

        <div className="ventas-grid">
          {ventasDisponibles
            .filter(venta => filtroEstado === 'TODOS' || venta.estado === filtroEstado)
            .map((venta) => (
            <div 
              key={venta.id}
              className={`venta-card ${selectedVenta?.id === venta.id ? 'selected' : ''} ${venta.estado.toLowerCase()}`}
              onClick={() => handleVentaSelect(venta)}
            >
              <div className="venta-header">
                <span className="venta-numero">{venta.numeroVenta}</span>
                <span className={`venta-estado ${venta.estado.toLowerCase()}`}>
                  {venta.estado}
                </span>
              </div>
              <div className="venta-info">
                <p><strong>Cliente:</strong> {venta.cliente}</p>
                <p><strong>Fecha:</strong> {venta.fechaVenta}</p>
                <p><strong>Total:</strong> Q{venta.montoTotal.toFixed(2)}</p>
                <p><strong>Saldo Pendiente:</strong> 
                  <span className={`saldo-pendiente ${venta.estado.toLowerCase()}`}>
                    Q{venta.saldoPendiente.toFixed(2)}
                  </span>
                </p>
                {venta.estado === 'PARCIAL' && (
                  <p><strong>Pagado:</strong> 
                    <span className="monto-pagado">
                      Q{(venta.montoTotal - venta.saldoPendiente).toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {ventasDisponibles.length === 0 && !loading && (
            <div className="empty-ventas">
              <span className="empty-icon">💰</span>
              <p>No hay ventas pendientes de pago</p>
              <small>Todas las ventas están al día</small>
            </div>
          )}
        </div>
      </div>

      {selectedVenta && (
        <div className="form-grid">
          <div className="form-group">
            <label>NÚMERO DE RECIBO *</label>
            <input
              type="text"
              name="numeroRecibo"
              value={formData.numeroRecibo}
              onChange={handleInputChange}
              placeholder="Número de recibo"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>FECHA DE PAGO *</label>
            <input
              type="date"
              name="fechaPago"
              value={formData.fechaPago}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>BANCO</label>
            <input
              type="text"
              name="banco"
              value={formData.banco}
              onChange={handleInputChange}
              placeholder="Nombre del banco"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>NÚMERO DE CUENTA</label>
            <input
              type="text"
              name="noCuenta"
              value={formData.noCuenta}
              onChange={handleInputChange}
              placeholder="Número de cuenta"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>NÚMERO DE TRANSFERENCIA</label>
            <input
              type="text"
              name="noTransferencia"
              value={formData.noTransferencia}
              onChange={handleInputChange}
              placeholder="Número de transferencia"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>MONTO DE ABONO * (Max: Q{selectedVenta.saldoPendiente.toFixed(2)})</label>
            <input
              type="number"
              name="montoAbono"
              value={formData.montoAbono}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max={selectedVenta.saldoPendiente}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>SALDO RESTANTE</label>
            <input
              type="number"
              name="saldo"
              value={formData.saldo}
              onChange={handleInputChange}
              readOnly
              className="readonly-input"
            />
          </div>
        </div>
      )}

      {selectedVenta && (
        <div className="venta-info-card">
          <div className="info-card">
            <h4>Información de la Venta</h4>
            <div className="info-details">
              <div className="info-item">
                <span className="label">Venta:</span>
                <span className="value">{selectedVenta.numeroVenta}</span>
              </div>
              <div className="info-item">
                <span className="label">Cliente:</span>
                <span className="value">{selectedVenta.cliente}</span>
              </div>
              <div className="info-item">
                <span className="label">Monto Total:</span>
                <span className="value">Q{selectedVenta.montoTotal.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="label">Saldo Pendiente:</span>
                <span className="value highlight">Q{selectedVenta.saldoPendiente.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pagos-stats">
        <div className="stats-card">
          <h4>Estadísticas de Pagos</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Pagos:</span>
              <span className="stat-value">{pagos.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monto Total Recaudado:</span>
              <span className="stat-value">Q{calcularTotalPagos()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ventas Pendientes:</span>
              <span className="stat-value">{ventasDisponibles.filter(v => v.saldoPendiente > 0).length}</span>
            </div>
          </div>
        </div>
      </div>

       {/* NUEVA SECCIÓN: Filtros de búsqueda para pagos */}
      <div className="filtros-section">
        <h3>FILTROS DE BÚSQUEDA DE PAGOS</h3>
        <div className="filtros-grid">
          <div className="form-group">
            <label>FILTRAR POR CLIENTE</label>
            <input
              type="text"
              name="cliente"
              value={filtros.cliente}
              onChange={handleFiltroChange}
              placeholder="Buscar por nombre de cliente..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>FILTRAR POR BANCO</label>
            <input
              type="text"
              name="banco"
              value={filtros.banco}
              onChange={handleFiltroChange}
              placeholder="Buscar por banco..."
              disabled={loading}
            />
          </div>

          
          

          {/* NUEVOS BOTONES AGREGADOS */}
          <div className="form-group">
            <label>&nbsp;</label>
            <div className="filtros-buttons">
              <Button 
                onClick={aplicarFiltrosManual}
                variant="info"
                size="medium"
                disabled={loading}
                className="flex items-center gap-2"
              >
                🔍 Buscar
              </Button>
              <Button 
                onClick={limpiarFiltros}
                variant="outline"
                size="medium"
                disabled={loading}
                className="flex items-center gap-2"
              >
                🔄 Limpiar
              </Button>
            </div>
          </div>
        </div>

        <div className="filtros-resumen">
          <p>
            <strong>Resultados:</strong> {pagos.length} pago(s) 
            {filtros.cliente || filtros.banco || filtros.fechaDesde || filtros.fechaHasta ? ' filtrado(s)' : ' total(es)'}
          </p>
        </div>
      </div>
      {/* TABLA DE PAGOS CORREGIDA */}
      <div className="pagos-table">
        <h3>HISTORIAL DE PAGOS ({pagos.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando pagos...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>RECIBO</th>
                <th>CLIENTE</th>
                <th>VENTA</th>
                <th>FECHA PAGO</th>
                <th>BANCO</th>
                <th>MONTO ABONO</th>
                <th>SALDO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => {
                console.log('Renderizando pago:', pago) // DEBUG
                return (
                  <tr 
                    key={pago.ID_pago} 
                    className={editingId === pago.ID_pago ? 'editing-row' : ''}
                  >
                    <td>{pago.ID_pago}</td>
                    <td>{pago.Numero_recibo}</td>
                    <td>
                      <span className="cliente-badge">
                        👤 {pago.Nombre_cliente || 'Cliente no encontrado'}
                      </span>
                    </td>
                    <td>ID: {pago.ID_venta}</td>
                    <td>{pago.Fecha_pago}</td>
                    <td>{pago.Banco || 'N/A'}</td>
                    <td>
                      <span className="monto-badge">
                        Q{parseFloat(pago.Monto_abono).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`saldo-badge ${parseFloat(pago.Saldo) === 0 ? 'pagado' : 'pendiente'}`}>
                        Q{parseFloat(pago.Saldo).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button 
                          onClick={() => handleEdit(pago)}
                          variant="edit"
                          size="xs"
                          disabled={loading}
                        >
                          ✏️
                        </Button>
                        <Button 
                          onClick={() => handleDelete(pago.ID_pago)}
                          variant="delete"
                          size="xs"
                          disabled={loading}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pagos.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">💳</span>
                      <p>No hay pagos registrados</p>
                      <small>Registre su primer pago seleccionando una venta</small>
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

export default PagosForm
