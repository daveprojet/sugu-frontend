import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useArtisans } from '@/hooks/useArtisans'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/context/AuthContext'
import ArtisanCard from '@/components/artisan/ArtisanCard'
import Spinner from '@/components/common/Spinner'
import EmptyState from '@/components/common/EmptyState'
import Pagination from '@/components/common/Pagination'
import { QUARTIERS_DAKAR } from '@/utils/constants'
import { normalizeCoord } from '@/utils/geo'
import { Filter, X, MapPin, CheckCircle, Star, Briefcase } from 'lucide-react'

export default function ArtisansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const topRef = useRef(null)
  const [page, setPage] = useState(1)

  const filters = {
    quartier:    searchParams.get('quartier') || '',
    categorie:   searchParams.get('categorie') || '',
    note_moyenne: searchParams.get('note_moyenne') || '',
    disponible:  searchParams.get('disponible') || '',
  }

  const { user } = useAuth()
  const { data: categories = [] } = useCategories()

  const [anonPos, setAnonPos] = useState(null)
  const anonRequested = useRef(false)

  useEffect(() => {
    if (user || anonPos || anonRequested.current) return
    if (!navigator.geolocation) return
    anonRequested.current = true
    navigator.geolocation.getCurrentPosition(
      (pos) => setAnonPos({
        latitude: normalizeCoord(pos.coords.latitude),
        longitude: normalizeCoord(pos.coords.longitude),
      }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [user, anonPos])

  const position = user?.latitude && user?.longitude
    ? { latitude: user.latitude, longitude: user.longitude }
    : anonPos
  const hasPosition = !!position
  const isCategoryActive = !!filters.categorie

  const { data, isLoading, isError } = useArtisans(
    { ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== '').map(([k, v]) => k === 'note_moyenne' ? ['note_min', v] : [k, v])), ...(position ? { lat: position.latitude, lng: position.longitude } : {}), ...(isCategoryActive && hasPosition ? { ordering: 'distance_calc' } : {}), page }
  )

  const artisans = data?.results || data || []
  const totalPages = Math.ceil((data?.count || 0) / 12)

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  const handleFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
      <div className="max-w-6xl mx-auto" ref={topRef}>
        
        {/* Header avec animation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {filters.categorie
              ? `Artisans — ${categories.find(c => c.uid === filters.categorie)?.nom || 'Categorie'}`
              : 'Tous les artisans'
            }
          </h1>
          <p className="text-gray-500 text-sm font-medium">Trouvez l'artisan qualifié près de chez vous.</p>
          {isCategoryActive && !hasPosition && (
            <p className="text-gray-400 text-xs italic mt-1">
              Activez la géolocalisation pour voir les artisans les plus proches
            </p>
          )}
        </motion.div>

        {/* Filtres - Design Premium Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-line p-4 mb-6 flex flex-wrap items-end gap-3"
        >
          <div className="items-center gap-2 text-xs font-semibold text-muted pr-3 py-3 border-r border-line hidden sm:flex">
            <Filter className="w-4 h-4" /> Filtres
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Catégorie</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={filters.categorie}
                onChange={e => handleFilter('categorie', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.uid} value={c.uid}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Quartier</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={filters.quartier}
                onChange={e => handleFilter('quartier', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="">Tous les quartiers</option>
                {QUARTIERS_DAKAR.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Note min.</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Star className="w-4 h-4" />
              </div>
              <select
                value={filters.note_moyenne}
                onChange={e => handleFilter('note_moyenne', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="">Toutes les notes</option>
                <option value="1">1 étoile et plus</option>
                <option value="2">2 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="4">4 étoiles et plus</option>
                <option value="5">5 étoiles</option>
              </select>
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Disponibilité</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <CheckCircle className="w-4 h-4" />
              </div>
              <select
                value={filters.disponible}
                onChange={e => handleFilter('disponible', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="true">Disponible</option>
                <option value="false">Non disponible</option>
              </select>
            </div>
          </div>

          {(filters.quartier || filters.categorie || filters.note_moyenne || filters.disponible) && (
            <button
              onClick={() => setSearchParams({}, { replace: true })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-line bg-white text-[13px] font-semibold text-ink hover:bg-canvas-soft transition-colors duration-150 ml-auto md:ml-0"
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

        {!isLoading && !isError && artisans.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>
    </main>
  )
}