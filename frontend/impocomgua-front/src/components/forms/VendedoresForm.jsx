// src/components/Forms/VendedoresForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import

const VendedoresForm = () => {
  const [formData, setFormData] = useState({
    Codigo_vendedor: '',
    Nombres: '',
    Apellidos: '',
    Telefono: '',
    Direccion: '',
    Porcentaje_comision: ''
  })

  const [vendedores, setVendedores] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadisticas, setEstadisticas] = useState(null)

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllVendedores()
    fetchEstadisticas()
  }, [])

  // ======================= OBTENER TODOS LOS VENDEDORES ======================= //
  const fetchAllVendedores = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      setVendedores(data)
    } catch (error) {
      console.error('Error al obtener vendedores:', error)
      alert('Error al cargar los vendedores')
    } finally {
      setLoading(false)
    }
  }

  // ======================= CREAR VENDEDOR ======================= //
  const createVendedor = async (vendedorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendedorData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear vendedor')
      }

      return { success: true, message: result.message, codigo: result.Codigo_vendedor }
    } catch (error) {
      console.error('Error al crear vendedor:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ACTUALIZAR VENDEDOR ======================= //
  const updateVendedor = async (codigo, vendedorData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/${codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendedorData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar vendedor')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar vendedor:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ELIMINAR VENDEDOR ======================= //
  const deleteVendedor = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/${codigo}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar vendedor')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al eliminar vendedor:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR VENDEDOR POR CÓDIGO ======================= //
  const fetchVendedorByCodigo = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/${codigo}`)
      
      if (!response.ok) {
        throw new Error('Vendedor no encontrado')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al buscar vendedor:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR VENDEDORES POR NOMBRE ======================= //
  const searchVendedoresByNombre = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchAllVendedores()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
      } else {
        setVendedores([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setVendedores([])
    } finally {
      setLoading(false)
    }
  }

  // ======================= VERIFICAR EXISTENCIA DE VENDEDOR ======================= //
  const checkVendedorExists = async (codigo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/${codigo}/exists`)
      
      if (!response.ok) {
        throw new Error('Error al verificar vendedor')
      }
      
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Error al verificar vendedor:', error)
      return false
    }
  }

  // ======================= OBTENER ESTADÍSTICAS ======================= //
  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/estadisticas`)
      
      if (response.ok) {
        const data = await response.json()
        setEstadisticas(data)
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
    }
  }

  // ======================= OBTENER TOP VENDEDORES ======================= //
  const fetchTopVendedores = async (limit = 5) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendedores/top-comision?limit=${limit}`)
      
      if (response.ok) {
        const data = await response.json()
        setVendedores(data)
      }
    } catch (error) {
      console.error('Error al obtener top vendedores:', error)
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
    if (!formData.Nombres || !formData.Apellidos) {
      alert('Por favor complete los campos obligatorios: Nombres y Apellidos')
      return
    }

    // Validar porcentaje de comisión
    if (formData.Porcentaje_comision && (formData.Porcentaje_comision < 0 || formData.Porcentaje_comision > 100)) {
      alert('El porcentaje de comisión debe estar entre 0 y 100')
      return
    }

    setLoading(true)

    try {
      // Preparar datos para enviar
      const vendedorData = {
        Nombres: formData.Nombres,
        Apellidos: formData.Apellidos,
        Telefono: formData.Telefono || null,
        Direccion: formData.Direccion || null,
        Porcentaje_comision: formData.Porcentaje_comision ? parseFloat(formData.Porcentaje_comision) : null
      }

      let result

      if (editingId) {
        // Actualizar vendedor existente
        result = await updateVendedor(editingId, vendedorData)
      } else {
        // Crear nuevo vendedor
        result = await createVendedor(vendedorData)
      }

      if (result.success) {
        alert(result.message)
        handleCancel()
        fetchAllVendedores() // Recargar la lista
        fetchEstadisticas() // Actualizar estadísticas
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (vendedor) => {
    setFormData({
      Codigo_vendedor: vendedor.Codigo_vendedor.toString(),
      Nombres: vendedor.Nombres || '',
      Apellidos: vendedor.Apellidos || '',
      Telefono: vendedor.Telefono || '',
      Direccion: vendedor.Direccion || '',
      Porcentaje_comision: vendedor.Porcentaje_comision ? vendedor.Porcentaje_comision.toString() : ''
    })
    setEditingId(vendedor.Codigo_vendedor)
  }

  const handleDelete = async (codigo) => {
    const vendedor = vendedores.find(v => v.Codigo_vendedor === codigo)
    if (window.confirm(`¿Está seguro de eliminar al vendedor "${vendedor.Nombres} ${vendedor.Apellidos}"?`)) {
      setLoading(true)
      
      const result = await deleteVendedor(codigo)
      
      if (result.success) {
        alert(result.message)
        fetchAllVendedores() // Recargar la lista
        fetchEstadisticas() // Actualizar estadísticas
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
      Codigo_vendedor: '',
      Nombres: '',
      Apellidos: '',
      Telefono: '',
      Direccion: '',
      Porcentaje_comision: ''
    })
    setEditingId(null)
  }

  const handleSearch = async () => {
    if (!formData.Codigo_vendedor) {
      alert('Ingrese un código para buscar')
      return
    }

    setLoading(true)
    const result = await fetchVendedorByCodigo(formData.Codigo_vendedor)
    
    if (result.success) {
      handleEdit(result.data)
      alert('Vendedor encontrado')
    } else {
      alert('Vendedor no encontrado')
    }
    
    setLoading(false)
  }

  const handleSearchByName = async () => {
    await searchVendedoresByNombre(searchTerm)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>VENDEDORES</h2>
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
          <span>Editando vendedor: <strong>{formData.Nombres} {formData.Apellidos}</strong></span>
        </div>
      )}

      {/* Búsqueda por nombre */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombres o apellidos..."
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
            onClick={fetchAllVendedores}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
          <Button 
            onClick={() => fetchTopVendedores(5)}
            variant="success"
            size="medium"
            disabled={loading}
          >
            🏆 Top 5 Comisión
          </Button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>CÓDIGO</label>
          <div className="input-with-search">
            <input
              type="text"
              name="Codigo_vendedor"
              value={formData.Codigo_vendedor}
              onChange={handleInputChange}
              placeholder="Código del vendedor"
              disabled={loading || editingId}
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

        <div className="form-group">
          <label>NOMBRES *</label>
          <input
            type="text"
            name="Nombres"
            value={formData.Nombres}
            onChange={handleInputChange}
            placeholder="Nombres del vendedor"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>APELLIDOS *</label>
          <input
            type="text"
            name="Apellidos"
            value={formData.Apellidos}
            onChange={handleInputChange}
            placeholder="Apellidos del vendedor"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>TELÉFONO</label>
          <input
            type="tel"
            name="Telefono"
            value={formData.Telefono}
            onChange={handleInputChange}
            placeholder="Número de teléfono"
            disabled={loading}
          />
        </div>

        <div className="form-group span-2">
          <label>DIRECCIÓN</label>
          <input
            type="text"
            name="Direccion"
            value={formData.Direccion}
            onChange={handleInputChange}
            placeholder="Dirección completa"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>PORCENTAJE COMISIÓN (%)</label>
          <input
            type="number"
            name="Porcentaje_comision"
            value={formData.Porcentaje_comision}
            onChange={handleInputChange}
            placeholder="0-100"
            min="0"
            max="100"
            step="0.1"
            disabled={loading}
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="vendedores-stats">
        <div className="stats-card">
          <h4>Estadísticas de Vendedores</h4>
          {loading && <p className="loading-text">⏳ Cargando estadísticas...</p>}
          {estadisticas && (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Vendedores:</span>
                <span className="stat-value">{estadisticas.total_vendedores}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comisión Promedio:</span>
                <span className="stat-value">
                  {estadisticas.promedio_comision ? parseFloat(estadisticas.promedio_comision).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comisión Mínima:</span>
                <span className="stat-value">
                  {estadisticas.min_comision ? estadisticas.min_comision : '0'}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Comisión Máxima:</span>
                <span className="stat-value">
                  {estadisticas.max_comision ? estadisticas.max_comision : '0'}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sin Comisión:</span>
                <span className="stat-value">{estadisticas.sin_comision}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLA DE VENDEDORES */}
      <div className="vendedores-table">
        <h3>LISTA DE VENDEDORES ({vendedores.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando vendedores...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>NOMBRES</th>
                <th>APELLIDOS</th>
                <th>TELÉFONO</th>
                <th>DIRECCIÓN</th>
                <th>COMISIÓN (%)</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((vendedor) => (
                <tr 
                  key={vendedor.Codigo_vendedor} 
                  className={editingId === vendedor.Codigo_vendedor ? 'editing-row' : ''}
                >
                  <td>{vendedor.Codigo_vendedor}</td>
                  <td>{vendedor.Nombres}</td>
                  <td>{vendedor.Apellidos}</td>
                  <td>{vendedor.Telefono || 'N/A'}</td>
                  <td>{vendedor.Direccion || 'N/A'}</td>
                  <td>
                    <span className="comision-badge">
                      {vendedor.Porcentaje_comision || 0}%
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(vendedor)}
                        variant="edit"
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(vendedor.Codigo_vendedor)}
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
              {vendedores.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">👨‍💼</span>
                      <p>No hay vendedores registrados</p>
                      <small>Agregue su primer vendedor usando el formulario</small>
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

export default VendedoresForm
