import { Link } from 'react-router-dom'
import {
  AlarmClock, CheckCircle2, ChevronRight, ClipboardSignature, CreditCard, Crown, FileText, Gauge, Inbox, Plus, Siren, Star, Timer,
} from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { Barres, BOUTON_PRINCIPAL, CarteChiffre, Panneau } from '@/components/espace/EspaceLayout'
import { dateHeure, fcfa, STATUTS_DEMANDE_ENTREPRISE, useTableauEntreprise } from '@/hooks/useEntreprises'

const ACTIONS = {
  DEVIS: { Icon: FileText, classe: 'bg-primary-50 text-primary-600', bouton: 'Répondre' },
  DELAI: { Icon: AlarmClock, classe: 'bg-red-50 text-red-600', bouton: 'Voir' },
  PV: { Icon: ClipboardSignature, classe: 'bg-sky-50 text-sky-600', bouton: 'Signer' },
  NOTE: { Icon: Star, classe: 'bg-blue-50 text-blue-600', bouton: 'Noter' },
}
const moisCourt = (iso) => new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(`${iso}T12:00:00`)).replace('.', '')

function AFaire({ actions }) {
  if (!actions.length) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted bg-canvas-soft rounded-xl p-4">
        <CheckCircle2 className="w-5 h-5 text-accent-500" /> Rien ne vous attend : l’inspecteur Bricolibe suit vos demandes.
      </p>
    )
  }
  return (
    <ul className="divide-y divide-line">
      {actions.map((action) => {
        const style = ACTIONS[action.type] || ACTIONS.DEVIS
        return (
          <li key={`${action.type}-${action.demande_uid}`}>
            <Link to={`/espace-entreprise/demandes/${action.demande_uid}`} className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-canvas-soft transition-colors">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.classe}`}><style.Icon className="w-4 h-4" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink">{action.titre}</span>
                <span className="block text-xs text-muted truncate">{action.metiers}{action.site ? ` · ${action.site}` : ''}</span>
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-blue-600">{style.bouton}</span>
              <ChevronRight className="w-4 h-4 text-muted shrink-0" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Formule en vigueur (abonnement) et mois à régler. */
function Formule({ formule }) {
  if (!formule) return null
  const abonne = formule.code !== 'PRESTATION'
  return (
    <Link
      to="/espace-entreprise/abonnement"
      className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl p-4 text-white shadow-card transition-transform hover:-translate-y-0.5 ${
        formule.a_payer ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-blue-600 to-sky-600'
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
        {formule.a_payer ? <CreditCard className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold">
          Formule {formule.label}
          {abonne && formule.deplacements_inclus !== 0 && ` · déplacements ${formule.deplacements_utilises ?? 0}${formule.deplacements_inclus === null ? ' (illimités)' : ` / ${formule.deplacements_inclus}`}`}
          {abonne && formule.remise ? ` · −${formule.remise} % sur la main-d’œuvre` : ''}
        </span>
        <span className="block text-sm text-white/85">
          {formule.a_payer
            ? `Mois à régler : ${fcfa(formule.a_payer.montant)}. Payez en ligne pour garder vos avantages.`
            : abonne ? 'Déplacements inclus, délais plus courts, entretien préventif.' : 'Passez à un abonnement : déplacements inclus, délais plus courts, réduction sur la main-d’œuvre.'}
        </span>
      </span>
      <span className="text-sm font-semibold underline underline-offset-2">{formule.a_payer ? 'Payer' : abonne ? 'Gérer' : 'Voir les formules'}</span>
    </Link>
  )
}

/** Tableau de bord de l'entreprise (ou du responsable de site) : ce qui attend une action, délais, activité. */
export default function TableauEntreprisePage() {
  const { data, isLoading } = useTableauEntreprise()

  return (
    <CadreEntreprise
      titre="Tableau de bord"
      sousTitre="Vos interventions en un coup d’œil : un inspecteur Bricolibe supervise chacune d’elles."
      actions={<Link to="/espace-entreprise/nouvelle-demande" className={BOUTON_PRINCIPAL}><Plus className="w-5 h-5" /> Nouvelle demande</Link>}
    >
      {isLoading || !data ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-5">
          <Formule formule={data.formule} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <CarteChiffre
              label="En cours" valeur={data.compteurs.en_cours} Icon={Inbox} ton="principal" to="/espace-entreprise/demandes"
              aide="Demandes suivies par l’inspecteur"
              alerte={data.compteurs.delais_depasses ? `${data.compteurs.delais_depasses} délai(s) dépassé(s)` : null}
            />
            <CarteChiffre
              label="Urgences" valeur={data.compteurs.urgences_en_cours} Icon={Siren}
              ton={data.compteurs.urgences_en_cours ? 'rouge' : 'orange'} aide="Urgences en cours de traitement"
            />
            <CarteChiffre
              label="Devis à répondre" valeur={data.compteurs.devis_a_repondre} Icon={FileText} ton="orange"
              aide="À accepter, discuter ou refuser"
            />
            <CarteChiffre
              label="Délais tenus" valeur={data.delais.taux == null ? '—' : `${data.delais.taux} %`} Icon={Timer} ton="bleu"
              aide={data.delais.mesurees ? `${data.delais.tenues} sur ${data.delais.mesurees} intervention(s), 90 derniers jours` : 'Aucune intervention mesurée pour l’instant'}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <Panneau titre="À faire" className="lg:col-span-2">
              <AFaire actions={data.a_faire} />
            </Panneau>
            <Panneau titre="Activité">
              <Barres donnees={data.par_mois.map((m) => ({ libelle: moisCourt(m.mois), valeur: m.nb }))} />
              <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <dt className="text-xs text-emerald-700">Clôturées ce mois</dt>
                  <dd className="font-display text-xl font-bold text-emerald-800">{data.compteurs.cloturees_mois}</dd>
                </div>
                <div className="rounded-xl bg-sky-50 p-3">
                  <dt className="text-xs text-sky-700">Clôturées au total</dt>
                  <dd className="font-display text-xl font-bold text-sky-800">{data.compteurs.cloturees_total}</dd>
                </div>
              </dl>
            </Panneau>
          </div>

          <div className={`grid gap-5 ${data.sites.length > 1 ? 'lg:grid-cols-3' : ''}`}>
            {data.sites.length > 1 && (
              <Panneau titre="Par site" action={<Link to="/espace-entreprise/sites" className="text-sm font-semibold text-blue-600">Gérer</Link>}>
                <ul className="grid gap-2">
                  {data.sites.map((site) => (
                    <li key={site.uid}>
                      <Link to={`/espace-entreprise/demandes?site=${site.uid}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-blue-300 transition-colors">
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-ink truncate">{site.nom}</span>
                          <span className="block text-xs text-muted">{site.cloturees} clôturée(s)</span>
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${site.en_cours ? 'bg-blue-50 text-blue-700' : 'bg-canvas-soft text-muted'}`}>
                          {site.en_cours} en cours
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panneau>
            )}
            <Panneau
              titre="Demandes récentes" className={data.sites.length > 1 ? 'lg:col-span-2' : ''}
              action={<Link to="/espace-entreprise/demandes" className="text-sm font-semibold text-blue-600">Toutes</Link>}
            >
              {data.recentes.length ? (
                <ul className="divide-y divide-line">
                  {data.recentes.map((demande) => {
                    const statut = STATUTS_DEMANDE_ENTREPRISE[demande.statut] || { label: demande.statut, classe: '' }
                    return (
                      <li key={demande.uid}>
                        <Link to={`/espace-entreprise/demandes/${demande.uid}`} className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-canvas-soft transition-colors">
                          <span className="flex-1 min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-ink">{demande.metiers}</span>
                              {demande.urgence === 'URGENCE' && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">Urgence</span>}
                            </span>
                            <span className="block text-xs text-muted truncate">
                              {demande.site ? `${demande.site.nom} · ` : ''}Envoyée {dateHeure(demande.created_at)}
                            </span>
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${statut.classe}`}>{statut.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <Gauge className="w-9 h-9 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">Aucune demande pour l’instant : plomberie, électricité, climatisation… décrivez votre besoin.</p>
                </div>
              )}
            </Panneau>
          </div>
        </div>
      )}
    </CadreEntreprise>
  )
}
