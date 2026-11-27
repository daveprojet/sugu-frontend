import { API_BASE_URL } from "./constants";
console.log("🔍 API_BASE_URL =", API_BASE_URL);
const BACKEND_ORIGIN = API_BASE_URL.replace("/api", "");

export const TYPE_PIECES = [
  { value: "cni", label: "Carte nationale d'identité (CNI)" },
  { value: "passeport", label: "Passeport" },
  { value: "permis", label: "Permis de conduire" },
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${BACKEND_ORIGIN}${path}`;
  return `${BACKEND_ORIGIN}/${path}`;
}

export function validateIdentityFile(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Seuls les fichiers JPG, JPEG et PNG sont acceptés.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Le fichier ne doit pas dépasser 5 Mo.";
  }
  return null;
}

/**
 * Nom affiché proprement : un nom saisi tout en majuscules (« PABOCHA PANGOU »)
 * passe en « Pabocha Pangou » ; un nom déjà en casse mixte reste tel quel.
 */
export function nomPropre(texte) {
  const t = (texte || "").trim();
  if (!t || t !== t.toUpperCase() || t === t.toLowerCase()) return t;
  return t.toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (_, sep, lettre) => sep + lettre.toUpperCase());
}

/** « Prénom Nom » d'un artisan ou d'un utilisateur, en casse propre. */
export function nomComplet(personne) {
  return [personne?.prenom, personne?.nom].map(nomPropre).filter(Boolean).join(" ");
}

/** 45000 → « 45 000 FCFA ». */
export function prixFCFA(montant) {
  return `${new Intl.NumberFormat('fr-FR').format(montant || 0).replace(/ | /g, ' ')} FCFA`;
}
