export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-md shadow-md p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      )}
      {children}
    </div>
  )
}