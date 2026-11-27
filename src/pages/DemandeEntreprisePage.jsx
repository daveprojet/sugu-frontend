import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building, CalendarClock, CheckCircle2, Circle, FileDown, MapPin, Phone, ShieldCheck, Star, Timer, UserRound } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import DevisEntreprise from '@/components/entreprise/DevisEntreprise'
import { ApresVente, Replanifier } from '@/components/entreprise/ApresVente'
import Galerie from '@/components/entreprise/Galerie'
import PhotosPicker from '@/components/demande/PhotosPicker'
import { entrepriseService } from '@/services/api'
import {
  dateHeure, STATUTS_DEMANDE_ENTREPRISE, STATUTS_MISSION, telechargerPdf, useActionDemandeEntreprise,
  useDemandeEntreprise,
} from '@/hooks/useEntreprises'

const ETAPES = [
  ['NOUVELLE', 'Demande reçue'],
  ['ARTISAN_AFFECTE', 'Ouvrier affecté'],
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

/** Prise en charge et délai d'intervention de la charte (article 6). */
function Delai({ demande }) {
  if (demande.statut === 'ANNULEE') return null
  const etat = {
    respecte: ['bg-emerald-50 text-emerald-800', 'Délai respecté'],
    depasse: ['bg-red-50 text-red-800', 'Délai dépassé'],
    en_cours: ['bg-sky-50 text-sky-800', null],
  }[demande.etat_delai] || ['bg-amber-50 text-amber-800', null]
  return (
    <section className={`rounded-2xl p-4 mb-4 text-sm flex flex-wrap items-start gap-3 ${etat[0]}`}>
      <Timer className="w-5 h-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          {demande.urgence_libelle}
          {etat[1] && ` · ${etat[1]}`}
        </p>
        {demande.deplacement_libelle && <p className="text-xs mb-0.5">Déplacement et diagnostic : {demande.deplacement_libelle.charAt(0).toLowerCase() + demande.deplacement_libelle.slice(1)}</p>}
        {demande.prise_en_charge_at ? (
          <p>
            Prise en charge {dateHeure(demande.prise_en_charge_at)}
            {demande.echeance_intervention && (demande.urgence === 'PLANIFIE'
              ? ` · intervention prévue ${dateHeure(demande.echeance_intervention)}`
              : ` · intervention au plus tard ${dateHeure(demande.echeance_intervention)}`)}
          </p>
        ) : (
          <p>En attente de prise en charge par l’inspecteur Bricolibe : le délai d’intervention démarre à ce moment-là.</p>
        )}
      </div>
    </section>
  )
}

/** Procès-verbal de fin de travaux : téléchargeable et à signer (« lu et approuvé »). */
function ProcesVerbal({ demande, signerPv }) {
  return (
    <section className="bg-emerald-50 rounded-2xl p-5 mb-4 grid gap-3">
      <p className="text-sm text-emerald-900">
        Intervention validée par l’inspecteur{demande.cloturee_at ? ` le ${dateHeure(demande.cloturee_at)}` : ''}.
        {demande.pv_signe_at
          ? ` Procès-verbal signé ${dateHeure(demande.pv_signe_at)}${demande.pv_signe_par_nom ? ` par ${demande.pv_signe_par_nom}` : ''}.`
          : ' Vérifiez le procès-verbal de fin de travaux, puis signez-le.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => telechargerPdf(entrepriseService.rapportPdf(demande.uid), 'proces-verbal-bricolibe.pdf')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-emerald-800 text-sm font-medium border border-emerald-200"
        >
          <FileDown className="w-4 h-4" /> Procès-verbal (PDF)
        </button>
        {!demande.pv_signe_at && (
          <button
            type="button" disabled={signerPv.isLoading}
            onClick={() => window.confirm('Signer le procès-verbal (« lu et approuvé ») ? Vous confirmez la fin des travaux.') && signerPv.mutate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" /> Signer le procès-verbal
          </button>
        )}
      </div>
    </section>
  )
}

/** L'entreprise note l'intervention (une fois, après la clôture). */
function Note({ demande, noter }) {
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  if (demande.note_entreprise) {
    return (
      <section className="bg-white border border-line rounded-2xl p-4 mb-4 text-sm">
        <p className="font-semibold text-ink flex items-center gap-1.5">
          Votre note : {demande.note_entreprise}/5 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </p>
        {demande.commentaire_entreprise && <p className="text-muted mt-1">{demande.commentaire_entreprise}</p>}
      </section>
    )
  }
  if (!demande.peut_noter) return null
  return (
    <section className="bg-white border border-line rounded-2xl p-5 mb-4 grid gap-3">
      <h2 className="font-semibold text-ink">Notez l’intervention</h2>
      <div className="flex gap-1" role="radiogroup" aria-label="Note de 1 à 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={note === n} aria-label={`${n} sur 5`} onClick={() => setNote(n)}>
            <Star className={`w-7 h-7 ${n <= note ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />
          </button>
        ))}
      </div>
      <textarea
        rows={2} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} maxLength={2000}
        placeholder="Un commentaire pour l’équipe Bricolibe (facultatif)"
        className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-sm resize-none"
      />
      <button
        type="button" disabled={!note || noter.isLoading} onClick={() => noter.mutate({ note, commentaire })}
        className="justify-self-start px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-60"
      >Envoyer ma note</button>
    </section>
  )
}

export default function DemandeEntreprisePage() {
  const { uid } = useParams()
  const { data: demande, isLoading } = useDemandeEntreprise(uid)
  const {
    annuler, ajouterPhotos, supprimerPhoto, repondreDevis, accordPortfolio, discuterDevis, signerPv, noter,
    reclamer, garantie, replanifier,
  } = useActionDemandeEntreprise(uid)
  const [nouvellesPhotos, setNouvellesPhotos] = useState([])

  if (isLoading) return <CadreEntreprise titre="Demande"><div className="flex justify-center py-16"><Spinner size="lg" /></div></CadreEntreprise>
  if (!demande) return <CadreEntreprise titre="Demande"><p className="text-muted">Demande introuvable.</p></CadreEntreprise>

  const statut = STATUTS_DEMANDE_ENTREPRISE[demande.statut] || { label: demande.statut, classe: '' }
  const photosPanne = demande.photos.filter((p) => p.type_photo === 'PANNE')
  const placesLibres = 5 - photosPanne.length

  const confirmerAnnulation = () => {
    const motif = window.prompt('Annuler cette demande ? Indiquez la raison (facultatif) :')
    if (motif !== null) annuler.mutate(motif)
  }
  const envoyerPhotos = () => ajouterPhotos.mutate(nouvellesPhotos, { onSuccess: () => setNouvellesPhotos([]) })

  return (
    <CadreEntreprise
      titre={demande.metiers}
      sousTitre={<Link to="/espace-entreprise/demandes" className="inline-flex items-center gap-1 text-blue-600 font-medium"><ArrowLeft className="w-4 h-4" /> Toutes les demandes</Link>}
    >
      <div className="max-w-3xl">

      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-sm text-muted">
            {demande.site && <span className="inline-flex items-center gap-1 mr-2"><Building className="w-3.5 h-3.5" />{demande.site.nom}</span>}
            Envoyée {dateHeure(demande.created_at)}{demande.cree_par_nom ? ` par ${demande.cree_par_nom}` : ''}
          </p>
        </div>
        <span className="flex flex-wrap gap-2">
          {demande.nature && demande.nature !== 'INTERVENTION' && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${demande.nature === 'PREVENTIF' ? 'bg-sky-50 text-sky-700' : 'bg-blue-50 text-blue-700'}`}>{demande.nature_libelle}</span>
          )}
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statut.classe}`}>{statut.label}</span>
        </span>
      </div>

      <Avancement statut={demande.statut} />
      <Delai demande={demande} />
      <Replanifier key={demande.date_souhaitee} demande={demande} replanifier={replanifier} />
      {demande.garantie_de_uid && (
        <p className="text-sm bg-blue-50 text-blue-800 rounded-xl p-3 mb-4">
          Retour sous garantie : déplacement et main-d’œuvre offerts.{' '}
          <Link to={`/espace-entreprise/demandes/${demande.garantie_de_uid}`} className="font-semibold underline">Voir l’intervention d’origine</Link>
        </p>
      )}

      <section className="bg-white border border-line rounded-2xl p-5 grid gap-4 mb-4">
        <p className="text-ink whitespace-pre-line">{demande.description}</p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <p className="flex items-start gap-2 text-muted"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{demande.adresse}, {demande.quartier ? `${demande.quartier}, ` : ''}{demande.ville}</p>
          {demande.urgence === 'PLANIFIE' && (
            <p className="flex items-start gap-2 text-muted"><CalendarClock className="w-4 h-4 mt-0.5 shrink-0" />Date convenue : {dateHeure(demande.date_souhaitee)}</p>
          )}
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

      <DevisEntreprise demande={demande} repondreDevis={repondreDevis} discuterDevis={discuterDevis} />

      <section className="bg-white border border-line rounded-2xl p-5 mb-4">
        <h2 className="font-semibold text-ink mb-1">Ouvriers</h2>
        {demande.inspecteur_contact && (
          <p className="text-sm text-muted mb-3">
            Une question sur l’intervention ? Joignez votre inspecteur, {demande.inspecteur_contact.nom} :{' '}
            <a href={`tel:${demande.inspecteur_contact.telephone}`} className="inline-flex items-center gap-1 text-primary-600 font-medium">
              <Phone className="w-3.5 h-3.5" />{demande.inspecteur_contact.telephone}
            </a>
          </p>
        )}
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
              : 'Un inspecteur Bricolibe choisit le ou les ouvriers les plus proches de votre site. Vous recevez leur nom et l’heure d’arrivée prévue dès qu’ils acceptent.'}
          </p>
        )}
      </section>

      {demande.statut === 'A_INSPECTER' && (
        <p className="text-sm bg-indigo-50 text-indigo-800 rounded-xl p-4 mb-4">
          L’intervention est terminée. L’inspecteur Bricolibe contrôle le travail avant de clôturer la prestation.
        </p>
      )}
      {demande.statut === 'INSPECTION_REFUSEE' && (
        <p className="text-sm bg-red-50 text-red-800 rounded-xl p-4 mb-4">
          Le contrôle qualité a relevé un problème. L’équipe Bricolibe le règle et revient vers vous.
        </p>
      )}
      {demande.rapport_disponible && <ProcesVerbal demande={demande} signerPv={signerPv} />}
      <Note demande={demande} noter={noter} />
      <ApresVente demande={demande} reclamer={reclamer} garantie={garantie} />
      {demande.statut === 'CLOTUREE' && demande.photos.some((p) => p.type_photo === 'APRES') && (
        <label className="flex items-start gap-3 bg-white border border-line rounded-2xl p-4 mb-4 text-sm cursor-pointer">
          <input
            type="checkbox" className="mt-1 accent-blue-600" checked={Boolean(demande.accord_portfolio)}
            disabled={accordPortfolio.isLoading} onChange={(e) => accordPortfolio.mutate(e.target.checked)}
          />
          <span>
            J’accepte que les ouvriers publient les photos avant / après de cette intervention sur leur profil Bricolibe
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
      </div>
    </CadreEntreprise>
  )
}
