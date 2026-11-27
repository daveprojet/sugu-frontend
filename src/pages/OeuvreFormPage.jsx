import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { ChevronLeft, X } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import PhotosPicker from '@/components/demande/PhotosPicker'
import VideoPicker from '@/components/demande/VideoPicker'
import Spinner from '@/components/common/Spinner'

const PHOTOS_MAX = 5
const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
const libelle = 'block text-xs font-semibold text-muted mb-1.5'

/** Ajouter ou modifier une œuvre (espace artiste). */
export default function OeuvreFormPage() {
  const { uid } = useParams()
  const edition = Boolean(uid)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: categories = [] } = useQuery('marketplace-categories', () => marketplaceService.categories().then((r) => r.data), { staleTime: 30 * 60 * 1000 })
  const { data: credits } = useQuery('mp-mes-credits', () => marketplaceService.mesCredits().then((r) => r.data))
  const { data: existante, isLoading } = useQuery(['mp-mon-oeuvre', uid], () => marketplaceService.monOeuvre(uid).then((r) => r.data), { enabled: edition })

  const [form, setForm] = useState({ titre: '', categorie: '', description: '', prix: '', disponibilite: 'UNIQUE', quantite: 1, livraison_possible: false })
  const [photos, setPhotos] = useState([])
  const [video, setVideo] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (existante) {
      setForm({
        titre: existante.titre, categorie: existante.categorie?.slug || '', description: existante.description,
        prix: existante.prix, disponibilite: existante.disponibilite, quantite: existante.quantite,
        livraison_possible: existante.livraison_possible,
      })
    }
  }, [existante])

  const photosExistantes = existante?.photos || []
  const videoAutorisee = credits?.avantages?.video

  const supprimerPhoto = async (photoId) => {
    try {
      const { data } = await marketplaceService.supprimerPhotoOeuvre(uid, photoId)
      qc.setQueryData(['mp-mon-oeuvre', uid], data)
    } catch (err) {
      toast.error(extractApiError(err, 'Suppression impossible'))
    }
  }

  const envoyer = async (publier) => {
    if (!edition && !photos.length) {
      toast.error('Ajoutez au moins une photo de l’œuvre.')
      return
    }
    setEnvoi(true)
    const donnees = { ...form, photos, video, ...(publier ? { publier: 'true' } : {}) }
    try {
      const { data } = edition
        ? await marketplaceService.modifierOeuvre(uid, donnees)
        : await marketplaceService.creerOeuvre(donnees)
      qc.invalidateQueries('mp-mes-oeuvres')
      qc.invalidateQueries('mp-mes-credits')
      toast.success(edition ? 'Œuvre enregistrée.' : data.statut === 'EN_LIGNE' ? 'Votre œuvre est en ligne !' : 'Œuvre enregistrée en brouillon.')
      navigate('/espace-artiste')
    } catch (err) {
      // Crédit manquant à la publication : l'œuvre est tout de même créée en brouillon.
      if (err?.response?.status === 402) {
        qc.invalidateQueries('mp-mes-oeuvres')
        toast.warning(`${err.response.data.detail} Votre œuvre est enregistrée en brouillon.`)
        navigate('/espace-artiste')
      } else {
        toast.error(extractApiError(err, 'Enregistrement impossible'))
      }
    } finally {
      setEnvoi(false)
    }
  }

  if (edition && isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  const lancement = credits?.lancement?.actif
  const gratuites = credits?.publications_gratuites_restantes ?? 0
  const infoPublication = lancement
    ? 'Phase de lancement : mise en ligne gratuite pour 6 mois.'
    : gratuites > 0
      ? `Mise en ligne gratuite pour 2 semaines (encore ${gratuites} œuvre${gratuites > 1 ? 's' : ''} gratuite${gratuites > 1 ? 's' : ''}).`
      : 'Mise en ligne : 1 crédit pour 6 mois.'

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/espace-artiste" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Mon espace artiste
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">{edition ? 'Modifier l’œuvre' : 'Ajouter une œuvre'}</h1>
      <p className="mt-1 text-sm text-muted">Une œuvre déjà réalisée (ou une série limitée), vendue à prix fixe.</p>

      <form onSubmit={(e) => { e.preventDefault(); envoyer(!edition) }} className="mt-6 flex flex-col gap-5 rounded-xl border border-line bg-white p-5 sm:p-7">
        <div>
          <label className={libelle} htmlFor="oe-titre">Titre *</label>
          <input id="oe-titre" className={champ} required maxLength={150} value={form.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Ex. : Coucher de soleil sur Gorée" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={libelle} htmlFor="oe-cat">Catégorie *</label>
            <select id="oe-cat" className={champ} required value={form.categorie} onChange={(e) => set('categorie', e.target.value)}>
              <option value="">Choisir…</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={libelle} htmlFor="oe-prix">Prix (FCFA) *</label>
            <input id="oe-prix" type="number" min="500" step="500" inputMode="numeric" className={champ} required value={form.prix} onChange={(e) => set('prix', e.target.value)} placeholder="Ex. : 45000" />
          </div>
        </div>
        <div>
          <label className={libelle} htmlFor="oe-desc">Description *</label>
          <textarea id="oe-desc" rows={5} className={`${champ} resize-none`} required value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Technique, dimensions, matériaux, histoire de l’œuvre…" />
        </div>
        <fieldset>
          <legend className={libelle}>Disponibilité</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['UNIQUE', 'Pièce unique'], ['SERIE', 'En série']].map(([v, l]) => (
              <label key={v} className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold ${form.disponibilite === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-line bg-canvas-soft text-ink'}`}>
                <input type="radio" name="dispo" value={v} checked={form.disponibilite === v} onChange={() => set('disponibilite', v)} className="sr-only" />{l}
              </label>
            ))}
          </div>
          {form.disponibilite === 'SERIE' && (
            <div className="mt-3">
              <label className={libelle} htmlFor="oe-qte">Exemplaires disponibles</label>
              <input id="oe-qte" type="number" min="1" className={`${champ} sm:w-40`} value={form.quantite} onChange={(e) => set('quantite', e.target.value)} />
            </div>
          )}
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.livraison_possible} onChange={(e) => set('livraison_possible', e.target.checked)} />
          Je peux livrer l’œuvre (à convenir avec l’acheteur)
        </label>

        <div>
          {photosExistantes.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {photosExistantes.map((p) => (
                <div key={p.id} className="relative">
                  <img src={p.image} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" />
                  {photosExistantes.length > 1 && (
                    <button type="button" onClick={() => supprimerPhoto(p.id)} aria-label="Supprimer cette photo"
                      className="absolute -right-2 -top-2 rounded-full border border-line bg-white p-1 text-muted shadow hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          <PhotosPicker photos={photos} onChange={setPhotos} max={PHOTOS_MAX - photosExistantes.length}
            label={edition ? 'Ajouter des photos' : 'Photos de l’œuvre * (1 à 5)'} aide="Lumière du jour, fond neutre : la première photo apparaît dans le catalogue." />
        </div>

        {videoAutorisee
          ? <VideoPicker video={video} onChange={setVideo} label="Vidéo de présentation (facultatif)" aide="30 secondes maximum : montrez l’œuvre sous plusieurs angles." />
          : <p className="text-xs text-muted">La vidéo de présentation est disponible avec les packs Pro et Galerie.</p>}

        {!edition && <p className="rounded-lg bg-canvas-soft px-3 py-2 text-xs text-muted">{infoPublication}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" disabled={envoi} className="flex-1 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            {envoi ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Publier l’œuvre'}
          </button>
          {!edition && (
            <button type="button" disabled={envoi} onClick={() => envoyer(false)} className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-ink hover:bg-canvas-soft disabled:opacity-60">
              Enregistrer en brouillon
            </button>
          )}
        </div>
      </form>
    </main>
  )
}
