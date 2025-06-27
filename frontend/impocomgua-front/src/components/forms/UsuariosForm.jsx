// src/components/Forms/UsuariosForm.jsx
import { useState, useEffect } from 'react'
import Button from '../iu/Button' // Corregido el import

const UsuariosForm = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    idRol: ''
  })

  // Roles que se cargarán desde la API
  const [roles, setRoles] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllUsuarios()
    fetchRoles()
  }, [])

  // ======================= OBTENER TODOS LOS USUARIOS ======================= //
  const fetchAllUsuarios = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      alert('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  // ======================= OBTENER ROLES ======================= //
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`)
      
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        // Si no tienes endpoint de roles, usar datos estáticos
        setRoles([
          { ID_rol: 1, Nombre_rol: 'Gerencia General', descripcion: 'Acceso completo al sistema' },
          { ID_rol: 2, Nombre_rol: 'Gerente de Inventario', descripcion: 'Gestión de inventario y productos' },
          { ID_rol: 3, Nombre_rol: 'Gerente de Ventas y Finanzas', descripcion: 'Gestión de ventas, clientes y finanzas' }
        ])
      }
    } catch (error) {
      console.error('Error al obtener roles:', error)
      // Usar roles por defecto
      setRoles([
        { ID_rol: 1, Nombre_rol: 'Gerencia General', descripcion: 'Acceso completo al sistema' },
        { ID_rol: 2, Nombre_rol: 'Gerente de Inventario', descripcion: 'Gestión de inventario y productos' },
        { ID_rol: 3, Nombre_rol: 'Gerente de Ventas y Finanzas', descripcion: 'Gestión de ventas, clientes y finanzas' }
      ])
    }
  }

  // ======================= CREAR USUARIO ======================= //
  const createUsuario = async (usuarioData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear usuario')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ACTUALIZAR USUARIO ======================= //
  const updateUsuario = async (id, usuarioData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar usuario')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= ELIMINAR USUARIO ======================= //
  const deleteUsuario = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar usuario')
      }

      return { success: true, message: result.message }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR USUARIO POR ID ======================= //
  const fetchUsuarioById = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`)
      
      if (!response.ok) {
        throw new Error('Usuario no encontrado')
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error al buscar usuario:', error)
      return { success: false, error: error.message }
    }
  }

  // ======================= BUSCAR USUARIOS POR CORREO ======================= //
  const searchUsuariosByCorreo = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchAllUsuarios()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      } else {
        setUsuarios([])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  // ======================= VERIFICAR EXISTENCIA DE USUARIO ======================= //
  const checkUsuarioExists = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}/exists`)
      
      if (!response.ok) {
        throw new Error('Error al verificar usuario')
      }
      
      const data = await response.json()
      return data.existe
    } catch (error) {
      console.error('Error al verificar usuario:', error)
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

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar correo
    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido'
    }

    // Validar contraseña (solo en modo creación o si se está cambiando)
    if (!editingId || formData.contrasena) {
      if (!formData.contrasena) {
        newErrors.contrasena = 'La contraseña es requerida'
      } else if (formData.contrasena.length < 6) {
        newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres'
      }

      // Validar confirmación de contraseña
      if (!formData.confirmarContrasena) {
        newErrors.confirmarContrasena = 'Confirme la contraseña'
      } else if (formData.contrasena !== formData.confirmarContrasena) {
        newErrors.confirmarContrasena = 'Las contraseñas no coinciden'
      }
    }

    // Validar rol
    if (!formData.idRol) {
      newErrors.idRol = 'Debe seleccionar un rol'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const rolSeleccionado = roles.find(r => r.ID_rol === parseInt(formData.idRol))
      
      if (editingId) {
        // Preparar datos para actualización
        const usuarioData = {
          Correo: formData.correo,
          Rol: rolSeleccionado.Nombre_rol, // Enviar nombre del rol
          ...(formData.contrasena && { Contrasena: formData.contrasena })
        }
        
        const result = await updateUsuario(editingId, usuarioData)
        
        if (result.success) {
          alert(result.message)
          handleCancel()
          fetchAllUsuarios()
        } else {
          alert(result.error)
        }
      } else {
        // Preparar datos para creación
        const usuarioData = {
          Correo: formData.correo,
          Contrasena: formData.contrasena,
          ID_rol: parseInt(formData.idRol)
        }
        
        const result = await createUsuario(usuarioData)
        
        if (result.success) {
          alert(result.message)
          handleCancel()
          fetchAllUsuarios()
        } else {
          alert(result.error)
        }
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario) => {
    // Buscar el rol por nombre para obtener el ID
    const rol = roles.find(r => r.Nombre_rol === usuario.Rol)
    
    setFormData({
      correo: usuario.Correo,
      contrasena: '',
      confirmarContrasena: '',
      idRol: rol ? rol.ID_rol.toString() : ''
    })
    setEditingId(usuario.ID_usuario)
    setErrors({})
  }

  const handleDelete = async (id) => {
    const usuario = usuarios.find(u => u.ID_usuario === id)
    if (window.confirm(`¿Está seguro de eliminar al usuario "${usuario.Correo}"?`)) {
      setLoading(true)
      
      const result = await deleteUsuario(id)
      
      if (result.success) {
        alert(result.message)
        fetchAllUsuarios()
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
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      idRol: ''
    })
    setEditingId(null)
    setErrors({})
    setShowPassword(false)
  }

  const handleSearchByEmail = async () => {
    await searchUsuariosByCorreo(searchTerm)
  }

  // ======================= FUNCIONES AUXILIARES ======================= //
  const getRolStats = () => {
    const stats = roles.map(rol => ({
      ...rol,
      cantidad: usuarios.filter(u => u.Rol === rol.Nombre_rol).length
    }))
    return stats
  }

  const getRolColor = (rolNombre) => {
    switch (rolNombre) {
      case 'Gerencia General':
        return 'gerencia-general'
      case 'Gerente de Inventario':
        return 'gerente-inventario'
      case 'Gerente de Ventas y Finanzas':
        return 'gerente-ventas'
      default:
        return 'default'
    }
  }

  const getRolById = (id) => {
    const rol = roles.find(r => r.ID_rol === parseInt(id))
    return rol || { Nombre_rol: 'Sin rol', descripcion: '' }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>GESTIÓN DE USUARIOS</h2>
        <div className="form-actions">
          <Button 
            onClick={handleSave}
            variant={editingId ? "warning" : "success"}
            size="medium"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '⏳' : '👤'} {editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
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
          <span>Editando usuario: <strong>{formData.correo}</strong></span>
        </div>
      )}

      {/* Búsqueda por correo */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por correo electrónico..."
            className="search-input"
          />
          <Button 
            onClick={handleSearchByEmail}
            variant="info"
            size="medium"
            disabled={loading}
          >
            🔍 Buscar
          </Button>
          <Button 
            onClick={fetchAllUsuarios}
            variant="outline"
            size="medium"
            disabled={loading}
          >
            📋 Mostrar Todos
          </Button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group span-2">
          <label>CORREO ELECTRÓNICO *</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            placeholder="usuario@imporcomgua.com"
            className={errors.correo ? 'error' : ''}
            disabled={loading}
            required
          />
          {errors.correo && <span className="error-text">{errors.correo}</span>}
        </div>

        <div className="form-group">
          <label>ROL DEL USUARIO *</label>
          <select
            name="idRol"
            value={formData.idRol}
            onChange={handleInputChange}
            className={errors.idRol ? 'error' : ''}
            disabled={loading}
            required
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((rol) => (
              <option key={rol.ID_rol} value={rol.ID_rol}>
                {rol.Nombre_rol}
              </option>
            ))}
          </select>
          {errors.idRol && <span className="error-text">{errors.idRol}</span>}
        </div>

        <div className="form-group">
          <label>CONTRASEÑA {editingId ? '(Dejar vacío para mantener actual)' : '*'}</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
              className={errors.contrasena ? 'error' : ''}
              disabled={loading}
              required={!editingId}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.contrasena && <span className="error-text">{errors.contrasena}</span>}
        </div>

        <div className="form-group">
          <label>CONFIRMAR CONTRASEÑA {editingId ? '' : '*'}</label>
          <input
            type="password"
            name="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={handleInputChange}
            placeholder="Repetir contraseña"
            className={errors.confirmarContrasena ? 'error' : ''}
            disabled={loading}
            required={!editingId || formData.contrasena}
          />
          {errors.confirmarContrasena && <span className="error-text">{errors.confirmarContrasena}</span>}
        </div>
      </div>

      {/* Información del rol seleccionado */}
      {formData.idRol && (
        <div className="rol-info">
          <div className="rol-card">
            <h4>Información del Rol</h4>
            {(() => {
              const rol = getRolById(formData.idRol)
              return (
                <div className="rol-details">
                  <p><strong>Rol:</strong> {rol.Nombre_rol}</p>
                  <p><strong>Descripción:</strong> {rol.descripcion}</p>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Estadísticas de roles */}
      <div className="roles-stats">
        <h3>DISTRIBUCIÓN DE ROLES</h3>
        <div className="roles-grid">
          {getRolStats().map((rol) => (
            <div key={rol.ID_rol} className={`rol-stat-card ${getRolColor(rol.Nombre_rol)}`}>
              <div className="rol-stat-header">
                <h4>{rol.Nombre_rol}</h4>
                <span className="rol-count">{rol.cantidad}</span>
              </div>
              <p>{rol.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="usuarios-table">
        <h3>LISTA DE USUARIOS ({usuarios.length})</h3>
        {loading && (
          <div className="loading-indicator">
            <p>⏳ Cargando usuarios...</p>
          </div>
        )}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>CORREO</th>
                <th>ROL</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr 
                  key={usuario.ID_usuario} 
                  className={editingId === usuario.ID_usuario ? 'editing-row' : ''}
                >
                  <td>{usuario.ID_usuario}</td>
                  <td>{usuario.Correo}</td>
                  <td>
                    <span className={`rol-badge ${getRolColor(usuario.Rol)}`}>
                      {usuario.Rol || 'Sin rol'}
                    </span>
                  </td>
                  <td>
                    <span className="estado-badge activo">
                      Activo
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        onClick={() => handleEdit(usuario)}
                        variant="edit"
                        size="xs"
                        disabled={loading}
                      >
                        ✏️
                      </Button>
                      <Button 
                        onClick={() => handleDelete(usuario.ID_usuario)}
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
              {usuarios.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">👥</span>
                      <p>No hay usuarios registrados</p>
                      <small>Cree su primer usuario del sistema</small>
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

export default UsuariosForm
