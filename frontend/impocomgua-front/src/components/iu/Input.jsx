// src/components/UI/Input.jsx
const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  className = "",
  error = false,
  errorMessage = ""
}) => {
  const baseClasses = "w-full px-4 py-3 border rounded-lg font-size-14 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
  
  const stateClasses = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    
  const disabledClasses = disabled || readOnly 
    ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
    : "bg-white"
    
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`
  
  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={inputClasses}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default Input
