import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { Camera, X, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useAjouterPhotos, useSupprimerPhoto } from '@/hooks/useDemandes'
import { compresserImage, MAX_PHOTOS_PAR_ETAPE, TYPES_PHOTO_ACCEPTES } from '@/utils/images'

// Mêmes règles que le serveur (apps/demandes/models.py, PhotoDemande.STATUTS_AUTORISES).
export const ETAPES_PHOTO = {
  PANNE: { titre: 'Photos de la panne', auteur: 'client', statuts: ['EN_ATTENTE', 'ACCEPTEE'] },
  // Avant : au démarrage des travaux (exigées pour passer « En cours »).
  // Après : à la fin des travaux (exigées pour passer « Terminée »).
  AVANT: { titre: 'Avant intervention', auteur: 'artisan', statuts: ['PRIX_FIXE', 'EN_COURS'] },
  APRES: { titre: 'Après intervention', auteur: 'artisan', statuts: ['EN_COURS', 'TERMINEE'] },
}

export const peutModifierPhotos = (type, role, statut) =>
  ETAPES_PHOTO[type].auteur === role && ETAPES_PHOTO[type].statuts.includes(statut)

/** Agrandissement plein écran, navigation clavier ← → et Échap. */
function Visionneuse({ photos, index, onClose, onIndex }) {
  useEffect(() => {
    const touche = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length)
    }
    document.addEventListener('keydown', touche)
    return () => document.removeEventListener('keydown', touche)
  }, [index, photos.length, onClose, onIndex])

  const photo = photos[index]
  if (!photo) return null
  // Portail : les cartes parentes sont animées (transform), ce qui casserait le position: fixed.
  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
        <X className="w-7 h-7" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + photos.length) % photos.length) }}
            className="absolute left-2 md:left-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % photos.length) }}
            className="absolute right-2 md:right-6 text-white/80 hover:text-white p-2 bg-white/10 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      <figure className="max-w-4xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={photo.image} alt={photo.legende} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
        <figcaption className="text-white/80 text-sm mt-3">
          {photo.legende} · {index + 1}/{photos.length}
        </figcaption>
      </figure>
    </div>,
    document.body
  )
}

/** Une étape (panne / avant / après) : vignettes, ajout et retrait si autorisés. */
function EtapePhotos({ demande, type, photos, modifiable, onOuvrir }) {
  const inputRef = useRef(null)
  const [preparation, setPreparation] = useState(false)
  const ajouter = useAjouterPhotos()
  const supprimer = useSupprimerPhoto()
  const restantes = MAX_PHOTOS_PAR_ETAPE - photos.length
  const occupe = preparation || ajouter.isLoading

  const choisir = async (e) => {
    const fichiers = Array.from(e.target.files || [])
    e.target.value = ''
    if (!fichiers.length) return
    if (fichiers.length > restantes) toast.error(`${MAX_PHOTOS_PAR_ETAPE} photos maximum par étape.`)
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
    if (prets.length) ajouter.mutate({ id: demande.id, typePhoto: type, photos: prets })
  }

  const retirer = (photo) => {
    if (!window.confirm('Retirer cette photo ?')) return
    supprimer.mutate({ id: demande.id, photoUid: photo.uid })
  }

  if (!photos.length && !modifiable) return null

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
        {ETAPES_PHOTO[type].titre} {photos.length > 0 && <span className="font-semibold">({photos.length})</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.uid} className="relative w-16 h-16 rounded-lg overflow-hidden border border-line bg-canvas-soft group">
            <button
              type="button"
              onClick={() => onOuvrir(p.uid)}
              aria-label={`Agrandir : ${ETAPES_PHOTO[type].titre}`}
              className="w-full h-full cursor-zoom-in"
            >
              <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
            {modifiable && (
              <button
                type="button"
                onClick={() => retirer(p)}
                disabled={supprimer.isLoading}
                aria-label="Retirer cette photo"
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {modifiable && restantes > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={occupe}
            className="w-16 h-16 rounded-lg border-2 border-dashed border-line hover:border-indigo-400 hover:bg-indigo-50/50 text-muted hover:text-indigo-700 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors disabled:opacity-60"
          >
            {occupe ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {occupe ? 'Envoi' : 'Ajouter'}
          </button>
        )}
      </div>
      {modifiable && (
        <input ref={inputRef} type="file" accept={TYPES_PHOTO_ACCEPTES} multiple onChange={choisir} className="hidden" />
      )}
    </div>
  )
}

/**
 * Photos d'une demande, regroupées par étape.
 * role : 'client' | 'artisan' — détermine ce que l'utilisateur peut ajouter / retirer.
 * types : étapes à afficher (par défaut toutes).
 */
export default function PhotosDemande({ demande, role, types = ['PANNE', 'AVANT', 'APRES'], className = '' }) {
  const [ouverte, setOuverte] = useState(null)
  const toutes = demande.photos || []

  const etapes = types
    .map((type) => ({
      type,
      photos: toutes.filter((p) => p.type_photo === type),
      modifiable: peutModifierPhotos(type, role, demande.statut),
    }))
    .filter((e) => e.photos.length > 0 || e.modifiable)

  if (!etapes.length) return null

  // Ordre de la visionneuse : panne, avant, après — on peut comparer en défilant.
  const galerie = etapes.flatMap((e) =>
    e.photos.map((p) => ({ ...p, legende: ETAPES_PHOTO[e.type].titre }))
  )
  const indexOuverte = galerie.findIndex((p) => p.uid === ouverte)

  return (
    <div className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {etapes.map((e) => (
        <EtapePhotos key={e.type} demande={demande} onOuvrir={setOuverte} {...e} />
      ))}
      {indexOuverte >= 0 && (
        <Visionneuse
          photos={galerie}
          index={indexOuverte}
          onClose={() => setOuverte(null)}
          onIndex={(i) => setOuverte(galerie[i].uid)}
        />
      )}
    </div>
  )
}
