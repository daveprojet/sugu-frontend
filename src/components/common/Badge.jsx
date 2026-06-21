export default function Badge({ children, variant = 'default', className = '' }) {
  // Nouveau mapping premium (fond clair, texte contrasté + anneau subtil)
  const variants = {
    default:   'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200/60',
    primary:   'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/60',
    success:   'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60',
    warning:   'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/60',
    danger:    'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/60',
    info:      'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200/60',
    disponible:'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/60', // Aligné avec le succès
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}