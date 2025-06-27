// src/components/UI/Button.jsx - Versión Corregida
const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "medium",
  disabled = false,
  className = ""
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transform hover:scale-105 active:scale-95"
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-gray-500",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-yellow-500",
    info: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl focus:ring-cyan-500",
    outline: "border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg focus:ring-blue-500 hover:border-blue-400",
    
    // NUEVAS VARIANTES CON COLORES MÁS CLAROS Y DISTINTIVOS
    edit: "bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg focus:ring-violet-400",
    delete: "bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-md hover:shadow-lg focus:ring-pink-400",
    view: "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg focus:ring-emerald-400"
  }
  
  const sizes = {
    xs: "px-2 py-1 text-xs min-w-[28px] h-7",
    small: "px-3 py-1.5 text-xs min-w-[32px] h-8",
    medium: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-base"
  }
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed transform-none hover:scale-100" 
    : "cursor-pointer"
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  )
}

export default Button
