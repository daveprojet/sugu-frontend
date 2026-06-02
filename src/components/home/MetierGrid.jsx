import { useNavigate } from 'react-router-dom'
import { METIERS } from '@/utils/constants'

export default function MetierGrid() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {METIERS.map(m => (
        <button
          key={m.id}
          onClick={() => navigate(`/artisans?metier=${m.id}`)}
          className="card p-4 flex flex-col items-center gap-2 text-center hover:border-primary-200 hover:border transition-all group cursor-pointer"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{m.icon}</span>
          <span className="text-xs font-medium text-gray-700 leading-tight">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
