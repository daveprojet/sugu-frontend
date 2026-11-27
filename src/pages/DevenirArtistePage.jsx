import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Check, Mail, Clock, AlertTriangle, BadgeCheck, Palette, X, Pencil, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import PhoneField from '@/components/common/PhoneField'
import PhotosPicker from '@/components/demande/PhotosPicker'
import Spinner from '@/components/common/Spinner'

const ETAPES = ['Compte', 'Profil', 'Dossier', 'Suivi']
const REALISATIONS_MIN = 3
const TYPES_PIECE = [
  ['cni', "Carte nationale d'identité"],
  ['passeport', 'Passeport'],
  ['permis', 'Permis de conduire'],
]

const champ =
  'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150'
const libelle = 'block text-xs font-semibold text-muted mb-1.5'
const boutonPrincipal =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

/** Profil d'artiste du compte connecté ; null s'il n'existe pas encore. */
function useMonProfil(actif) {
  return useQuery(
    'marketplace-mon-profil',
    () => marketplaceService.monProfil().then((r) => r.data).catch((e) => {
      if (e?.response?.status === 404) return null
      throw e
    }),
    { enabled: actif, retry: false, refetchOnWindowFocus: true },
  )
}

function Progression({ etape }) {
  return (
    <ol className="grid grid-cols-4 gap-2 mb-8" aria-label="Étapes de l’inscription">
      {ETAPES.map((titre, i) => (
        <li key={titre} aria-current={i === etape ? 'step' : undefined}>
          <span className={`block h-1.5 rounded-full ${i <= etape ? 'bg-indigo-600' : 'bg-line'}`} />
          <span className={`mt-2 flex items-center gap-1 text-xs font-semibold ${i <= etape ? 'text-indigo-700' : 'text-muted'}`}>
            {i < etape ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <span aria-hidden="true">{i + 1}.</span>}
            <span className="truncate">{titre}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

// ── Étape 1 : compte Bricolibe ───────────────────────────────────────────────
function EtapeCompte() {
  const { register } = useAuth()
  const { pathname } = useLocation()
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', password: '' })
  const [cgu, setCgu] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const envoyer = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    try {
      await register({ ...form, role: 'client' })
      toast.success('Compte créé. Continuons avec votre profil d’artiste.')
    } catch (err) {
      toast.error(extractApiError(err, 'Erreur lors de la création du compte'))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Votre profil d’artiste sera rattaché à un compte Bricolibe. Vous avez déjà un compte ?{' '}
        <Link to={`/connexion?redirect=${encodeURIComponent(pathname)}`} className="font-semibold text-indigo-700 underline">Connectez-vous</Link>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={libelle} htmlFor="mp-prenom">Prénom *</label>
          <input id="mp-prenom" className={champ} required value={form.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Ex. : Awa" />
        </div>
        <div>
          <label className={libelle} htmlFor="mp-nom">Nom *</label>
          <input id="mp-nom" className={champ} required value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Ex. : Diop" />
        </div>
      </div>
      <div>
        <label className={libelle}>Téléphone *</label>
        <PhoneField value={form.telephone} onChange={(v) => set('telephone', v)} required />
        <p className="mt-1 text-xs text-muted">Les acheteurs vous appelleront sur ce numéro.</p>
      </div>
      <div>
        <label className={libelle} htmlFor="mp-mdp">Mot de passe *</label>
        <input id="mp-mdp" type="password" minLength={6} className={champ} required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="6 caractères minimum" />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" className="mt-0.5" checked={cgu} onChange={(e) => setCgu(e.target.checked)} />
        <span>J’accepte les <Link to="/cgu" target="_blank" className="font-semibold text-indigo-700 underline">CGU</Link> et la{' '}
          <Link to="/confidentialite" target="_blank" className="font-semibold text-indigo-700 underline">politique de confidentialité</Link>.</span>
      </label>
      <button type="submit" className={boutonPrincipal} disabled={envoi || !cgu}>{envoi ? 'Création…' : 'Créer mon compte et continuer'}</button>
    </form>
  )
}

// ── Étape 2 : profil d'artiste ───────────────────────────────────────────────
export function EtapeProfil({ profil, onTermine }) {
  const qc = useQueryClient()
  const { data: categories = [] } = useQuery('marketplace-categories', () => marketplaceService.categories().then((r) => r.data), { staleTime: 30 * 60 * 1000 })
  const [form, setForm] = useState(() => ({
    email: profil?.email || '', nom_artiste: profil?.nom_artiste || '', ville: profil?.ville || '',
    quartier: profil?.quartier || '', whatsapp: profil?.whatsapp || '', bio: profil?.bio || '',
    specialites: profil?.specialites || [],
  }))
  const [photo, setPhoto] = useState([])
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const basculer = (slug) => set('specialites', form.specialites.includes(slug) ? form.specialites.filter((s) => s !== slug) : [...form.specialites, slug])

  const envoyer = async (e) => {
    e.preventDefault()
    if (!form.specialites.length) {
      toast.error('Choisissez au moins une spécialité.')
      return
    }
    setEnvoi(true)
    try {
      let { data } = profil ? await marketplaceService.modifierProfil(form) : await marketplaceService.creerProfil(form)
      if (photo.length) data = (await marketplaceService.modifierProfil({ photo: photo[0] })).data
      setPhoto([])
      qc.setQueryData('marketplace-mon-profil', data)
      if (!profil || profil.email !== data.email) toast.success(`Un lien de confirmation a été envoyé à ${data.email}.`)
      onTermine?.()
    } catch (err) {
      toast.error(extractApiError(err, 'Impossible d’enregistrer votre profil'))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-4">
      <div>
        <label className={libelle} htmlFor="mp-email">Adresse e-mail *</label>
        <input id="mp-email" type="email" className={champ} required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Ex. : awa.diop@gmail.com" />
        <p className="mt-1 text-xs text-muted">Elle reçoit les informations importantes de votre compte d’artiste. Nous vous enverrons un lien pour la confirmer.</p>
      </div>
      <div>
        <label className={libelle} htmlFor="mp-nom-artiste">Nom d’artiste (facultatif)</label>
        <input id="mp-nom-artiste" className={champ} value={form.nom_artiste} onChange={(e) => set('nom_artiste', e.target.value)} placeholder="Sinon, vos prénom et nom sont affichés" />
      </div>
      <fieldset>
        <legend className={libelle}>Spécialités *</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const actif = form.specialites.includes(c.slug)
            return (
              <button key={c.slug} type="button" onClick={() => basculer(c.slug)} aria-pressed={actif}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${actif ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-line bg-white text-ink hover:border-indigo-300'}`}>
                {actif && <Check className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />}{c.nom}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={libelle} htmlFor="mp-ville">Ville *</label>
          <input id="mp-ville" className={champ} required value={form.ville} onChange={(e) => set('ville', e.target.value)} placeholder="Ex. : Dakar" />
        </div>
        <div>
          <label className={libelle} htmlFor="mp-quartier">Quartier</label>
          <input id="mp-quartier" className={champ} value={form.quartier} onChange={(e) => set('quartier', e.target.value)} placeholder="Ex. : Médina" />
        </div>
      </div>
      <div>
        <label className={libelle}>Numéro WhatsApp (s’il est différent de votre téléphone)</label>
        <PhoneField value={form.whatsapp} onChange={(v) => set('whatsapp', v)} />
      </div>
      <div>
        <p className={libelle}>Photo de profil (vous ou votre atelier)</p>
        <div className="flex items-center gap-4">
          {profil?.photo && !photo.length && <img src={profil.photo} alt="" className="h-20 w-20 rounded-full border border-line object-cover" />}
          <PhotosPicker photos={photo} onChange={setPhoto} max={1} label={profil?.photo ? 'Changer la photo' : 'Ajouter une photo'} />
        </div>
      </div>
      <div>
        <label className={libelle} htmlFor="mp-bio">Présentation</label>
        <textarea id="mp-bio" rows={4} className={`${champ} resize-none`} value={form.bio} onChange={(e) => set('bio', e.target.value)}
          placeholder="Votre parcours, vos techniques, vos matériaux, vos expositions (Dak’Art…)" />
      </div>
      <button type="submit" className={boutonPrincipal} disabled={envoi}>{envoi ? 'Enregistrement…' : profil ? 'Enregistrer' : 'Continuer'}</button>
    </form>
  )
}

// ── Étape 3 : pièce d'identité et réalisations ──────────────────────────────
function EtapeDossier({ profil, onTermine }) {
  const qc = useQueryClient()
  const [typePiece, setTypePiece] = useState(profil.piece_identite?.type_piece || 'cni')
  const [recto, setRecto] = useState([])
  const [verso, setVerso] = useState([])
  const [nouvelles, setNouvelles] = useState([])
  const [envoi, setEnvoi] = useState(false)
  const pieceEnvoyee = Boolean(profil.piece_identite)
  const total = profil.realisations.length + nouvelles.length
  const pret = (pieceEnvoyee || recto.length) && total >= REALISATIONS_MIN

  const supprimer = async (id) => {
    try {
      const { data } = await marketplaceService.supprimerRealisation(id)
      qc.setQueryData('marketplace-mon-profil', data)
    } catch (err) {
      toast.error(extractApiError(err, 'Suppression impossible'))
    }
  }

  const envoyer = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    try {
      let data = profil
      if (recto.length) {
        data = (await marketplaceService.envoyerPiece({ type_piece: typePiece, recto: recto[0], verso: verso[0] })).data
      }
      if (nouvelles.length) {
        data = (await marketplaceService.ajouterRealisations(nouvelles)).data
      }
      qc.setQueryData('marketplace-mon-profil', data)
      setRecto([]); setVerso([]); setNouvelles([])
      onTermine?.()
    } catch (err) {
      toast.error(extractApiError(err, 'Envoi impossible'))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-6">
      <section>
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-600" aria-hidden="true" />Pièce d’identité</h3>
        <p className="text-xs text-muted mb-3">Vue uniquement par l’équipe Bricolibe, jamais par les acheteurs.</p>
        {pieceEnvoyee && !recto.length && (
          <p className="mb-3 rounded-lg bg-[#eef8f2] px-3 py-2 text-sm text-[#1f6b45]">
            Pièce envoyée{profil.piece_identite.envoyee_le ? ` le ${new Date(profil.piece_identite.envoyee_le).toLocaleDateString('fr-FR')}` : ''}. Ajoutez une nouvelle photo seulement pour la remplacer.
          </p>
        )}
        <label className={libelle} htmlFor="mp-type-piece">Type de pièce</label>
        <select id="mp-type-piece" className={`${champ} mb-3`} value={typePiece} onChange={(e) => setTypePiece(e.target.value)}>
          {TYPES_PIECE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PhotosPicker photos={recto} onChange={setRecto} max={1} label={pieceEnvoyee ? 'Recto (pour remplacer)' : 'Recto *'} />
          <PhotosPicker photos={verso} onChange={setVerso} max={1} label="Verso" />
        </div>
      </section>

      <section>
        <h3 className="font-bold text-ink mb-1 flex items-center gap-2"><Palette className="w-4 h-4 text-indigo-600" aria-hidden="true" />Photos de vos réalisations</h3>
        <p className="text-xs text-muted mb-3">Au moins {REALISATIONS_MIN} photos d’œuvres que vous avez déjà réalisées : elles montrent votre travail à l’équipe.</p>
        {profil.realisations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {profil.realisations.map((r) => (
              <div key={r.id} className="relative">
                <img src={r.image} alt="" className="h-20 w-20 rounded-lg object-cover border border-line" />
                <button type="button" onClick={() => supprimer(r.id)} aria-label="Supprimer cette photo"
                  className="absolute -top-2 -right-2 rounded-full bg-white border border-line p-1 text-muted hover:text-red-600 shadow">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <PhotosPicker photos={nouvelles} onChange={setNouvelles} max={10 - profil.realisations.length} label="Ajouter des photos" />
        <p className={`mt-2 text-xs font-semibold ${total >= REALISATIONS_MIN ? 'text-[#1f6b45]' : 'text-amber-700'}`}>
          {total} / {REALISATIONS_MIN} photos minimum
        </p>
      </section>

      <button type="submit" className={boutonPrincipal} disabled={envoi || !pret}>{envoi ? 'Envoi…' : 'Envoyer mon dossier'}</button>
    </form>
  )
}

// ── Étape 4 : suivi ─────────────────────────────────────────────────────────
function EtapeSuivi({ profil, onModifierProfil, onModifierDossier }) {
  const [renvoi, setRenvoi] = useState(false)
  const renvoyer = async () => {
    setRenvoi(true)
    try {
      const { data } = await marketplaceService.renvoyerEmail()
      toast.success(data.detail)
    } catch (err) {
      toast.error(extractApiError(err, 'Envoi impossible'))
    } finally {
      setRenvoi(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-xl border p-4 flex gap-3 ${profil.email_verifie ? 'border-[#bfe9cf] bg-[#eef8f2]' : 'border-amber-200 bg-amber-50'}`}>
        <Mail className={`w-5 h-5 shrink-0 ${profil.email_verifie ? 'text-[#1f6b45]' : 'text-amber-700'}`} aria-hidden="true" />
        <div className="text-sm">
          {profil.email_verifie ? (
            <p className="font-semibold text-[#1f6b45]">Adresse e-mail confirmée : {profil.email}</p>
          ) : (
            <>
              <p className="font-semibold text-amber-900">Confirmez votre adresse e-mail</p>
              <p className="text-amber-800">Ouvrez le lien envoyé à <b>{profil.email}</b> (pensez à regarder dans les spams). Sans cette confirmation, l’équipe ne peut pas valider votre profil.</p>
              <button type="button" onClick={renvoyer} disabled={renvoi} className="mt-2 font-semibold text-amber-900 underline disabled:opacity-60">
                {renvoi ? 'Envoi…' : 'Renvoyer le lien'}
              </button>
            </>
          )}
        </div>
      </div>

      {profil.statut === 'EN_ATTENTE' && (
        <div className="rounded-xl border border-line bg-white p-4 flex gap-3">
          <Clock className="w-5 h-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-ink">Dossier en cours de vérification</p>
            <p className="text-muted">L’équipe Bricolibe vérifie votre pièce et vos réalisations sous 48 heures ouvrées. Vous recevrez un e-mail dès que c’est fait.</p>
          </div>
        </div>
      )}
      {profil.statut === 'REJETE' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Dossier à compléter</p>
            <p className="text-red-800 whitespace-pre-line">{profil.motif_rejet}</p>
            <button type="button" onClick={onModifierDossier} className="mt-2 font-semibold text-red-900 underline">Corriger mon dossier</button>
          </div>
        </div>
      )}
      {profil.statut === 'VALIDE' && (
        <div className="rounded-xl border border-[#bfe9cf] bg-[#eef8f2] p-4 flex gap-3">
          <BadgeCheck className="w-5 h-5 shrink-0 text-[#1f6b45]" aria-hidden="true" />
          <div className="text-sm text-[#1f6b45]">
            <p className="font-semibold">Votre profil d’artiste est validé</p>
            {profil.credits?.solde > 0 && <p>Vous avez <b>{profil.credits.solde} crédit{profil.credits.solde > 1 ? 's' : ''}</b>.</p>}
            <p>La publication de vos œuvres ouvre très bientôt dans votre espace artiste.</p>
          </div>
        </div>
      )}
      {profil.statut === 'SUSPENDU' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">Votre compte d’artiste est suspendu. Contactez l’équipe Bricolibe.</div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <button type="button" onClick={onModifierProfil} className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 hover:underline">
          <Pencil className="w-4 h-4" aria-hidden="true" /> Modifier mon profil
        </button>
        {!['VALIDE', 'SUSPENDU'].includes(profil.statut) && (
          <button type="button" onClick={onModifierDossier} className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 hover:underline">
            <Pencil className="w-4 h-4" aria-hidden="true" /> Modifier mon dossier
          </button>
        )}
      </div>
    </div>
  )
}

/** Inscription des artistes à la Marketplace, puis suivi du dossier (aussi servi sur /espace-artiste). */
export default function DevenirArtistePage() {
  const { user, loading } = useAuth()
  const plateforme = user && ['client', 'artisan'].includes(user.role)
  const { data: profil, isLoading } = useMonProfil(Boolean(plateforme))
  const [modification, setModification] = useState(null) // 'profil' | 'dossier' | null

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [modification])

  if (loading || (plateforme && isLoading)) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  if (user && !plateforme) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center text-muted">
        La Marketplace est réservée aux comptes particuliers et artisans. Créez un compte personnel pour vendre vos œuvres.
      </main>
    )
  }

  const dossierComplet = profil?.etapes?.piece_identite && profil?.etapes?.realisations
  let etape = 3
  if (!user) etape = 0
  else if (!profil || modification === 'profil') etape = 1
  else if (!dossierComplet || modification === 'dossier') etape = 2
  const titres = [
    ['Vendez vos œuvres sur Bricolibe', 'Créez votre compte en une minute.'],
    ['Votre profil d’artiste', 'Ce que les acheteurs verront de vous.'],
    ['Votre dossier', 'Pour que l’équipe vérifie votre identité et votre travail.'],
    ['Suivi de votre inscription', profil?.nom_affiche || ''],
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-sm font-semibold text-orange-600 mb-1">Marketplace Bricolibe</p>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">{titres[etape][0]}</h1>
      <p className="text-sm text-muted mt-1 mb-6">{titres[etape][1]}</p>
      <Progression etape={etape} />
      <div className="bg-white rounded-xl border border-line p-5 sm:p-8">
        {etape === 0 && <EtapeCompte />}
        {etape === 1 && <EtapeProfil profil={profil} onTermine={() => setModification(null)} />}
        {etape === 2 && <EtapeDossier profil={profil} onTermine={() => setModification(null)} />}
        {etape === 3 && (
          <EtapeSuivi profil={profil} onModifierProfil={() => setModification('profil')} onModifierDossier={() => setModification('dossier')} />
        )}
        {modification && (
          <button type="button" onClick={() => setModification(null)} className="mt-4 text-sm font-semibold text-muted hover:text-ink">
            Annuler
          </button>
        )}
      </div>
      {etape <= 1 && (
        <p className="mt-6 text-xs text-muted text-center">
          Les acheteurs vous contactent directement par téléphone ou WhatsApp : Bricolibe ne prend aucune commission sur vos ventes.
        </p>
      )}
    </main>
  )
}
