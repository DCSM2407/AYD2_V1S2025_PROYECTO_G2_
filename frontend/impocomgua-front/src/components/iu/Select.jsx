// src/components/UI/Select.jsx
const Select = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  disabled = false,
  required = false,
  className = "",
  error = false,
  errorMessage = ""
}) => {
  const baseClasses = "w-full px-4 py-3 border rounded-lg font-size-14 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white"
  
  const stateClasses = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    
  const disabledClasses = disabled 
    ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
    : "cursor-pointer"
    
  const selectClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`
  
  return (
    <div className="w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default Select
