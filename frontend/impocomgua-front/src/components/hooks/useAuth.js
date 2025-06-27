// src/hooks/useAuth.js
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  return context
}

// Hook adicional para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth()
  
  const hasPermission = (permission) => {
    if (!user) return false
    
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      user: ['read', 'write']
    }
    
    return permissions[user.role]?.includes(permission) || false
  }
  
  const isAdmin = () => user?.role === 'admin'
  const isUser = () => user?.role === 'user'
  
  return {
    hasPermission,
    isAdmin,
    isUser,
    userRole: user?.role
  }
}
