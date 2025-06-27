// src/hooks/useForm.js
import { useState, useCallback } from 'react'

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }, [errors])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setValue(name, newValue)
  }, [setValue])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    // Validar campo individual
    if (validationRules[name]) {
      const error = validationRules[name](values[name], values)
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }))
      }
    }
  }, [values, validationRules])

  const validate = useCallback(() => {
    const newErrors = {}
    
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field], values)
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validationRules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    validate,
    reset,
    setFieldError,
    clearErrors,
    isValid: Object.keys(errors).length === 0,
    isDirty: Object.keys(touched).length > 0
  }
}
