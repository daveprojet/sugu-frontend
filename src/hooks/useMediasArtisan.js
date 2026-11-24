import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { artisanService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

export const MAX_PHOTO = 5 * 1024 * 1024
export const MAX_VIDEO = 30 * 1024 * 1024
export const ACCEPT_PHOTO = 'image/jpeg,image/png,image/webp'
export const ACCEPT_VIDEO = 'video/*,.mp4,.mov,.webm,.3gp,.m4v'

// Certains téléphones ne donnent pas le type du fichier : l'extension sert alors.
const genre = (fichier) => {
  if (fichier.type) return fichier.type.split('/')[0]
  const ext = fichier.name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image'
  return ['mp4', 'mov', 'webm', '3gp', 'm4v'].includes(ext) ? 'video' : ''
}

/** Contrôle avant l'envoi (le serveur vérifie aussi) : évite un long téléversement refusé.
 *  attendu : 'photo' ou 'video'. */
export function erreurFichier(fichier, attendu) {
  const g = genre(fichier)
  if (attendu === 'photo' && g !== 'image') return `« ${fichier.name} » n'est pas une photo.`
  if (attendu === 'video' && g !== 'video') return `« ${fichier.name} » n'est pas une vidéo.`
  if (g === 'image') return fichier.size > MAX_PHOTO ? `« ${fichier.name} » dépasse 5 Mo.` : null
  if (g === 'video') return fichier.size > MAX_VIDEO ? `La vidéo « ${fichier.name} » dépasse 30 Mo (1 minute environ).` : null
  return `« ${fichier.name} » n'est ni une photo ni une vidéo.`
}

/** Galerie (photos et vidéos) de l'artisan connecté : liste, ajout et retrait. */
export function useMediasArtisan() {
  const { user } = useAuth()
  const uid = user?.artisan_uid
  const queryClient = useQueryClient()
  const cle = ['artisan-medias', uid]

  const requete = useQuery(cle, () => artisanService.medias(uid).then((r) => r.data), { enabled: !!uid })

  const apresChangement = (donnees) => {
    queryClient.setQueryData(cle, donnees)
    queryClient.invalidateQueries(['artisan-portfolio', uid])
  }
  const ajout = useMutation((fichiers) => artisanService.ajouterMedias(uid, fichiers).then((r) => r.data), {
    onSuccess: (donnees) => { apresChangement(donnees); toast.success('Ajouté à votre profil.') },
    onError: (err) => toast.error(extractApiError(err, "L'envoi n'a pas abouti.")),
  })
  const retrait = useMutation((mediaUid) => artisanService.supprimerMedia(uid, mediaUid).then((r) => r.data), {
    onSuccess: apresChangement,
    onError: (err) => toast.error(extractApiError(err, 'Impossible de retirer ce fichier.')),
  })

  const medias = requete.data?.medias || []
  const nbPhotos = medias.filter((m) => m.type === 'PHOTO').length
  return {
    uid,
    isLoading: requete.isLoading,
    medias,
    nbPhotos,
    nbVideos: medias.length - nbPhotos,
    maxPhotos: requete.data?.max_photos ?? 20,
    maxVideos: requete.data?.max_videos ?? 3,
    ajout,
    retrait,
  }
}
