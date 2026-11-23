import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, ChevronRight, Inbox, Plus, Search } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { BOUTON_PRINCIPAL } from '@/components/espace/EspaceLayout'
import { dateHeure, STATUTS_DEMANDE_ENTREPRISE, useDemandesEntreprise, useSitesEntreprise } from '@/hooks/useEntreprises'

const FILTRES = [
  ['actives', 'En cours'],
  ['CLOTUREE', 'Clôturées'],
  ['', 'Toutes'],
]

/** Demandes de l'entreprise (ou du site du responsable), filtrables par site et par état. */
export default function DemandesEntreprisePage() {
  const [params, setParams] = useSearchParams()
  const filtre = params.get('statut') ?? 'actives'
  const site = params.get('site') || ''
  const [recherche, setRecherche] = useState('')
  const { data: sites = [] } = useSitesEntreprise()
  const { data: demandes = [], isLoading } = useDemandesEntreprise({ ...(filtre ? { statut: filtre } : {}), ...(site ? { site } : {}) })
  const changer = (cle, valeur) => {
    const suivants = new URLSearchParams(params)
    suivants.set(cle, valeur)
    if (!valeur && cle === 'site') suivants.delete('site')
    setParams(suivants, { replace: true })
  }
  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase()
    if (!terme) return demandes
    return demandes.filter((d) => [d.metiers, d.description, d.adresse, d.site?.nom].join(' ').toLowerCase().includes(terme))
  }, [demandes, recherche])

  return (
    <CadreEntreprise
      titre="Demandes"
      sousTitre="Suivez chaque intervention : prise en charge, ouvrier affecté, devis, travaux et procès-verbal."
      actions={<Link to="/espace-entreprise/nouvelle-demande" className={BOUTON_PRINCIPAL}><Plus className="w-5 h-5" /> Nouvelle demande</Link>}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="inline-flex rounded-xl border border-line bg-white p-1 self-start" role="tablist">
          {FILTRES.map(([cle, libelle]) => (
            <button
              key={cle} type="button" role="tab" aria-selected={filtre === cle} onClick={() => changer('statut', cle)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filtre === cle ? 'bg-blue-600 text-white' : 'text-muted hover:text-ink'}`}
            >
              {libelle}
            </button>
          ))}
        </div>
        {sites.length > 1 && (
          <select
            aria-label="Site" value={site} onChange={(e) => changer('site', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-line bg-white text-ink"
          >
            <option value="">Tous les sites</option>
            {sites.map((s) => <option key={s.uid} value={s.uid}>{s.nom}</option>)}
          </select>
        )}
        <label className="relative md:ml-auto md:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Métier, adresse, site…"
            aria-label="Rechercher une demande"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : visibles.length ? (
        <ul className="grid gap-3">
          {visibles.map((demande) => {
            const statut = STATUTS_DEMANDE_ENTREPRISE[demande.statut] || { label: demande.statut, classe: '' }
            return (
              <li key={demande.uid}>
                <Link
                  to={`/espace-entreprise/demandes/${demande.uid}`}
                  className={`flex items-center gap-4 bg-white border rounded-2xl p-4 shadow-sm hover:border-blue-300 hover:shadow-card-hover transition-all ${
                    demande.etat_delai === 'depasse' ? 'border-red-200' : 'border-line'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{demande.metiers}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.classe}`}>{statut.label}</span>
                      {demande.urgence === 'URGENCE' && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">Urgence</span>}
                      {demande.urgence === 'PLANIFIE' && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">Planifiée</span>}
                      {demande.etat_delai === 'depasse' && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">Délai dépassé</span>}
                    </div>
                    <p className="text-sm text-muted truncate mt-1">{demande.description}</p>
                    <p className="text-xs text-muted mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {demande.site && sites.length > 1 && <span className="font-medium text-blue-700">{demande.site.nom}</span>}
                      <span>{demande.adresse}, {demande.ville}</span>
                      {demande.echeance_intervention
                        ? <span>Intervention {demande.urgence === 'PLANIFIE' ? 'prévue' : 'au plus tard'} {dateHeure(demande.echeance_intervention)}</span>
                        : <span>Envoyée {dateHeure(demande.created_at)}</span>}
                      {demande.cree_par_nom && <span>par {demande.cree_par_nom}</span>}
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
          <Inbox className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="font-semibold text-ink">{recherche ? 'Aucune demande ne correspond' : filtre === 'actives' ? 'Aucune demande en cours' : 'Aucune demande'}</p>
          <p className="text-sm text-muted mt-1">Plomberie, électricité, climatisation… décrivez votre besoin, nous nous occupons du reste.</p>
        </div>
      )}
    </CadreEntreprise>
  )
}
