import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Video, X, Loader2 } from 'lucide-react'

export const DUREE_MAX_VIDEO_S = 30
export const TAILLE_MAX_VIDEO = 20 * 1024 * 1024
const TYPES_VIDEO = 'video/mp4,video/quicktime,video/webm,video/3gpp,video/x-m4v'

// Lit la durée dans le navigateur, sans envoyer le fichier.
const lireDuree = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration) }
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    video.src = url
  })

export async function verifierVideo(file) {
  if (!file.type.startsWith('video/')) throw new Error(`« ${file.name} » n'est pas une vidéo.`)
  if (file.size > TAILLE_MAX_VIDEO) {
    throw new Error('La vidéo dépasse 20 Mo : filmez une séquence plus courte (30 secondes maximum).')
  }
  const duree = await lireDuree(file)
  // Durée illisible (format que le navigateur ne lit pas) : le poids suffit comme garde-fou.
  if (duree && Number.isFinite(duree) && duree > DUREE_MAX_VIDEO_S + 1) {
    throw new Error(`La vidéo dure ${Math.round(duree)} s : ${DUREE_MAX_VIDEO_S} secondes maximum.`)
  }
  return file
}

/** Courte vidéo facultative de la panne. `video` : File ou null ; `onChange(file|null)`. */
export default function VideoPicker({ video, onChange, label = 'Vidéo de la panne (facultatif)', aide }) {
  const inputRef = useRef(null)
  const [verification, setVerification] = useState(false)
  const [apercu, setApercu] = useState(null)

  useEffect(() => {
    if (!video) { setApercu(null); return undefined }
    const url = URL.createObjectURL(video)
    setApercu(url)
    return () => URL.revokeObjectURL(url)
  }, [video])

  const choisir = async (e) => {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    setVerification(true)
    try {
      onChange(await verifierVideo(fichier))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setVerification(false)
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-muted mb-1.5">{label}</label>
      {apercu ? (
        <div className="relative w-full max-w-xs">
          <video src={apercu} controls playsInline preload="metadata" className="w-full rounded-lg bg-black max-h-48" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow"
            aria-label="Retirer la vidéo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={verification}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-line text-sm text-muted hover:border-primary-400 hover:text-primary-600 transition-colors"
        >
          {verification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
          {verification ? 'Vérification…' : 'Filmer ou choisir une vidéo'}
        </button>
      )}
      <p className="text-xs text-muted mt-1.5">
        {aide || `${DUREE_MAX_VIDEO_S} secondes maximum : montrez la panne en mouvement (fuite, bruit, étincelles…).`}
      </p>
      <input ref={inputRef} type="file" accept={TYPES_VIDEO} capture="environment" className="hidden" onChange={choisir} />
    </div>
  )
}
