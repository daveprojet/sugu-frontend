import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/** Vignettes ; un clic ouvre la photo en grand. `onRetirer(photo)` facultatif. */
export default function Galerie({ photos = [], vide = null, onRetirer }) {
  const [ouverte, setOuverte] = useState(null)

  useEffect(() => {
    if (!ouverte) return undefined
    const fermer = (e) => { if (e.key === 'Escape') setOuverte(null) }
    document.addEventListener('keydown', fermer)
    return () => document.removeEventListener('keydown', fermer)
  }, [ouverte])

  if (!photos.length) return vide ? <p className="text-sm text-muted">{vide}</p> : null
  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {photos.map((photo) => (
          <div key={photo.uid} className="relative aspect-square">
            <button type="button" onClick={() => setOuverte(photo.image)} className="w-full h-full rounded-lg overflow-hidden bg-canvas-soft">
              <img src={photo.image} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
            {onRetirer && (
              <button
                type="button"
                onClick={() => onRetirer(photo)}
                className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow border border-line"
                aria-label="Retirer la photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {ouverte && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setOuverte(null)} role="dialog" aria-modal="true">
          <button type="button" className="absolute top-4 right-4 bg-white rounded-full p-1.5" aria-label="Fermer"><X className="w-5 h-5" /></button>
          <img src={ouverte} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </>
  )
}
