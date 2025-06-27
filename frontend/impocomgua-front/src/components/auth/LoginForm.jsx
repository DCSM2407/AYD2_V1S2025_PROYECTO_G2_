// src/components/Auth/LoginForm.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../iu/Button' // Corregido el import

const LoginForm = ({ onSwitchToRegister }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setErrors({ general: result.error })
    }
  }

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@imporcomgua.com',
        password: 'admin123'
      })
    } else {
      setFormData({
        email: 'usuario@imporcomgua.com',
        password: 'user123'
      })
    }
    setErrors({})
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>Iniciar Sesión</h2>
        <div className="brand-container">
          <img
            src="/logo.png"
            alt="IMPORCOMGUA Logo"
            className="brand-logo"
            style={{ height: '120px', width: 'auto' }}
          />

          <p>Accede a tu cuenta de IMPORCOMGUA</p>
        </div>
      </div>

      {errors.general && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-body">
        <div className="form-group">
          <label>Email</label>
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
          <label>Contraseña</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Tu contraseña"
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

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="auth-submit-btn"
        >
          Iniciar Sesión
        </Button>
      </form>
    </div>
  )
}

export default LoginForm
