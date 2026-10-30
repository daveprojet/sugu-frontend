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
  PRIX_FIXE:  { label: 'Prix fixé',   color: 'bg-purple-100 text-purple-800' },
  EN_COURS:   { label: 'En cours',    color: 'bg-orange-100 text-orange-800' },
  TERMINEE:   { label: 'Terminée',    color: 'bg-green-100 text-green-800' },
  ANNULEE:    { label: 'Annulée',     color: 'bg-red-100 text-red-800' },
}

export const STATUTS_IDENTITE = {
  EN_ATTENTE: { label: 'En attente de vérification', color: 'bg-amber-100 text-amber-800' },
  VERIFIEE:   { label: 'Vérifiée',                   color: 'bg-emerald-100 text-emerald-800' },
  REJETEE:    { label: 'Rejetée',                     color: 'bg-red-100 text-red-800' },
}

// Un client ne signale qu'un artisan qui a pris en charge sa demande.
export const STATUTS_DEMANDE_SIGNALABLE = ['ACCEPTEE', 'PRIX_FIXE', 'EN_COURS', 'TERMINEE']

export const MOTIFS_SIGNALEMENT = [
  { value: 'TRAVAIL_NON_EXECUTE', label: 'Travail non exécuté' },
  { value: 'TRAVAIL_MAL_FAIT', label: 'Travail mal fait' },
  { value: 'DOMMAGE', label: 'Dommage matériel' },
  { value: 'ABSENCE_RETARD', label: 'Absence ou retard' },
  { value: 'PRIX', label: 'Désaccord sur le prix' },
  { value: 'COMPORTEMENT', label: 'Comportement inapproprié' },
  { value: 'FRAUDE', label: 'Fraude ou arnaque' },
  { value: 'AUTRE', label: 'Autre' },
]

export const METHODES_PAYTECH = [
  { value: 'Orange Money', label: 'Orange Money' },
  { value: 'Wave', label: 'Wave' },
  { value: 'Free Money', label: 'Free Money' },
  { value: 'Carte Bancaire', label: 'Carte Bancaire' },
]

export const PROFILS_DOSSIER = [
  { value: 'PROFESSIONNEL', label: 'Professionnel (attestation, certificat et CV)' },
  { value: 'NON_PROFESSIONNEL', label: 'Non professionnel (historique sur Bricolibe)' },
]

export const TYPES_DOCUMENT_PRO = [
  { value: 'ATTESTATION', label: 'Attestation de travaux' },
  { value: 'CERTIFICAT',  label: 'Certificat / diplôme' },
  { value: 'CV',          label: 'CV' },
  { value: 'REALISATION', label: 'Photo de réalisation' },
  { value: 'AUTRE',       label: 'Autre justificatif' },
]

export const METIER_TO_CATEGORIE_NOM = {
  plombier: 'Plomberie',
  electricien: 'Électricité',
  menuisier: 'Menuiserie',
  macon: 'Maçonnerie',
  peintre: 'Peinture',
  carreleur: 'Carrelage',
  climatisation: 'Climatisation',
  soudeur: 'Soudure',
  jardinier: 'Jardinage',
  menage: 'Ménage',
  chauffeur: null,
  informatique: 'Informatique',
}

export const API_BASE_URL = import.meta.env.VITE_API_URL
