import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronLeft } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import ListeMissions from '@/components/entreprise/MissionsEntreprises'
import { useMissions } from '@/hooks/useEntreprises'

const ONGLETS = [
  ['en_cours', 'En cours'],
  ['terminees', 'Terminées'],
]

const VIDES = {
  en_cours: 'Aucune mission en cours. L’inspecteur Bricolibe vous prévient par notification et SMS dès qu’une entreprise a besoin de vous.',
  terminees: 'Aucune mission terminée pour l’instant.',
}

/** Missions confiées par l'inspecteur pour des entreprises : séparées des demandes des clients particuliers. */
export default function MissionsEntreprisesPage() {
  const { user } = useAuth()
  // Uniquement partenaire : cette page est son accueil, il n'a pas de tableau de bord indépendant.
  const independant = user?.independant !== false
  const [onglet, setOnglet] = useState('en_cours')
  const { data: missions = [], isLoading } = useMissions(onglet)
  const { data: enCours = [] } = useMissions('en_cours')
  const aRepondre = enCours.filter((m) => m.statut === 'PROPOSEE').length

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          {independant && (
            // Lien fixe (pas « page précédente ») : en revenant d'une mission, on retourne bien au tableau de bord.
            <Link
              to="/dashboard-artisan"
              aria-label="Retour au tableau de bord"
              className="p-2 rounded-full border border-line bg-white hover:bg-canvas-soft text-muted hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
              <Building2 className="w-6 h-6" /> Missions entreprises
            </h1>
            <p className="text-muted text-sm font-medium mt-0.5">Les interventions que l’inspecteur Bricolibe vous confie</p>
          </div>
        </div>

        {aRepondre > 0 && (
          <p className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3">
            {aRepondre} mission(s) à accepter : répondez vite, l’inspecteur est alerté au bout de 5 minutes.
          </p>
        )}

        <div className="inline-flex rounded-xl border border-line bg-white p-1" role="tablist">
          {ONGLETS.map(([cle, libelle]) => (
            <button
              key={cle} type="button" role="tab" aria-selected={onglet === cle} onClick={() => setOnglet(cle)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                onglet === cle ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {libelle}
              {cle === 'en_cours' && enCours.length > 0 && <span className="ml-1.5 opacity-80">({enCours.length})</span>}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : missions.length ? (
          <ListeMissions missions={missions} />
        ) : (
          <p className="text-sm text-muted bg-white border border-line rounded-2xl p-6 text-center">{VIDES[onglet]}</p>
        )}
      </div>
    </main>
  )
}
