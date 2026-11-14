import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LocateFixed, Loader2 } from "lucide-react";
import { normalizeCoord } from "@/utils/geo";

/** Position actuelle du téléphone, demandée au clic (le client sait pourquoi). */
export function obtenirPosition() {
  return new Promise((resoudre, rejeter) => {
    if (!navigator.geolocation) {
      rejeter(new Error("Votre appareil ne permet pas de vous localiser : choisissez votre ville et votre quartier."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resoudre({
        latitude: normalizeCoord(pos.coords.latitude),
        longitude: normalizeCoord(pos.coords.longitude),
      }),
      (erreur) => rejeter(new Error(
        erreur.code === 1
          ? "Localisation refusée. Autorisez-la dans votre navigateur, ou choisissez votre ville et votre quartier."
          : "Position introuvable pour le moment. Réessayez, ou choisissez votre ville et votre quartier.",
      )),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export function urlAutour(position, categorie) {
  const params = new URLSearchParams({ autour: "1", lat: String(position.latitude), lng: String(position.longitude) });
  if (categorie) params.set("categorie", categorie);
  return `/artisans?${params.toString()}`;
}

/** « Autour de moi » : localise le client puis ouvre les artisans les plus proches. */
export default function BoutonAutour({ categorie = "", className = "", children = "Autour de moi" }) {
  const navigate = useNavigate();
  const [enCours, setEnCours] = useState(false);

  const chercher = async () => {
    setEnCours(true);
    try {
      navigate(urlAutour(await obtenirPosition(), categorie));
    } catch (erreur) {
      toast.error(erreur.message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <button type="button" onClick={chercher} disabled={enCours} className={`inline-flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}>
      {enCours ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
      {enCours ? "Localisation…" : children}
    </button>
  );
}
