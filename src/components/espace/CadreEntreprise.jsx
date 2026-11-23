import { Building2, CreditCard, Inbox, LayoutDashboard, MapPin, Plus, UsersRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTableauEntreprise } from '@/hooks/useEntreprises'
import EspaceLayout from './EspaceLayout'

/** Cadre de toutes les pages de l'espace entreprise : menu latéral et compteurs d'actions. */
export default function CadreEntreprise({ titre, sousTitre, actions, children }) {
  const { user } = useAuth()
  const { data: tableau } = useTableauEntreprise()
  const compteurs = tableau?.compteurs || {}
  const aFaire = (compteurs.devis_a_repondre || 0) + (compteurs.pv_a_signer || 0) + (compteurs.a_noter || 0)
  const liens = [
    { to: '/espace-entreprise', label: 'Tableau de bord', Icon: LayoutDashboard, exact: true, compteur: aFaire },
    { to: '/espace-entreprise/demandes', label: 'Demandes', Icon: Inbox, compteur: compteurs.en_cours },
    { to: '/espace-entreprise/nouvelle-demande', label: 'Nouvelle demande', Icon: Plus },
    { to: '/espace-entreprise/abonnement', label: 'Abonnement', Icon: CreditCard, compteur: tableau?.formule?.a_payer ? 1 : 0 },
    { to: '/espace-entreprise/sites', label: 'Sites', Icon: MapPin },
    { to: '/espace-entreprise/equipe', label: 'Équipe et profil', Icon: UsersRound },
  ]
  const marque = {
    titre: user?.entreprise?.raison_sociale || 'Mon entreprise',
    sousTitre: tableau?.responsable_de_site ? `Responsable · ${tableau.responsable_de_site}` : 'Espace entreprise',
    Icon: Building2,
  }
  return (
    <EspaceLayout marque={marque} liens={liens} titre={titre} sousTitre={sousTitre} actions={actions}>
      {children}
    </EspaceLayout>
  )
}
