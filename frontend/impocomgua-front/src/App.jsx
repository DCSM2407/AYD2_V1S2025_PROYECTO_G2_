// src/App.jsx - Sin Loading
import { useState } from 'react'
import { AuthProvider, useAuth } from './components/contexts/AuthContext'
import AuthLayout from './components/auth/AuthLayout'
import LoginForm from './components/auth/LoginForm'
import Sidebar from './components/layout/Sidebar'
import ClientesForm from './components/forms/ClientesForm'
import ProductosForm from './components/forms/ProductosForm'
import InventarioForm from './components/forms/InventarioForm'
import SalidaInventarioForm from './components/forms/SalidaInvetarioForm'
import VendedoresForm from './components/forms/VendedoresForm'
import PagosForm from './components/forms/PagosForm'
import VentasForm from './components/forms/VentasForm'
import UsuariosForm from './components/forms/UsuariosForm'
import ProductosListView from './components/Views/ProductosListView'
import ProtectedRoute from './components/ProtectedRoute'
import ProveedoresForm from './components/forms/ProveedoresForm'
import { usePermissions } from './components/hooks/usePermissions'
import './styles/index.css'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <AuthLayout>
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  )
}

const MainApp = () => {
  const { user, logout } = useAuth()
  const { canAccessModule } = usePermissions()
  const [activeSection, setActiveSection] = useState(() => {
    // Establecer sección inicial basada en permisos
    if (canAccessModule('clientes')) return 'clientes'
    if (canAccessModule('productos')) return 'productos'
    if (canAccessModule('inventario')) return 'inventario'
    if (canAccessModule('ventas')) return 'ventas'
    if (canAccessModule('proveedores')) return 'proveedores'
    if (canAccessModule('usuarios')) return 'usuarios'
    return 'clientes'
  })

  const renderContent = () => {
    switch (activeSection) {
      case 'clientes':
        return (
          <ProtectedRoute module="clientes">
            <ClientesForm />
          </ProtectedRoute>
        )
      case 'productos':
        return (
          <ProtectedRoute module="productos">
            <ProductosForm />
          </ProtectedRoute>
        )
      case 'vendedores':
        return (
          <ProtectedRoute module="vendedores">
            <VendedoresForm />
          </ProtectedRoute>
        )
      case 'inventario':
        return (
          <ProtectedRoute module="inventario">
            <InventarioForm />
          </ProtectedRoute>
        )
      case 'salida':
        return (
          <ProtectedRoute module="salida">
            <SalidaInventarioForm />
          </ProtectedRoute>
        )
      case 'ventas':
        return (
          <ProtectedRoute module="ventas">
            <VentasForm />
          </ProtectedRoute>
        )
      case 'pagos':
        return (
          <ProtectedRoute module="pagos">
            <PagosForm />
          </ProtectedRoute>
        )
      case 'proveedores':
        return (
          <ProtectedRoute module="proveedores">
            <ProveedoresForm />
          </ProtectedRoute>
        )
      case 'usuarios':
        return (
          <ProtectedRoute module="usuarios">
            <UsuariosForm />
          </ProtectedRoute>
        )
      case 'productos-lista':
        return (
          <ProtectedRoute module="productos">
            <ProductosListView />
          </ProtectedRoute>
        )
      default:
        return (
          <div className="dashboard-welcome">
            <div className="welcome-content">
              <div className="welcome-header">
                <h2>Bienvenido a IMPORCOMGUA</h2>
                <p>Sistema de Gestión Empresarial</p>
              </div>
              
              <div className="user-welcome">
                <div className="user-card">
                  <div className="user-avatar-large">
                    <span>👤</span>
                  </div>
                  <h3>{user?.name}</h3>
                  <p className="user-role-display">{user?.role}</p>
                  <p className="user-email-display">{user?.email}</p>
                </div>
              </div>

              <div className="quick-stats">
                <h3>Acceso Rápido</h3>
                <div className="stats-grid">
                  {canAccessModule('clientes') && (
                    <div 
                      className="stat-card clickable"
                      onClick={() => setActiveSection('clientes')}
                    >
                      <span className="stat-icon">👥</span>
                      <h4>Clientes</h4>
                      <p>Gestionar clientes</p>
                    </div>
                  )}
                  
                  {canAccessModule('productos') && (
                    <div 
                      className="stat-card clickable"
                      onClick={() => setActiveSection('productos')}
                    >
                      <span className="stat-icon">📦</span>
                      <h4>Productos</h4>
                      <p>Gestionar productos</p>
                    </div>
                  )}
                  
                  {canAccessModule('proveedores') && (
                    <div 
                      className="stat-card clickable exclusive"
                      onClick={() => setActiveSection('proveedores')}
                    >
                      <span className="stat-icon">🚚</span>
                      <h4>Proveedores</h4>
                      <p>Gestionar proveedores</p>
                      <span className="exclusive-tag">👑 Exclusivo</span>
                    </div>
                  )}
                  
                  {canAccessModule('usuarios') && (
                    <div 
                      className="stat-card clickable"
                      onClick={() => setActiveSection('usuarios')}
                    >
                      <span className="stat-icon">👤</span>
                      <h4>Usuarios</h4>
                      <p>Administrar usuarios</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="app">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        user={user}
        onLogout={logout}
      />
      <div className="main-content">
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

const AppContent = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <MainApp /> : <AuthPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App