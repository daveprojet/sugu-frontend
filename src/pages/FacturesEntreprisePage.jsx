import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronDown, FileDown, Receipt, Wallet } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import { BOUTON_PRINCIPAL, CarteChiffre, Panneau } from '@/components/espace/EspaceLayout'
import { entrepriseService } from '@/services/api'
import { fcfa, telechargerPdf, useFacturesEntreprise, usePayerFacture } from '@/hooks/useEntreprises'

const date = (valeur) => (valeur ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${String(valeur).slice(0, 10)}T12:00:00`)) : '—')
const FILTRES = [['A_PAYER', 'À payer'], ['PAYEE', 'Payées'], ['', 'Toutes']]
const TYPES = { ABONNEMENT: 'bg-blue-50 text-blue-700', PRESTATION: 'bg-primary-50 text-primary-700', RELEVE: 'bg-sky-50 text-sky-700' }

function Statut({ facture }) {
  if (facture.statut === 'PAYEE') return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Payée</span>
  if (facture.en_retard) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">En retard</span>
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">À payer</span>
}

function Detail({ facture }) {
  return (
    <div className="bg-canvas-soft rounded-xl p-3 mt-2">
      <table className="w-full text-sm">
        <tbody>
          {facture.lignes.map((ligne, index) => (
            <tr key={index} className="border-b border-line last:border-0 align-top">
              <td className="py-1.5 pr-3 text-ink">{ligne.libelle}</td>
              <td className={`py-1.5 text-right whitespace-nowrap ${ligne.montant < 0 ? 'text-emerald-700' : 'text-ink'}`}>
                {ligne.montant < 0 ? `− ${fcfa(-ligne.montant)}` : fcfa(ligne.montant)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {facture.statut === 'PAYEE' && (
        <p className="text-xs text-muted mt-2">Payée le {date(facture.payee_at)} · {facture.mode_paiement}{facture.reference_paiement && facture.mode_paiement !== 'Paiement en ligne' ? ` (${facture.reference_paiement})` : ''}</p>
      )}
    </div>
  )
}

/** Factures et relevés émis par Bricolibe : téléchargement et paiement en ligne. */
export default function FacturesEntreprisePage() {
  const { data, isLoading } = useFacturesEntreprise()
  const payer = usePayerFacture()
  const [filtre, setFiltre] = useState('A_PAYER')
  const [ouverte, setOuverte] = useState(null)
  const factures = useMemo(() => (data?.factures || []).filter((f) => !filtre || f.statut === filtre), [data, filtre])

  return (
    <CadreEntreprise
      titre="Factures"
      sousTitre="Bricolibe émet toutes les factures : vous ne payez jamais l’ouvrier directement."
    >
      {isLoading || !data ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-5">
          {data.bloquee && (
            <p className="flex items-start gap-2 text-sm bg-red-50 text-red-800 border border-red-200 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Une facture relancée reste impayée depuis plus de 15 jours : les nouvelles interventions sont suspendues jusqu’au règlement.
            </p>
          )}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <CarteChiffre label="À payer" valeur={fcfa(data.total_a_payer)} Icon={Wallet} ton="orange" aide={`${data.nb_a_payer} facture(s)`} />
            <CarteChiffre
              label="En retard" valeur={data.nb_en_retard} Icon={AlertTriangle} ton={data.nb_en_retard ? 'rouge' : 'vert'}
              aide={data.nb_en_retard ? 'Échéance dépassée' : 'Aucun retard'}
            />
            <CarteChiffre label="Factures" valeur={data.factures.length} Icon={Receipt} ton="principal" aide="Abonnement, prestations, relevés" />
            <CarteChiffre label="Moyens de paiement" valeur="Wave · OM" Icon={Wallet} ton="bleu" aide="En ligne, mobile money ou chèque" />
          </div>

          <Panneau
            titre="Vos factures"
            action={(
              <div className="inline-flex rounded-xl border border-line bg-white p-1" role="tablist">
                {FILTRES.map(([cle, libelle]) => (
                  <button
                    key={cle} type="button" role="tab" aria-selected={filtre === cle} onClick={() => setFiltre(cle)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filtre === cle ? 'bg-blue-700 text-white' : 'text-muted hover:text-ink'}`}
                  >{libelle}</button>
                ))}
              </div>
            )}
          >
            {factures.length ? (
              <ul className="divide-y divide-line">
                {factures.map((facture) => (
                  <li key={facture.uid} className="py-3">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                      <button
                        type="button" onClick={() => setOuverte(ouverte === facture.uid ? null : facture.uid)}
                        className="flex-1 min-w-0 flex items-center gap-3 text-left" aria-expanded={ouverte === facture.uid}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Receipt className="w-5 h-5" /></span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink">{facture.numero}</span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPES[facture.type] || ''}`}>{facture.type_libelle}</span>
                            {facture.site && <span className="text-xs text-muted">{facture.site}</span>}
                          </span>
                          <span className="block text-xs text-muted">
                            Émise le {date(facture.date_emission)} · à régler avant le {date(facture.echeance)}
                            {facture.demande_uid && <> · <Link to={`/espace-entreprise/demandes/${facture.demande_uid}`} className="text-blue-700 underline" onClick={(e) => e.stopPropagation()}>voir l’intervention</Link></>}
                          </span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform ${ouverte === facture.uid ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <span className="font-display text-lg font-bold text-ink whitespace-nowrap">{fcfa(facture.montant)}</span>
                        <Statut facture={facture} />
                        <button
                          type="button" onClick={() => telechargerPdf(entrepriseService.facturePdf(facture.uid), `${facture.numero}.pdf`)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"
                        ><FileDown className="w-4 h-4" /> PDF</button>
                        {facture.statut === 'A_PAYER' && (
                          <button type="button" disabled={payer.isLoading} onClick={() => payer.mutate(facture.uid)} className={`${BOUTON_PRINCIPAL} !py-2`}>
                            Payer en ligne
                          </button>
                        )}
                      </div>
                    </div>
                    {ouverte === facture.uid && <Detail facture={facture} />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted bg-canvas-soft rounded-xl p-6 text-center">
                {filtre === 'A_PAYER' ? 'Aucune facture à payer.' : 'Aucune facture pour l’instant.'}
              </p>
            )}
            <p className="text-xs text-muted mt-4">
              Abonnement : à régler dans les 5 jours · intervention à la prestation : sous 7 jours · relevé mensuel des abonnés : sous 15 jours.
              Vous pouvez aussi régler par chèque ou mobile money auprès de Bricolibe.
            </p>
          </Panneau>
        </div>
      )}
    </CadreEntreprise>
  )
}
