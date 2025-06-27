// src/components/UI/FormGroup.jsx
const FormGroup = ({
  label,
  children,
  required = false,
  error = false,
  errorMessage = "",
  className = "",
  fullWidth = false
}) => {
  const containerClasses = `form-group ${fullWidth ? 'full-width' : ''} ${className}`
  
  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default FormGroup
