import { FileDown } from 'lucide-react'
import { entrepriseService } from '@/services/api'
import { dateHeure, fcfa, STATUTS_DEVIS, telechargerPdf } from '@/hooks/useEntreprises'

function Lignes({ devis }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="py-1.5 pr-3 font-medium">Désignation</th>
            <th className="py-1.5 pr-3 font-medium hidden sm:table-cell">Qté</th>
            <th className="py-1.5 pr-3 font-medium text-right hidden sm:table-cell">Prix unitaire</th>
            <th className="py-1.5 font-medium text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {devis.lignes.map((ligne, index) => (
            <tr key={index} className="border-t border-line align-top">
              <td className="py-1.5 pr-3">
                {ligne.libelle}
                <span className="block text-xs text-muted">{ligne.type_libelle}{ligne.metier ? ` · ${ligne.metier}` : ''}</span>
                {/* Au téléphone, quantité et prix unitaire passent sous la désignation. */}
                <span className="block text-xs text-muted sm:hidden">{Number(ligne.quantite)} × {fcfa(ligne.prix_unitaire)}</span>
              </td>
              <td className="py-1.5 pr-3 hidden sm:table-cell">{Number(ligne.quantite)}</td>
              <td className="py-1.5 pr-3 text-right whitespace-nowrap hidden sm:table-cell">{fcfa(ligne.prix_unitaire)}</td>
              <td className="py-1.5 text-right whitespace-nowrap">{fcfa(ligne.montant)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Totaux({ totaux }) {
  return (
    <dl className="grid gap-1 text-sm sm:ml-auto sm:min-w-[260px]">
      <div className="flex justify-between gap-4 text-muted"><dt>Main-d’œuvre</dt><dd>{fcfa(totaux.main_oeuvre)}</dd></div>
      <div className="flex justify-between gap-4 text-muted"><dt>Matériaux</dt><dd>{fcfa(totaux.materiaux)}</dd></div>
      <div className="flex justify-between gap-4 text-muted"><dt>Déplacement</dt><dd>{fcfa(totaux.deplacement)}</dd></div>
      <div className="flex justify-between gap-4 font-semibold text-ink border-t border-line pt-1"><dt>Total</dt><dd>{fcfa(totaux.total)}</dd></div>
    </dl>
  )
}

function BoutonPdf({ demandeUid, devis }) {
  return (
    <button
      type="button"
      onClick={() => telechargerPdf(entrepriseService.devisPdf(demandeUid, devis.uid), `devis-bricolibe-v${devis.version}.pdf`)}
      className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium"
    >
      <FileDown className="w-4 h-4" /> Télécharger le PDF
    </button>
  )
}

/** Devis validés par l'inspecteur : l'entreprise accepte (l'intervention peut commencer) ou refuse. */
export default function DevisEntreprise({ demande, repondreDevis }) {
  const versions = demande.devis || []
  if (!versions.length) {
    if (['ANNULEE', 'CLOTUREE'].includes(demande.statut)) return null
    return (
      <section className="bg-white border border-line rounded-2xl p-5 mb-4">
        <h2 className="font-semibold text-ink mb-1">Devis</h2>
        <p className="text-sm text-muted">
          L’artisan peut passer faire un diagnostic. Le devis vous sera envoyé ici une fois validé par l’inspecteur Bricolibe :
          l’intervention commence après votre accord.
        </p>
      </section>
    )
  }
  const [courant, ...anciennes] = versions
  const statut = STATUTS_DEVIS[courant.statut] || { label: courant.statut, classe: '' }
  const refuser = () => {
    const motif = window.prompt('Qu’est-ce qui ne vous convient pas dans ce devis ?')
    if (motif?.trim()) repondreDevis.mutate({ devisUid: courant.uid, action: 'refuser', motif })
  }
  const accepter = () => {
    if (window.confirm(`Accepter ce devis de ${fcfa(courant.totaux.total)} ? L’intervention pourra commencer.`)) {
      repondreDevis.mutate({ devisUid: courant.uid, action: 'accepter' })
    }
  }

  return (
    <section className="bg-white border border-line rounded-2xl p-5 mb-4 grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-ink">Devis <span className="text-muted font-normal text-sm">· version {courant.version}</span></h2>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.classe}`}>{statut.label}</span>
      </div>
      <Lignes devis={courant} />
      <Totaux totaux={courant.totaux} />
      {courant.commentaire_inspecteur && (
        <p className="text-sm bg-canvas-soft rounded-xl p-3"><b>Mot de l’inspecteur :</b> {courant.commentaire_inspecteur}</p>
      )}
      {courant.motif_rejet && <p className="text-sm text-red-700">Votre motif de refus : {courant.motif_rejet}</p>}
      <p className="text-xs text-muted">
        Validé {dateHeure(courant.valide_at)}{courant.valide_par ? ` par ${courant.valide_par}` : ''}
        {courant.reponse_at ? ` · votre réponse ${dateHeure(courant.reponse_at)}` : ''}.
        Le règlement se fait directement auprès de Bricolibe, pas sur la plateforme.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <BoutonPdf demandeUid={demande.uid} devis={courant} />
        {courant.statut === 'VALIDE' && (
          <>
            <button
              type="button" onClick={refuser} disabled={repondreDevis.isLoading}
              className="ml-auto px-4 py-2 rounded-lg border border-line text-ink text-sm font-medium"
            >Refuser</button>
            <button
              type="button" onClick={accepter} disabled={repondreDevis.isLoading}
              className="px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-semibold disabled:opacity-60"
            >Accepter le devis</button>
          </>
        )}
      </div>
      {anciennes.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted">Versions précédentes ({anciennes.length})</summary>
          <ul className="grid gap-3 mt-3">
            {anciennes.map((devis) => (
              <li key={devis.uid} className="border border-line rounded-xl p-3 grid gap-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <span>Version {devis.version} · {fcfa(devis.totaux.total)}</span>
                  <span className="text-xs text-muted">{(STATUTS_DEVIS[devis.statut] || {}).label}</span>
                </div>
                <Lignes devis={devis} />
                <BoutonPdf demandeUid={demande.uid} devis={devis} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
