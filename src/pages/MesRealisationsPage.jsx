import { ArrowLeft, ImagePlus, Loader2, MessageCircle, Trash2, Video } from 'lucide-react'
import BackLink from '@/components/common/BackLink'
import Spinner from '@/components/common/Spinner'
import { BoutonAjoutMedia } from '@/components/artisan/AjoutMedias'
import { useAuth } from '@/context/AuthContext'
import { useMediasArtisan } from '@/hooks/useMediasArtisan'
import { lienWhatsappProfil, WHATSAPP_BRICOLIBE } from '@/utils/whatsappBricolibe'

/** L'artisan ajoute ou retire les photos et vidéos de ses réalisations (onglet « Photos et vidéos » du profil public). */
export default function MesRealisationsPage() {
  const { user } = useAuth()
  const { isLoading, medias, nbPhotos, nbVideos, maxPhotos, maxVideos, retrait } = useMediasArtisan()

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
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{nbPhotos}/{maxPhotos}</span> photos ·{' '}
          <span className="font-semibold text-gray-900">{nbVideos}/{maxVideos}</span> vidéos
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <BoutonAjoutMedia type="photo" className="btn-primary inline-flex items-center justify-center gap-2">
            {({ enCours }) => (
              <>
                {enCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {enCours ? 'Envoi en cours…' : 'Ajouter des photos'}
              </>
            )}
          </BoutonAjoutMedia>
          <BoutonAjoutMedia
            type="video"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-300 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
          >
            {({ enCours }) => (
              <>
                {enCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                {enCours ? 'Envoi en cours…' : 'Ajouter une vidéo'}
              </>
            )}
          </BoutonAjoutMedia>
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
