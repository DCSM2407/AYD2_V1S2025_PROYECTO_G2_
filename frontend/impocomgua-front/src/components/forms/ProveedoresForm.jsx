// src/components/Forms/ProveedoresForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button'

const API_BASE_URL = 'http://127.0.0.1:5000'

const ProveedoresForm = () => {
  const [proveedores, setProveedores] = useState([])
  const [formData, setFormData] = useState({
    ID_proveedor: '',
    Nombre_proveedor: '',
    NIT_proveedor: '',
    Pais_origen: '',
    Contacto: '',
    Direccion: '',
    Telefono: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Lista de países para autocompletado
  const paises = [
    'China', 'Estados Unidos', 'México', 'Colombia', 'Brasil', 'Argentina',
    'Chile', 'Perú', 'Ecuador', 'Venezuela', 'España', 'Italia', 'Francia',
    'Alemania', 'Reino Unido', 'Japón', 'Corea del Sur', 'India', 'Tailandia'
  ]

  // Cargar proveedores al montar
  useEffect(() => {
    fetchProveedores()
  }, [])

  // ================== API CRUD ==================
  const fetchProveedores = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/proveedores`)
      if (!res.ok) throw new Error('Error al cargar proveedores')
      const data = await res.json()
      setProveedores(data)
    } catch (e) {
      console.error('Error al obtener proveedores:', e)
      alert('Error al cargar los proveedores')
    } finally {
      setLoading(false)
    }
  }

  const createProveedor = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/proveedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Error al crear proveedor')
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProveedor = async (id, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/proveedores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Error al actualizar proveedor')
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const deleteProveedor = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/proveedores/${id}`, { 
        method: 'DELETE' 
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Error al eliminar proveedor')
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const searchProveedores = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchProveedores()
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/proveedores/search?q=${encodeURIComponent(searchTerm)}`)
      if (res.ok) {
        const data = await res.json()
        setProveedores(data)
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setProveedores([])
    } finally {
      setLoading(false)
    }
  }

  // ================== Handlers ==================
  const validate = () => {
    const errs = {}
    if (!formData.ID_proveedor) errs.ID_proveedor = 'ID requerido'
    if (!formData.Nombre_proveedor) errs.Nombre_proveedor = 'Nombre requerido'
    if (!formData.NIT_proveedor) errs.NIT_proveedor = 'NIT requerido'
    if (!formData.Pais_origen) errs.Pais_origen = 'País requerido'
    
    // Validar formato de NIT (opcional)
    if (formData.NIT_proveedor && !/^[\d\-K]+$/.test(formData.NIT_proveedor)) {
      errs.NIT_proveedor = 'Formato de NIT inválido'
    }
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    
    try {
      let result
      if (editingId) {
        result = await updateProveedor(editingId, formData)
      } else {
        result = await createProveedor(formData)
      }
      
      if (result.success) {
        alert(result.message)
        fetchProveedores()
        handleCancel()
      } else {
        alert(result.error)
      }
    } catch (e) {
      alert('Error inesperado al guardar proveedor')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (proveedor) => {
    setFormData({ ...proveedor })
    setEditingId(proveedor.ID_proveedor)
    setErrors({})
  }

  const handleDelete = async (id) => {
    const proveedor = proveedores.find(p => p.ID_proveedor === id)
    if (window.confirm(`¿Está seguro de eliminar al proveedor "${proveedor.Nombre_proveedor}"?`)) {
      setLoading(true)
      
      const result = await deleteProveedor(id)
      
      if (result.success) {
        alert(result.message)
        fetchProveedores()
        if (editingId === id) handleCancel()
      } else {
        alert(result.error)
      }
      
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      ID_proveedor: '',
      Nombre_proveedor: '',
      NIT_proveedor: '',
      Pais_origen: '',
      Contacto: '',
      Direccion: '',
      Telefono: ''
    })
    setEditingId(null)
    setErrors({})
  }

  const handleSearchByName = async () => {
    await searchProveedores(searchTerm)
  }

  const getProveedoresPorPais = () => {
    const paisesCount = {}
    proveedores.forEach(p => {
      paisesCount[p.Pais_origen] = (paisesCount[p.Pais_origen] || 0) + 1
    })
    return paisesCount
  }

  // ================== Render ==================
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>PROVEEDORES</h2>
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
          <span>Editando proveedor: <strong>{formData.Nombre_proveedor}</strong></span>
        </div>
      )}

      {/* Búsqueda por nombre */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de proveedor..."
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
            onClick={fetchProveedores}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>ID PROVEEDOR *</label>
          <input
            type="text"
            name="ID_proveedor"
            value={formData.ID_proveedor}
            onChange={handleInputChange}
            placeholder="Código único del proveedor"
            disabled={!!editingId || loading}
            className={errors.ID_proveedor ? 'error' : ''}
            required
          />
          {errors.ID_proveedor && <span className="error-text">{errors.ID_proveedor}</span>}
        </div>

        <div className="form-group">
          <label>NOMBRE PROVEEDOR *</label>
          <input
            type="text"
            name="Nombre_proveedor"
            value={formData.Nombre_proveedor}
            onChange={handleInputChange}
            placeholder="Nombre de la empresa proveedora"
            disabled={loading}
            className={errors.Nombre_proveedor ? 'error' : ''}
            required
          />
          {errors.Nombre_proveedor && <span className="error-text">{errors.Nombre_proveedor}</span>}
        </div>

        <div className="form-group">
          <label>NIT PROVEEDOR *</label>
          <input
            type="text"
            name="NIT_proveedor"
            value={formData.NIT_proveedor}
            onChange={handleInputChange}
            placeholder="Número de identificación tributaria"
            disabled={loading}
            className={errors.NIT_proveedor ? 'error' : ''}
            required
          />
          {errors.NIT_proveedor && <span className="error-text">{errors.NIT_proveedor}</span>}
        </div>

        <div className="form-group">
          <label>PAÍS DE ORIGEN *</label>
          <select
            name="Pais_origen"
            value={formData.Pais_origen}
            onChange={handleInputChange}
            disabled={loading}
            className={errors.Pais_origen ? 'error' : ''}
            required
          >
            <option value="">Seleccionar país...</option>
            {paises.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
          {errors.Pais_origen && <span className="error-text">{errors.Pais_origen}</span>}
        </div>

        <div className="form-group">
          <label>CONTACTO</label>
          <input
            type="text"
            name="Contacto"
            value={formData.Contacto}
            onChange={handleInputChange}
            placeholder="Nombre del contacto principal"
            disabled={loading}
          />
        </div>

        <div className="form-group">
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
      </div>

      {/* Estadísticas por país */}
      {proveedores.length > 0 && (
        <div className="proveedores-stats">
          <div className="stats-card">
            <h4>Distribución por País</h4>
            <div className="paises-grid">
              {Object.entries(getProveedoresPorPais()).map(([pais, cantidad]) => (
                <div key={pais} className="pais-stat">
                  <span className="pais-nombre">🌍 {pais}</span>
                  <span className="pais-cantidad">{cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="proveedores-table">
        <h3>LISTA DE PROVEEDORES ({proveedores.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando proveedores...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>NIT</th>
                <th>PAÍS</th>
                <th>CONTACTO</th>
                <th>DIRECCIÓN</th>
                <th>TELÉFONO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr 
                  key={p.ID_proveedor}
                  className={editingId === p.ID_proveedor ? 'editing-row' : ''}
                >
                  <td>{p.ID_proveedor}</td>
                  <td>{p.Nombre_proveedor}</td>
                  <td>{p.NIT_proveedor}</td>
                  <td>{p.Pais_origen}</td>
                  <td>{p.Contacto || 'N/A'}</td>
                  <td>{p.Direccion || 'N/A'}</td>
                  <td>{p.Telefono || 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(p)} 
                        variant="edit" 
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(p.ID_proveedor)} 
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
              {proveedores.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">🚚</span>
                      <p>No hay proveedores registrados</p>
                      <small>Agregue su primer proveedor usando el formulario</small>
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

export default ProveedoresForm
