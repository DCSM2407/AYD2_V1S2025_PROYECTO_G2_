// src/components/UI/SearchInput.jsx
const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  disabled = false,
  className = ""
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value)
    }
  }
  
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => onSearch && onSearch(value)}
        disabled={disabled}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        🔍
      </button>
    </div>
  )
}

export default SearchInput
