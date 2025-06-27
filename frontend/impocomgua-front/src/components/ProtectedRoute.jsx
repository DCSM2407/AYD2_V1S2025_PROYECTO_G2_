// src/components/ProtectedRoute.jsx
import { usePermissions } from './hooks/usePermissions'

const ProtectedRoute = ({ module, children, fallback = null }) => {
  const { canAccessModule } = usePermissions()

  if (!canAccessModule(module)) {
    return fallback || (
      <div className="access-denied">
        <div className="access-denied-content">
          <span className="access-denied-icon">🚫</span>
          <h3>Acceso Denegado</h3>
          <p>No tiene permisos para acceder a este módulo</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
