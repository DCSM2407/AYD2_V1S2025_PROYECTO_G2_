// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // URL base de tu API Flask
  const API_BASE_URL = 'http://127.0.0.1:5000'

  useEffect(() => {
    const savedUser = localStorage.getItem('imporcomgua_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('imporcomgua_user')
      }
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          Correo: email, 
          Contrasena: password 
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Login exitoso
        const userWithRole = {
          id: data.usuario.ID_usuario,
          email: data.usuario.Correo,
          name: data.usuario.Correo.split('@')[0], // Usar parte del email como nombre
          role: data.usuario.Rol
        }

        setUser(userWithRole)
        setIsAuthenticated(true)
        localStorage.setItem('imporcomgua_user', JSON.stringify(userWithRole))
        
        return { 
          success: true, 
          user: userWithRole,
          message: data.message 
        }
      } else {
        // Error en login
        return { 
          success: false, 
          error: data.message || 'Error en el login' 
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      return { 
        success: false, 
        error: 'Error de conexión con el servidor' 
      }
    }
  }

  const register = async (userData) => {
    try {
      // Aquí puedes implementar el endpoint de registro si lo tienes
      // Por ahora simularemos el registro
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        role: 'Usuario' // Rol por defecto
      }

      setUser(newUser)
      setIsAuthenticated(true)
      localStorage.setItem('imporcomgua_user', JSON.stringify(newUser))
      
      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: 'Error al registrar usuario' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('imporcomgua_user')
    console.log('Sesión cerrada exitosamente')
  }

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
