export default function StarRating({ note, size = 'sm', showNote = true }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }
  const n = Number(note)
  const validNote = Number.isFinite(n) ? n : 0

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizes[size]}`}>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= Math.round(validNote) ? 'text-amber-400' : 'text-gray-200'}>★</span>
        ))}
      </div>
      {showNote && <span className="text-xs text-gray-500 font-medium">{validNote.toFixed(1)}</span>}
    </div>
  )
}
