export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}