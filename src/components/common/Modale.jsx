import { useEffect } from 'react'
import { X } from 'lucide-react'

/** Fenêtre modale simple : fond assombri, fermeture par la croix, Échap ou clic à l'extérieur. */
export default function Modale({ titre, onClose, children, largeur = 'max-w-md' }) {
  useEffect(() => {
    const echap = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', echap)
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', echap); document.body.style.overflow = avant }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={titre} className={`w-full ${largeur} max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">{titre}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 text-muted hover:bg-canvas-soft hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
