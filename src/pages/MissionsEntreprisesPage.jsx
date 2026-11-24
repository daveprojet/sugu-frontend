import { useState } from 'react'
import {
  BadgeCheck, Briefcase, Building2, CalendarCheck, Clock, HardHat, Inbox, MapPinned, MessageCircle, Star, TriangleAlert,
  User, Wallet,
} from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import ListeMissions from '@/components/entreprise/MissionsEntreprises'
import EspaceLayout, { CarteChiffre, Panneau } from '@/components/espace/EspaceLayout'
import { fcfa, useMaZone, useMesResultats, useMissions } from '@/hooks/useEntreprises'

const ONGLETS = [
  ['en_cours', 'En cours'],
  ['terminees', 'Terminées'],
]

const VIDES = {
  en_cours: 'Aucune mission en cours. L’inspecteur Bricolibe vous prévient par notification et SMS dès qu’une entreprise a besoin de vous.',
  terminees: 'Aucune mission terminée pour l’instant.',
}

const note = (valeur) => (valeur == null ? '—' : `${Number(valeur).toFixed(1)}/5`)
const taux = (valeur) => (valeur == null ? '—' : `${valeur} %`)

/** Zone d'intervention de l'ouvrier et son référent, qui relaie les consignes de l'inspecteur. */
function MaZone() {
  const { data } = useMaZone()
  if (!data?.zone) {
    return <p className="text-sm text-muted">Votre zone d’intervention apparaîtra ici quand votre quartier sera rattaché à une zone.</p>
  }
  const { zone, zone_secondaire: secondaire, referent, est_referent: estReferent } = data
  const numero = (referent?.whatsapp || referent?.telephone || '').replace(/\D/g, '')
  return (
    <div className="grid gap-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><MapPinned className="w-5 h-5" /></span>
        <div>
          <p className="font-semibold text-ink">Zone {zone.numero} — {zone.nom}</p>
          {secondaire && <p className="text-xs text-muted">Renfort : zone {secondaire.numero} — {secondaire.nom}</p>}
        </div>
      </div>
      {estReferent ? (
        <p className="flex items-start gap-2 rounded-xl bg-primary-50 text-primary-800 p-3">
          <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
          Vous êtes le référent de votre zone : vous relayez les consignes de l’inspecteur et l’aidez à trouver un ouvrier disponible.
        </p>
      ) : referent ? (
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-xs text-sky-700">Votre référent de zone</p>
          <p className="font-semibold text-ink">{referent.nom}</p>
          {numero && (
            <a href={`https://wa.me/${numero}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 font-semibold text-emerald-700 hover:underline">
              <MessageCircle className="w-4 h-4" /> {referent.whatsapp || referent.telephone}
            </a>
          )}
        </div>
      ) : (
        <p className="text-muted">Pas encore de référent dans votre zone.</p>
      )}
    </div>
  )
}

/** Accueil de l'ouvrier partenaire : ses chiffres, sa zone et les missions confiées par l'inspecteur. */
export default function MissionsEntreprisesPage() {
  const { user } = useAuth()
  // Uniquement partenaire : cette page est son accueil, il n'a pas de tableau de bord indépendant.
  const independant = user?.independant !== false
  const [onglet, setOnglet] = useState('en_cours')
  const { data: missions = [], isLoading } = useMissions(onglet)
  const { data: enCours = [] } = useMissions('en_cours')
  const { data: resultats } = useMesResultats()
  const aRepondre = enCours.filter((m) => m.statut === 'PROPOSEE').length

  const liens = [
    { to: '/dashboard-artisan/missions-entreprises', label: 'Missions entreprises', Icon: Building2, compteur: aRepondre, exact: true },
    ...(independant ? [{ to: '/dashboard-artisan', label: 'Demandes des particuliers', Icon: Inbox, exact: true }] : []),
    { to: '/mon-profil', label: 'Mon profil', Icon: User },
  ]
  const marque = {
    titre: user ? `${user.prenom} ${user.nom}` : 'Mon espace',
    sousTitre: 'Ouvrier / technicien partenaire',
    Icon: HardHat,
  }
  const r = resultats

  return (
    <EspaceLayout
      marque={marque} liens={liens} titre="Missions entreprises"
      sousTitre="Les interventions que l’inspecteur Bricolibe vous confie, et vos résultats."
    >
      <div className="grid gap-5">
        {aRepondre > 0 && (
          <p className="flex items-center gap-2 text-sm bg-primary-50 text-primary-800 border border-primary-200 rounded-xl p-3">
            <Clock className="w-4 h-4 shrink-0" />
            {aRepondre} mission(s) à accepter : répondez vite, l’inspecteur est alerté au bout de 5 minutes.
          </p>
        )}
        {r?.suivi?.a_recadrer && (
          <p className="flex items-start gap-2 text-sm bg-red-50 text-red-800 border border-red-200 rounded-xl p-3">
            <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
            Vos {r.suivi.serie_mauvaises_notes} dernières interventions ont reçu une mauvaise note : l’inspecteur va faire le point avec vous.
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CarteChiffre label="À accepter" valeur={aRepondre} Icon={Briefcase} ton={aRepondre ? 'orange' : 'principal'} aide="Missions proposées" />
          <CarteChiffre label="En cours" valeur={r?.interventions.en_cours ?? '—'} Icon={Building2} ton="principal" aide="Acceptées ou sur site" />
          <CarteChiffre
            label="Terminées ce mois" valeur={r?.interventions.ce_mois ?? '—'} Icon={CalendarCheck} ton="vert"
            aide={r ? `${r.interventions.total} au total` : null}
          />
          <CarteChiffre
            label="Ponctualité" valeur={taux(r?.ponctualite.taux_a_l_heure)} Icon={Clock} ton="bleu"
            aide={r?.ponctualite.nb_arrivees ? `${r.ponctualite.a_l_heure} à l’heure sur ${r.ponctualite.nb_arrivees}` : 'Mesurée à chaque arrivée sur site'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Panneau titre="Mes missions" className="lg:col-span-2">
            <div className="inline-flex rounded-xl border border-line bg-white p-1 mb-4" role="tablist">
              {ONGLETS.map(([cle, libelle]) => (
                <button
                  key={cle} type="button" role="tab" aria-selected={onglet === cle} onClick={() => setOnglet(cle)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${onglet === cle ? 'bg-blue-600 text-white' : 'text-muted hover:text-ink'}`}
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
              <p className="text-sm text-muted bg-canvas-soft rounded-xl p-6 text-center">{VIDES[onglet]}</p>
            )}
          </Panneau>

          <div className="grid gap-5 content-start">
            <Panneau titre="Mes gains">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="w-5 h-5" /></span>
                <div>
                  <p className="text-xs text-muted">Total déjà reçu</p>
                  <p className="font-display text-lg font-bold text-emerald-800">{r ? fcfa(r.montants.paye) : '—'}</p>
                </div>
              </div>
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                Vos gains sont reversés chaque jeudi.
              </p>
              <p className="mt-2 text-xs text-muted">Le détail de chaque paiement figure dans la mission terminée.</p>
            </Panneau>
            <Panneau titre="Ma zone"><MaZone /></Panneau>
            <Panneau titre="Mes résultats">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-blue-50 p-3">
                  <dt className="text-xs text-blue-700 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Note d’inspection</dt>
                  <dd className="font-display text-lg font-bold text-blue-900">{note(r?.inspections.note_qualite)}</dd>
                </div>
                <div className="rounded-xl bg-sky-50 p-3">
                  <dt className="text-xs text-sky-700">Avis des entreprises</dt>
                  <dd className="font-display text-lg font-bold text-sky-900">{note(r?.inspections.avis_entreprise)}</dd>
                </div>
                <div className="rounded-xl bg-primary-50 p-3">
                  <dt className="text-xs text-primary-700">Délégations acceptées</dt>
                  <dd className="font-display text-lg font-bold text-primary-800">{taux(r?.delegations.taux_acceptation)}</dd>
                </div>
              </dl>
              {r?.inspections.reprises > 0 && (
                <p className="text-xs text-muted mt-3">{r.inspections.reprises} reprise(s) demandée(s) par l’inspecteur ({taux(r.inspections.taux_reprises)}).</p>
              )}
            </Panneau>
          </div>
        </div>
      </div>
    </EspaceLayout>
  )
}
