import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, X } from 'lucide-react'
import { useCreateSignalement } from '@/hooks/useSignalements'
import { MOTIFS_SIGNALEMENT } from '@/utils/constants'

/**
 * Signaler l'autre partie d'une demande. L'identité de l'auteur n'est jamais communiquée
 * à la personne signalée.
 */
export default function SignalementModal({ demandeId, cibleNom, onClose }) {
  const createSignalement = useCreateSignalement()
  const [motif, setMotif] = useState(MOTIFS_SIGNALEMENT[0].value)
  const [description, setDescription] = useState('')

  const envoyer = async (e) => {
    e.preventDefault()
    try {
      await createSignalement.mutateAsync({ motif, description, demande_id: demandeId })
      onClose()
    } catch {
      // Message affiché par la mutation : le formulaire reste ouvert pour réessayer.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl border border-line w-full max-w-md p-6 text-left"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Flag className="w-6 h-6 text-red-500" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-full hover:bg-canvas text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-ink mb-1">Signaler {cibleNom}</h3>
        <p className="text-sm text-muted mb-5">
          Votre signalement reste confidentiel et sera étudié par notre équipe, qui pourra vous contacter
          pour clarifier la situation.
        </p>

        <form onSubmit={envoyer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Motif</label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150"
            >
              {MOTIFS_SIGNALEMENT.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Que s'est-il passé ?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Décrivez les faits : date, lieu, ce qui était convenu…"
              className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink text-sm placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 resize-none"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-line bg-white text-ink text-sm font-semibold px-4 py-3 rounded-lg hover:bg-canvas-soft transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createSignalement.isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-3 rounded-lg transition-colors duration-150 disabled:opacity-70"
            >
              {createSignalement.isLoading ? 'Envoi...' : 'Envoyer le signalement'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
