import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useArtisans } from '@/hooks/useArtisans'
import ArtisanCard from '@/components/artisan/ArtisanCard'
import Spinner from '@/components/common/Spinner'
import EmptyState from '@/components/common/EmptyState'
import { METIERS, QUARTIERS_DAKAR } from '@/utils/constants'
import { Filter, X, MapPin, Briefcase, CheckCircle } from 'lucide-react'

export default function ArtisansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    metier:    searchParams.get('metier') || '',
    quartier:  searchParams.get('quartier') || '',
    disponible: '',
  })

  const { data, isLoading, isError } = useArtisans(
    Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''))
  )

  const artisans = data?.results || data || []

  useEffect(() => {
    const params = {}
    if (filters.metier)   params.metier = filters.metier
    if (filters.quartier) params.quartier = filters.quartier
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  // Animation variants pour un effet d'apparition en cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header avec animation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {filters.metier
              ? `Artisans — ${METIERS.find(m => m.id === filters.metier)?.label}`
              : 'Tous les artisans'
            }
          </h1>
          <p className="text-gray-500 text-sm font-medium">Trouvez l'artisan qualifié près de chez vous.</p>
        </motion.div>

        {/* Filtres - Design Premium Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-4 md:p-6 mb-8 flex flex-wrap items-end gap-3 md:gap-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 pr-2 border-r border-gray-200/70 hidden sm:flex">
            <Filter className="w-4 h-4" /> Filtres
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Métier</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={filters.metier}
                onChange={e => handleFilter('metier', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
              >
                <option value="">Tous les métiers</option>
                {METIERS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Quartier</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={filters.quartier}
                onChange={e => handleFilter('quartier', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
              >
                <option value="">Tous les quartiers</option>
                {QUARTIERS_DAKAR.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Disponibilité</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <select
                value={filters.disponible}
                onChange={e => handleFilter('disponible', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
              >
                <option value="">Disponibilité</option>
                <option value="true">Disponible maintenant</option>
                <option value="false">Tous</option>
              </select>
            </div>
          </div>

          {(filters.metier || filters.quartier || filters.disponible) && (
            <button
              onClick={() => setFilters({ metier: '', quartier: '', disponible: '' })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white/50 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm ml-auto md:ml-0"
            >
              Effacer <X className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>

        {/* Résultats & Compteur */}
        {!isLoading && !isError && artisans.length > 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 font-medium mb-4"
          >
            {artisans.length} artisan{artisans.length > 1 ? 's' : ''} trouvé{artisans.length > 1 ? 's' : ''}
          </motion.p>
        )}

        {/* Grille Artisans */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <EmptyState icon="⚠️" title="Erreur de chargement" description="Impossible de charger les artisans." />
        ) : artisans.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Aucun artisan trouvé"
            description="Essayez d'autres filtres ou un autre quartier."
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            {artisans.map((artisan, idx) => (
              <motion.div key={artisan.id} variants={itemVariants}>
                <ArtisanCard artisan={artisan} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}