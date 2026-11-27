import { lienArtisan } from '@/utils/liensArtisan'
import { nomComplet } from '@/utils/helpers'
import BoutonPartage from '@/components/common/BoutonPartage'

/**
 * Bouton « Partager le profil » d'un artisan.
 * `soi` : l'artisan partage sa propre fiche (texte du message adapté).
 * `siteSeulement` : partage la page d'accueil de Bricolibe (profil pas encore visible).
 */
export default function PartagerProfil({ artisan, soi = false, siteSeulement = false, pleineLargeur = false, className = '', libelle = 'Partager le profil' }) {
  if (!artisan) return null
  const nom = nomComplet(artisan)
  const metier = artisan.categories?.[0]?.nom
  const texte = siteSeulement
    ? 'Besoin d’un plombier, d’un électricien ou d’un autre artisan ? Trouvez un artisan près de chez vous sur Bricolibe :'
    : soi
      ? `Retrouvez mon profil sur Bricolibe${metier ? ` (${metier})` : ''} et demandez-moi une intervention :`
      : `Je vous recommande ${nom}${metier ? `, ${metier}` : ''}, sur Bricolibe :`
  return (
    <BoutonPartage
      chemin={siteSeulement ? '/' : lienArtisan(artisan)}
      titre={siteSeulement ? 'Bricolibe' : `${nom} | Bricolibe`}
      texte={texte}
      libelle={libelle}
      messageCopie={siteSeulement ? 'Lien de Bricolibe copié' : 'Lien du profil copié'}
      pleineLargeur={pleineLargeur}
      className={className}
    />
  )
}
