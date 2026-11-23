import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Building2, ChevronRight, Crown, MapPin, UserMinus, UserPlus } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import PhoneField from '@/components/common/PhoneField'
import { useMonEntreprise } from '@/hooks/useEntreprises'
import { entrepriseService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors'
const TOUS = ''

/** Profil : raison sociale, NINEA (modifiable par le compte principal), interlocuteur principal. */
function Profil({ estGestionnaire }) {
  const qc = useQueryClient()
  const { data: entreprise } = useMonEntreprise()
  const [ninea, setNinea] = useState(null)
  const enregistrer = useMutation((valeur) => entrepriseService.majMoi({ ninea: valeur }).then((r) => r.data), {
    onSuccess: (data) => { qc.setQueryData('mon-entreprise', data); setNinea(null); toast.success('NINEA enregistré.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’enregistrer le NINEA')),
  })
  if (!entreprise) return null
  return (
    <section className="bg-white border border-line rounded-2xl p-4 mb-6 grid gap-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><Building2 className="w-4 h-4" /></span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">{entreprise.raison_sociale}</p>
          <p className="text-sm text-muted">
            Interlocuteur principal : {entreprise.contact || '—'}{entreprise.telephone ? ` · ${entreprise.telephone}` : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs font-semibold text-muted mb-1.5">NINEA</span>
          <input
            value={ninea ?? entreprise.ninea ?? ''} onChange={(e) => setNinea(e.target.value)} disabled={!estGestionnaire}
            maxLength={30} placeholder="Numéro d’identification de l’entreprise" className={champ}
          />
        </label>
        {estGestionnaire && ninea !== null && ninea !== (entreprise.ninea || '') && (
          <button
            type="button" onClick={() => enregistrer.mutate(ninea.trim())} disabled={enregistrer.isLoading}
            className="px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold disabled:opacity-60"
          >Enregistrer</button>
        )}
      </div>
    </section>
  )
}

/** Mon entreprise : profil, sites et comptes. Le compte principal voit tout ; un responsable de site ne voit que son site. */
export default function EquipeEntreprisePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('membres-entreprise', () => entrepriseService.membres().then((r) => r.data))
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', site: TOUS })
  const rafraichir = () => { qc.invalidateQueries('membres-entreprise'); qc.invalidateQueries('sites-entreprise') }
  const ajouter = useMutation((donnees) => entrepriseService.ajouterMembre(donnees), {
    onSuccess: () => {
      rafraichir()
      setForm({ prenom: '', nom: '', telephone: '', site: TOUS })
      toast.success('Compte créé : votre collègue reçoit un SMS pour choisir son mot de passe.')
    },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’ajouter ce compte')),
  })
  const changerSite = useMutation(({ uid, site }) => entrepriseService.changerSiteMembre(uid, site), {
    onSuccess: () => { rafraichir(); toast.success('Accès mis à jour.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible de changer l’accès de ce compte')),
  })
  const retirer = useMutation((uid) => entrepriseService.retirerMembre(uid), {
    onSuccess: () => { rafraichir(); toast.success('Compte retiré.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible de retirer ce compte')),
  })

  if (isLoading || !data) {
    return <CadreEntreprise titre="Équipe et profil"><div className="flex justify-center py-16"><Spinner size="lg" /></div></CadreEntreprise>
  }
  const { membres, max, max_par_site: maxParSite, est_gestionnaire: estGestionnaire, sites = [] } = data
  const plusieursSites = sites.length > 1

  return (
    <CadreEntreprise titre="Équipe et profil" sousTitre="Profil de l’entreprise et comptes de l’équipe.">
      <div className="max-w-3xl">
      <Profil estGestionnaire={estGestionnaire} />
      {/* Sur téléphone, les sites n'ont pas d'onglet : accès depuis cette page. */}
      <Link to="/espace-entreprise/sites" className="md:hidden flex items-center gap-3 bg-white border border-line rounded-2xl p-4 mb-6 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><MapPin className="w-4 h-4" /></span>
        <span className="flex-1 font-semibold text-ink">Sites de l’entreprise ({sites.length})</span>
        <ChevronRight className="w-4 h-4 text-muted" />
      </Link>

      <h2 className="font-semibold text-ink mb-1">Comptes de l’équipe</h2>
      <p className="text-sm text-muted mb-3">
        Un compte « tous les sites » voit et crée les demandes de toute l’entreprise ; un responsable de site, seulement
        celles de son site. Jusqu’à {max} comptes pour le site principal, {maxParSite} par autre site.
      </p>

      <ul className="grid gap-3 mb-6">
        {membres.map((membre) => (
          <li key={membre.uid} className="flex flex-wrap items-center gap-3 bg-white border border-line rounded-2xl p-4 shadow-sm">
            <div className="flex-1 min-w-[180px]">
              <p className="font-semibold text-ink flex flex-wrap items-center gap-1.5">
                {membre.prenom} {membre.nom}
                {membre.est_gestionnaire && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" /> Compte principal
                  </span>
                )}
              </p>
              <p className="text-sm text-muted">
                {membre.telephone}{!estGestionnaire || membre.est_gestionnaire ? ` · ${membre.site ? `responsable du site ${membre.site.nom}` : 'tous les sites'}` : ''}
              </p>
            </div>
            {estGestionnaire && !membre.est_gestionnaire && (
              <>
                {plusieursSites && (
                  <select
                    aria-label={`Accès de ${membre.prenom} ${membre.nom}`} value={membre.site?.uid || TOUS} disabled={changerSite.isLoading}
                    onChange={(e) => changerSite.mutate({ uid: membre.uid, site: e.target.value || null })}
                    className="px-3 py-2 bg-canvas-soft border border-line rounded-lg text-sm"
                  >
                    <option value={TOUS}>Tous les sites</option>
                    {sites.map((site) => <option key={site.uid} value={site.uid}>Responsable : {site.nom}</option>)}
                  </select>
                )}
                <button
                  type="button"
                  disabled={retirer.isLoading}
                  onClick={() => window.confirm(`Retirer le compte de ${membre.prenom} ${membre.nom} ? Il ne pourra plus se connecter.`) && retirer.mutate(membre.uid)}
                  className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
                >
                  <UserMinus className="w-4 h-4" /> Retirer
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {estGestionnaire ? (
        <form
          onSubmit={(e) => { e.preventDefault(); ajouter.mutate({ ...form, site: form.site || null }) }}
          className="bg-white border border-line rounded-2xl p-5 grid gap-4 shadow-sm"
        >
          <h2 className="font-semibold text-ink flex items-center gap-2"><UserPlus className="w-4 h-4" /> Ajouter un collègue</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={champ} />
            <input required placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={champ} />
          </div>
          <PhoneField value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v || '' })} required />
          {plusieursSites && (
            <label>
              <span className="block text-xs font-semibold text-muted mb-1.5">Accès</span>
              <select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className={champ}>
                <option value={TOUS}>Tous les sites</option>
                {sites.map((site) => (
                  <option key={site.uid} value={site.uid} disabled={site.nb_membres >= site.max_membres}>
                    Responsable du site : {site.nom} ({site.nb_membres}/{site.max_membres})
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="text-xs text-muted">Il recevra un SMS et choisira son mot de passe avec « Mot de passe oublié ».</p>
          <button
            type="submit"
            disabled={ajouter.isLoading}
            className="justify-self-start px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold"
          >
            {ajouter.isLoading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">Seul le compte principal de l’entreprise peut ajouter ou retirer des comptes.</p>
      )}
      </div>
    </CadreEntreprise>
  )
}
