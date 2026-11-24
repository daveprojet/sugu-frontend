import { Check, CreditCard, Crown, Info } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { BOUTON_PRINCIPAL, Panneau } from '@/components/espace/EspaceLayout'
import { fcfa, useAbonnementEntreprise, useActionAbonnement } from '@/hooks/useEntreprises'

const date = (valeur) => (valeur ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${valeur}T12:00:00`)) : '—')
const STATUTS_MOIS = { PAYEE: ['Payé', 'bg-emerald-50 text-emerald-700'], A_PAYER: ['À payer', 'bg-primary-50 text-primary-700'] }

const LIGNES = [
  ['deplacements', 'Déplacements et diagnostics inclus', (f) => (f.deplacements === null ? 'Illimités' : f.deplacements ? `${f.deplacements} par mois` : 'Aucun (10 000 FCFA par intervention)')],
  ['delai_urgence', 'Délai d’une urgence', (f) => f.delai_urgence],
  ['delai_normal', 'Délai normal', (f) => f.delai_normal],
  ['preventif', 'Entretien préventif', (f) => f.preventif],
  ['remise', 'Réduction sur la main-d’œuvre', (f) => (f.remise ? `${f.remise} %` : 'Aucune')],
  ['sites', 'Sites couverts', (f) => (f.code === 'PRESTATION' ? '1 par demande' : f.sites === null ? 'Illimités' : f.sites === 1 ? '1' : `Jusqu’à ${f.sites}`)],
  ['nuit_dimanche', 'Nuit et dimanche', (f) => f.nuit_dimanche],
  ['rapport', 'Rapport mensuel', (f) => f.rapport],
  ['engagement', 'Engagement', (f) => f.engagement],
]

function CarteFormule({ formule, courante, etat, action }) {
  const { abonnement, peut_gerer: peutGerer, formules } = etat
  const estCourante = formule.code === courante
  const abonne = abonnement && abonnement.statut !== 'EN_ATTENTE'
  const prixActuel = abonne ? (formules.find((f) => f.code === abonnement.formule)?.prix || 0) : 0
  const superieure = formule.prix > prixActuel
  let bouton = null
  let aide = null
  if (formule.code !== 'PRESTATION' && peutGerer && !(abonne && abonnement.formule === formule.code)) {
    if (abonnement?.formule_suivante === formule.code) {
      bouton = <span className="text-sm font-semibold text-blue-700">À partir du mois prochain</span>
    } else {
      // Souscription ou formule supérieure : paiement immédiat, puis accès aussitôt ; inférieure : mois suivant.
      aide = superieure
        ? `Paiement de ${fcfa(formule.prix)} maintenant, accès immédiat.`
        : 'Prend effet au début du mois prochain, sans paiement aujourd’hui.'
      bouton = (
        <button
          type="button" disabled={action.isLoading}
          onClick={() => {
            if (!superieure && !window.confirm(`Passer à ${formule.label} au début du mois prochain ?`)) return
            action.mutate({ action: abonne ? 'changer' : 'souscrire', formule: formule.code })
          }}
          className={formule.code === 'PRO' ? BOUTON_PRINCIPAL : 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-primary-300 text-primary-700 font-semibold hover:bg-primary-50 transition-colors'}
        >
          {abonne ? `Passer à ${formule.label}` : `Choisir ${formule.label}`}
        </button>
      )
    }
  }
  return (
    <article className={`relative flex flex-col bg-white rounded-2xl p-5 shadow-sm border-2 ${estCourante ? 'border-blue-500' : 'border-line'}`}>
      {estCourante && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-xs font-semibold px-3 py-1">
          <Check className="w-3.5 h-3.5" /> Votre formule
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{formule.label}</h3>
      <p className="text-xs text-muted">{formule.pour_qui}</p>
      <p className="mt-3">
        {formule.prix
          ? <><span className="font-display text-2xl font-bold text-ink">{fcfa(formule.prix)}</span><span className="text-sm text-muted"> / mois</span></>
          : <span className="font-display text-lg font-bold text-ink">10 000 FCFA <span className="text-sm font-normal text-muted">par intervention</span></span>}
      </p>
      <dl className="grid gap-2 mt-4 text-sm flex-1">
        {LIGNES.map(([cle, libelle, valeur]) => (
          <div key={cle}>
            <dt className="text-xs text-muted">{libelle}</dt>
            <dd className="font-medium text-ink">{valeur(formule)}</dd>
          </div>
        ))}
      </dl>
      {bouton && <div className="mt-5 grid gap-1.5">{bouton}{aide && <span className="text-xs text-muted">{aide}</span>}</div>}
    </article>
  )
}

/** Formules de la charte et abonnement de l'entreprise : souscription et paiement en ligne. */
export default function AbonnementEntreprisePage() {
  const { data: etat, isLoading } = useAbonnementEntreprise()
  const action = useActionAbonnement()

  if (isLoading || !etat) {
    return <CadreEntreprise titre="Abonnement"><div className="flex justify-center py-16"><Spinner size="lg" /></div></CadreEntreprise>
  }
  const { formule_active: active, periode_courante: periode, a_payer: aPayer, abonnement, historique, peut_gerer: peutGerer } = etat

  return (
    <CadreEntreprise
      titre="Abonnement"
      sousTitre="À la prestation sans engagement, ou abonnement mensuel : déplacements inclus, délais plus courts, entretien préventif."
    >
      <div className="grid gap-5">
        {aPayer && (
          <section className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-primary-50 border border-primary-200 p-4">
            <CreditCard className="w-6 h-6 text-primary-600 shrink-0" />
            <div className="flex-1 text-sm text-primary-900">
              {aPayer.montee_en_gamme || abonnement?.statut === 'EN_ATTENTE' ? (
                <>
                  <p className="font-semibold">Paiement non finalisé : formule {aPayer.formule_label} ({fcfa(aPayer.montant)})</p>
                  <p>La formule sera active dès le paiement confirmé.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Mois à régler : {fcfa(aPayer.montant)} — formule {aPayer.formule_label}</p>
                  <p>Mois du {date(aPayer.debut)}, à régler dans les 5 jours (Wave, Orange Money, carte…).</p>
                </>
              )}
            </div>
            {peutGerer ? (
              <div className="flex flex-wrap items-center gap-3">
                {(aPayer.montee_en_gamme || abonnement?.statut === 'EN_ATTENTE') && (
                  <button type="button" disabled={action.isLoading} onClick={() => action.mutate({ action: 'annuler-paiement' })} className="text-sm font-semibold text-primary-800 underline underline-offset-2">
                    Abandonner
                  </button>
                )}
                <button type="button" disabled={action.isLoading} onClick={() => action.mutate({ action: 'payer' })} className={BOUTON_PRINCIPAL}>Payer en ligne</button>
              </div>
            ) : <p className="text-xs text-primary-800">Le compte principal règle l’abonnement.</p>}
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          <Panneau titre="Votre formule" className="lg:col-span-2">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><Crown className="w-6 h-6" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-2xl font-bold text-ink">{active.label}</p>
                <p className="text-sm text-muted">
                  {periode ? `Mois en cours jusqu’au ${date(periode.fin)}` : 'Sans engagement : 10 000 FCFA de déplacement et diagnostic, déduits si vous acceptez le devis.'}
                  {abonnement?.statut === 'SUSPENDU' && ' · abonnement suspendu (mois non réglé)'}
                </p>
              </div>
            </div>
            {periode && (
              <dl className="grid sm:grid-cols-3 gap-3 mt-5 text-sm">
                <div className="rounded-xl bg-blue-50 p-3">
                  <dt className="text-xs text-blue-700">Déplacements ce mois</dt>
                  <dd className="font-display text-xl font-bold text-blue-900">
                    {periode.deplacements_utilises}{periode.deplacements_inclus === null ? ' (illimités)' : ` / ${periode.deplacements_inclus}`}
                  </dd>
                </div>
                <div className="rounded-xl bg-sky-50 p-3">
                  <dt className="text-xs text-sky-700">Réduction main-d’œuvre</dt>
                  <dd className="font-display text-xl font-bold text-sky-900">{active.remise} %</dd>
                </div>
                <div className="rounded-xl bg-primary-50 p-3">
                  <dt className="text-xs text-primary-700">Engagement jusqu’au</dt>
                  <dd className="font-display text-base font-bold text-primary-900">{date(abonnement?.fin_engagement)}</dd>
                </div>
              </dl>
            )}
            {abonnement?.deplacements_offerts > 0 && (
              <p className="text-sm text-emerald-800 bg-emerald-50 rounded-xl p-3 mt-4">
                {abonnement.deplacements_offerts} déplacement(s) offert(s) : nous n’avions pas tenu le délai d’une urgence.
              </p>
            )}
            {abonnement?.formule_suivante && (
              <p className="text-sm text-blue-800 bg-blue-50 rounded-xl p-3 mt-4">
                Passage à la formule {abonnement.formule_suivante_label} au début du mois prochain.
              </p>
            )}
            {abonnement && abonnement.statut !== 'EN_ATTENTE' && peutGerer && (
              <div className="mt-5 pt-4 border-t border-line text-sm">
                {abonnement.fin_prevue ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-red-700">Résiliation demandée : l’abonnement s’arrête le {date(abonnement.fin_prevue)}.</p>
                    <button type="button" disabled={action.isLoading} onClick={() => action.mutate({ action: 'annuler-resiliation' })} className="font-semibold text-blue-600">
                      Annuler la résiliation
                    </button>
                  </div>
                ) : (
                  <button
                    type="button" disabled={action.isLoading}
                    onClick={() => window.confirm(`Résilier l’abonnement ? Il s’arrêtera le ${date(abonnement.fin_si_resiliation)} (3 mois d’engagement, préavis de 30 jours).`)
                      && action.mutate({ action: 'resilier' })}
                    className="text-red-600 font-medium hover:underline"
                  >Résilier l’abonnement</button>
                )}
              </div>
            )}
          </Panneau>

          <Panneau titre="Bon à savoir">
            <ul className="grid gap-2 text-sm text-muted">
              {[
                'Au-delà des déplacements inclus, chaque déplacement est facturé 10 000 FCFA.',
                'Les déplacements non utilisés ne sont pas reportés.',
                'Changement de formule possible : il prend effet au mois suivant.',
                'Engagement de 3 mois, puis renouvellement de mois en mois ; résiliation avec un préavis de 30 jours.',
                'Délai d’une urgence dépassé par Bricolibe : le déplacement suivant vous est offert.',
              ].map((texte) => <li key={texte} className="flex gap-2"><Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />{texte}</li>)}
            </ul>
          </Panneau>
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-4">Les formules</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            {etat.formules.map((formule) => (
              <CarteFormule key={formule.code} formule={formule} courante={active.code} etat={etat} action={action} />
            ))}
          </div>
          {!peutGerer && <p className="text-sm text-muted mt-3">Seul le compte principal de l’entreprise choisit et règle l’abonnement.</p>}
        </div>

        {historique.length > 0 && (
          <Panneau titre="Historique des mois">
            <ul className="divide-y divide-line text-sm">
              {historique.map((mois) => {
                const [libelle, classe] = STATUTS_MOIS[mois.statut] || [mois.statut, 'bg-canvas-soft text-muted']
                return (
                  <li key={mois.debut} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className="flex-1 min-w-[180px] text-ink">{date(mois.debut)} → {date(mois.fin)} · {mois.formule_label}</span>
                    <span className="font-semibold text-ink">{fcfa(mois.montant)}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${classe}`}>{libelle}</span>
                  </li>
                )
              })}
            </ul>
          </Panneau>
        )}
      </div>
    </CadreEntreprise>
  )
}
