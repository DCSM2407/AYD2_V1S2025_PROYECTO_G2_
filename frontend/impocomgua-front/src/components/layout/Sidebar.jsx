// src/components/Layout/Sidebar.jsx
import Button from '../iu/Button'
import { usePermissions } from '../hooks/usePermissions'

const Sidebar = ({ activeSection, setActiveSection, user, onLogout }) => {
  const { canAccessModule } = usePermissions()

  const allMenuItems = [
    { id: 'clientes', label: 'CLIENTES', icon: '👤' },
    { id: 'usuarios', label: 'USUARIOS', icon: '👥' },
    { id: 'vendedores', label: 'VENDEDORES', icon: '📈' },
    { id: 'proveedores', label: 'PROVEEDORES', icon: '🚚' }, 
    { id: 'productos', label: 'PRODUCTOS', icon: '📦' },
    { id: 'productos-lista', label: 'CATÁLOGO', icon: '📋' },// NUEVO MÓDULO
    { id: 'inventario', label: 'INVENTARIO DE PRODUCTO', icon: '📊' },
    { id: 'ventas', label: 'VENTAS', icon: '💰' },
    { id: 'pagos', label: 'PAGOS', icon: '💳' },
    { id: 'salida', label: 'SALIDA DE PRODUCTO', icon: '📤' }
  ]

  // Filtrar menú según permisos del rol
  const menuItems = allMenuItems.filter(item => canAccessModule(item.id))

  const handleLogout = () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      onLogout()
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Gerencia General':
        return 'role-gerencia'
      case 'Gerente de Inventario':
        return 'role-inventario'
      case 'Gerente de Ventas y Finanzas':
        return 'role-ventas'
      default:
        return 'role-default'
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand-container" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <img 
            src="/logo2.png" 
            alt="IMPORCOMGUA Logo" 
            className="sidebar-logo"
            style={{ 
              height: '60px', 
              width: 'auto',
              margin: '0 auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
          <h1>IMPORCOMGUA</h1>
        </div>
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-details">
              <p className="user-name">{user.name}</p>
              <p className={`user-role ${getRoleColor(user.role)}`}>
                {user.role}
              </p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.id === 'proveedores' && (
              <span className="exclusive-badge"></span>
            )}
          </button>
        ))}
        
        {menuItems.length === 0 && (
          <div className="no-access">
            <p>Sin permisos de acceso</p>
          </div>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <Button
          onClick={handleLogout}
          variant="danger"
          size="medium"
          className="logout-btn"
        >
          🚪 Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
