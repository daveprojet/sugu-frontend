import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import {
  Plus, Eye, Phone, MessageCircle, Coins, Rocket, Star, Tag, ArrowUpCircle, CheckCircle2,
  Pencil, Trash2, EyeOff, RefreshCcw, ExternalLink, Clock, Sparkles, BarChart3,
} from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import { prixFCFA } from '@/utils/helpers'
import Modale from '@/components/common/Modale'
import Spinner from '@/components/common/Spinner'
import DevenirArtistePage, { EtapeProfil } from '@/pages/DevenirArtistePage'
import PacksCredits from '@/components/marketplace/PacksCredits'
import StatistiquesOeuvre from '@/components/marketplace/StatistiquesOeuvre'

const dateFr = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')
const joursRestants = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000)

function useMonProfil() {
  return useQuery('marketplace-mon-profil', () => marketplaceService.monProfil().then((r) => r.data).catch((e) => {
    if (e?.response?.status === 404) return null
    throw e
  }), { retry: false })
}

/** Statut affiché d'une œuvre, avec sa couleur. */
function statutOeuvre(o) {
  if (o.statut === 'EN_LIGNE' && o.est_expiree) return ['Expirée', 'bg-amber-100 text-amber-800']
  return {
    EN_LIGNE: ['En ligne', 'bg-[#dff3e8] text-[#1f6b45]'],
    BROUILLON: ['Brouillon', 'bg-canvas text-muted'],
    VENDUE: ['Vendue', 'bg-indigo-50 text-indigo-700'],
    RETIREE: ['Retirée', 'bg-canvas text-muted'],
    MASQUEE: ['Masquée par l’équipe', 'bg-red-50 text-red-700'],
  }[o.statut] || [o.statut, 'bg-canvas text-muted']
}

const FILTRES = [
  ['TOUTES', 'Toutes', () => true],
  ['EN_LIGNE', 'En ligne', (o) => o.est_visible],
  ['A_RENOUVELER', 'À renouveler', (o) => o.est_expiree || (o.statut === 'RETIREE')],
  ['BROUILLON', 'Brouillons', (o) => o.statut === 'BROUILLON'],
  ['VENDUE', 'Vendues', (o) => o.statut === 'VENDUE'],
]

// ── Fenêtres d'action ───────────────────────────────────────────────────────
const LIBELLE_MODE = {
  GRATUITE: (o) => ({ titre: 'Gratuitement', detail: `Visible ${o.duree_jours} jours, renouvelable gratuitement.` }),
  LANCEMENT: (o) => ({ titre: 'Gratuit (lancement)', detail: `Visible ${Math.round(o.duree_jours / 30)} mois pendant la phase de lancement.` }),
  CREDIT: (o) => ({ titre: `${o.credits} crédit`, detail: `Visible ${Math.round(o.duree_jours / 30)} mois.` }),
}

function ModalePublication({ oeuvre, solde, onClose, onFait }) {
  const [envoi, setEnvoi] = useState(null)
  const publier = async (mode) => {
    setEnvoi(mode)
    try {
      await marketplaceService.actionOeuvre(oeuvre.uid, 'publier', { mode })
      toast.success(oeuvre.statut === 'BROUILLON' ? 'Votre œuvre est en ligne !' : 'Visibilité prolongée.')
      onFait()
    } catch (err) {
      toast.error(extractApiError(err, 'Publication impossible'))
    } finally {
      setEnvoi(null)
    }
  }
  return (
    <Modale titre={oeuvre.statut === 'BROUILLON' ? 'Mettre en ligne' : 'Renouveler la visibilité'} onClose={onClose}>
      <p className="mb-4 text-sm text-muted">« {oeuvre.titre} »</p>
      <div className="flex flex-col gap-2">
        {oeuvre.options_publication.map((o) => {
          const { titre, detail } = LIBELLE_MODE[o.mode](o)
          const manque = o.credits > solde
          return (
            <button key={o.mode} type="button" disabled={Boolean(envoi) || manque} onClick={() => publier(o.mode)}
              className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-left hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">
              <span><span className="block font-bold text-ink">{titre}</span><span className="block text-xs text-muted">{detail}</span></span>
              <span className="text-sm font-semibold text-indigo-700">{envoi === o.mode ? '…' : manque ? 'Crédits insuffisants' : 'Choisir'}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-muted">Votre solde : <b>{solde} crédit{solde > 1 ? 's' : ''}</b>.</p>
    </Modale>
  )
}

function ModaleVisibilite({ oeuvre, solde, couts, onClose, onFait }) {
  const [envoi, setEnvoi] = useState(null)
  const options = [
    { cle: 'REMONTEE', icone: ArrowUpCircle, titre: 'Remonter en tête', detail: 'Réapparaît en haut du catalogue, comme une nouvelle œuvre.', cout: couts.REMONTEE },
    { cle: 'UNE_7J', icone: Star, titre: 'À la une · 7 jours', detail: oeuvre.a_la_une ? `Déjà à la une jusqu’au ${dateFr(oeuvre.une_jusqu_au)} : prolonge.` : 'En tête du catalogue, avec un badge « À la une ».', cout: couts.UNE_7J },
    { cle: 'UNE_30J', icone: Star, titre: 'À la une · 30 jours', detail: 'La mise en avant la plus longue.', cout: couts.UNE_30J },
    { cle: 'ETIQUETTE', etiquette: 'PROMO', icone: Tag, titre: 'Étiquette « Promo » · 7 jours', detail: 'Pour signaler un prix réduit.', cout: couts.ETIQUETTE },
    { cle: 'ETIQUETTE', etiquette: 'URGENT', icone: Tag, titre: 'Étiquette « Urgent » · 7 jours', detail: 'Pour une vente rapide.', cout: couts.ETIQUETTE },
  ]
  const appliquer = async (o) => {
    setEnvoi(o.titre)
    try {
      await marketplaceService.actionOeuvre(oeuvre.uid, 'visibilite', { action: o.cle, ...(o.etiquette ? { etiquette: o.etiquette } : {}) })
      toast.success('C’est fait !')
      onFait()
    } catch (err) {
      toast.error(extractApiError(err, 'Action impossible'))
    } finally {
      setEnvoi(null)
    }
  }
  return (
    <Modale titre="Booster la visibilité" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">« {oeuvre.titre} » · solde : <b>{solde} crédit{solde > 1 ? 's' : ''}</b></p>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const Icone = o.icone
          const manque = o.cout > solde
          return (
            <button key={o.titre} type="button" disabled={Boolean(envoi) || manque} onClick={() => appliquer(o)}
              className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-left hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">
              <Icone className="h-5 w-5 shrink-0 text-primary-500" aria-hidden="true" />
              <span className="flex-1"><span className="block font-bold text-ink">{o.titre}</span><span className="block text-xs text-muted">{o.detail}</span></span>
              <span className="whitespace-nowrap text-sm font-bold text-indigo-700">{envoi === o.titre ? '…' : `${o.cout} crédit${o.cout > 1 ? 's' : ''}`}</span>
            </button>
          )
        })}
      </div>
      {solde < 3 && <p className="mt-4 text-xs text-muted">Besoin de crédits ? Achetez un pack dans l’onglet « Crédits ».</p>}
    </Modale>
  )
}

function ModaleVente({ oeuvre, onClose, onFait }) {
  const [quantite, setQuantite] = useState(1)
  const [envoi, setEnvoi] = useState(false)
  const valider = async () => {
    setEnvoi(true)
    try {
      await marketplaceService.actionOeuvre(oeuvre.uid, 'vendue', { quantite })
      toast.success('Bravo pour cette vente !')
      onFait()
    } catch (err) {
      toast.error(extractApiError(err, 'Action impossible'))
    } finally {
      setEnvoi(false)
    }
  }
  const serie = oeuvre.disponibilite === 'SERIE'
  return (
    <Modale titre="Marquer comme vendue" onClose={onClose}>
      <p className="text-sm text-muted">
        {serie
          ? `« ${oeuvre.titre} » : combien d’exemplaires avez-vous vendus ? Il en reste ${oeuvre.quantite}.`
          : `« ${oeuvre.titre} » quittera le catalogue.`}
      </p>
      {serie && (
        <input type="number" min="1" max={oeuvre.quantite} value={quantite} onChange={(e) => setQuantite(Number(e.target.value) || 1)}
          className="mt-3 w-32 rounded-lg border border-line px-3 py-2 text-sm" aria-label="Exemplaires vendus" />
      )}
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={valider} disabled={envoi} className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">Confirmer la vente</button>
        <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink">Annuler</button>
      </div>
    </Modale>
  )
}

// ── Carte d'une œuvre de l'artiste ──────────────────────────────────────────
function CarteMonOeuvre({ o, onAction, stats }) {
  const [libelle, couleur] = statutOeuvre(o)
  const enLigne = o.est_visible
  const restant = enLigne ? joursRestants(o.expire_le) : null
  const retireeEncoreValable = o.statut === 'RETIREE' && o.expire_le && joursRestants(o.expire_le) > 0
  const peutPublier = ['BROUILLON', 'RETIREE'].includes(o.statut) || o.est_expiree
  return (
    <article className="flex gap-3 rounded-xl border border-line bg-white p-3 sm:gap-4 sm:p-4">
      <img src={o.photos?.[0]?.image} alt="" className="h-24 w-24 shrink-0 rounded-lg bg-canvas object-cover sm:h-28 sm:w-28" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${couleur}`}>{libelle}</span>
          {o.a_la_une && <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-600"><Star className="h-3 w-3 fill-current" />À la une</span>}
          {o.etiquette && <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[11px] font-bold text-white">{o.etiquette === 'URGENT' ? 'Urgent' : 'Promo'}</span>}
        </div>
        <h3 className="mt-1 truncate font-bold text-ink">{o.titre}</h3>
        <p className="text-sm font-semibold text-ink">{prixFCFA(o.prix)}{o.disponibilite === 'SERIE' && o.statut !== 'VENDUE' ? ` · ${o.quantite} dispo.` : ''}</p>
        {enLigne && (
          <p className={`mt-0.5 flex items-center gap-1 text-xs ${restant <= 7 ? 'font-semibold text-amber-700' : 'text-muted'}`}>
            <Clock className="h-3 w-3" aria-hidden="true" />Visible jusqu’au {dateFr(o.expire_le)}{restant <= 7 ? ` (${restant} j)` : ''}
          </p>
        )}
        {o.statut === 'MASQUEE' && o.motif_masquage && <p className="mt-0.5 text-xs text-red-700">{o.motif_masquage}</p>}
        <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{o.vues} vue{o.vues > 1 ? 's' : ''}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{o.contacts_whatsapp} WhatsApp</span>
          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{o.contacts_appel} appel{o.contacts_appel > 1 ? 's' : ''}</span>
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {peutPublier && !retireeEncoreValable && o.options_publication.length > 0 && (
            <button type="button" onClick={() => onAction('publier', o)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">
              <Rocket className="h-3.5 w-3.5" />{o.statut === 'BROUILLON' ? 'Mettre en ligne' : 'Renouveler'}
            </button>
          )}
          {retireeEncoreValable && (
            <button type="button" onClick={() => onAction('remettre-en-ligne', o)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">
              <RefreshCcw className="h-3.5 w-3.5" />Remettre en ligne
            </button>
          )}
          {enLigne && (
            <>
              <button type="button" onClick={() => onAction('visibilite', o)} className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-600">
                <Sparkles className="h-3.5 w-3.5" />Booster
              </button>
              {restant <= 7 && o.options_publication.length > 0 && (
                <button type="button" onClick={() => onAction('publier', o)} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
                  <RefreshCcw className="h-3.5 w-3.5" />Prolonger
                </button>
              )}
              <button type="button" onClick={() => onAction('vendue', o)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-soft">
                <CheckCircle2 className="h-3.5 w-3.5" />Vendue
              </button>
              <Link to={o.chemin} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-soft">
                <ExternalLink className="h-3.5 w-3.5" />Voir
              </Link>
            </>
          )}
          {stats && o.publiee_le && (
            <button type="button" onClick={() => onAction('stats', o)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-soft">
              <BarChart3 className="h-3.5 w-3.5" />Statistiques
            </button>
          )}
          {o.statut !== 'MASQUEE' && o.statut !== 'VENDUE' && (
            <Link to={`/espace-artiste/oeuvres/${o.uid}/modifier`} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-soft">
              <Pencil className="h-3.5 w-3.5" />Modifier
            </Link>
          )}
          {enLigne && (
            <button type="button" onClick={() => onAction('retirer', o)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted hover:text-ink">
              <EyeOff className="h-3.5 w-3.5" />Retirer
            </button>
          )}
          {!enLigne && (
            <button type="button" onClick={() => onAction('supprimer', o)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />Supprimer
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Onglets ─────────────────────────────────────────────────────────────────
function OngletOeuvres({ credits }) {
  const qc = useQueryClient()
  const { data: oeuvres = [], isLoading } = useQuery('mp-mes-oeuvres', () => marketplaceService.mesOeuvres().then((r) => r.data))
  const [filtre, setFiltre] = useState('TOUTES')
  const [modale, setModale] = useState(null) // { type, oeuvre }
  const rafraichir = () => { setModale(null); qc.invalidateQueries('mp-mes-oeuvres'); qc.invalidateQueries('mp-mes-credits') }

  const action = async (type, o) => {
    if (['publier', 'visibilite', 'vendue', 'stats'].includes(type)) return setModale({ type, oeuvre: o })
    if (type === 'supprimer' && !window.confirm(`Supprimer définitivement « ${o.titre} » ?`)) return
    if (type === 'retirer' && !window.confirm(`Retirer « ${o.titre} » du catalogue ? Vous pourrez la remettre en ligne tant que sa période de visibilité court.`)) return
    try {
      if (type === 'supprimer') await marketplaceService.supprimerOeuvre(o.uid)
      else await marketplaceService.actionOeuvre(o.uid, type)
      rafraichir()
    } catch (err) {
      toast.error(extractApiError(err, 'Action impossible'))
    }
  }

  const [, , test] = FILTRES.find(([cle]) => cle === filtre)
  const visibles = oeuvres.filter(test)
  const solde = credits?.solde ?? 0

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTRES.map(([cle, libelle, t]) => {
            const n = oeuvres.filter(t).length
            return (
              <button key={cle} type="button" onClick={() => setFiltre(cle)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${filtre === cle ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-line bg-white text-ink'}`}>
                {libelle} {n > 0 && <span className="opacity-70">{n}</span>}
              </button>
            )
          })}
        </div>
        <Link to="/espace-artiste/oeuvres/nouvelle" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />Ajouter une œuvre
        </Link>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Spinner /></div>
        : !oeuvres.length ? (
          <div className="rounded-xl border border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-bold text-ink">Publiez votre première œuvre</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Une belle photo, un titre, un prix : les acheteurs vous contacteront directement.</p>
            <Link to="/espace-artiste/oeuvres/nouvelle" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"><Plus className="h-4 w-4" />Ajouter une œuvre</Link>
          </div>
        ) : visibles.length ? (
          <div className="grid gap-3 lg:grid-cols-2">{visibles.map((o) => <CarteMonOeuvre key={o.uid} o={o} onAction={action} stats={credits?.avantages?.statistiques_detaillees} />)}</div>
        ) : <p className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">Aucune œuvre dans cette liste.</p>}

      {modale?.type === 'publier' && <ModalePublication oeuvre={modale.oeuvre} solde={solde} onClose={() => setModale(null)} onFait={rafraichir} />}
      {modale?.type === 'visibilite' && <ModaleVisibilite oeuvre={modale.oeuvre} solde={solde} couts={credits?.couts || {}} onClose={() => setModale(null)} onFait={rafraichir} />}
      {modale?.type === 'vendue' && <ModaleVente oeuvre={modale.oeuvre} onClose={() => setModale(null)} onFait={rafraichir} />}
      {modale?.type === 'stats' && <StatistiquesOeuvre oeuvre={modale.oeuvre} onClose={() => setModale(null)} />}
    </div>
  )
}

const LIBELLES_COUTS = [
  ['PUBLICATION', 'Mise en ligne (au-delà des gratuites) · 6 mois'],
  ['RENOUVELLEMENT', 'Renouvellement · 6 mois'],
  ['REMONTEE', 'Remonter une œuvre en tête'],
  ['ETIQUETTE', 'Étiquette « Urgent » ou « Promo » · 7 jours'],
  ['UNE_7J', 'À la une · 7 jours'],
  ['UNE_30J', 'À la une · 30 jours'],
]

function OngletCredits({ credits }) {
  if (!credits) return <div className="flex justify-center py-12"><Spinner /></div>
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-line bg-white p-5 lg:col-span-1">
        <p className="text-sm text-muted">Votre solde</p>
        <p className="mt-1 flex items-center gap-2 font-display text-4xl font-bold text-ink"><Coins className="h-8 w-8 text-primary-500" />{credits.solde}</p>
        {credits.prochaine_expiration && (
          <p className="mt-2 text-xs text-amber-700">{credits.prochaine_expiration.credits} crédit(s) expirent le {dateFr(credits.prochaine_expiration.date)}.</p>
        )}
        <a href="#packs-credits" className="mt-4 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700">Acheter des crédits</a>
      </div>
      <div className="rounded-xl border border-line bg-white p-5 lg:col-span-2">
        <h3 className="mb-3 font-bold text-ink">Ce que coûtent les options</h3>
        <ul className="divide-y divide-line-soft text-sm">
          {LIBELLES_COUTS.map(([cle, libelle]) => (
            <li key={cle} className="flex justify-between gap-3 py-2"><span className="text-ink">{libelle}</span><b className="whitespace-nowrap text-indigo-700">{credits.couts[cle]} crédit{credits.couts[cle] > 1 ? 's' : ''}</b></li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          {credits.lancement.actif
            ? 'Phase de lancement : la mise en ligne est gratuite pour 6 mois. Seules les options de visibilité se paient.'
            : `Vos 3 premières œuvres sont gratuites (visibles 2 semaines, renouvelables) : il vous en reste ${credits.publications_gratuites_restantes}.`}
        </p>
      </div>
      <div id="packs-credits" className="scroll-mt-24 lg:col-span-3">
        <PacksCredits />
      </div>
      <div className="rounded-xl border border-line bg-white p-5 lg:col-span-3">
        <h3 className="mb-3 font-bold text-ink">Historique</h3>
        {credits.mouvements.length ? (
          <ul className="divide-y divide-line-soft text-sm">
            {credits.mouvements.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0"><span className="block text-ink">{m.motif_label}{m.oeuvre_titre ? ` · ${m.oeuvre_titre}` : ''}</span><span className="text-xs text-muted">{dateFr(m.created_at)}</span></span>
                <b className={m.delta > 0 ? 'text-[#1f6b45]' : 'text-ink'}>{m.delta > 0 ? `+${m.delta}` : m.delta}</b>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">Aucun mouvement pour le moment.</p>}
      </div>
    </div>
  )
}

/** Espace artiste : ses œuvres, ses crédits, son profil. Avant validation : suivi de l'inscription. */
export default function EspaceArtistePage() {
  const { data: profil, isLoading } = useMonProfil()
  const validee = profil?.statut === 'VALIDE'
  const { data: credits } = useQuery('mp-mes-credits', () => marketplaceService.mesCredits().then((r) => r.data), { enabled: validee })
  const [onglet, setOnglet] = useState('oeuvres')

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!validee) return <DevenirArtistePage />

  const lancement = credits?.lancement
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-600">Espace artiste</p>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{profil.nom_affiche}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setOnglet('credits')} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink">
            <Coins className="h-4 w-4 text-primary-500" />{credits?.solde ?? '…'} crédit{credits?.solde > 1 ? 's' : ''}
          </button>
          <Link to={profil.chemin} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:bg-canvas-soft">
            <ExternalLink className="h-4 w-4" />Ma page publique
          </Link>
        </div>
      </div>

      {lancement?.actif && (
        <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          <b>Phase de lancement :</b> mise en ligne gratuite pour 6 mois, jusqu’à {lancement.plafond_oeuvres} œuvres en ligne
          ({lancement.oeuvres_en_ligne}/{lancement.plafond_oeuvres}).
        </div>
      )}

      <nav className="mt-6 flex gap-1 border-b border-line" aria-label="Sections de l’espace artiste">
        {[['oeuvres', 'Mes œuvres'], ['credits', 'Crédits'], ['profil', 'Mon profil']].map(([cle, libelle]) => (
          <button key={cle} type="button" onClick={() => setOnglet(cle)} aria-current={onglet === cle ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${onglet === cle ? 'border-primary-500 text-primary-600' : 'border-transparent text-muted hover:text-ink'}`}>
            {libelle}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {onglet === 'oeuvres' && <OngletOeuvres credits={credits} />}
        {onglet === 'credits' && <OngletCredits credits={credits} />}
        {onglet === 'profil' && (
          <div className="max-w-2xl rounded-xl border border-line bg-white p-5 sm:p-7">
            <EtapeProfil profil={profil} onTermine={() => toast.success('Profil enregistré.')} />
          </div>
        )}
      </div>
    </main>
  )
}
