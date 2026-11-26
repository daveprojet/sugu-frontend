import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Share2, Link2, MessageCircle } from 'lucide-react'
import { lienArtisan } from '@/utils/liensArtisan'

/**
 * Bouton « Partager le profil » d'un artisan.
 * Sur mobile : feuille de partage du téléphone (WhatsApp, SMS…).
 * Ailleurs : petit menu WhatsApp / Facebook / copier le lien.
 * `pleineLargeur` : le bouton occupe toute la largeur de son bloc.
 * `soi` : l'artisan partage sa propre fiche (texte du message adapté).
 */
function IconeFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  )
}

export default function PartagerProfil({ artisan, soi = false, pleineLargeur = false, className = '', libelle = 'Partager le profil' }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef(null)

  useEffect(() => {
    if (!ouvert) return
    const fermer = (e) => {
      if (conteneur.current && !conteneur.current.contains(e.target)) setOuvert(false)
    }
    const echap = (e) => e.key === 'Escape' && setOuvert(false)
    document.addEventListener('mousedown', fermer)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('mousedown', fermer)
      document.removeEventListener('keydown', echap)
    }
  }, [ouvert])

  if (!artisan) return null

  const url = `${window.location.origin}${lienArtisan(artisan)}`
  const nom = `${artisan.prenom || ''} ${artisan.nom || ''}`.trim()
  const metier = artisan.categories?.[0]?.nom
  const texte = soi
    ? `Retrouvez mon profil sur Bricolibe${metier ? ` (${metier})` : ''} et demandez-moi une intervention :`
    : `Je vous recommande ${nom}${metier ? `, ${metier}` : ''}, sur Bricolibe :`

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien du profil copié')
    } catch {
      toast.error('Impossible de copier le lien')
    }
    setOuvert(false)
  }

  const partager = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${nom} | Bricolibe`, text: texte, url })
        return
      } catch (e) {
        // Partage annulé par l'utilisateur : rien à faire.
        if (e?.name === 'AbortError') return
      }
    }
    setOuvert((o) => !o)
  }

  const lienMenu =
    'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-canvas-soft transition-colors text-left'

  return (
    <div ref={conteneur} className={`relative ${pleineLargeur ? "block w-full" : "inline-block"}`}>
      <button
        type="button"
        onClick={partager}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        className={
          className ||
          `${pleineLargeur ? 'w-full ' : ''}flex items-center justify-center gap-2 rounded-lg border border-line bg-white hover:bg-canvas-soft text-ink text-sm font-semibold px-4 py-2.5 transition-colors duration-150`
        }
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        {libelle}
      </button>

      {ouvert && (
        <div
          role="menu"
          className="absolute right-0 left-auto z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
        >
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(`${texte} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOuvert(false)}
            className={lienMenu}
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" /> WhatsApp
          </a>
          <a
            role="menuitem"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOuvert(false)}
            className={lienMenu}
          >
            <IconeFacebook className="w-4 h-4 text-[#1877F2]" aria-hidden="true" /> Facebook
          </a>
          <button type="button" role="menuitem" onClick={copier} className={lienMenu}>
            <Link2 className="w-4 h-4 text-muted" aria-hidden="true" /> Copier le lien
          </button>
        </div>
      )}
    </div>
  )
}
