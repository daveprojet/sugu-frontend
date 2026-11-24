import { useQuery } from 'react-query'
import CadreEntreprise from '@/components/espace/CadreEntreprise'
import SitesEntreprise from '@/components/entreprise/SitesEntreprise'
import { entrepriseService } from '@/services/api'

/** Sites de l'entreprise (siège, agences, entrepôts) : chaque demande concerne un site. */
export default function SitesEntreprisePage() {
  const { data } = useQuery('membres-entreprise', () => entrepriseService.membres().then((r) => r.data))
  return (
    <CadreEntreprise
      titre="Sites"
      sousTitre="Siège, agences, entrepôts : l’ouvrier le plus proche du site concerné est envoyé en priorité."
    >
      <SitesEntreprise estGestionnaire={Boolean(data?.est_gestionnaire)} />
    </CadreEntreprise>
  )
}
