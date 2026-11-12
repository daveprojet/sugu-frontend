import { Link } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { dateHeure, STATUTS_MISSION, useMissions } from '@/hooks/useEntreprises'

/** Encart du tableau de bord artisan : missions entreprises à accepter ou en cours. */
export default function MissionsEntreprises() {
  const { data: missions = [] } = useMissions('en_cours')
  if (!missions.length) return null
  const aRepondre = missions.filter((m) => m.statut === 'PROPOSEE').length

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xl font-bold text-ink flex items-center gap-2"><Building2 className="w-5 h-5" /> Missions entreprises</h2>
        {aRepondre > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
            {aRepondre} à accepter
          </span>
        )}
      </div>
      <ul className="grid gap-3">
        {missions.map((mission) => {
          const statut = STATUTS_MISSION[mission.statut] || { label: mission.statut, classe: '' }
          return (
            <li key={mission.uid}>
              <Link
                to={`/dashboard-artisan/missions-entreprises/${mission.uid}`}
                className={`flex items-center gap-4 bg-white border rounded-2xl p-4 transition-all hover:shadow-sm ${
                  mission.statut === 'PROPOSEE' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-line'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{mission.demande.entreprise}</span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.classe}`}>{statut.label}</span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {mission.metier} · {mission.demande.ville} · {dateHeure(mission.heure_prevue)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted shrink-0" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
