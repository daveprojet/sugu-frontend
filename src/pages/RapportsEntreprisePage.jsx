import { Link } from 'react-router-dom'
import { FileBarChart, FileDown, Lock } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { BOUTON_PRINCIPAL, Panneau } from '@/components/espace/EspaceLayout'
import { entrepriseService } from '@/services/api'
import { telechargerPdf, useRapportsMensuels } from '@/hooks/useEntreprises'

const libelleMois = (cle) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${cle}-15T12:00:00`))

/** Rapports mensuels (formules Pro et Premium) : activité, délais, notes, interventions, factures. */
export default function RapportsEntreprisePage() {
  const { data, isLoading } = useRapportsMensuels()

  return (
    <CadreEntreprise titre="Rapports mensuels" sousTitre="Le bilan de chaque mois : interventions, délais tenus, notes, visites préventives et factures.">
      {isLoading || !data ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-5">
          {!data.eligible && (
            <section className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-white border border-line p-5 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Lock className="w-6 h-6" /></span>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-ink">Inclus dans les formules Pro et Premium</p>
                <p className="text-muted">Votre formule actuelle : {data.formule_label}. Passez à Pro ou Premium pour recevoir un rapport chaque mois.</p>
              </div>
              <Link to="/espace-entreprise/abonnement" className={BOUTON_PRINCIPAL}>Voir les formules</Link>
            </section>
          )}
          <Panneau titre={`Rapports disponibles · ${data.mois.length}`}>
            {data.mois.length ? (
              <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {data.mois.map((cle) => (
                  <li key={cle} className="flex items-center gap-3 rounded-xl border border-line p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileBarChart className="w-5 h-5" /></span>
                    <span className="flex-1 font-semibold text-ink capitalize">{libelleMois(cle)}</span>
                    <button
                      type="button" onClick={() => telechargerPdf(entrepriseService.rapportMensuelPdf(cle), `rapport-bricolibe-${cle}.pdf`)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"
                    ><FileDown className="w-4 h-4" /> PDF</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted bg-canvas-soft rounded-xl p-6 text-center">
                Les rapports apparaissent ici pour chaque mois couvert par une formule Pro ou Premium.
              </p>
            )}
          </Panneau>
        </div>
      )}
    </CadreEntreprise>
  )
}
