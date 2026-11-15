import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, FileDown, MapPin, Phone, UserRound } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import DevisEntreprise from '@/components/entreprise/DevisEntreprise'
import Galerie from '@/components/entreprise/Galerie'
import PhotosPicker from '@/components/demande/PhotosPicker'
import { entrepriseService } from '@/services/api'
import {
  dateHeure, STATUTS_DEMANDE_ENTREPRISE, STATUTS_MISSION, telechargerPdf, useActionDemandeEntreprise,
  useDemandeEntreprise,
} from '@/hooks/useEntreprises'

const ETAPES = [
  ['NOUVELLE', 'Demande reçue'],
  ['ARTISAN_AFFECTE', 'Artisan affecté'],
  ['EN_COURS', 'Intervention en cours'],
  ['A_INSPECTER', 'Contrôle qualité'],
  ['CLOTUREE', 'Clôturée'],
]

function Avancement({ statut }) {
  if (statut === 'ANNULEE') return null
  // Inspection refusée : la prestation reste à l'étape du contrôle qualité.
  const courant = ETAPES.findIndex(([cle]) => cle === (statut === 'INSPECTION_REFUSEE' ? 'A_INSPECTER' : statut))
  return (
    <ol className="grid grid-cols-5 gap-1 mb-6">
      {ETAPES.map(([cle, libelle], index) => {
        const fait = index <= courant
        return (
          <li key={cle} className="flex flex-col items-center text-center gap-1.5">
            {fait ? <CheckCircle2 className="w-5 h-5 text-accent-500" /> : <Circle className="w-5 h-5 text-line" />}
            <span className={`text-[11px] leading-tight ${fait ? 'text-ink font-medium' : 'text-muted'}`}>{libelle}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function DemandeEntreprisePage() {
  const { uid } = useParams()
  const { data: demande, isLoading } = useDemandeEntreprise(uid)
  const { annuler, ajouterPhotos, supprimerPhoto, repondreDevis, accordPortfolio } = useActionDemandeEntreprise(uid)
  const [nouvellesPhotos, setNouvellesPhotos] = useState([])

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!demande) return <main className="max-w-2xl mx-auto px-4 py-12 text-center text-muted">Demande introuvable.</main>

  const statut = STATUTS_DEMANDE_ENTREPRISE[demande.statut] || { label: demande.statut, classe: '' }
  const photosPanne = demande.photos.filter((p) => p.type_photo === 'PANNE')
  const placesLibres = 5 - photosPanne.length

  const confirmerAnnulation = () => {
    const motif = window.prompt('Annuler cette demande ? Indiquez la raison (facultatif) :')
    if (motif !== null) annuler.mutate(motif)
  }
  const envoyerPhotos = () => ajouterPhotos.mutate(nouvellesPhotos, { onSuccess: () => setNouvellesPhotos([]) })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/espace-entreprise" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Mes demandes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{demande.metiers}</h1>
          <p className="text-sm text-muted">
            Envoyée {dateHeure(demande.created_at)}{demande.cree_par_nom ? ` par ${demande.cree_par_nom}` : ''}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statut.classe}`}>{statut.label}</span>
      </div>

      <Avancement statut={demande.statut} />

      <section className="bg-white border border-line rounded-2xl p-5 grid gap-4 mb-4">
        <p className="text-ink whitespace-pre-line">{demande.description}</p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <p className="flex items-start gap-2 text-muted"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{demande.adresse}, {demande.quartier ? `${demande.quartier}, ` : ''}{demande.ville}</p>
          <p className="flex items-start gap-2 text-muted"><CalendarClock className="w-4 h-4 mt-0.5 shrink-0" />Début souhaité : {dateHeure(demande.date_souhaitee)}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink mb-2">Photos de la panne</h2>
          <Galerie
            photos={photosPanne}
            vide="Aucune photo jointe."
            onRetirer={demande.peut_annuler ? (photo) => supprimerPhoto.mutate(photo.uid) : undefined}
          />
          {demande.peut_annuler && placesLibres > 0 && (
            <div className="mt-3 grid gap-2">
              <PhotosPicker photos={nouvellesPhotos} onChange={setNouvellesPhotos} max={placesLibres} label="Ajouter des photos" />
              {nouvellesPhotos.length > 0 && (
                <button
                  type="button" onClick={envoyerPhotos} disabled={ajouterPhotos.isLoading}
                  className="justify-self-start px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium disabled:opacity-60"
                >
                  {ajouterPhotos.isLoading ? 'Envoi…' : `Envoyer ${nouvellesPhotos.length} photo(s)`}
                </button>
              )}
            </div>
          )}
        </div>
        {demande.video_url && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-2">Vidéo</h2>
            <video src={demande.video_url} controls playsInline preload="metadata" className="w-full max-w-md rounded-lg bg-black" />
          </div>
        )}
      </section>

      <DevisEntreprise demande={demande} repondreDevis={repondreDevis} />

      <section className="bg-white border border-line rounded-2xl p-5 mb-4">
        <h2 className="font-semibold text-ink mb-3">Artisans</h2>
        {demande.affectations.length ? (
          <ul className="grid gap-4">
            {demande.affectations.map((a) => {
              const s = STATUTS_MISSION[a.statut] || { label: a.statut, classe: '' }
              const avant = demande.photos.filter((p) => p.affectation_uid === a.uid && p.type_photo === 'AVANT')
              const apres = demande.photos.filter((p) => p.affectation_uid === a.uid && p.type_photo === 'APRES')
              return (
                <li key={a.uid} className="border border-line rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {a.artisan.photo
                      ? <img src={a.artisan.photo} alt="" className="w-11 h-11 rounded-full object-cover" />
                      : <span className="w-11 h-11 rounded-full bg-canvas-soft flex items-center justify-center"><UserRound className="w-5 h-5 text-muted" /></span>}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{a.artisan.nom}</p>
                      <p className="text-xs text-muted">{a.metier}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.classe}`}>{s.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mt-3">
                    <span>Prévu {dateHeure(a.heure_prevue)}</span>
                    {a.arrivee_at && <span>Arrivé {dateHeure(a.arrivee_at)}</span>}
                    {a.terminee_at && <span>Terminé {dateHeure(a.terminee_at)}</span>}
                    {a.nb_reprises > 0 && <span>{a.nb_reprises} reprise(s) demandée(s)</span>}
                    {a.artisan.telephone && (
                      <a href={`tel:${a.artisan.telephone}`} className="inline-flex items-center gap-1 text-primary-600 font-medium">
                        <Phone className="w-3.5 h-3.5" />{a.artisan.telephone}
                      </a>
                    )}
                  </div>
                  {(avant.length > 0 || apres.length > 0) && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div><p className="text-xs font-semibold text-muted mb-1">Avant</p><Galerie photos={avant} vide="—" /></div>
                      <div><p className="text-xs font-semibold text-muted mb-1">Après</p><Galerie photos={apres} vide="—" /></div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            {demande.statut === 'ANNULEE'
              ? 'Demande annulée.'
              : 'Un inspecteur Bricolibe choisit le ou les artisans adaptés. Vous serez prévenu dès qu’un artisan accepte.'}
          </p>
        )}
      </section>

      {demande.statut === 'A_INSPECTER' && (
        <p className="text-sm bg-violet-50 text-violet-800 rounded-xl p-4 mb-4">
          L’intervention est terminée. L’inspecteur Bricolibe contrôle le travail avant de clôturer la prestation.
        </p>
      )}
      {demande.statut === 'INSPECTION_REFUSEE' && (
        <p className="text-sm bg-red-50 text-red-800 rounded-xl p-4 mb-4">
          Le contrôle qualité a relevé un problème. L’équipe Bricolibe le règle et revient vers vous.
        </p>
      )}
      {demande.rapport_disponible && (
        <section className="bg-emerald-50 rounded-2xl p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-900">
            Intervention validée par l’inspecteur{demande.cloturee_at ? ` le ${dateHeure(demande.cloturee_at)}` : ''}.
          </p>
          <button
            type="button"
            onClick={() => telechargerPdf(entrepriseService.rapportPdf(demande.uid), 'rapport-inspection-bricolibe.pdf')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-emerald-800 text-sm font-medium border border-emerald-200"
          >
            <FileDown className="w-4 h-4" /> Rapport d’inspection (PDF)
          </button>
        </section>
      )}
      {demande.statut === 'CLOTUREE' && demande.photos.some((p) => p.type_photo === 'APRES') && (
        <label className="flex items-start gap-3 bg-white border border-line rounded-2xl p-4 mb-4 text-sm cursor-pointer">
          <input
            type="checkbox" className="mt-1 accent-indigo-600" checked={Boolean(demande.accord_portfolio)}
            disabled={accordPortfolio.isLoading} onChange={(e) => accordPortfolio.mutate(e.target.checked)}
          />
          <span>
            J’accepte que les artisans publient les photos avant / après de cette intervention sur leur profil Bricolibe
            <span className="block text-xs text-muted mt-0.5">
              Le nom de votre entreprise et l’adresse n’apparaissent jamais. Vous pouvez retirer votre accord à tout moment.
            </span>
          </span>
        </label>
      )}
      {demande.motif_annulation && <p className="text-sm text-muted mb-4">Motif d’annulation : {demande.motif_annulation}</p>}
      {demande.peut_annuler && (
        <button type="button" onClick={confirmerAnnulation} disabled={annuler.isLoading} className="text-sm text-red-600 hover:underline">
          Annuler la demande
        </button>
      )}
    </main>
  )
}
