import { toast } from 'react-toastify'
import { ACCEPT_PHOTO, ACCEPT_VIDEO, erreurFichier, useMediasArtisan } from '@/hooks/useMediasArtisan'

function ZoneFichier({ className, enCours, inactif, accept, multiple, onChange, children }) {
  return (
    <label className={`${className} ${enCours || inactif ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`} aria-busy={enCours}>
      {typeof children === 'function' ? children({ enCours }) : children}
      <input type="file" accept={accept} multiple={multiple} onChange={onChange} className="sr-only" disabled={enCours || inactif} />
    </label>
  )
}

/**
 * Zone cliquable qui ouvre la galerie pour ajouter des photos (type="photo", plusieurs à la fois)
 * ou une vidéo (type="video") à la galerie publique de l'artisan connecté.
 * children peut être une fonction ({ enCours }) => …
 */
export function BoutonAjoutMedia({ type, className = '', children }) {
  const { uid, ajout } = useMediasArtisan()
  const photo = type === 'photo'

  const choisir = (e) => {
    const fichiers = Array.from(e.target.files || [])
    e.target.value = ''
    if (!fichiers.length) return
    const erreur = fichiers.map((f) => erreurFichier(f, type)).find(Boolean)
    if (erreur) { toast.error(erreur); return }
    ajout.mutate(fichiers)
  }

  return (
    <ZoneFichier
      className={className} enCours={ajout.isLoading} inactif={!uid}
      accept={photo ? ACCEPT_PHOTO : ACCEPT_VIDEO} multiple={photo} onChange={choisir}
    >
      {children}
    </ZoneFichier>
  )
}
