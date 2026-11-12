import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Camera, Upload, X } from "lucide-react";
import CameraCapture from "@/components/common/CameraCapture";
import { TYPE_PIECES, validateIdentityFile } from "@/utils/helpers";

const labelClass = "block text-sm font-medium text-indigo-200 mb-2 ml-1";

function Apercu({ fichier, onRetirer, libelle }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!fichier) return undefined;
    const lien = URL.createObjectURL(fichier);
    setUrl(lien);
    return () => URL.revokeObjectURL(lien);
  }, [fichier]);
  if (!url) return null;
  return (
    <div className="relative flex-shrink-0">
      <img src={url} alt={libelle} className="h-32 w-28 rounded-lg border border-white/40 object-cover" />
      <button
        type="button" onClick={onRetirer} aria-label={`Retirer ${libelle}`}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ChampPhoto({ libelle, aide, fichier, onChange, camera }) {
  const choisir = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const erreur = validateIdentityFile(file);
    if (erreur) {
      toast.error(erreur);
      return;
    }
    onChange(file);
  };
  return (
    <div>
      <label className={labelClass}>{libelle} <span className="text-red-300">*</span></label>
      {aide && <p className="text-xs text-indigo-200 mb-2 ml-1">{aide}</p>}
      <div className="flex items-start gap-3">
        {camera ? (
          <button
            type="button" onClick={camera}
            className="flex-1 flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/20 text-indigo-100 transition"
          >
            <Camera className="w-7 h-7 mb-1.5" />
            <span className="text-sm font-medium">{fichier ? "Reprendre la photo" : "Prendre la photo avec la caméra"}</span>
          </button>
        ) : (
          <label className="flex-1 flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/20 text-indigo-100 cursor-pointer transition">
            <Upload className="w-7 h-7 mb-1.5" />
            <span className="text-sm font-medium">{fichier ? fichier.name : "Choisir une photo"}</span>
            <span className="text-xs text-indigo-200 mt-1">JPG, PNG — 5 Mo maximum</span>
            <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={choisir} className="hidden" />
          </label>
        )}
        <Apercu fichier={fichier} libelle={libelle} onRetirer={() => onChange(null)} />
      </div>
    </div>
  );
}

/** 2e étape de la candidature artisan : la pièce d'identité, comme pour les artisans indépendants.
 * L'équipe la contrôle en étudiant la candidature. */
export default function EtapePieceIdentite({ piece, onChange }) {
  const [cameraOuverte, setCameraOuverte] = useState(false);
  const versoRequis = piece.type_piece !== "passeport";
  const set = (cle, valeur) => onChange({ ...piece, [cle]: valeur });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-indigo-100 px-1">
        Dernière étape : votre pièce d’identité. Notre équipe la vérifie en étudiant votre candidature ; vous n’aurez rien
        à renvoyer une fois votre compte créé.
      </p>
      <div>
        <label className={labelClass}>Type de pièce</label>
        <select
          value={piece.type_piece} onChange={(e) => set("type_piece", e.target.value)}
          className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {TYPE_PIECES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <ChampPhoto
        libelle={versoRequis ? "Recto" : "Page d’identité (avec la photo)"}
        fichier={piece.piece_recto} onChange={(f) => set("piece_recto", f)}
      />
      {versoRequis && <ChampPhoto libelle="Verso" fichier={piece.piece_verso} onChange={(f) => set("piece_verso", f)} />}
      <ChampPhoto
        libelle="Selfie avec la pièce à côté du visage"
        aide="Prenez une photo de vous avec votre pièce d’identité visible à côté de votre visage."
        fichier={piece.piece_selfie} onChange={(f) => set("piece_selfie", f)}
        camera={() => setCameraOuverte(true)}
      />
      {cameraOuverte && (
        <CameraCapture
          onCapture={(fichier) => { set("piece_selfie", fichier); setCameraOuverte(false); }}
          onClose={() => setCameraOuverte(false)}
        />
      )}
    </div>
  );
}
