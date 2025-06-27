// src/components/Forms/InventarioForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import

const InventarioForm = () => {
  const [formData, setFormData] = useState({
    ID_importacion: '',
    ID_proveedor: '',
    Codigo_producto: '',
    Fecha_ingreso: '',
    Producto: '',
    Cantidad_fardos: '',
    Unidades_por_fardo: '',
    Unidades_totales: '',
    No_contenedor: '',
    No_duca: '',
    Fecha_duca: '',
    No_duca_rectificada: '',
    Fecha_duca_rectificada: '',
    Observaciones: ''
  })

  const [importaciones, setImportaciones] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllImportaciones()
    fetchProveedores()
    fetchProductos()
  }, [])

  // Auto-calcular unidades totales
  useEffect(() => {
    const cantidad = parseFloat(formData.Cantidad_fardos) || 0
    const unidades = parseFloat(formData.Unidades_por_fardo) || 0
    const total = cantidad * unidades
    
    if (total !== parseFloat(formData.Unidades_totales)) {
      setFormData(prev => ({
        ...prev,
        Unidades_totales: total.toString()
      }))
    }
  }, [formData.Cantidad_fardos, formData.Unidades_por_fardo])

  // ======================= OBTENER TODAS LAS IMPORTACIONES ======================= //
  // ======================= OBTENER TODAS LAS IMPORTACIONES ======================= //
const fetchAllImportaciones = async () => {
  setLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/importaciones`)
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Importaciones obtenidas:', data) // Para debugging
    setImportaciones(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Error al obtener importaciones:', error)
    alert(`Error al cargar las importaciones: ${error.message}`)
    setImportaciones([])
  } finally {
    setLoading(false)
  }
}


  // ======================= OBTENER PROVEEDORES ======================= //
  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/proveedores`)
      
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)
      }
    } catch (error) {
      console.error('Error al obtener proveedores:', error)
    }
  }

  // ======================= OBTENER PRODUCTOS ======================= //
  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/productos`)
      
      if (response.ok) {
        const data = await response.json()
        setProductos(data)
      }
    } catch (error) {
      console.error('Error al obtener productos:', error)
    }
  }

  // ======================= CREAR IMPORTACIÓN ======================= //
  const createImportacion = async (importacionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importacionData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear importación')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al crear importación:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ACTUALIZAR IMPORTACIÓN ======================= //
  const updateImportacion = async (id, importacionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importacionData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar importación')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar importación:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ELIMINAR IMPORTACIÓN ======================= //
  const deleteImportacion = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar importación')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al eliminar importación:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR IMPORTACIÓN POR ID ======================= //
  const fetchImportacionById = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones/${id}`)
      
      if (!response.ok) {
        throw new Error('Importación no encontrada')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al buscar importación:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR IMPORTACIONES POR CONTENEDOR ======================= //
  const searchImportacionesByContenedor = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchAllImportaciones()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (response.ok) {
        const data = await response.json()
        setImportaciones(data)
      } else {
        setImportaciones([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setImportaciones([])
    } finally {
      setLoading(false)
    }
  }

  // ======================= VERIFICAR EXISTENCIA DE IMPORTACIÓN ======================= //
  const checkImportacionExists = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/importaciones/${id}/exists`)
      
      if (!response.ok) {
        throw new Error('Error al verificar importación')
      }
      
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Error al verificar importación:', error)
      return false
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
    if (!formData.ID_proveedor || !formData.Codigo_producto || !formData.Fecha_ingreso) {
      alert('Por favor complete los campos obligatorios: Proveedor, Producto y Fecha de Ingreso')
      return
    }

    setLoading(true)

    try {
      // Preparar datos para enviar
      const importacionData = {
        ID_proveedor: formData.ID_proveedor,
        Codigo_producto: formData.Codigo_producto,
        Fecha_ingreso: formData.Fecha_ingreso,
        Producto: formData.Producto,
        Cantidad_fardos: parseInt(formData.Cantidad_fardos) || 0,
        Unidades_por_fardo: parseInt(formData.Unidades_por_fardo) || 0,
        Unidades_totales: parseInt(formData.Unidades_totales) || 0,
        No_contenedor: formData.No_contenedor || null,
        No_duca: formData.No_duca || null,
        Fecha_duca: formData.Fecha_duca || null,
        No_duca_rectificada: formData.No_duca_rectificada || null,
        Fecha_duca_rectificada: formData.Fecha_duca_rectificada || null,
        Observaciones: formData.Observaciones || null
      }

      let result

      if (editingId) {
        // Actualizar importación existente
        result = await updateImportacion(editingId, importacionData)
      } else {
        // Crear nueva importación
        result = await createImportacion(importacionData)
      }

      if (result.success) {
        alert(result.message)
        handleCancel()
        fetchAllImportaciones() // Recargar la lista
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (importacion) => {
    setFormData({
      ID_importacion: importacion.ID_importacion || '',
      ID_proveedor: importacion.ID_proveedor || '',
      Codigo_producto: importacion.Codigo_producto || '',
      Fecha_ingreso: importacion.Fecha_ingreso || '',
      Producto: importacion.Producto || '',
      Cantidad_fardos: importacion.Cantidad_fardos ? importacion.Cantidad_fardos.toString() : '',
      Unidades_por_fardo: importacion.Unidades_por_fardo ? importacion.Unidades_por_fardo.toString() : '',
      Unidades_totales: importacion.Unidades_totales ? importacion.Unidades_totales.toString() : '',
      No_contenedor: importacion.No_contenedor || '',
      No_duca: importacion.No_duca || '',
      Fecha_duca: importacion.Fecha_duca || '',
      No_duca_rectificada: importacion.No_duca_rectificada || '',
      Fecha_duca_rectificada: importacion.Fecha_duca_rectificada || '',
      Observaciones: importacion.Observaciones || ''
    })
    setEditingId(importacion.ID_importacion)
  }

  const handleDelete = async (id) => {
    const importacion = importaciones.find(i => i.ID_importacion === id)
    if (window.confirm(`¿Está seguro de eliminar la importación "${importacion.No_contenedor || id}"?`)) {
      setLoading(true)
      
      const result = await deleteImportacion(id)
      
      if (result.success) {
        alert(result.message)
        fetchAllImportaciones()
        if (editingId === id) {
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
      ID_importacion: '',
      ID_proveedor: '',
      Codigo_producto: '',
      Fecha_ingreso: '',
      Producto: '',
      Cantidad_fardos: '',
      Unidades_por_fardo: '',
      Unidades_totales: '',
      No_contenedor: '',
      No_duca: '',
      Fecha_duca: '',
      No_duca_rectificada: '',
      Fecha_duca_rectificada: '',
      Observaciones: ''
    })
    setEditingId(null)
  }

  const handleSearch = async () => {
    if (!formData.ID_importacion) {
      alert('Ingrese un ID para buscar')
      return
    }

    setLoading(true)
    const result = await fetchImportacionById(formData.ID_importacion)
    
    if (result.success) {
      handleEdit(result.data)
      alert('Importación encontrada')
    } else {
      alert('Importación no encontrada')
    }
    
    setLoading(false)
  }

  const handleSearchByContenedor = async () => {
    await searchImportacionesByContenedor(searchTerm)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>INGRESO DE INVENTARIO</h2>
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
          <span>Editando importación: <strong>{formData.No_contenedor || formData.ID_importacion}</strong></span>
        </div>
      )}

      {/* Búsqueda por número de contenedor */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número de contenedor, DUCA o producto..."
            className="search-input"
          />
          <Button 
            onClick={handleSearchByContenedor}
            variant="info"
            size="medium"
            disabled={loading}
          >
            🔍 Buscar
          </Button>
          <Button 
            onClick={fetchAllImportaciones}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
        </div>
      </div>

      <div className="inventory-form-grid">
        <div className="form-group">
          <label>ID IMPORTACIÓN</label>
          <div className="input-with-search">
            <input
              type="text"
              name="ID_importacion"
              value={formData.ID_importacion}
              onChange={handleInputChange}
              placeholder="ID de la importación"
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
          <label>PROVEEDOR *</label>
          <select
            name="ID_proveedor"
            value={formData.ID_proveedor}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedores.map(proveedor => (
              <option key={proveedor.ID_proveedor} value={proveedor.ID_proveedor}>
                {proveedor.Nombre_proveedor}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>PRODUCTO *</label>
          <select
            name="Codigo_producto"
            value={formData.Codigo_producto}
            onChange={handleInputChange}
            disabled={loading}
            required
          >
            <option value="">Seleccionar producto...</option>
            {productos.map(producto => (
              <option key={producto.Codigo_producto} value={producto.Codigo_producto}>
                {producto.Nombre_producto}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>FECHA INGRESO *</label>
          <input
            type="date"
            name="Fecha_ingreso"
            value={formData.Fecha_ingreso}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>NOMBRE PRODUCTO</label>
          <input
            type="text"
            name="Producto"
            value={formData.Producto}
            onChange={handleInputChange}
            placeholder="Nombre descriptivo del producto"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>CANTIDAD FARDOS *</label>
          <input
            type="number"
            name="Cantidad_fardos"
            value={formData.Cantidad_fardos}
            onChange={handleInputChange}
            step="1"
            min="0"
            placeholder="Cantidad de fardos"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>UNIDADES POR FARDO</label>
          <input
            type="number"
            name="Unidades_por_fardo"
            value={formData.Unidades_por_fardo}
            onChange={handleInputChange}
            step="1"
            min="1"
            placeholder="Unidades por fardo"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>UNIDADES TOTALES</label>
          <input
            type="number"
            name="Unidades_totales"
            value={formData.Unidades_totales}
            onChange={handleInputChange}
            readOnly
            className="readonly-input"
            placeholder="Calculado automáticamente"
          />
        </div>

        <div className="form-group">
          <label>NO. CONTENEDOR</label>
          <input
            type="text"
            name="No_contenedor"
            value={formData.No_contenedor}
            onChange={handleInputChange}
            placeholder="Número de contenedor"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NO. DE DUCA</label>
          <input
            type="text"
            name="No_duca"
            value={formData.No_duca}
            onChange={handleInputChange}
            placeholder="Número de DUCA"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>FECHA DE DUCA</label>
          <input
            type="date"
            name="Fecha_duca"
            value={formData.Fecha_duca}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NO. DE DUCA RECTIFICATIVA</label>
          <input
            type="text"
            name="No_duca_rectificada"
            value={formData.No_duca_rectificada}
            onChange={handleInputChange}
            placeholder="Número de DUCA rectificativa"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>FECHA DE DUCA RECTIFICATIVA</label>
          <input
            type="date"
            name="Fecha_duca_rectificada"
            value={formData.Fecha_duca_rectificada}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <label>OBSERVACIONES</label>
          <textarea
            name="Observaciones"
            value={formData.Observaciones}
            onChange={handleInputChange}
            rows={6}
            placeholder="Observaciones sobre el ingreso de inventario..."
            disabled={loading}
          />
        </div>
      </div>

      

      {/* TABLA DE IMPORTACIONES */}
      <div className="importaciones-table">
        <h3>LISTA DE IMPORTACIONES ({importaciones.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando importaciones...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>PROVEEDOR</th>
                <th>PRODUCTO</th>
                <th>FECHA INGRESO</th>
                <th>CANTIDAD FARDOS</th>
                <th>UNIDADES TOTALES</th>
                <th>NO. CONTENEDOR</th>
                <th>NO. DUCA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {importaciones.map((importacion) => (
                <tr 
                  key={importacion.ID_importacion} 
                  className={editingId === importacion.ID_importacion ? 'editing-row' : ''}
                >
                  <td>{importacion.ID_importacion}</td>
                  <td>{importacion.Nombre_proveedor || 'N/A'}</td>
                  <td>{importacion.Nombre_producto || importacion.Producto || 'N/A'}</td>
                  <td>{importacion.Fecha_ingreso}</td>
                  <td>{importacion.Cantidad_fardos}</td>
                  <td>
                    <span className="unidades-badge">
                      {importacion.Unidades_totales}
                    </span>
                  </td>
                  <td>{importacion.No_contenedor || 'N/A'}</td>
                  <td>{importacion.No_duca || 'N/A'}</td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(importacion)}
                        variant="edit"
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(importacion.ID_importacion)}
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
              {importaciones.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">📦</span>
                      <p>No hay importaciones registradas</p>
                      <small>Agregue su primera importación usando el formulario</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="inventory-note">
        <p><strong>Pantalla para registrar el ingreso de productos por DUCA, estableciendo:</strong></p>
        <ul>
          <li>Fecha de ingreso</li>
          <li>Producto y cantidades</li>
          <li>Información de contenedor y DUCA</li>
          <li>Observaciones relevantes</li>
        </ul>
      </div>
    </div>
  )
}

export default InventarioForm
