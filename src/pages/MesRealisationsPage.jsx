import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { ArrowLeft, ImagePlus, Loader2, MessageCircle, Trash2 } from 'lucide-react'
import BackLink from '@/components/common/BackLink'
import Spinner from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'
import { artisanService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import { lienWhatsappProfil, WHATSAPP_BRICOLIBE } from '@/utils/whatsappBricolibe'

const MAX_PHOTO = 5 * 1024 * 1024
const MAX_VIDEO = 30 * 1024 * 1024

// Contrôle avant l'envoi (le serveur vérifie aussi) : évite d'attendre un long
// téléversement pour se le voir refuser.
// Certains téléphones ne donnent pas le type du fichier : l'extension sert alors.
const genre = (fichier) => {
  if (fichier.type) return fichier.type.split('/')[0]
  const ext = fichier.name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image'
  return ['mp4', 'mov', 'webm', '3gp', 'm4v'].includes(ext) ? 'video' : ''
}

function erreurFichier(fichier) {
  if (genre(fichier) === 'image') {
    return fichier.size > MAX_PHOTO ? `« ${fichier.name} » dépasse 5 Mo.` : null
  }
  if (genre(fichier) === 'video') {
    return fichier.size > MAX_VIDEO ? `La vidéo « ${fichier.name} » dépasse 30 Mo (1 minute environ).` : null
  }
  return `« ${fichier.name} » n'est ni une photo ni une vidéo.`
}

/** L'artisan ajoute ou retire les photos et vidéos de ses réalisations (onglet « Photos et vidéos » du profil public). */
export default function MesRealisationsPage() {
  const { user } = useAuth()
  const uid = user?.artisan_uid
  const queryClient = useQueryClient()
  const input = useRef(null)
  const cle = ['artisan-medias', uid]

  const { data, isLoading } = useQuery(cle, () => artisanService.medias(uid).then((r) => r.data), { enabled: !!uid })

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

  const choisir = (e) => {
    const fichiers = Array.from(e.target.files || [])
    e.target.value = ''
    if (!fichiers.length) return
    const erreur = fichiers.map(erreurFichier).find(Boolean)
    if (erreur) { toast.error(erreur); return }
    ajout.mutate(fichiers)
  }

  const medias = data?.medias || []
  const nbPhotos = medias.filter((m) => m.type === 'PHOTO').length
  const nbVideos = medias.length - nbPhotos

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      <BackLink fallback="/mon-profil" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </BackLink>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Mes photos et vidéos</h1>
      <p className="mt-1.5 text-sm text-gray-600">
        Montrez votre travail : ces photos et vidéos s'affichent sur votre profil public.
      </p>

      <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{nbPhotos}/{data?.max_photos ?? 20}</span> photos ·{' '}
            <span className="font-semibold text-gray-900">{nbVideos}/{data?.max_videos ?? 3}</span> vidéos
          </p>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={ajout.isLoading || !uid}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {ajout.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {ajout.isLoading ? 'Envoi en cours…' : 'Ajouter des photos ou vidéos'}
          </button>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,video/*" multiple hidden onChange={choisir} />
        </div>
        <p className="mt-2 text-xs text-gray-500">Photos : 5 Mo maximum. Vidéos : 30 Mo maximum (1 minute environ).</p>

        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : medias.length === 0 ? (
          <p className="mt-6 rounded-xl bg-sand-50 px-4 py-8 text-center text-sm text-gray-500">
            Aucune photo pour l'instant. Ajoutez 3 à 5 photos de vos plus beaux travaux.
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {medias.map((media) => (
              <li key={media.uid} className="relative">
                {media.type === 'VIDEO' ? (
                  <video src={media.url} controls preload="metadata" playsInline className="w-full aspect-[4/3] rounded-xl bg-black object-cover" />
                ) : (
                  <img src={media.miniature || media.url} alt="Réalisation" loading="lazy" className="w-full aspect-[4/3] rounded-xl object-cover bg-sand-50" />
                )}
                <button
                  type="button"
                  onClick={() => { if (window.confirm('Retirer ce fichier de votre profil ?')) retrait.mutate(media.uid) }}
                  disabled={retrait.isLoading}
                  aria-label="Retirer"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-600 shadow flex items-center justify-center hover:bg-white disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a
        href={lienWhatsappProfil(user)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 hover:border-accent-300 transition-colors"
      >
        <span className="w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5" />
        </span>
        <span className="text-sm text-gray-700">
          <span className="block font-semibold text-gray-900">Pas à l'aise avec l'envoi ?</span>
          Envoyez vos fichiers sur WhatsApp au {WHATSAPP_BRICOLIBE}, nous les ajoutons pour vous.
        </span>
      </a>
    </main>
  )
}
