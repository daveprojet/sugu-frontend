import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { MapPin, Pencil } from 'lucide-react'
import ChampsZone from '@/components/common/ChampsZone'
import MapPicker from '@/components/common/MapPicker'
import { useMonEntreprise } from '@/hooks/useEntreprises'
import { chercherZoneProche } from '@/hooks/useZones'
import { entrepriseService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors'
const label = 'block text-sm font-medium text-ink mb-1.5'

const versFormulaire = (entreprise) => ({
  adresse: entreprise?.adresse || '',
  zone_ville: entreprise?.zone_ville ?? null,
  zone_quartier: entreprise?.zone_quartier ?? null,
  latitude: entreprise?.latitude != null ? Number(entreprise.latitude) : null,
  longitude: entreprise?.longitude != null ? Number(entreprise.longitude) : null,
})

/** Adresse et position de l'entreprise : elles donnent la zone, donc l'inspecteur qui la suit,
 * et le lieu proposé par défaut pour une nouvelle demande. Modifiables par le compte principal. */
export default function AdresseEntreprise({ estGestionnaire }) {
  const qc = useQueryClient()
  const { data: entreprise } = useMonEntreprise()
  const [edition, setEdition] = useState(false)
  const [form, setForm] = useState(versFormulaire(null))
  const enregistrer = useMutation((donnees) => entrepriseService.majMoi(donnees).then((r) => r.data), {
    onSuccess: (data) => {
      qc.setQueryData('mon-entreprise', data)
      setEdition(false)
      toast.success('Adresse de l’entreprise enregistrée.')
    },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’enregistrer l’adresse')),
  })

  if (!entreprise) return null
  const sansPosition = entreprise.latitude == null || !entreprise.zone_ville

  const ouvrir = () => {
    setForm(versFormulaire(entreprise))
    setEdition(true)
  }

  const surPosition = async ({ latitude, longitude, quartier, noms, communes }) => {
    setForm((f) => ({ ...f, latitude, longitude }))
    const zone = await chercherZoneProche(latitude, longitude, noms ?? [quartier], communes)
    if (zone.ville) setForm((f) => ({ ...f, zone_ville: zone.ville.id, zone_quartier: zone.quartier?.id ?? null }))
  }

  const valider = (e) => {
    e.preventDefault()
    if (form.latitude == null || form.longitude == null) return toast.error('Placez l’entreprise sur la carte.')
    if (!form.zone_ville) return toast.error('Choisissez la ville de l’entreprise.')
    enregistrer.mutate({
      ...form,
      latitude: Number(form.latitude).toFixed(6),
      longitude: Number(form.longitude).toFixed(6),
    })
  }

  return (
    <section className={`bg-white border rounded-2xl p-4 mb-6 ${sansPosition ? 'border-amber-300' : 'border-line'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><MapPin className="w-4 h-4" /></span>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-ink">Adresse de l’entreprise</h2>
          {sansPosition ? (
            <p className="text-sm text-amber-700 mt-0.5">
              Pas encore placée sur la carte. Ajoutez-la pour que vos demandes soient suivies par l’inspecteur de votre zone.
            </p>
          ) : (
            <p className="text-sm text-muted mt-0.5">
              {[entreprise.adresse, entreprise.zone_quartier_nom, entreprise.zone_ville_nom].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        {estGestionnaire && !edition && (
          <button type="button" onClick={ouvrir} className="inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-primary-700 underline underline-offset-2">
            <Pencil className="w-3.5 h-3.5" /> {sansPosition ? 'Ajouter' : 'Modifier'}
          </button>
        )}
      </div>
      {!estGestionnaire && sansPosition && (
        <p className="text-xs text-muted mt-2">Seul le compte principal peut renseigner l’adresse.</p>
      )}
      {edition && (
        <form onSubmit={valider} className="grid gap-4 mt-4">
          <div>
            <label className={label}>Adresse (rue, bâtiment, repère)</label>
            <input value={form.adresse} onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))} className={champ} maxLength={255} placeholder="Route de la Corniche, immeuble Teranga" />
          </div>
          <MapPicker
            value={form.latitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
            onChange={surPosition}
          />
          <div className="grid grid-cols-2 gap-4">
            <ChampsZone
              zoneVille={form.zone_ville}
              zoneQuartier={form.zone_quartier}
              onChange={(zone) => setForm((f) => ({ ...f, ...zone }))}
              labelClass={label}
              champClass={champ}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={() => setEdition(false)} className="px-4 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-canvas-soft">Annuler</button>
            <button type="submit" disabled={enregistrer.isLoading} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
              {enregistrer.isLoading ? 'Enregistrement…' : 'Enregistrer l’adresse'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
