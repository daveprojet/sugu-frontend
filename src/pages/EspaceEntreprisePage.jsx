import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Camera, ChevronRight, Plus, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Spinner from '@/components/common/Spinner'
import { dateHeure, STATUTS_DEMANDE_ENTREPRISE, useDemandesEntreprise } from '@/hooks/useEntreprises'

const FILTRES = [
  ['actives', 'En cours'],
  ['', 'Toutes'],
]

export default function EspaceEntreprisePage() {
  const { user } = useAuth()
  const [filtre, setFiltre] = useState('actives')
  const { data: demandes = [], isLoading } = useDemandesEntreprise(filtre ? { statut: filtre } : {})

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Espace entreprise
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mt-1">
            {user?.entreprise?.raison_sociale || 'Mon entreprise'}
          </h1>
          <p className="text-sm text-muted mt-1">
            Décrivez votre panne : un inspecteur Bricolibe envoie les bons artisans et contrôle leur travail.
          </p>
        </div>
        <Link
          to="/espace-entreprise/nouvelle-demande"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" /> Nouvelle demande
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTRES.map(([cle, libelle]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setFiltre(cle)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filtre === cle ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-line hover:border-ink/40'
            }`}
          >
            {libelle}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : demandes.length ? (
        <ul className="grid gap-3">
          {demandes.map((demande) => {
            const statut = STATUTS_DEMANDE_ENTREPRISE[demande.statut] || { label: demande.statut, classe: '' }
            return (
              <li key={demande.uid}>
                <Link
                  to={`/espace-entreprise/demandes/${demande.uid}`}
                  className="flex items-center gap-4 bg-white border border-line rounded-2xl p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{demande.categorie_nom}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.classe}`}>{statut.label}</span>
                    </div>
                    <p className="text-sm text-muted truncate mt-1">{demande.description}</p>
                    <p className="text-xs text-muted mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      <span>{demande.adresse}, {demande.ville}</span>
                      <span>Souhaitée {dateHeure(demande.date_souhaitee)}</span>
                      {demande.nb_photos > 0 && <span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" />{demande.nb_photos}</span>}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted shrink-0" />
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="bg-white border border-dashed border-line rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="font-semibold text-ink">{filtre ? 'Aucune demande en cours' : 'Aucune demande pour l’instant'}</p>
          <p className="text-sm text-muted mt-1">Plomberie, électricité, peinture… décrivez votre besoin, nous nous occupons du reste.</p>
        </div>
      )}
    </main>
  )
}
