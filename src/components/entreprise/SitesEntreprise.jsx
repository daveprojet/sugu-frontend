import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import ChampsZone from '@/components/common/ChampsZone'
import MapPicker from '@/components/common/MapPicker'
import { useSitesEntreprise } from '@/hooks/useEntreprises'
import { chercherZoneProche } from '@/hooks/useZones'
import { entrepriseService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors'
const label = 'block text-sm font-medium text-ink mb-1.5'

const versFormulaire = (site) => ({
  nom: site?.nom || '',
  adresse: site?.adresse || '',
  zone_ville: site?.zone_ville ?? null,
  zone_quartier: site?.zone_quartier ?? null,
  latitude: site?.latitude != null ? Number(site.latitude) : null,
  longitude: site?.longitude != null ? Number(site.longitude) : null,
})

function FormulaireSite({ site, onFermer }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(versFormulaire(site))
  const enregistrer = useMutation(
    (donnees) => (site ? entrepriseService.majSite(site.uid, donnees) : entrepriseService.ajouterSite(donnees)),
    {
      onSuccess: () => {
        qc.invalidateQueries('sites-entreprise')
        qc.invalidateQueries('membres-entreprise')
        qc.invalidateQueries('mon-entreprise')
        toast.success(site ? 'Site enregistré.' : 'Site ajouté.')
        onFermer()
      },
      onError: (e) => toast.error(extractApiError(e, 'Impossible d’enregistrer le site')),
    },
  )

  const surPosition = async ({ latitude, longitude, quartier, noms, communes }) => {
    setForm((f) => ({ ...f, latitude, longitude }))
    const zone = await chercherZoneProche(latitude, longitude, noms ?? [quartier], communes)
    if (zone.ville) setForm((f) => ({ ...f, zone_ville: zone.ville.id, zone_quartier: zone.quartier?.id ?? null }))
  }

  const valider = (e) => {
    e.preventDefault()
    if (!form.zone_ville) return toast.error('Choisissez la ville du site.')
    enregistrer.mutate({
      ...form,
      latitude: form.latitude != null ? Number(form.latitude).toFixed(6) : null,
      longitude: form.longitude != null ? Number(form.longitude).toFixed(6) : null,
    })
  }

  return (
    <form onSubmit={valider} className="grid gap-4 mt-3 border-t border-line pt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nom du site</label>
          <input required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} className={champ} maxLength={120} placeholder="Agence Plateau, entrepôt de Hann…" />
        </div>
        <div>
          <label className={label}>Adresse (rue, bâtiment, repère)</label>
          <input required value={form.adresse} onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))} className={champ} maxLength={255} placeholder="Route de la Corniche, immeuble Teranga" />
        </div>
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
        <button type="button" onClick={onFermer} className="px-4 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-canvas-soft">Annuler</button>
        <button type="submit" disabled={enregistrer.isLoading} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
          {enregistrer.isLoading ? 'Enregistrement…' : 'Enregistrer le site'}
        </button>
      </div>
    </form>
  )
}

/** Sites de l'entreprise (siège, agences, entrepôts) : les demandes se font par site. Gérés par le compte principal. */
export default function SitesEntreprise({ estGestionnaire }) {
  const qc = useQueryClient()
  const { data: sites = [] } = useSitesEntreprise()
  const [edition, setEdition] = useState(null) // uid du site, ou 'nouveau'
  const retirer = useMutation((uid) => entrepriseService.retirerSite(uid), {
    onSuccess: () => { qc.invalidateQueries('sites-entreprise'); toast.success('Site retiré.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible de retirer ce site')),
  })

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-sm text-muted">{sites.length} site(s){estGestionnaire ? '' : ' · seul le compte principal les modifie'}</p>
        {estGestionnaire && edition !== 'nouveau' && (
          <button
            type="button" onClick={() => setEdition('nouveau')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter un site
          </button>
        )}
      </div>
      <ul className="grid sm:grid-cols-2 gap-3">
        {sites.map((site) => {
          const sansPosition = site.latitude == null || !site.zone_ville
          return (
            <li key={site.uid} className={`bg-white border rounded-2xl p-4 shadow-sm ${edition === site.uid ? 'sm:col-span-2' : ''} ${sansPosition ? 'border-amber-300' : 'border-line'}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><MapPin className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink flex flex-wrap items-center gap-1.5">
                    {site.nom}
                    {site.est_principal && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> Site principal
                      </span>
                    )}
                  </p>
                  <p className={`text-sm mt-0.5 ${sansPosition ? 'text-amber-700' : 'text-muted'}`}>
                    {[site.adresse, site.quartier, site.ville].filter(Boolean).join(', ') || 'Adresse à compléter'}
                    {sansPosition && ' · placez le site sur la carte'}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{site.nb_membres} compte(s) sur {site.max_membres}</p>
                </div>
                {estGestionnaire && edition !== site.uid && (
                  <div className="flex shrink-0 gap-3">
                    <button type="button" onClick={() => setEdition(site.uid)} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600" aria-label={`Modifier ${site.nom}`}>
                      <Pencil className="w-3.5 h-3.5" /> Modifier
                    </button>
                    {!site.est_principal && (
                      <button
                        type="button" disabled={retirer.isLoading} aria-label={`Retirer ${site.nom}`}
                        onClick={() => window.confirm(`Retirer le site « ${site.nom} » ? Ses demandes restent dans l’historique.`) && retirer.mutate(site.uid)}
                        className="inline-flex items-center gap-1 text-sm text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {edition === site.uid && <FormulaireSite site={site} onFermer={() => setEdition(null)} />}
            </li>
          )
        })}
      </ul>
      {edition === 'nouveau' && (
        <div className="bg-white border border-blue-200 rounded-2xl p-4 mt-3 shadow-sm">
          <p className="font-semibold text-ink">Nouveau site</p>
          <FormulaireSite onFermer={() => setEdition(null)} />
        </div>
      )}
    </section>
  )
}
