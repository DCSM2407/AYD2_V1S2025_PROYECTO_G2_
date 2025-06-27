// src/components/Forms/ClientesForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // CORREGIDO: era '../iu/Button'

const ClientesForm = () => {
  const [formData, setFormData] = useState({
    ID_cliente: '',
    Cod_departamento: '',
    Cod_municipio: '',
    Numero_Cliente: '',
    Nombre_Contacto: '',
    Nombre_Negocio: '',
    Direccion: '',
    NIT: '',
    Encargado_bodega: '',
    Telefono: '',
    Tipo_venta_autorizado: '',
    Observaciones: ''
  })

  const [clientes, setClientes] = useState([])
  const [clientesOriginales, setClientesOriginales] = useState([]) // NUEVO: para mantener datos originales
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // NUEVOS ESTADOS PARA FILTROS
  const [filtros, setFiltros] = useState({
    departamento: '',
    municipio: '',
    tipoVenta: ''
  })
  const [municipiosFiltroDisponibles, setMunicipiosFiltroDisponibles] = useState([])

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllClientes()
    fetchDepartamentos()
    fetchMunicipios()
  }, [])

  // Filtrar municipios cuando cambia el departamento en el formulario
  useEffect(() => {
    if (formData.Cod_departamento) {
      fetchMunicipiosByDepartamento(formData.Cod_departamento)
    } else {
      setMunicipiosFiltrados([])
    }
  }, [formData.Cod_departamento])

  // NUEVO: Filtrar municipios para el filtro de búsqueda
  useEffect(() => {
    if (filtros.departamento) {
      const municipiosDelDepartamento = municipios.filter(m => 
        m.Cod_departamento === filtros.departamento
      )
      setMunicipiosFiltroDisponibles(municipiosDelDepartamento)
      // Limpiar municipio si no pertenece al departamento seleccionado
      if (filtros.municipio) {
        const municipioValido = municipiosDelDepartamento.find(m => 
          m.Cod_municipio === parseInt(filtros.municipio)
        )
        if (!municipioValido) {
          setFiltros(prev => ({ ...prev, municipio: '' }))
        }
      }
    } else {
      setMunicipiosFiltroDisponibles([])
      setFiltros(prev => ({ ...prev, municipio: '' }))
    }
  }, [filtros.departamento, municipios])

  // NUEVO: Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros()
  }, [filtros, clientesOriginales])

  // ======================= FUNCIONES DE FILTRADO ======================= //
  const aplicarFiltros = () => {
    let clientesFiltrados = [...clientesOriginales]

    // Filtrar por departamento
    if (filtros.departamento) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.Cod_departamento === filtros.departamento
      )
    }

    // Filtrar por municipio
    if (filtros.municipio) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.Cod_municipio === parseInt(filtros.municipio)
      )
    }

    // Filtrar por tipo de venta
    if (filtros.tipoVenta) {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.Tipo_venta_autorizado === filtros.tipoVenta
      )
    }

    setClientes(clientesFiltrados)
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
      departamento: '',
      municipio: '',
      tipoVenta: ''
    })
    setClientes(clientesOriginales)
  }

  // ======================= API FUNCTIONS (sin cambios) ======================= //
  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/departamentos`)
      
      if (response.ok) {
        const data = await response.json()
        setDepartamentos(data)
      } else {
        console.error('Error al obtener departamentos')
      }
    } catch (error) {
      console.error('Error al obtener departamentos:', error)
    }
  }

  const fetchMunicipios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/municipios`)
      
      if (response.ok) {
        const data = await response.json()
        setMunicipios(data)
      } else {
        console.error('Error al obtener municipios')
      }
    } catch (error) {
      console.error('Error al obtener municipios:', error)
    }
  }

  const fetchMunicipiosByDepartamento = async (codDepartamento) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/municipios/departamento/${codDepartamento}`)
      
      if (response.ok) {
        const data = await response.json()
        setMunicipiosFiltrados(data)
      } else {
        setMunicipiosFiltrados([])
      }
    } catch (error) {
      console.error('Error al obtener municipios por departamento:', error)
      setMunicipiosFiltrados([])
    }
  }

  // MODIFICADO: fetchAllClientes para guardar datos originales
  const fetchAllClientes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      setClientesOriginales(data) // Guardar datos originales
      setClientes(data)
    } catch (error) {
      console.error('Error al obtener clientes:', error)
      alert('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  // MODIFICADO: searchClientesByNombre para actualizar datos originales
  const searchClientesByNombre = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchAllClientes()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (response.ok) {
        const data = await response.json()
        setClientesOriginales(data) // Actualizar datos originales
        setClientes(data)
      } else {
        setClientesOriginales([])
        setClientes([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setClientesOriginales([])
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  // ======================= RESTO DE FUNCIONES (sin cambios significativos) ======================= //
  const createCliente = async (clienteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clienteData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear cliente')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al crear cliente:', error)
      return { success: false, error: error.message }
    }
  }

  const updateCliente = async (id, clienteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clienteData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar cliente')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteCliente = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar cliente')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  const fetchClienteById = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/${id}`)
      
      if (!response.ok) {
        throw new Error('Cliente no encontrado')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      return { success: false, error: error.message }
    }
  }

  const checkClienteExists = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/${id}/exists`)
      
      if (!response.ok) {
        throw new Error('Error al verificar cliente')
      }
      
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Error al verificar cliente:', error)
      return false
    }
  }

  // ======================= HANDLERS ======================= //
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar municipio cuando cambia departamento
    if (name === 'Cod_departamento') {
      setFormData(prev => ({
        ...prev,
        Cod_municipio: ''
      }))
    }
  }

  const handleMunicipioChange = async (e) => {
    const codMunicipio = e.target.value
    
    if (codMunicipio) {
      const municipio = municipios.find(m => m.Cod_municipio === parseInt(codMunicipio))
      
      if (municipio) {
        setFormData(prev => ({
          ...prev,
          Cod_municipio: codMunicipio,
          Cod_departamento: municipio.Cod_departamento
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        Cod_municipio: ''
      }))
    }
  }

  const handleSave = async () => {
    // Validar campos obligatorios
    if (!formData.ID_cliente || !formData.Nombre_Contacto || !formData.NIT) {
      alert('Por favor complete los campos obligatorios: ID Cliente, Nombre de Contacto y NIT')
      return
    }

    setLoading(true)

    try {
      const clienteData = { ...formData }
      
      if (clienteData.Cod_municipio) {
        const municipio = municipios.find(m => m.Cod_municipio === parseInt(clienteData.Cod_municipio))
        if (municipio) {
          clienteData.Cod_departamento = municipio.Cod_departamento
        }
      }

      let result
      
      if (editingId) {
        result = await updateCliente(editingId, clienteData)
      } else {
        const exists = await checkClienteExists(clienteData.ID_cliente)
        if (exists) {
          alert('Ya existe un cliente con este ID')
          setLoading(false)
          return
        }
        
        result = await createCliente(clienteData)
      }

      if (result.success) {
        alert(result.message)
        handleCancel()
        fetchAllClientes()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (cliente) => {
    setFormData({
      ID_cliente: cliente.ID_cliente,
      Cod_departamento: cliente.Cod_departamento || '',
      Cod_municipio: cliente.Cod_municipio || '',
      Numero_Cliente: cliente.Numero_Cliente || '',
      Nombre_Contacto: cliente.Nombre_Contacto || '',
      Nombre_Negocio: cliente.Nombre_Negocio || '',
      Direccion: cliente.Direccion || '',
      NIT: cliente.NIT || '',
      Encargado_bodega: cliente.Encargado_bodega || '',
      Telefono: cliente.Telefono || '',
      Tipo_venta_autorizado: cliente.Tipo_venta_autorizado || '',
      Observaciones: cliente.Observaciones || ''
    })
    setEditingId(cliente.ID_cliente)
  }

  const handleDelete = async (id) => {
    const cliente = clientes.find(c => c.ID_cliente === id)
    if (window.confirm(`¿Está seguro de eliminar al cliente "${cliente.Nombre_Contacto}"?`)) {
      setLoading(true)
      
      const result = await deleteCliente(id)
      
      if (result.success) {
        alert(result.message)
        fetchAllClientes()
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
      ID_cliente: '',
      Cod_departamento: '',
      Cod_municipio: '',
      Numero_Cliente: '',
      Nombre_Contacto: '',
      Nombre_Negocio: '',
      Direccion: '',
      NIT: '',
      Encargado_bodega: '',
      Telefono: '',
      Tipo_venta_autorizado: '',
      Observaciones: ''
    })
    setEditingId(null)
  }

  const handleSearch = async () => {
    if (!formData.ID_cliente) {
      alert('Ingrese un ID para buscar')
      return
    }

    setLoading(true)
    const result = await fetchClienteById(formData.ID_cliente)
    
    if (result.success) {
      handleEdit(result.data)
      alert('Cliente encontrado')
    } else {
      alert('Cliente no encontrado')
    }
    
    setLoading(false)
  }

  const handleSearchByName = async () => {
    await searchClientesByNombre(searchTerm)
  }

  // ======================= HELPERS ======================= //
  const getDepartamentoNombre = (codigo) => {
    const dept = departamentos.find(d => d.Cod_departamento === codigo)
    return dept ? dept.Descripcion : codigo
  }

  const getMunicipioNombre = (codigo) => {
    const mun = municipios.find(m => m.Cod_municipio === parseInt(codigo))
    return mun ? mun.Descripcion : codigo
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>CLIENTES</h2>
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
          <span>Editando cliente: <strong>{formData.Nombre_Contacto}</strong></span>
        </div>
      )}

      {/* NUEVA SECCIÓN: Filtros de búsqueda */}
      

      {/* Búsqueda por nombre */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de contacto o negocio..."
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
            onClick={fetchAllClientes}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
        </div>
      </div>

      {/* Resto del formulario sin cambios... */}
      <div className="form-grid">
        <div className="form-group">
          <label>ID CLIENTE *</label>
          <div className="input-with-search">
            <input
              type="text"
              name="ID_cliente"
              value={formData.ID_cliente}
              onChange={handleInputChange}
              placeholder="ID del cliente"
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

        <div className="form-group">
          <label>NÚMERO CLIENTE</label>
          <input
            type="text"
            name="Numero_Cliente"
            value={formData.Numero_Cliente}
            onChange={handleInputChange}
            placeholder="Número de cliente"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NOMBRE CONTACTO *</label>
          <input
            type="text"
            name="Nombre_Contacto"
            value={formData.Nombre_Contacto}
            onChange={handleInputChange}
            placeholder="Nombre del contacto"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>NOMBRE NEGOCIO</label>
          <input
            type="text"
            name="Nombre_Negocio"
            value={formData.Nombre_Negocio}
            onChange={handleInputChange}
            placeholder="Nombre del negocio"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>NIT *</label>
          <input
            type="text"
            name="NIT"
            value={formData.NIT}
            onChange={handleInputChange}
            placeholder="Número de NIT"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label>DEPARTAMENTO</label>
          <select
            name="Cod_departamento"
            value={formData.Cod_departamento}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Seleccionar departamento...</option>
            {departamentos.map(dept => (
              <option key={dept.Cod_departamento} value={dept.Cod_departamento}>
                {dept.Descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>MUNICIPIO</label>
          <select
            name="Cod_municipio"
            value={formData.Cod_municipio}
            onChange={handleMunicipioChange}
            disabled={loading || municipiosFiltrados.length === 0}
          >
            <option value="">Seleccionar municipio...</option>
            {municipiosFiltrados.map(municipio => (
              <option key={municipio.Cod_municipio} value={municipio.Cod_municipio}>
                {municipio.Descripcion}
              </option>
            ))}
          </select>
          {formData.Cod_departamento && municipiosFiltrados.length === 0 && (
            <small className="text-muted">No hay municipios disponibles para este departamento</small>
          )}
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

        <div className="form-group">
          <label>TIPO DE VENTA</label>
          <select
            name="Tipo_venta_autorizado"
            value={formData.Tipo_venta_autorizado}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Seleccionar...</option>
            <option value="Contado">Contado</option>
            <option value="Credito">Crédito</option>
          </select>
        </div>

        <div className="form-group">
          <label>ENCARGADO BODEGA</label>
          <input
            type="text"
            name="Encargado_bodega"
            value={formData.Encargado_bodega}
            onChange={handleInputChange}
            placeholder="Nombre del encargado"
            disabled={loading}
          />
        </div>

        <div className="form-group full-width">
          <label>OBSERVACIONES</label>
          <textarea
            name="Observaciones"
            value={formData.Observaciones}
            onChange={handleInputChange}
            rows={4}
            placeholder="Observaciones adicionales..."
            disabled={loading}
          />
        </div>
      </div>

      <div className="filtros-section">
        <h3>FILTROS DE BÚSQUEDA</h3>
        <div className="filtros-grid">
          <div className="form-group">
            <label>FILTRAR POR DEPARTAMENTO</label>
            <select
              name="departamento"
              value={filtros.departamento}
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map(dept => (
                <option key={dept.Cod_departamento} value={dept.Cod_departamento}>
                  {dept.Descripcion}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>FILTRAR POR MUNICIPIO</label>
            <select
              name="municipio"
              value={filtros.municipio}
              onChange={handleFiltroChange}
              disabled={loading || !filtros.departamento}
            >
              <option value="">Todos los municipios</option>
              {municipiosFiltroDisponibles.map(municipio => (
                <option key={municipio.Cod_municipio} value={municipio.Cod_municipio}>
                  {municipio.Descripcion}
                </option>
              ))}
            </select>
            {filtros.departamento && municipiosFiltroDisponibles.length === 0 && (
              <small className="text-muted">No hay municipios disponibles para este departamento</small>
            )}
          </div>

          <div className="form-group">
            <label>FILTRAR POR TIPO DE VENTA</label>
            <select
              name="tipoVenta"
              value={filtros.tipoVenta}
              onChange={handleFiltroChange}
              disabled={loading}
            >
              <option value="">Todos los tipos</option>
              <option value="Contado">Contado</option>
              <option value="Credito">Crédito</option>
            </select>
          </div>

          <div className="form-group">
            <label>&nbsp;</label>
            <Button 
              onClick={limpiarFiltros}
              variant="outline"
              size="medium"
              disabled={loading}
              className="flex items-center gap-2"
            >
              🔄 Limpiar Filtros
            </Button>
          </div>
        </div>

        <div className="filtros-resumen">
          <p>
            <strong>Resultados:</strong> {clientes.length} cliente(s) 
            {filtros.departamento || filtros.municipio || filtros.tipoVenta ? ' filtrado(s)' : ' total(es)'}
          </p>
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="clientes-table">
        <h3>LISTA DE CLIENTES ({clientes.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando clientes...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE CONTACTO</th>
                <th>NEGOCIO</th>
                <th>NIT</th>
                <th>DEPARTAMENTO</th>
                <th>MUNICIPIO</th>
                <th>TELÉFONO</th>
                <th>TIPO VENTA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr 
                  key={cliente.ID_cliente} 
                  className={editingId === cliente.ID_cliente ? 'editing-row' : ''}
                >
                  <td>{cliente.ID_cliente}</td>
                  <td>{cliente.Nombre_Contacto}</td>
                  <td>{cliente.Nombre_Negocio || 'N/A'}</td>
                  <td>{cliente.NIT}</td>
                  <td>{getDepartamentoNombre(cliente.Cod_departamento)}</td>
                  <td>{getMunicipioNombre(cliente.Cod_municipio)}</td>
                  <td>{cliente.Telefono || 'N/A'}</td>
                  <td>
                    <span className={`tipo-venta-badge ${cliente.Tipo_venta_autorizado?.toLowerCase()}`}>
                      {cliente.Tipo_venta_autorizado || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(cliente)}
                        variant="edit"
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(cliente.ID_cliente)}
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
              {clientes.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">👥</span>
                      <p>No hay clientes registrados</p>
                      <small>Agregue su primer cliente usando el formulario</small>
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

export default ClientesForm
