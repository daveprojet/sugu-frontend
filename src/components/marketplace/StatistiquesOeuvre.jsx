import { useState } from 'react'
import { useQuery } from 'react-query'
import { Eye, MessageCircle, Phone } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import Modale from '@/components/common/Modale'
import Spinner from '@/components/common/Spinner'

const jourCourt = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

function Tuile({ icone: Icone, libelle, valeur }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted"><Icone className="h-3.5 w-3.5" aria-hidden="true" />{libelle}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{valeur}</p>
    </div>
  )
}

/** Histogramme des vues par jour (une série, bleu du logo, info-bulle au survol). */
function HistogrammeVues({ jours }) {
  const [survol, setSurvol] = useState(null)
  const max = Math.max(1, ...jours.map((j) => j.vues))
  const graduations = [max, Math.round(max / 2), 0]
  return (
    <figure className="mt-5">
      <figcaption className="mb-2 text-sm font-semibold text-ink">Vues par jour · 30 derniers jours</figcaption>
      <div className="relative flex gap-2">
        <div className="flex h-36 flex-col justify-between text-right text-[10px] text-muted" aria-hidden="true">
          {graduations.map((g) => <span key={g}>{g}</span>)}
        </div>
        <div className="relative h-36 flex-1 border-b border-line">
          {/* Grille discrète */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-line-soft" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line-soft" aria-hidden="true" />
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {jours.map((j, i) => (
              <div key={j.jour} className="flex h-full flex-1 items-end" onMouseEnter={() => setSurvol(i)} onMouseLeave={() => setSurvol(null)}
                onFocus={() => setSurvol(i)} onBlur={() => setSurvol(null)} tabIndex={0} aria-label={`${jourCourt(j.jour)} : ${j.vues} vues`}>
                <div className="w-full rounded-t-[4px] bg-indigo-600 transition-opacity"
                  style={{ height: `${(j.vues / max) * 100}%`, minHeight: j.vues ? 2 : 0, opacity: survol === null || survol === i ? 1 : 0.45 }} />
              </div>
            ))}
          </div>
          {survol !== null && (
            <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow"
              style={{ left: `${((survol + 0.5) / jours.length) * 100}%` }}>
              <b>{jourCourt(jours[survol].jour)}</b> · {jours[survol].vues} vue{jours[survol].vues > 1 ? 's' : ''}
              <span className="block text-white/80">{jours[survol].whatsapp} WhatsApp · {jours[survol].appels} appel{jours[survol].appels > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-6 text-[10px] text-muted" aria-hidden="true">
        <span>{jourCourt(jours[0].jour)}</span><span>{jourCourt(jours[jours.length - 1].jour)}</span>
      </div>
      {/* Données en tableau pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>Vues et contacts par jour</caption>
        <thead><tr><th>Jour</th><th>Vues</th><th>WhatsApp</th><th>Appels</th></tr></thead>
        <tbody>{jours.map((j) => <tr key={j.jour}><td>{jourCourt(j.jour)}</td><td>{j.vues}</td><td>{j.whatsapp}</td><td>{j.appels}</td></tr>)}</tbody>
      </table>
    </figure>
  )
}

export default function StatistiquesOeuvre({ oeuvre, onClose }) {
  const { data, isLoading, error } = useQuery(['mp-stats', oeuvre.uid], () => marketplaceService.statistiques(oeuvre.uid).then((r) => r.data), { retry: false })
  return (
    <Modale titre="Statistiques" onClose={onClose} largeur="max-w-xl">
      <p className="mb-4 text-sm text-muted">« {oeuvre.titre} »</p>
      {isLoading ? <div className="flex justify-center py-10"><Spinner /></div>
        : error ? <p className="text-sm text-muted">{error?.response?.data?.detail || 'Statistiques indisponibles.'}</p>
          : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Tuile icone={Eye} libelle="Vues" valeur={data.totaux.vues} />
                <Tuile icone={MessageCircle} libelle="WhatsApp" valeur={data.totaux.whatsapp} />
                <Tuile icone={Phone} libelle="Appels" valeur={data.totaux.appels} />
              </div>
              <HistogrammeVues jours={data.jours} />
            </>
          )}
    </Modale>
  )
}
