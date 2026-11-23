import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import {
  Building2, ChevronRight, CreditCard, Crown, Mail, MapPin, Phone, Receipt, ShieldCheck, UserMinus, UserPlus, Users, X,
} from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { BOUTON_PRINCIPAL, CarteChiffre, Panneau } from '@/components/espace/EspaceLayout'
import PhoneField from '@/components/common/PhoneField'
import { useMonEntreprise, useTableauEntreprise } from '@/hooks/useEntreprises'
import { entrepriseService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const champ = 'w-full px-3.5 py-2.5 bg-canvas-soft border border-line rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors'
const TOUS = ''
const initiales = (...mots) => mots.filter(Boolean).map((mot) => mot[0]).join('').slice(0, 2).toUpperCase()
const dateCourte = (valeur) => (valeur ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(valeur)) : '—')

/** Profil : raison sociale, NINEA (modifiable par le compte principal), interlocuteur principal. */
function Profil({ estGestionnaire }) {
  const qc = useQueryClient()
  const { data: entreprise } = useMonEntreprise()
  const [ninea, setNinea] = useState(null)
  const enregistrer = useMutation((valeur) => entrepriseService.majMoi({ ninea: valeur }).then((r) => r.data), {
    onSuccess: (data) => { qc.setQueryData('mon-entreprise', data); setNinea(null); toast.success('NINEA enregistré.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’enregistrer le NINEA')),
  })
  if (!entreprise) return <Panneau><div className="flex justify-center py-8"><Spinner /></div></Panneau>
  const modifie = ninea !== null && ninea !== (entreprise.ninea || '')

  return (
    <Panneau>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1748a5] text-white font-display text-lg font-bold">
          {initiales(...entreprise.raison_sociale.split(' ')) || <Building2 className="w-6 h-6" />}
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink truncate">{entreprise.raison_sociale}</p>
          <p className="text-sm text-muted truncate">{[entreprise.secteur, entreprise.zone_ville_nom || entreprise.ville].filter(Boolean).join(' · ') || 'Entreprise cliente'}</p>
        </div>
      </div>

      <dl className="grid gap-3 mt-5 text-sm">
        <div className="flex items-start gap-3">
          <dt className="sr-only">Interlocuteur principal</dt>
          <Crown className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <dd>
            <span className="block font-medium text-ink">{entreprise.contact || '—'}</span>
            <span className="block text-xs text-muted">Interlocuteur principal</span>
          </dd>
        </div>
        {entreprise.telephone && (
          <div className="flex items-center gap-3">
            <dt className="sr-only">Téléphone</dt>
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <dd><a href={`tel:${entreprise.telephone}`} className="text-ink hover:text-blue-700">{entreprise.telephone}</a></dd>
          </div>
        )}
        {entreprise.email && (
          <div className="flex items-center gap-3">
            <dt className="sr-only">E-mail</dt>
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <dd className="truncate"><a href={`mailto:${entreprise.email}`} className="text-ink hover:text-blue-700">{entreprise.email}</a></dd>
          </div>
        )}
        <div className="flex items-center gap-3">
          <dt className="sr-only">Cliente depuis</dt>
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <dd className="text-muted">Cliente Bricolibe depuis le {dateCourte(entreprise.created_at)}</dd>
        </div>
      </dl>

      <div className="mt-5 pt-4 border-t border-line">
        <label htmlFor="ninea" className="block text-xs font-semibold text-muted mb-1.5">NINEA</label>
        <div className="flex gap-2">
          <input
            id="ninea" value={ninea ?? entreprise.ninea ?? ''} onChange={(e) => setNinea(e.target.value)} disabled={!estGestionnaire}
            maxLength={30} placeholder="Numéro d’identification de l’entreprise" className={champ}
          />
          {estGestionnaire && modifie && (
            <button
              type="button" onClick={() => enregistrer.mutate(ninea.trim())} disabled={enregistrer.isLoading}
              className="px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-60 shrink-0"
            >Enregistrer</button>
          )}
        </div>
        {!estGestionnaire && <p className="text-xs text-muted mt-1.5">Seul le compte principal modifie le profil.</p>}
      </div>
    </Panneau>
  )
}

/** Occupation des comptes par site (quotas de la charte). */
function ComptesParSite({ sites }) {
  return (
    <Panneau titre="Comptes par site" action={<Link to="/espace-entreprise/sites" className="text-sm font-semibold text-blue-700">Gérer les sites</Link>}>
      <ul className="grid gap-3">
        {sites.map((site) => {
          const plein = site.nb_membres >= site.max_membres
          return (
            <li key={site.uid}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-ink truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />{site.nom}
                  {site.est_principal && <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">principal</span>}
                </span>
                <span className={`text-xs font-semibold ${plein ? 'text-primary-700' : 'text-muted'}`}>{site.nb_membres} / {site.max_membres}</span>
              </div>
              <div className="h-1.5 rounded-full bg-blue-50 mt-1.5 overflow-hidden">
                <span className={`block h-full rounded-full ${plein ? 'bg-primary-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (site.nb_membres / site.max_membres) * 100)}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted mt-4">Le site principal compte aussi les comptes « tous les sites ».</p>
    </Panneau>
  )
}

function FormulaireAjout({ sites, onFermer }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', site: TOUS })
  const ajouter = useMutation((donnees) => entrepriseService.ajouterMembre(donnees), {
    onSuccess: () => {
      qc.invalidateQueries('membres-entreprise')
      qc.invalidateQueries('sites-entreprise')
      toast.success('Compte créé : votre collègue reçoit un SMS pour choisir son mot de passe.')
      onFermer()
    },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’ajouter ce compte')),
  })
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); ajouter.mutate({ ...form, site: form.site || null }) }}
      className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 mb-4 grid gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-700" /> Nouveau compte</p>
        <button type="button" onClick={onFermer} aria-label="Fermer" className="text-muted hover:text-ink"><X className="w-4 h-4" /></button>
      </div>
      <div className={`grid gap-3 sm:grid-cols-2 ${sites.length > 1 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        <input required aria-label="Prénom" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={champ} />
        <input required aria-label="Nom" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={champ} />
        <PhoneField value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v || '' })} required />
        {sites.length > 1 && (
          <select aria-label="Accès" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className={champ}>
            <option value={TOUS}>Tous les sites</option>
            {sites.map((site) => (
              <option key={site.uid} value={site.uid} disabled={site.nb_membres >= site.max_membres}>
                Responsable : {site.nom} ({site.nb_membres}/{site.max_membres})
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted">Il recevra un SMS et choisira son mot de passe avec « Mot de passe oublié ».</p>
        <button type="submit" disabled={ajouter.isLoading} className={`${BOUTON_PRINCIPAL} disabled:opacity-60`}>
          {ajouter.isLoading ? 'Création…' : 'Créer le compte'}
        </button>
      </div>
    </form>
  )
}

/** Équipe et profil : le compte principal voit tout ; un responsable de site ne voit que son site. */
export default function EquipeEntreprisePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('membres-entreprise', () => entrepriseService.membres().then((r) => r.data))
  const { data: tableau } = useTableauEntreprise()
  const [ajout, setAjout] = useState(false)
  const rafraichir = () => { qc.invalidateQueries('membres-entreprise'); qc.invalidateQueries('sites-entreprise') }
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
  const responsables = membres.filter((m) => m.site).length
  const placesMax = max + Math.max(0, sites.length - 1) * maxParSite

  const acces = (membre) => {
    if (estGestionnaire && !membre.est_gestionnaire && plusieursSites) {
      return (
        <select
          aria-label={`Accès de ${membre.prenom} ${membre.nom}`} value={membre.site?.uid || TOUS} disabled={changerSite.isLoading}
          onChange={(e) => changerSite.mutate({ uid: membre.uid, site: e.target.value || null })}
          className="w-full max-w-[240px] px-3 py-2 bg-white border border-line rounded-lg text-sm"
        >
          <option value={TOUS}>Tous les sites</option>
          {sites.map((site) => <option key={site.uid} value={site.uid}>Responsable : {site.nom}</option>)}
        </select>
      )
    }
    return membre.site
      ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-700"><MapPin className="w-3 h-3" />Responsable : {membre.site.nom}</span>
      : <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Tous les sites</span>
  }

  const boutonRetirer = (membre) => (estGestionnaire && !membre.est_gestionnaire ? (
    <button
      type="button" disabled={retirer.isLoading}
      onClick={() => window.confirm(`Retirer le compte de ${membre.prenom} ${membre.nom} ? Il ne pourra plus se connecter.`) && retirer.mutate(membre.uid)}
      className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
    >
      <UserMinus className="w-4 h-4" /> Retirer
    </button>
  ) : null)

  return (
    <CadreEntreprise titre="Équipe et profil" sousTitre="Profil de l’entreprise, comptes de l’équipe et accès par site.">
      <div className="grid gap-5">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <CarteChiffre label="Comptes" valeur={membres.length} Icon={Users} ton="principal" aide={`Jusqu’à ${placesMax} avec vos ${sites.length} site(s)`} />
          <CarteChiffre label="Sites" valeur={sites.length} Icon={MapPin} ton="bleu" to="/espace-entreprise/sites" aide="Siège, agences, entrepôts" />
          <CarteChiffre label="Responsables de site" valeur={responsables} Icon={ShieldCheck} ton="vert" aide="Ne voient que leur site" />
          <CarteChiffre
            label="Formule" valeur={tableau?.formule?.label || '—'} Icon={CreditCard} ton="orange" to="/espace-entreprise/abonnement"
            aide={tableau?.formule?.a_payer ? 'Un mois est à régler' : 'Voir les formules'}
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-5 items-start">
          <div className="grid gap-5">
            <Profil estGestionnaire={estGestionnaire} />
            {sites.length > 0 && <ComptesParSite sites={sites} />}
            {/* Sur téléphone, factures et abonnement n'ont pas d'onglet : accès depuis cette page. */}
            <Link to="/espace-entreprise/factures" className="md:hidden flex items-center gap-3 bg-white border border-line rounded-2xl p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Receipt className="w-4 h-4" /></span>
              <span className="flex-1 font-semibold text-ink">Factures</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
            <Link to="/espace-entreprise/abonnement" className="md:hidden flex items-center gap-3 bg-white border border-line rounded-2xl p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600"><CreditCard className="w-4 h-4" /></span>
              <span className="flex-1 font-semibold text-ink">Abonnement et formules</span>
              <ChevronRight className="w-4 h-4 text-muted" />
            </Link>
          </div>

          <Panneau
            titre={`Comptes de l’équipe · ${membres.length}`}
            className="xl:col-span-2"
            action={estGestionnaire && !ajout && (
              <button type="button" onClick={() => setAjout(true)} className={BOUTON_PRINCIPAL}><UserPlus className="w-4 h-4" /> Ajouter un collègue</button>
            )}
          >
            {ajout && <FormulaireAjout sites={sites} onFermer={() => setAjout(false)} />}

            {/* Ordinateur : tableau. */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-line">
                    <th className="py-2.5 pr-3 font-semibold">Collègue</th>
                    <th className="py-2.5 pr-3 font-semibold">Téléphone</th>
                    <th className="py-2.5 pr-3 font-semibold">Accès</th>
                    <th className="py-2.5 pr-3 font-semibold">Ajouté le</th>
                    <th className="py-2.5 font-semibold sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {membres.map((membre) => (
                    <tr key={membre.uid} className="align-middle">
                      <td className="py-3 pr-3">
                        <span className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${membre.est_gestionnaire ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                            {initiales(membre.prenom, membre.nom)}
                          </span>
                          <span>
                            <span className="block font-semibold text-ink">{membre.prenom} {membre.nom}</span>
                            {membre.est_gestionnaire && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700"><Crown className="w-3 h-3" /> Compte principal</span>}
                            {!membre.actif && <span className="block text-xs text-red-600">Compte inactif</span>}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap"><a href={`tel:${membre.telephone}`} className="text-ink hover:text-blue-700">{membre.telephone}</a></td>
                      <td className="py-3 pr-3">{acces(membre)}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">{dateCourte(membre.created_at)}</td>
                      <td className="py-3 text-right whitespace-nowrap">{boutonRetirer(membre)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Téléphone : cartes. */}
            <ul className="md:hidden grid gap-3">
              {membres.map((membre) => (
                <li key={membre.uid} className="rounded-xl border border-line p-3 grid gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${membre.est_gestionnaire ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                      {initiales(membre.prenom, membre.nom)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{membre.prenom} {membre.nom}</p>
                      <p className="text-xs text-muted">{membre.est_gestionnaire ? 'Compte principal · ' : ''}{membre.telephone}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">{acces(membre)}{boutonRetirer(membre)}</div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted mt-4">
              Un compte « tous les sites » voit et crée les demandes de toute l’entreprise ; un responsable de site, seulement celles
              de son site. Jusqu’à {max} comptes pour le site principal, {maxParSite} par autre site.
              {!estGestionnaire && ' Seul le compte principal ajoute ou retire des comptes.'}
            </p>
          </Panneau>
        </div>
      </div>
    </CadreEntreprise>
  )
}
