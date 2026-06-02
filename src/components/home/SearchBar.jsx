import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { METIERS, QUARTIERS_DAKAR } from '@/utils/constants'

export default function SearchBar() {
  const [metier,   setMetier]   = useState('')
  const [quartier, setQuartier] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (metier)   params.set('metier', metier)
    if (quartier) params.set('quartier', quartier)
    navigate(`/artisans?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-card p-2 flex flex-col md:flex-row gap-2">
      <select
        value={metier}
        onChange={e => setMetier(e.target.value)}
        className="flex-1 input-field"
      >
        <option value="">Quel type d'artisan ?</option>
        {METIERS.map(m => (
          <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
        ))}
      </select>

      <select
        value={quartier}
        onChange={e => setQuartier(e.target.value)}
        className="flex-1 input-field"
      >
        <option value="">Quel quartier ?</option>
        {QUARTIERS_DAKAR.map(q => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>

      <button type="submit" className="btn-primary md:px-8 whitespace-nowrap">
        🔍 Chercher
      </button>
    </form>
  )
}
