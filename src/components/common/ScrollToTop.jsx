import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Remet l'écran en haut à chaque nouvelle page (clic sur un lien, redirection).
 *
 * Sans lui, la fenêtre gardait la position de la page précédente : une fiche
 * artisan déjà en cache s'affichait d'un coup en entier et restait au niveau où
 * l'on avait défilé dans la liste, comme si la page avait défilé toute seule.
 *
 * Le bouton « retour » (POP) garde le comportement du navigateur, qui ramène
 * la liste là où on l'avait laissée. Seul le chemin compte : changer de page de
 * résultats ou de filtre (?page=, ?ville=) ne remonte pas l'écran.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const cheminPrecedent = useRef(pathname)

  // Avant l'affichage (layout effect) : la nouvelle page ne se montre jamais
  // à l'ancienne position. Déclenché seulement quand le chemin change.
  useLayoutEffect(() => {
    if (cheminPrecedent.current === pathname) return
    cheminPrecedent.current = pathname
    if (navigationType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
