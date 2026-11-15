import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, CalendarClock, Check, ClipboardList, Flag, MapPin, Navigation, Phone, RotateCcw, Wallet, X } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import DevisArtisan from '@/components/entreprise/DevisArtisan'
import Galerie from '@/components/entreprise/Galerie'
import PhotosPicker from '@/components/demande/PhotosPicker'
import { dateHeure, fcfa, STATUTS_MISSION, useActionMission, useMission } from '@/hooks/useEntreprises'

// Messages en haut d'écran : en bas, ils masqueraient la barre d'actions au téléphone.
const EN_HAUT = { position: 'top-center' }

function EtapePhotos({ titre, type, mission, actions, modifiable }) {
  const [photos, setPhotos] = useState([])
  const deja = mission.mes_photos.filter((p) => p.type_photo === type)
  const envoyer = () => actions.ajouterPhotos.mutate({ type, photos }, { onSuccess: () => setPhotos([]) })

  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-semibold text-ink">{titre} <span className="text-muted font-normal">({deja.length}/5)</span></h3>
      <Galerie
        photos={deja}
        vide="Aucune photo pour l’instant."
        onRetirer={mission.statut === 'SUR_SITE' ? (p) => actions.supprimerPhoto.mutate(p.uid) : undefined}
      />
      {modifiable && deja.length < 5 && (
        <>
          <PhotosPicker photos={photos} onChange={setPhotos} max={5 - deja.length} label="" />
          {photos.length > 0 && (
            <button
              type="button" onClick={envoyer} disabled={actions.ajouterPhotos.isLoading}
              className="justify-self-start px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium disabled:opacity-60"
            >
              {actions.ajouterPhotos.isLoading ? 'Envoi…' : `Envoyer ${photos.length} photo(s)`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function MissionEntreprisePage() {
  const { uid } = useParams()
  const { data: mission, isLoading, error } = useMission(uid)
  const actions = useActionMission(uid)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (error || !mission) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted">Cette mission n’est plus disponible (elle a peut-être été annulée).</p>
        <Link to="/dashboard-artisan/missions-entreprises" className="text-primary-600 font-medium mt-3 inline-block">Retour aux missions entreprises</Link>
      </main>
    )
  }

  const { demande } = mission
  const statut = STATUTS_MISSION[mission.statut] || { label: mission.statut, classe: '' }
  const agir = (action, data, succes) => actions.action.mutate({ action, data }, { onSuccess: () => succes && toast.success(succes, EN_HAUT) })
  const refuser = () => {
    const motif = window.prompt('Pourquoi refusez-vous cette mission ? (facultatif)')
    if (motif !== null) agir('refuser', { motif }, 'Mission refusée.')
  }
  const terminer = () => {
    if (window.confirm('Confirmez-vous la fin de l’intervention ? L’inspecteur Bricolibe va contrôler le travail.')) {
      agir('terminer', {}, 'Intervention terminée, merci !')
    }
  }
  const itineraire = demande.latitude && demande.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${demande.latitude},${demande.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${demande.adresse}, ${demande.ville}`)}`
  const enAttente = actions.action.isLoading
  const visite = () => {
    if (window.confirm('Signaler votre visite de diagnostic chez l’entreprise ?')) {
      agir('visite', {}, 'Visite enregistrée. Proposez maintenant votre devis.')
    }
  }
  const enReprise = mission.nb_reprises > 0 && ['ACCEPTEE', 'SUR_SITE'].includes(mission.statut)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-28">
      <Link to="/dashboard-artisan/missions-entreprises" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Missions entreprises
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Mission entreprise · {mission.metier}</p>
          <h1 className="font-display text-2xl font-bold text-ink">{demande.entreprise}</h1>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statut.classe}`}>{statut.label}</span>
      </div>

      <section className="bg-white border border-line rounded-2xl p-5 grid gap-4 mb-4">
        <div className="grid gap-2 text-sm">
          <p className="flex items-start gap-2 text-ink font-medium"><CalendarClock className="w-4 h-4 mt-0.5 shrink-0" />Attendu {dateHeure(mission.heure_prevue)}</p>
          <p className="flex items-start gap-2 text-muted"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{demande.adresse}, {demande.quartier ? `${demande.quartier}, ` : ''}{demande.ville}</p>
          <a href={itineraire} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 font-medium">
            <Navigation className="w-4 h-4" /> Itinéraire
          </a>
          {demande.telephone_contact ? (
            <a href={`tel:${demande.telephone_contact}`} className="inline-flex items-center gap-1.5 text-primary-600 font-medium">
              <Phone className="w-4 h-4" /> {demande.contact_sur_place} · {demande.telephone_contact}
            </a>
          ) : (
            <p className="text-xs text-muted">Le contact sur place s’affiche dès que vous acceptez la mission.</p>
          )}
        </div>
        <p className="text-ink whitespace-pre-line border-t border-line pt-4">{demande.description}</p>
        <Galerie photos={demande.photos_panne} />
        {demande.video_url && <video src={demande.video_url} controls playsInline preload="metadata" className="w-full max-w-md rounded-lg bg-black" />}
      </section>

      {enReprise && (
        <section className="bg-orange-50 text-orange-900 rounded-2xl p-5 mb-4 grid gap-1">
          <p className="font-semibold flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reprise demandée par l’inspecteur</p>
          {mission.derniere_reprise?.commentaire && <p className="text-sm">{mission.derniere_reprise.commentaire}</p>}
          <p className="text-sm">Retour prévu {dateHeure(mission.heure_prevue)}. Ajoutez une nouvelle photo « après » une fois la correction faite.</p>
        </section>
      )}

      {mission.statut !== 'PROPOSEE' && <DevisArtisan mission={mission} proposer={actions.proposerDevis} />}

      {mission.statut === 'ACCEPTEE' && !mission.devis_accepte && (
        <section className="bg-white border border-line rounded-2xl p-5 mb-4 grid gap-2">
          <h2 className="font-semibold text-ink flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Visite de diagnostic</h2>
          {mission.visite_at ? (
            <p className="text-sm text-muted">Visite signalée {dateHeure(mission.visite_at)}.</p>
          ) : (
            <>
              <p className="text-sm text-muted">Passez évaluer le travail sur place avant de chiffrer votre devis (facultatif).</p>
              <button type="button" onClick={visite} disabled={enAttente} className="justify-self-start px-4 py-2 rounded-lg border border-line text-ink text-sm font-medium">
                Je suis sur place pour le diagnostic
              </button>
            </>
          )}
        </section>
      )}

      {mission.statut === 'TERMINEE' && demande.statut === 'CLOTUREE' && (
        <label className="flex items-start gap-3 bg-white border border-line rounded-2xl p-4 mb-4 text-sm cursor-pointer">
          <input
            type="checkbox" className="mt-1 accent-indigo-600" checked={Boolean(mission.portfolio_publie)}
            disabled={actions.publierPortfolio.isLoading} onChange={(e) => actions.publierPortfolio.mutate(e.target.checked)}
          />
          <span>
            Publier mes photos avant / après sur mon profil
            <span className={`block text-xs mt-0.5 ${mission.accord_portfolio ? 'text-emerald-700' : 'text-muted'}`}>
              {mission.accord_portfolio
                ? 'L’entreprise a donné son accord.'
                : 'Elles s’afficheront dès que l’entreprise aura donné son accord.'}
            </span>
          </span>
        </label>
      )}

      {mission.paiement && (
        <section className="bg-emerald-50 text-emerald-900 rounded-2xl p-5 mb-4 flex items-start gap-2">
          <Wallet className="w-4 h-4 mt-0.5" />
          <p className="text-sm">
            Payé {fcfa(mission.paiement.montant)} par {mission.paiement.operateur_libelle} le{' '}
            {new Date(`${mission.paiement.date_paiement}T12:00:00`).toLocaleDateString('fr-FR')} (réf. {mission.paiement.reference}).
          </p>
        </section>
      )}

      {['SUR_SITE', 'TERMINEE'].includes(mission.statut) && (
        <section className="bg-white border border-line rounded-2xl p-5 grid gap-5 mb-4">
          <p className="text-sm text-muted">Photos obligatoires : au moins une avant et une après l’intervention.</p>
          <EtapePhotos titre="Photos avant" type="AVANT" mission={mission} actions={actions} modifiable={mission.statut === 'SUR_SITE'} />
          <EtapePhotos titre="Photos après" type="APRES" mission={mission} actions={actions} modifiable />
        </section>
      )}

      {/* Actions : barre fixe en bas d'écran, à portée de pouce sur le chantier. */}
      {['PROPOSEE', 'ACCEPTEE', 'SUR_SITE'].includes(mission.statut) && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-line p-3 z-40">
          <div className="max-w-2xl mx-auto flex gap-3">
            {mission.statut === 'PROPOSEE' && (
              <>
                <button type="button" onClick={refuser} disabled={enAttente} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-ink font-semibold">
                  <X className="w-4 h-4" /> Refuser
                </button>
                <button type="button" onClick={() => agir('accepter', {}, 'Mission acceptée !')} disabled={enAttente} className="flex-[2] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500 text-white font-semibold">
                  <Check className="w-4 h-4" /> Accepter la mission
                </button>
              </>
            )}
            {mission.statut === 'ACCEPTEE' && (mission.devis_accepte ? (
              <button type="button" onClick={() => agir('arrivee', {}, 'Arrivée enregistrée.')} disabled={enAttente} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-semibold">
                <MapPin className="w-4 h-4" /> {mission.nb_reprises ? 'Je suis de retour sur site' : 'Je suis arrivé sur site'}
              </button>
            ) : (
              <p className="flex-1 text-center text-sm text-muted py-2">
                L’intervention commence quand l’entreprise a accepté le devis validé par l’inspecteur.
              </p>
            ))}
            {mission.statut === 'SUR_SITE' && (
              <button type="button" onClick={terminer} disabled={enAttente} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500 text-white font-semibold">
                <Flag className="w-4 h-4" /> Intervention terminée
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
