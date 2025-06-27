// src/components/Auth/RegisterForm.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext' // Ruta corregida
import Button from '../iu/Button' // Ruta corregida

const RegisterForm = ({ onSwitchToLogin }) => {
  const { register } = useAuth() // Removido loading
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido'
    }
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = await register(formData)
    
    if (!result.success) {
      setErrors({ general: result.error })
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>Crear Cuenta</h2>
        <p>Únete a IMPORCOMGUA</p>
      </div>

      {errors.general && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-body">
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Tu nombre completo"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Empresa</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Nombre de tu empresa"
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Tu número de teléfono"
          />
        </div>

        <div className="form-group">
          <label>Contraseña *</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repite tu contraseña"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <Button
          type="submit"
          variant="success"
          size="large"
          className="auth-submit-btn"
        >
          Crear Cuenta
        </Button>
      </form>

      <div className="auth-form-footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
