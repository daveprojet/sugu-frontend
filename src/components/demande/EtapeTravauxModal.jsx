import { motion } from 'framer-motion'
import { Camera, X } from 'lucide-react'
import PhotosDemande from '@/components/demande/PhotosDemande'

const ETAPES = {
  AVANT: {
    titre: 'Démarrer les travaux',
    texte: "Avant de commencer, prenez au moins une photo de l'état des lieux (la panne telle que vous la trouvez sur place).",
    action: 'Démarrer les travaux',
  },
  APRES: {
    titre: 'Terminer la mission',
    texte: 'Avant de terminer, prenez au moins une photo du travail réalisé.',
    action: 'Marquer terminé',
  },
}

/**
 * Photos obligatoires avant de changer de statut : « avant » pour passer En cours,
 * « après » pour passer Terminée (le serveur l'exige aussi).
 *
 * demande : données à jour (la fenêtre suit l'ajout des photos).
 */
export default function EtapeTravauxModal({ demande, etape, onConfirmer, onClose, enCours }) {
  const config = ETAPES[etape]
  const nbPhotos = (demande.photos || []).filter((p) => p.type_photo === etape).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl border border-line w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <Camera className="w-6 h-6 text-indigo-600" />
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

        <h3 className="text-lg font-bold text-ink mb-1">{config.titre}</h3>
        <p className="text-sm text-muted leading-relaxed mb-5">{config.texte}</p>

        <PhotosDemande demande={demande} role="artisan" types={[etape]} />

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-line bg-white text-ink text-sm font-semibold px-4 py-3 rounded-lg hover:bg-canvas-soft transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirmer}
            disabled={nbPhotos === 0 || enCours}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-3 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enCours ? 'Enregistrement…' : config.action}
          </button>
        </div>
        {nbPhotos === 0 && (
          <p className="text-[11px] text-muted text-center mt-2">Ajoutez au moins une photo pour continuer.</p>
        )}
      </motion.div>
    </div>
  )
}
