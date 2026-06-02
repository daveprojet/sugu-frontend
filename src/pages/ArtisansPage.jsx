import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useArtisans } from '@/hooks/useArtisans'
import ArtisanCard from '@/components/artisan/ArtisanCard'
import Spinner from '@/components/common/Spinner'
import EmptyState from '@/components/common/EmptyState'
import { METIERS, QUARTIERS_DAKAR } from '@/utils/constants'

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        {filters.metier
          ? `Artisans — ${METIERS.find(m => m.id === filters.metier)?.label}`
          : 'Tous les artisans'
        }
      </h1>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-8 flex flex-wrap gap-3">
        <select
          value={filters.metier}
          onChange={e => handleFilter('metier', e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">Tous les métiers</option>
          {METIERS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
        </select>

        <select
          value={filters.quartier}
          onChange={e => handleFilter('quartier', e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">Tous les quartiers</option>
          {QUARTIERS_DAKAR.map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        <select
          value={filters.disponible}
          onChange={e => handleFilter('disponible', e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">Disponibilité</option>
          <option value="true">Disponible maintenant</option>
          <option value="false">Tous</option>
        </select>

        {(filters.metier || filters.quartier || filters.disponible) && (
          <button
            onClick={() => setFilters({ metier: '', quartier: '', disponible: '' })}
            className="text-sm text-primary-500 hover:text-primary-700 font-medium px-2"
          >
            Effacer les filtres ×
          </button>
        )}
      </div>

      {/* Résultats */}
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
        <>
          <p className="text-sm text-gray-500 mb-4">{artisans.length} artisan(s) trouvé(s)</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artisans.map(artisan => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
