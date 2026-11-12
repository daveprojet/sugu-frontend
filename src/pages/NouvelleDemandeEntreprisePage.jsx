import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCategories } from '@/hooks/useCategories'
import { chercherZoneProche } from '@/hooks/useZones'
import { useCreerDemandeEntreprise } from '@/hooks/useEntreprises'
import ChampsZone from '@/components/common/ChampsZone'
import MapPicker from '@/components/common/MapPicker'
import PhoneField from '@/components/common/PhoneField'
import PhotosPicker from '@/components/demande/PhotosPicker'
import VideoPicker from '@/components/demande/VideoPicker'

const label = 'block text-xs font-semibold text-muted mb-1.5'
const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors'

// Valeur par défaut du champ date : dans une heure, arrondie au quart d'heure (heure locale).
const dansUneHeure = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function NouvelleDemandeEntreprisePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const creer = useCreerDemandeEntreprise()
  const [photos, setPhotos] = useState([])
  const [video, setVideo] = useState(null)
  const [form, setForm] = useState({
    categorie: '',
    description: '',
    adresse: '',
    zone_ville: null,
    zone_quartier: null,
    latitude: null,
    longitude: null,
    date_souhaitee: dansUneHeure(),
    contact_sur_place: '',
    telephone_contact: '',
  })
  const set = (cle, valeur) => setForm((f) => ({ ...f, [cle]: valeur }))

  const surPosition = async ({ latitude, longitude, quartier, noms, communes }) => {
    setForm((f) => ({ ...f, latitude, longitude }))
    const zone = await chercherZoneProche(latitude, longitude, noms ?? [quartier], communes)
    if (zone.ville) setForm((f) => ({ ...f, zone_ville: zone.ville.id, zone_quartier: zone.quartier?.id ?? null }))
  }

  const envoyer = async (e) => {
    e.preventDefault()
    if (!form.categorie) return toast.error('Choisissez le corps de métier concerné.')
    if (!form.zone_ville) return toast.error('Choisissez la ville du lieu d’intervention.')
    const payload = {
      ...form,
      date_souhaitee: new Date(form.date_souhaitee).toISOString(),
      // Coordonnées arrondies : le champ accepte 8 décimales.
      latitude: form.latitude != null ? Number(form.latitude).toFixed(6) : null,
      longitude: form.longitude != null ? Number(form.longitude).toFixed(6) : null,
      photos,
      video,
    }
    const demande = await creer.mutateAsync(payload).catch(() => null)
    if (demande) navigate(`/espace-entreprise/demandes/${demande.uid}`, { replace: true })
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/espace-entreprise" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Mes demandes
      </Link>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Nouvelle demande</h1>
      <p className="text-sm text-muted mt-1 mb-6">
        Plus votre description est précise (photos, vidéo), plus l’inspecteur envoie le bon artisan avec le bon matériel.
      </p>

      <form onSubmit={envoyer} className="bg-white border border-line rounded-2xl p-5 md:p-7 grid gap-5">
        <div>
          <label className={label}>Corps de métier</label>
          <select value={form.categorie} onChange={(e) => set('categorie', e.target.value)} className={champ} required>
            <option value="">Choisir…</option>
            {categories.map((c) => <option key={c.uid} value={c.uid}>{c.nom}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Décrivez la panne ou le besoin</label>
          <textarea
            rows={5}
            required
            minLength={10}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Ex. : fuite au plafond de la cuisine du restaurant, l’eau coule depuis ce matin près du tableau électrique…"
            className={`${champ} resize-none`}
          />
        </div>

        <PhotosPicker
          photos={photos}
          onChange={setPhotos}
          label="Photos de la panne (facultatif)"
          aide="Jusqu’à 5 photos, prises avec l’appareil ou choisies dans la galerie. Elles sont réduites avant l’envoi."
        />
        <VideoPicker video={video} onChange={setVideo} />

        <div>
          <label className={label}>Début d’intervention souhaité</label>
          <input
            type="datetime-local"
            required
            value={form.date_souhaitee}
            onChange={(e) => set('date_souhaitee', e.target.value)}
            className={champ}
          />
          <p className="text-xs text-muted mt-1.5">L’heure à laquelle l’artisan est attendu sur place.</p>
        </div>

        <div className="grid gap-4 pt-4 border-t border-line">
          <div>
            <label className={label}>Adresse du lieu d’intervention</label>
            <input
              required
              value={form.adresse}
              onChange={(e) => set('adresse', e.target.value)}
              placeholder="Ex. : Immeuble Fahd, 3e étage, avenue Hassan II"
              className={champ}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ChampsZone
              zoneVille={form.zone_ville}
              zoneQuartier={form.zone_quartier}
              onChange={(zone) => setForm((f) => ({ ...f, ...zone }))}
              labelClass={label}
              champClass={champ}
            />
          </div>
          <div>
            <label className={label}>Position sur la carte (facultatif, aide l’artisan à trouver le lieu)</label>
            <MapPicker
              value={form.latitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
              onChange={surPosition}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-line">
          <div>
            <label className={label}>Contact sur place (facultatif)</label>
            <input
              value={form.contact_sur_place}
              onChange={(e) => set('contact_sur_place', e.target.value)}
              placeholder={user ? `${user.prenom} ${user.nom}` : 'Nom'}
              className={champ}
            />
          </div>
          <div>
            <label className={label}>Téléphone du contact</label>
            <PhoneField value={form.telephone_contact} onChange={(v) => set('telephone_contact', v || '')} />
          </div>
        </div>

        <button
          type="submit"
          disabled={creer.isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold transition-colors"
        >
          <Send className="w-4 h-4" /> {creer.isLoading ? 'Envoi…' : 'Envoyer la demande'}
        </button>
      </form>
    </main>
  )
}
