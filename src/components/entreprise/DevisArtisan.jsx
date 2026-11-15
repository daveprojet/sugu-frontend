import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { fcfa, STATUTS_DEVIS } from '@/hooks/useEntreprises'

const TYPES = [
  ['MAIN_OEUVRE', 'Main-d’œuvre'],
  ['MATERIAUX', 'Matériaux'],
  ['DEPLACEMENT', 'Déplacement'],
]

const vide = () => ({ type_ligne: 'MAIN_OEUVRE', libelle: '', quantite: '1', prix_unitaire: '' })
const montant = (l) => Math.round(Number(l.quantite || 0) * Number(l.prix_unitaire || 0))

function Formulaire({ base, metier, proposer, onFermer }) {
  // On repart de sa partie du devis actuel (les lignes des autres métiers sont conservées côté serveur).
  const [lignes, setLignes] = useState(() => (base?.lignes.length
    ? base.lignes.map((l) => ({
      type_ligne: l.type_ligne, libelle: l.libelle, quantite: String(Number(l.quantite)), prix_unitaire: String(l.prix_unitaire),
    }))
    : [vide()]))
  const [note, setNote] = useState('')
  const modifier = (i, champ, valeur) => setLignes(lignes.map((l, j) => (j === i ? { ...l, [champ]: valeur } : l)))
  const complet = lignes.every((l) => l.libelle.trim() && Number(l.quantite) > 0 && l.prix_unitaire !== '')
  const envoyer = () => proposer.mutate({
    lignes: lignes.map((l) => ({ ...l, libelle: l.libelle.trim(), prix_unitaire: Number(l.prix_unitaire) })),
    note,
  }, { onSuccess: onFermer })

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">Chiffrez votre partie ({metier}). L’inspecteur Bricolibe valide le devis avant de l’envoyer à l’entreprise.</p>
      <ul className="grid gap-3">
        {lignes.map((ligne, i) => (
          <li key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_auto_auto_auto] gap-2 border border-line rounded-xl p-3">
            <input
              value={ligne.libelle} onChange={(e) => modifier(i, 'libelle', e.target.value)} placeholder="Désignation (ex. remplacement du robinet)"
              className="col-span-2 sm:col-span-4 border border-line rounded-lg px-3 py-2 text-sm"
            />
            <select value={ligne.type_ligne} onChange={(e) => modifier(i, 'type_ligne', e.target.value)} className="border border-line rounded-lg px-2 py-2 text-sm" aria-label="Type">
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs text-muted">Qté
              <input type="number" inputMode="decimal" min="0.01" step="0.01" value={ligne.quantite} onChange={(e) => modifier(i, 'quantite', e.target.value)} className="w-16 border border-line rounded-lg px-2 py-2 text-sm text-ink" />
            </label>
            <label className="flex items-center gap-1 text-xs text-muted">Prix
              <input type="number" inputMode="numeric" min="0" step="1" value={ligne.prix_unitaire} onChange={(e) => modifier(i, 'prix_unitaire', e.target.value)} placeholder="FCFA" className="w-28 border border-line rounded-lg px-2 py-2 text-sm text-ink" />
            </label>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span className="font-medium whitespace-nowrap">{fcfa(montant(ligne))}</span>
              {lignes.length > 1 && (
                <button type="button" onClick={() => setLignes(lignes.filter((_, j) => j !== i))} aria-label="Retirer la ligne" className="p-1.5 text-muted hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setLignes([...lignes, vide()])} className="justify-self-start inline-flex items-center gap-1.5 text-sm text-primary-600 font-medium">
        <Plus className="w-4 h-4" /> Ajouter une ligne
      </button>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Remarque pour l’inspecteur (facultatif)" className="border border-line rounded-lg px-3 py-2 text-sm" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink">Total : {fcfa(lignes.reduce((s, l) => s + montant(l), 0))}</span>
        <button type="button" onClick={onFermer} className="ml-auto px-4 py-2 rounded-lg border border-line text-sm">Annuler</button>
        <button
          type="button" onClick={envoyer} disabled={!complet || proposer.isLoading}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold disabled:opacity-60"
        >{proposer.isLoading ? 'Envoi…' : 'Envoyer le devis'}</button>
      </div>
    </div>
  )
}

/** Devis de la mission, réduit au corps de métier de l'artisan. */
export default function DevisArtisan({ mission, proposer }) {
  const [edition, setEdition] = useState(false)
  const devis = mission.devis
  const peutProposer = ['ACCEPTEE', 'SUR_SITE'].includes(mission.statut)
  const statut = devis ? STATUTS_DEVIS[devis.statut] || { label: devis.statut, classe: '' } : null

  return (
    <section className="bg-white border border-line rounded-2xl p-5 grid gap-3 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-ink">Devis{devis ? <span className="text-muted font-normal text-sm"> · version {devis.version}</span> : ''}</h2>
        {statut && <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.classe}`}>{statut.label}</span>}
      </div>
      {!devis && !edition && (
        <p className="text-sm text-muted">
          Aucun devis pour l’instant. Après votre visite de diagnostic, proposez votre devis : l’intervention commence
          quand l’inspecteur l’a validé et que l’entreprise l’a accepté.
        </p>
      )}
      {devis && !edition && (
        <>
          {devis.lignes.length ? (
            <ul className="grid gap-1 text-sm">
              {devis.lignes.map((l, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-line py-1">
                  <span>{l.libelle} <span className="text-xs text-muted">· {l.type_libelle} · {Number(l.quantite)} × {fcfa(l.prix_unitaire)}</span></span>
                  <span className="whitespace-nowrap">{fcfa(l.montant)}</span>
                </li>
              ))}
              <li className="flex justify-between font-semibold pt-1"><span>Votre partie</span><span>{fcfa(devis.totaux.total)}</span></li>
            </ul>
          ) : <p className="text-sm text-muted">L’inspecteur n’a pas encore chiffré votre métier.</p>}
          {devis.commentaire_inspecteur && (
            <p className={`text-sm rounded-xl p-3 ${devis.statut === 'REFUSE' ? 'bg-red-50 text-red-800' : 'bg-canvas-soft'}`}>
              <b>Inspecteur :</b> {devis.commentaire_inspecteur}
            </p>
          )}
          {devis.statut === 'REJETE' && devis.motif_rejet && (
            <p className="text-sm bg-red-50 text-red-800 rounded-xl p-3"><b>Entreprise :</b> {devis.motif_rejet}</p>
          )}
        </>
      )}
      {edition && <Formulaire base={devis} metier={mission.metier} proposer={proposer} onFermer={() => setEdition(false)} />}
      {/* Toujours possible : sur une demande à plusieurs métiers, chaque artisan ajoute sa partie. */}
      {peutProposer && !edition && (
        <button type="button" onClick={() => setEdition(true)} className="justify-self-start px-4 py-2 rounded-lg border border-primary-500 text-primary-600 text-sm font-semibold">
          {devis?.lignes.length ? 'Modifier ma partie (nouvelle version)' : 'Proposer mon devis'}
        </button>
      )}
    </section>
  )
}
