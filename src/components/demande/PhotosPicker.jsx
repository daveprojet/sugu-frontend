import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Camera, X, Loader2 } from 'lucide-react'
import { compresserImage, MAX_PHOTOS_PAR_ETAPE, TYPES_PHOTO_ACCEPTES } from '@/utils/images'

/**
 * Sélection de photos avant envoi (formulaire). `photos` : tableau de File
 * déjà compressés ; `onChange(nouveauTableau)`.
 */
export default function PhotosPicker({ photos, onChange, max = MAX_PHOTOS_PAR_ETAPE, label, aide }) {
  const inputRef = useRef(null)
  const [preparation, setPreparation] = useState(false)
  const [apercus, setApercus] = useState([])

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f))
    setApercus(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [photos])

  const restantes = max - photos.length

  const ajouter = async (e) => {
    const fichiers = Array.from(e.target.files || [])
    e.target.value = '' // permet de re-sélectionner le même fichier
    if (!fichiers.length) return
    if (fichiers.length > restantes) {
      toast.error(`${max} photos maximum : ${restantes} de plus possible(s).`)
    }
    setPreparation(true)
    const prets = []
    for (const f of fichiers.slice(0, restantes)) {
      try {
        prets.push(await compresserImage(f))
      } catch (err) {
        toast.error(err.message)
      }
    }
    setPreparation(false)
    if (prets.length) onChange([...photos, ...prets])
  }

  const retirer = (index) => onChange(photos.filter((_, i) => i !== index))

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-muted mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {apercus.map((src, i) => (
          <div key={src} className="relative w-20 h-20 rounded-lg overflow-hidden border border-line bg-canvas-soft">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => retirer(i)}
              aria-label={`Retirer la photo ${i + 1}`}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {restantes > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={preparation}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-line hover:border-indigo-400 hover:bg-indigo-50/50 text-muted hover:text-indigo-700 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors disabled:opacity-60"
          >
            {preparation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            {preparation ? 'Préparation' : 'Ajouter'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={TYPES_PHOTO_ACCEPTES}
        multiple
        onChange={ajouter}
        className="hidden"
      />
      {aide && <p className="text-[11px] text-muted mt-1.5">{aide}</p>}
    </div>
  )
}
