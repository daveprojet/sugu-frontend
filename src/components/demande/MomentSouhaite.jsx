import { Zap, Clock } from "lucide-react";

/** Moment souhaité par le client (« dès que possible », « aujourd'hui à 15h30 »…), rien pour une ancienne demande. */
export default function MomentSouhaite({ demande, className = "" }) {
  const libelle = demande?.moment_libelle;
  if (!libelle) return null;
  const urgent = demande.moment_souhaite === "DES_QUE_POSSIBLE";
  const Icon = urgent ? Zap : Clock;
  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        urgent ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-800"
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      Souhaitée {libelle}
    </p>
  );
}
