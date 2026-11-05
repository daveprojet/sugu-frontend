import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IdCard } from 'lucide-react'

const PAGE_IDENTITE = '/mon-profil/identite'

// Affiché quand un artisan dont la pièce n'est pas validée clique sur une offre
// (badge, Boost) : le message dépend de l'état de sa pièce.
function contenu(identite, objet) {
  if (identite?.statut === 'EN_ATTENTE') {
    return {
      titre: 'Pièce d’identité en cours de vérification',
      message: `Notre équipe vérifie votre pièce d’identité. Vous pourrez activer ${objet} dès qu’elle sera validée : vous serez prévenu par notification.`,
      action: null,
    }
  }
  if (identite?.statut === 'REJETEE') {
    return {
      titre: 'Votre pièce d’identité a été refusée',
      message: `Pour activer ${objet}, votre pièce d’identité doit être validée par notre équipe. Envoyez une nouvelle pièce : vous pourrez souscrire dès sa validation.`,
      action: 'Envoyer une nouvelle pièce',
    }
  }
  return {
    titre: 'Pièce d’identité requise',
    message: `${objet.charAt(0).toUpperCase()}${objet.slice(1)} est réservé aux artisans dont la pièce d’identité a été validée par notre équipe. Envoyez la vôtre : vous pourrez souscrire dès sa validation.`,
    action: 'Envoyer ma pièce d’identité',
  }
}

export default function IdentiteRequiseModal({ identite, objet, onClose }) {
  const navigate = useNavigate()
  const { titre, message, action } = contenu(identite, objet)

  useEffect(() => {
    const fermerSurEchap = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', fermerSurEchap)
    return () => document.removeEventListener('keydown', fermerSurEchap)
  }, [onClose])

  const fournir = () => {
    onClose()
    navigate(PAGE_IDENTITE)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="identite-requise-titre"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <IdCard className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="identite-requise-titre" className="font-display text-xl font-bold text-gray-900">{titre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>
        {identite?.statut === 'REJETEE' && identite.motif_rejet && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Motif : {identite.motif_rejet}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus={!action}
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {action ? 'Plus tard' : 'Compris'}
          </button>
          {action && (
            <button
              type="button"
              autoFocus
              onClick={fournir}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
