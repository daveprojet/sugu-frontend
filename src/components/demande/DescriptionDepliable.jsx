import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Texte limité à 3 lignes, avec « Voir plus » à droite au bout de la 3e ligne
 * — seulement si le texte dépasse réellement (mesuré à l'écran, la largeur
 * variant d'un téléphone à l'autre). « Voir moins » le replie.
 *
 * fond : couleur du fond de la carte, pour le fondu sous le bouton.
 */
export default function DescriptionDepliable({ texte, className = '', fond = 'from-white' }) {
  const ref = useRef(null)
  const [deplie, setDeplie] = useState(false)
  const [depasse, setDepasse] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || deplie) return undefined
    const mesurer = () => setDepasse(el.scrollHeight > el.clientHeight + 1)
    mesurer()
    // La largeur change (rotation de l'écran, chargement de la police) : on remesure.
    const observateur = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesurer) : null
    observateur?.observe(el)
    return () => observateur?.disconnect()
  }, [texte, deplie])

  return (
    <div className={`relative ${className}`}>
      <p ref={ref} className={`text-sm text-muted leading-relaxed whitespace-pre-line ${deplie ? '' : 'line-clamp-3'}`}>
        {texte}
        {deplie && (
          <button
            type="button"
            onClick={() => setDeplie(false)}
            className="ml-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Voir moins
          </button>
        )}
      </p>
      {depasse && !deplie && (
        <button
          type="button"
          onClick={() => setDeplie(true)}
          aria-label="Voir toute la description"
          className={`absolute bottom-0 right-0 pl-10 bg-gradient-to-l ${fond} from-70% to-transparent text-sm leading-relaxed`}
        >
          <span className="text-muted">… </span>
          <span className="font-semibold text-indigo-700 hover:text-indigo-800">Voir plus</span>
        </button>
      )}
    </div>
  )
}
