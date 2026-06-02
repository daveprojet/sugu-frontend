export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-gray-100 text-gray-700',
    primary:   'bg-primary-100 text-primary-700',
    success:   'bg-green-100 text-green-700',
    warning:   'bg-amber-100 text-amber-700',
    danger:    'bg-red-100 text-red-700',
    info:      'bg-blue-100 text-blue-700',
    disponible:'bg-accent-100 text-accent-700',
  }
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
