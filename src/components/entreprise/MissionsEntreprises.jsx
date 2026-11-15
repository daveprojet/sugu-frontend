import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { dateHeure, STATUTS_MISSION } from '@/hooks/useEntreprises'

/** Liste des missions entreprises de l'artisan (page « Missions entreprises »). */
export default function ListeMissions({ missions }) {
  return (
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
                  {mission.nb_reprises > 0 && mission.statut !== 'TERMINEE' && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700">Reprise</span>
                  )}
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
  )
}
