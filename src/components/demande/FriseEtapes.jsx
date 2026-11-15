import { Check, Ban } from "lucide-react";

// Avancement d'une demande de particulier, pour le client et pour l'artisan :
// une frise des étapes et une phrase qui dit qui doit agir et quoi faire.

const ETAPES = ["Envoyée", "Acceptée", "Prix", "Travaux", "Terminée", "Payée"];

const RANG = { EN_ATTENTE: 0, ACCEPTEE: 1, PRIX_FIXE: 2, EN_COURS: 3, TERMINEE: 4 };

/** Dernière étape atteinte (index dans ETAPES). */
export function etapeAtteinte(demande) {
  if (demande.statut === "TERMINEE" && demande.est_payee) return 5;
  return RANG[demande.statut] ?? 0;
}

/** Prochaine étape : { aVous, texte } du point de vue de `role` (client ou artisan). */
export function prochaineEtape(demande, role) {
  const client = role === "client";
  const especes = demande.mode_paiement === "especes";
  switch (demande.statut) {
    case "EN_ATTENTE":
      return client
        ? { aVous: false, texte: "En attente de la réponse de l’artisan." }
        : { aVous: true, texte: "Acceptez ou refusez cette demande." };
    case "ACCEPTEE":
      return client
        ? { aVous: false, texte: "L’artisan vous appelle pour convenir du prix (vous pouvez aussi l’appeler)." }
        : { aVous: true, texte: "Appelez le client pour convenir du prix, puis fixez-le." };
    case "PRIX_FIXE":
      return client
        ? { aVous: false, texte: "Prix fixé : l’artisan va démarrer les travaux." }
        : { aVous: true, texte: "Démarrez les travaux (photo avant)." };
    case "EN_COURS":
      return client
        ? { aVous: false, texte: "Travaux en cours." }
        : { aVous: true, texte: "Terminez les travaux (photo après)." };
    case "TERMINEE":
      if (!demande.est_payee) {
        if (demande.prix_total == null) return { aVous: false, texte: "Montant non fixé par l’artisan." };
        return client
          ? { aVous: true, texte: especes ? "Confirmez le montant payé en espèces." : "Réglez la prestation en ligne." }
          : { aVous: false, texte: especes ? "En attente de la confirmation du paiement par le client." : "En attente du paiement du client." };
      }
      if (client && !demande.avis_id) return { aVous: true, texte: "Laissez un avis sur l’artisan." };
      return { aVous: false, texte: "Prestation terminée et réglée." };
    default:
      return null;
  }
}

/** compact : points seuls (tableau sur ordinateur), sinon points et libellés. */
export default function FriseEtapes({ demande, role, compact = false, className = "" }) {
  if (demande.statut === "ANNULEE") {
    return (
      <p className={`inline-flex items-center gap-1.5 text-xs text-red-700 ${className}`}>
        <Ban className="w-3.5 h-3.5" /> Demande annulée
      </p>
    );
  }
  const atteinte = etapeAtteinte(demande);
  const suite = prochaineEtape(demande, role);

  return (
    <div className={className}>
      <ol className="flex items-start" aria-label={`Étape : ${ETAPES[atteinte]}`}>
        {ETAPES.map((libelle, i) => {
          const faite = i <= atteinte;
          return (
            <li key={libelle} className="flex-1 flex flex-col items-center relative min-w-0" title={libelle}>
              {i > 0 && (
                <span className={`absolute top-[9px] right-1/2 w-full h-0.5 ${i <= atteinte ? "bg-indigo-500" : "bg-gray-200"}`} />
              )}
              <span
                className={`relative z-[1] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < atteinte || atteinte === ETAPES.length - 1
                    ? "bg-indigo-500 text-white"
                    : i === atteinte
                    ? "bg-white border-2 border-indigo-500 text-indigo-600"
                    : "bg-white border-2 border-gray-200 text-gray-400"
                }`}
              >
                {i < atteinte || atteinte === ETAPES.length - 1 ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {!compact && (
                <span className={`mt-1 text-[10px] leading-tight text-center truncate max-w-full ${faite ? "text-ink font-semibold" : "text-muted"}`}>
                  {libelle}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {suite && (
        <p className={`mt-2 text-xs leading-snug ${suite.aVous ? "text-indigo-800" : "text-muted"}`}>
          {suite.aVous && (
            <span className="inline-block mr-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide align-[1px]">À vous</span>
          )}
          {suite.texte}
        </p>
      )}
    </div>
  );
}
