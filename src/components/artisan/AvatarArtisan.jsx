import { useState } from "react";

/**
 * Photo d'un artisan, avec ses initiales si la photo manque ou ne se charge pas
 * (évite le texte de remplacement « MAVO… » d'une image cassée).
 */
export default function AvatarArtisan({ artisan, taille = "w-12 h-12", texte = "text-[15px]", className = "" }) {
  const [enErreur, setEnErreur] = useState(false);
  const initiales = `${artisan?.prenom?.[0] || ""}${artisan?.nom?.[0] || ""}`;

  if (artisan?.photo && !enErreur) {
    return (
      <img
        src={artisan.photo}
        alt=""
        loading="lazy"
        onError={() => setEnErreur(true)}
        className={`${taille} rounded-full object-cover border border-line ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${taille} rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold uppercase ${texte} ${className}`}
    >
      {initiales}
    </div>
  );
}
