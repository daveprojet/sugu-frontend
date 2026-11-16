import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useUploadArtisanPhoto } from "@/hooks/useArtisans";
import { compresserImage, TYPES_PHOTO_ACCEPTES } from "@/utils/images";

// Zone cliquable qui ouvre l'appareil photo ou la galerie, puis envoie la photo de
// profil de l'artisan connecté. children peut être une fonction ({ enCours }) => …
export default function ChoisirPhotoProfil({ children, className = "", ...props }) {
  const { user, fetchMe } = useAuth();
  const envoyer = useUploadArtisanPhoto();
  const [enCours, setEnCours] = useState(false);

  const choisir = async (e) => {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de reprendre la même photo après un échec
    if (!fichier || !user?.artisan_uid) return;
    setEnCours(true);
    try {
      const photo = await compresserImage(fichier);
      await envoyer.mutateAsync({ uid: user.artisan_uid, file: photo });
      await fetchMe();
    } catch (err) {
      // Les erreurs d'envoi sont déjà affichées par useUploadArtisanPhoto.
      if (!err?.response) toast.error(err?.message || "Photo inutilisable.");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <label
      className={`${className} ${enCours ? "pointer-events-none opacity-70" : "cursor-pointer"}`}
      aria-busy={enCours}
      {...props}
    >
      {typeof children === "function" ? children({ enCours }) : children}
      <input type="file" accept={TYPES_PHOTO_ACCEPTES} onChange={choisir} className="sr-only" disabled={enCours} />
    </label>
  );
}
