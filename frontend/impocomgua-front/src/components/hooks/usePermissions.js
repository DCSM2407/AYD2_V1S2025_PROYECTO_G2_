// src/hooks/usePermissions.js
import { useAuth } from '../contexts/AuthContext'

export const usePermissions = () => {
  const { user } = useAuth()
  
  const hasPermission = (permission) => {
    if (!user) return false
    
    const rolePermissions = {
      'Gerencia General': ['read', 'write', 'delete', 'manage_users', 'manage_all', 'manage_providers'],
      'Gerente de Inventario': ['read', 'write', 'manage_inventory', 'manage_products'],
      'Gerente de Ventas y Finanzas': ['read', 'write', 'manage_sales', 'manage_clients', 'manage_payments']
    }
    
    return rolePermissions[user.role]?.includes(permission) || false
  }
  
  const isGerenciaGeneral = () => user?.role === 'Gerencia General'
  const isGerenteInventario = () => user?.role === 'Gerente de Inventario'
  const isGerenteVentas = () => user?.role === 'Gerente de Ventas y Finanzas'
  
  const canAccessModule = (module) => {
    if (!user) return false
    
    const moduleAccess = {
      'clientes': ['Gerencia General', 'Gerente de Ventas y Finanzas'],
      'productos': ['Gerencia General', 'Gerente de Inventario', 'Gerente de Ventas y Finanzas'],
      'vendedores': ['Gerencia General'],
      'inventario': ['Gerencia General', 'Gerente de Inventario'],
      'salida': ['Gerencia General', 'Gerente de Inventario'],
      'ventas': ['Gerencia General', 'Gerente de Ventas y Finanzas'],
      'pagos': ['Gerencia General', 'Gerente de Ventas y Finanzas'],
      'usuarios': ['Gerencia General'],
      'proveedores': ['Gerencia General'], // SOLO GERENCIA GENERAL
      'productos-lista': ['Gerencia General', 'Gerente de Inventario', 'Gerente de Ventas y Finanzas']
    }
    
    return moduleAccess[module]?.includes(user.role) || false
  }
  
  const getProductCatalogPermissions = () => {
    if (!user) return { canView: false, canEdit: false, canDelete: false }
    
    switch (user.role) {
      case 'Gerencia General':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canManageCategories: true
        }
      case 'Gerente de Inventario':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          canExport: true,
          canManageCategories: true
        }
      case 'Gerente de Ventas y Finanzas':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          canExport: true,
          canManageCategories: false
        }
      default:
        return { canView: false, canEdit: false, canDelete: false }
    }
  }
  
  return {
    hasPermission,
    isGerenciaGeneral,
    isGerenteInventario,
    isGerenteVentas,
    canAccessModule,
    getProductCatalogPermissions,
    userRole: user?.role
  }
}
