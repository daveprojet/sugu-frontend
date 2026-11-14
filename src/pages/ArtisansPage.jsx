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
import SelectRecherche from '@/components/common/SelectRecherche'
import { useZones } from '@/hooks/useZones'
import BoutonAutour from '@/components/common/BoutonAutour'
import { Building2, Filter, X, MapPin, Star, Briefcase, LocateFixed } from 'lucide-react'

// D'anciens liens contiennent le nom du quartier : on ignore ce qui n'est pas un identifiant.
const idZone = (valeur) => (/^\d+$/.test(valeur || '') ? valeur : '')

export default function ArtisansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const topRef = useRef(null)
  const [page, setPage] = useState(1)

  const filters = {
    ville:       idZone(searchParams.get('ville')),
    quartier:    idZone(searchParams.get('quartier')),
    categorie:   searchParams.get('categorie') || '',
    note_moyenne: searchParams.get('note_moyenne') || '',
  }

  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const { data: zones = [] } = useZones()
  const villeChoisie = zones.find(v => String(v.id) === filters.ville)

  // « Autour de moi » (?autour=1&lat=&lng=) : position du moment, envoyée par le bouton.
  const latAutour = parseFloat(searchParams.get('lat'))
  const lngAutour = parseFloat(searchParams.get('lng'))
  const autour = searchParams.get('autour') === '1' && Number.isFinite(latAutour) && Number.isFinite(lngAutour)

  // Sinon, client connecté : la position de son profil sert à trier par distance.
  const position = autour
    ? { latitude: latAutour, longitude: lngAutour }
    : user?.latitude && user?.longitude ? { latitude: user.latitude, longitude: user.longitude } : null
  const hasPosition = !!position
  const isCategoryActive = !!filters.categorie

  const criteres = Object.fromEntries(
    Object.entries(filters)
      .filter(([cle, v]) => v !== '' && !(autour && (cle === 'ville' || cle === 'quartier')))
      .map(([k, v]) => [{ note_moyenne: 'note_min', ville: 'zone_ville', quartier: 'zone_quartier' }[k] || k, v]),
  )
  const { data, isLoading, isError } = useArtisans({
    ...criteres,
    ...(position ? { lat: position.latitude, lng: position.longitude } : {}),
    ...(autour ? { autour: 1, ...(searchParams.get('plus_loin') ? { plus_loin: searchParams.get('plus_loin') } : {}) }
      : isCategoryActive && hasPosition ? { ordering: 'distance_calc' } : {}),
    page,
  })

  const quitterAutour = () => {
    const next = new URLSearchParams(searchParams)
    ;['autour', 'lat', 'lng', 'plus_loin'].forEach((cle) => next.delete(cle))
    setSearchParams(next, { replace: true })
  }

  // « Voir plus loin » : le serveur passe au rayon suivant qui ajoute des artisans.
  const voirPlusLoin = () => {
    const next = new URLSearchParams(searchParams)
    next.set('plus_loin', String(data.rayon_km))
    setSearchParams(next, { replace: true })
  }

  const artisans = data?.results || data || []
  const total = data?.count ?? artisans.length
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

  const handleVille = (value) => {
    const next = new URLSearchParams(searchParams)
    next.delete('quartier')
    if (value) {
      next.set('ville', value)
    } else {
      next.delete('ville')
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
        </motion.div>

        {/* « Autour de moi » : bandeau du mode, ou bouton pour l'activer */}
        {autour ? (
          <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <LocateFixed className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="flex-1 min-w-[12rem] text-sm text-indigo-900">
              <span className="font-semibold">Artisans autour de vous</span>
              {data?.rayon_km ? ` · dans un rayon de ${data.rayon_km} km` : ''}
            </p>
            {data?.rayon_km && (
              <button type="button" onClick={voirPlusLoin} className="text-sm font-semibold text-indigo-700 underline">
                Voir plus loin
              </button>
            )}
            <button type="button" onClick={quitterAutour} className="text-sm font-semibold text-indigo-700 underline">
              Chercher par ville
            </button>
          </div>
        ) : (
          <BoutonAutour
            categorie={filters.categorie}
            className="mb-4 w-full sm:w-auto px-5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 transition-colors"
          >
            Autour de moi
          </BoutonAutour>
        )}

        {/* Filtres - Design Premium Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-line p-4 mb-6 flex flex-wrap items-end gap-3"
        >
          <div className="items-center gap-2 text-xs font-semibold text-muted pr-3 py-3 border-r border-line hidden sm:flex">
            <Filter className="w-4 h-4" /> Filtres
          </div>

          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Catégorie</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={filters.categorie}
                onChange={e => handleFilter('categorie', e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.uid} value={c.uid}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>

          {!autour && (<>
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Ville</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={filters.ville}
                onChange={e => handleVille(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
              >
                <option value="">Toutes les villes</option>
                {zones.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Quartier</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <MapPin className="w-4 h-4" />
              </div>
              <SelectRecherche
                value={String(filters.quartier)}
                onChange={valeur => handleFilter('quartier', valeur)}
                disabled={!villeChoisie}
                ariaLabel="Quartier"
                placeholderRecherche="Rechercher un quartier…"
                options={[
                  { value: '', label: villeChoisie ? 'Tous les quartiers' : "Choisissez d'abord une ville" },
                  ...(villeChoisie?.quartiers || []).map(q => ({ value: String(q.id), label: q.nom })),
                ]}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 disabled:opacity-60"
              />
            </div>
          </div>
          </>)}

          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[140px]">
            <label className="block text-xs font-semibold text-muted mb-1.5">Note min.</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Star className="w-4 h-4" />
              </div>
              <select
                value={filters.note_moyenne}
                onChange={e => handleFilter('note_moyenne', e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
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

          {(filters.ville || filters.quartier || filters.categorie || filters.note_moyenne) && (
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
            {total} artisan{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
          >
            {artisans.map((artisan, idx) => (
              <motion.div key={artisan.id} variants={itemVariants} className="min-w-0">
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