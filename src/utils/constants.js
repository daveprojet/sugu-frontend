export const METIERS = [
  { id: 'plombier',      label: 'Plombier',         icon: '🔧', description: 'Tuyauterie, sanitaires, fuites' },
  { id: 'electricien',   label: 'Électricien',       icon: '⚡', description: 'Installation, dépannage électrique' },
  { id: 'menuisier',     label: 'Menuisier',         icon: '🪵', description: 'Portes, fenêtres, mobilier' },
  { id: 'macon',         label: 'Maçon',             icon: '🧱', description: 'Construction, rénovation' },
  { id: 'peintre',       label: 'Peintre',           icon: '🎨', description: 'Intérieur, extérieur, décoration' },
  { id: 'carreleur',     label: 'Carreleur',         icon: '◼',  description: 'Pose de carrelage et dallage' },
  { id: 'climatisation', label: 'Climatisation',     icon: '❄️', description: 'Installation et maintenance clim' },
  { id: 'soudeur',       label: 'Soudeur',           icon: '🔩', description: 'Soudure, ferronnerie, portails' },
  { id: 'jardinier',     label: 'Jardinier',         icon: '🌿', description: 'Entretien jardin, espaces verts' },
  { id: 'menage',        label: 'Ménage',            icon: '🧹', description: 'Nettoyage, entretien maison' },
  { id: 'chauffeur',     label: 'Chauffeur',         icon: '🚗', description: 'Transport, livraison' },
  { id: 'informatique',  label: 'Technicien info',   icon: '💻', description: 'Réparation PC, réseau' },
]

export const QUARTIERS_DAKAR = [
  'Plateau', 'Médina', 'Fann', 'Point E', 'Mermoz',
  'Sacré-Cœur', 'Liberté', 'Grand Dakar', 'Biscuiterie',
  'Parcelles Assainies', 'Pikine', 'Guédiawaye', 'Rufisque',
  'Almadies', 'Ngor', 'Yoff', 'HLM', 'Grand Yoff',
  'Ouakam', 'Cambérène', 'Thiaroye', 'Mbao',
]

export const VILLES = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Kaolack',
  'Ziguinchor', 'Diourbel', 'Tambacounda', 'Louga',
  'Mbour', 'Touba', 'Kolda', 'Fatick',
]

export const STATUTS_DEMANDE = {
  EN_ATTENTE: { label: 'En attente',  color: 'bg-amber-100 text-amber-800' },
  ACCEPTEE:   { label: 'Acceptée',    color: 'bg-blue-100 text-blue-800' },
  EN_COURS:   { label: 'En cours',    color: 'bg-orange-100 text-orange-800' },
  TERMINEE:   { label: 'Terminée',    color: 'bg-green-100 text-green-800' },
  ANNULEE:    { label: 'Annulée',     color: 'bg-red-100 text-red-800' },
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
