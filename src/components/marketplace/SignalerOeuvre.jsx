import { useState } from 'react'
import { toast } from 'react-toastify'
import { Flag } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import Modale from '@/components/common/Modale'

const MOTIFS = [
  ['CONTREFACON', 'Contrefaçon, ou œuvre qui n’est pas de l’artiste'],
  ['ARNAQUE', 'Arnaque ou comportement suspect'],
  ['INAPPROPRIE', 'Contenu inapproprié'],
  ['SUR_MESURE', 'Annonce de commande sur mesure'],
  ['PRIX', 'Prix trompeur'],
  ['AUTRE', 'Autre'],
]

/** Lien « Signaler cette œuvre » et sa fenêtre (connecté ou non). */
export default function SignalerOeuvre({ segment }) {
  const [ouvert, setOuvert] = useState(false)
  const [motif, setMotif] = useState('')
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const envoyer = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    try {
      const { data } = await marketplaceService.signaler(segment, { motif, message })
      toast.success(data.detail)
      setOuvert(false); setMotif(''); setMessage('')
    } catch (err) {
      toast.error(extractApiError(err, 'Signalement impossible'))
    } finally {
      setEnvoi(false)
    }
  }
  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted underline underline-offset-2 hover:text-red-600">
        <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Signaler cette œuvre
      </button>
      {ouvert && (
        <Modale titre="Signaler cette œuvre" onClose={() => setOuvert(false)}>
          <form onSubmit={envoyer} className="flex flex-col gap-3">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm text-muted">Quel est le problème ?</legend>
              {MOTIFS.map(([v, l]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${motif === v ? 'border-indigo-500 bg-indigo-50' : 'border-line'}`}>
                  <input type="radio" name="motif" value={v} checked={motif === v} onChange={() => setMotif(v)} />{l}
                </label>
              ))}
            </fieldset>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000}
              placeholder={motif === 'AUTRE' ? 'Décrivez le problème (obligatoire)' : 'Précisions (facultatif)'}
              className="w-full resize-none rounded-lg border border-line bg-canvas-soft px-3 py-2.5 text-sm" />
            <button type="submit" disabled={!motif || envoi || (motif === 'AUTRE' && !message.trim())}
              className="rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
              {envoi ? 'Envoi…' : 'Envoyer le signalement'}
            </button>
          </form>
        </Modale>
      )}
    </>
  )
}
