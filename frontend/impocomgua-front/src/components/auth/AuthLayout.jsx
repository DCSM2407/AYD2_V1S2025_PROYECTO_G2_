// src/components/Auth/AuthLayout.jsx
import { useState } from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-header">
          <div className="company-logo">
            <h1>IMPORCOMGUA</h1>
            <p>Sistema de Gestión Empresarial</p>
          </div>
        </div>
        
        <div className="auth-form-container">
          {children}
        </div>
        
        <div className="auth-footer">
          <p>&copy; 2025 IMPORCOMGUA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
