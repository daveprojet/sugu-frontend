import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { METIERS, QUARTIERS_DAKAR } from '@/utils/constants'
import { Briefcase, MapPin, Search } from 'lucide-react'

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
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onSubmit={handleSearch} 
      className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-3 flex flex-col md:flex-row gap-3"
    >
      {/* Select Métier avec Icône */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
          <Briefcase className="w-5 h-5" />
        </div>
        <select
          value={metier}
          onChange={e => setMetier(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
        >
          <option value="">Quel type d&apos;artisan ?</option>
          {METIERS.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Select Quartier avec Icône */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
          <MapPin className="w-5 h-5" />
        </div>
        <select
          value={quartier}
          onChange={e => setQuartier(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
        >
          <option value="">Quel quartier ?</option>
          {QUARTIERS_DAKAR.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      {/* Bouton CTA Premium */}
      <motion.button 
        type="submit" 
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 md:px-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 whitespace-nowrap"
      >
        <Search className="w-5 h-5" />
        Chercher
      </motion.button>
    </motion.form>
  )
}