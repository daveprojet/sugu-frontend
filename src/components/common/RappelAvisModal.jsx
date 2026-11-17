import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquare, Send, Star, X } from 'lucide-react'
import { useCreateAvis } from '@/hooks/useAvis'
import { useDemandes } from '@/hooks/useDemandes'
import { nePlusDemander, noterProposition, prestationAEvaluer } from '@/utils/rappelAvis'

// Pages où le modal gênerait (connexion, paiement en cours…).
const PAGES_EXCLUES = ['/connexion', '/inscription', '/payment', '/mot-de-passe', '/reset-mot-de-passe']
const LIBELLES = { 1: 'Très décevant', 2: 'Décevant', 3: 'Correct', 4: 'Bien', 5: 'Excellent' }

/** Propose au client de noter une prestation terminée, sans insister (voir utils/rappelAvis). */
export default function RappelAvisModal() {
  const { pathname } = useLocation()
  const { data: demandes } = useDemandes()
  const creerAvis = useCreateAvis()
  const [demande, setDemande] = useState(null)
  const [note, setNote] = useState(0)
  const [survol, setSurvol] = useState(0)
  const [commentaire, setCommentaire] = useState('')

  const pageExclue = PAGES_EXCLUES.some((prefixe) => pathname.startsWith(prefixe))

  useEffect(() => {
    if (demande || pageExclue || !demandes?.length) return
    const aEvaluer = prestationAEvaluer(demandes)
    if (!aEvaluer) return
    // Délai : laisser la page s'afficher et le message « Bienvenue » de la connexion disparaître.
    const minuterie = setTimeout(() => {
      noterProposition(aEvaluer.id)
      setDemande(aEvaluer)
    }, 4000)
    return () => clearTimeout(minuterie)
  }, [demandes, demande, pageExclue])

  useEffect(() => {
    if (!demande) return undefined
    const fermerSurEchap = (event) => { if (event.key === 'Escape') setDemande(null) }
    document.addEventListener('keydown', fermerSurEchap)
    return () => document.removeEventListener('keydown', fermerSurEchap)
  }, [demande])

  if (!demande) return null
  const fermer = () => setDemande(null)
  const metier = demande.categorie_nom || demande.service_element_nom
  const affichee = survol || note

  const envoyer = async (event) => {
    event.preventDefault()
    if (!note) return
    try {
      await creerAvis.mutateAsync({ artisan: demande.artisan, demande: demande.id, note, commentaire: commentaire.trim() })
      fermer()
    } catch {
      // Message d'erreur déjà affiché par useCreateAvis.
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={fermer}>
      <form
        onSubmit={envoyer}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rappel-avis-titre"
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6"
      >
        <button type="button" onClick={fermer} aria-label="Fermer" className="absolute right-3 top-3 p-2 rounded-full text-muted hover:bg-canvas hover:text-ink">
          <X className="w-5 h-5" />
        </button>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="rappel-avis-titre" className="font-display text-xl font-bold text-ink pr-8">
          Comment s’est passée votre prestation ?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Avec <b className="text-ink">{demande.artisan_nom}</b>{metier ? ` · ${metier}` : ''}. Votre avis aide les autres clients à choisir leur artisan.
        </p>

        <div className="mt-5 flex flex-col items-center gap-1" onMouseLeave={() => setSurvol(0)}>
          <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5">
            {[1, 2, 3, 4, 5].map((valeur) => (
              <button
                key={valeur}
                type="button"
                role="radio"
                aria-checked={note === valeur}
                aria-label={`${valeur} sur 5`}
                onClick={() => setNote(valeur)}
                onMouseEnter={() => setSurvol(valeur)}
                className="p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Star className={`w-9 h-9 transition-colors ${valeur <= affichee ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <span className="h-5 text-sm font-semibold text-ink">{affichee ? LIBELLES[affichee] : 'Touchez une étoile'}</span>
        </div>

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="rappel-avis-commentaire">Un commentaire ? <span className="text-muted font-normal">(facultatif)</span></label>
        <textarea
          id="rappel-avis-commentaire"
          value={commentaire}
          onChange={(event) => setCommentaire(event.target.value)}
          rows={3}
          placeholder={`Ponctualité, qualité du travail, propreté…`}
          className="mt-1.5 w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" onClick={fermer} className="px-4 py-3 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-canvas-soft">
            Plus tard
          </button>
          <button
            type="submit"
            disabled={!note || creerAvis.isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {creerAvis.isLoading ? 'Envoi…' : <>Envoyer mon avis <Send className="w-4 h-4" /></>}
          </button>
        </div>
        <button
          type="button"
          onClick={() => { nePlusDemander(demande.id); fermer() }}
          className="mt-3 block w-full text-center text-xs text-muted underline underline-offset-2 hover:text-ink"
        >
          Ne plus me demander pour cette prestation
        </button>
      </form>
    </div>
  )
}
