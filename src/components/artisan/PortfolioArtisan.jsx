import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { BadgeCheck, Images, X } from "lucide-react";
import { artisanService } from "@/services/api";

const dateCourte = (valeur) => (valeur
  ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(valeur))
  : "");

function Vignette({ src, alt, onOuvrir, etiquette }) {
  return (
    <button
      type="button" onClick={() => onOuvrir(src)} aria-label={`Agrandir : ${alt}`}
      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-canvas-soft group"
    >
      <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      {etiquette && (
        <span className="absolute left-1.5 top-1.5 text-[10px] font-semibold uppercase tracking-wide bg-black/60 text-white px-1.5 py-0.5 rounded">
          {etiquette}
        </span>
      )}
    </button>
  );
}

function AvantApres({ paires, onOuvrir }) {
  return (
    <ul className="grid gap-5">
      {paires.map((paire) => (
        <li key={paire.id}>
          <p className="text-sm text-muted mb-2">
            {[paire.metier, dateCourte(paire.date)].filter(Boolean).join(" · ")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Vignette src={paire.avant[0]} alt="Avant l’intervention" etiquette="Avant" onOuvrir={onOuvrir} />
            <Vignette src={paire.apres[0]} alt="Après l’intervention" etiquette="Après" onOuvrir={onOuvrir} />
          </div>
          {(paire.avant.length > 1 || paire.apres.length > 1) && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
              {[...paire.avant.slice(1).map((src) => [src, "Avant"]), ...paire.apres.slice(1).map((src) => [src, "Après"])].map(([src, etiquette]) => (
                <Vignette key={src} src={src} alt={`${etiquette} l’intervention`} etiquette={etiquette} onOuvrir={onOuvrir} />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Realisations({ realisations, onOuvrir }) {
  return (
    <ul className="grid gap-5">
      {realisations.map((realisation) => (
        <li key={realisation.id}>
          {realisation.libelle && <p className="text-sm text-muted mb-2">{realisation.libelle}</p>}
          <div className="grid grid-cols-3 gap-3">
            {realisation.images.map((src) => (
              <Vignette key={src} src={src} alt={realisation.libelle || "Réalisation"} onOuvrir={onOuvrir} />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Galerie du profil public : « Avant / après » (publiées avec l'accord du client) et
 * « Travaux réalisés » (dossier professionnel, artisans au badge « Vérifié »). */
export default function PortfolioArtisan({ uid }) {
  const { data } = useQuery(["artisan-portfolio", uid], () => artisanService.portfolio(uid).then((r) => r.data), {
    enabled: !!uid, staleTime: 60 * 1000,
  });
  const [onglet, setOnglet] = useState(null);
  const [ouverte, setOuverte] = useState(null);

  useEffect(() => {
    if (!ouverte) return undefined;
    const fermer = (e) => { if (e.key === "Escape") setOuverte(null); };
    document.addEventListener("keydown", fermer);
    return () => document.removeEventListener("keydown", fermer);
  }, [ouverte]);

  const paires = data?.avant_apres || [];
  const realisations = data?.realisations || [];
  const onglets = [
    paires.length > 0 && ["avant_apres", "Avant / après", paires.length],
    realisations.length > 0 && ["realisations", "Travaux réalisés", realisations.length],
  ].filter(Boolean);
  if (!onglets.length) return null;
  const actif = onglets.some(([cle]) => cle === onglet) ? onglet : onglets[0][0];

  return (
    <div className="bg-white rounded-xl border border-line p-6">
      <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <Images className="w-5 h-5" /> Réalisations
      </h2>
      <div className="inline-flex rounded-xl border border-line bg-canvas-soft p-1 mb-5" role="tablist">
        {onglets.map(([cle, libelle, nombre]) => (
          <button
            key={cle} type="button" role="tab" aria-selected={actif === cle} onClick={() => setOnglet(cle)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              actif === cle ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {libelle} <span className="opacity-60">({nombre})</span>
          </button>
        ))}
      </div>
      {actif === "avant_apres" && (
        <>
          <AvantApres paires={paires} onOuvrir={setOuverte} />
          <p className="text-xs text-muted mt-4">Photos publiées avec l’accord des clients.</p>
        </>
      )}
      {actif === "realisations" && (
        <>
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4 inline-flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4" /> Travaux vérifiés par l’équipe Bricolibe (badge « Vérifié »)
          </p>
          <Realisations realisations={realisations} onOuvrir={setOuverte} />
        </>
      )}
      {ouverte && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setOuverte(null)} role="dialog" aria-modal="true" aria-label="Photo agrandie"
        >
          <button type="button" aria-label="Fermer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <img src={ouverte} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
