import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { BadgeCheck, ChevronLeft, ChevronRight, Images, Loader2, X } from "lucide-react";
import { artisanService } from "@/services/api";

// Galerie du profil public. Pour rester légère même avec beaucoup de photos :
// 6 éléments par onglet puis « Voir plus » (page suivante demandée au serveur),
// vignettes en miniatures (480 px, générées côté serveur, chargées au défilement),
// et les originaux seulement dans la visionneuse, une photo à la fois.

const dateCourte = (valeur) => (valeur
  ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(valeur))
  : "");

function Vignette({ photo, alt, etiquette, plus = 0, onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={`Agrandir : ${alt}`}
      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-canvas-soft group"
    >
      <img
        src={photo.miniature || photo.url} alt={alt} loading="lazy" decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
      />
      {etiquette && (
        <span className="absolute left-1.5 top-1.5 text-[10px] font-semibold uppercase tracking-wide bg-black/60 text-white px-1.5 py-0.5 rounded">
          {etiquette}
        </span>
      )}
      {plus > 0 && (
        <span className="absolute right-1.5 bottom-1.5 text-xs font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
          +{plus}
        </span>
      )}
    </button>
  );
}

/** Visionneuse plein écran : une seule photo (l'original) chargée à la fois. */
function Visionneuse({ photos, depart, onFermer }) {
  const [index, setIndex] = useState(depart);
  const total = photos.length;
  const aller = useCallback((pas) => setIndex((i) => (i + pas + total) % total), [total]);

  useEffect(() => {
    const touche = (e) => {
      if (e.key === "Escape") onFermer();
      else if (e.key === "ArrowRight") aller(1);
      else if (e.key === "ArrowLeft") aller(-1);
    };
    document.addEventListener("keydown", touche);
    return () => document.removeEventListener("keydown", touche);
  }, [aller, onFermer]);

  const photo = photos[index];
  const fleche = "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center";
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={onFermer} role="dialog" aria-modal="true" aria-label="Photo agrandie"
    >
      <button type="button" aria-label="Fermer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
        <X className="w-5 h-5" />
      </button>
      <img key={photo.url} src={photo.url} alt={photo.etiquette || ""} className="max-h-[85vh] max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
      {total > 1 && (
        <>
          <button type="button" aria-label="Photo précédente" className={`${fleche} left-3`} onClick={(e) => { e.stopPropagation(); aller(-1); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button type="button" aria-label="Photo suivante" className={`${fleche} right-3`} onClick={(e) => { e.stopPropagation(); aller(1); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/90 bg-black/50 px-3 py-1 rounded-full">
        {[photo.etiquette, total > 1 && `${index + 1} / ${total}`].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}

function AvantApres({ paires, onOuvrir }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-5">
      {paires.map((paire) => {
        const photos = [
          ...paire.avant.map((p) => ({ ...p, etiquette: "Avant" })),
          ...paire.apres.map((p) => ({ ...p, etiquette: "Après" })),
        ];
        const debutApres = paire.avant.length;
        return (
          <li key={paire.id}>
            <p className="text-sm text-muted mb-2">
              {[paire.metier, dateCourte(paire.date)].filter(Boolean).join(" · ")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Vignette
                photo={paire.avant[0]} alt="Avant l’intervention" etiquette="Avant"
                plus={paire.avant.length - 1} onClick={() => onOuvrir(photos, 0)}
              />
              <Vignette
                photo={paire.apres[0]} alt="Après l’intervention" etiquette="Après"
                plus={paire.apres.length - 1} onClick={() => onOuvrir(photos, debutApres)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const VIGNETTES_PAR_REALISATION = 3;

function Realisations({ realisations, onOuvrir }) {
  return (
    <ul className="grid gap-5">
      {realisations.map((realisation) => {
        const photos = realisation.images.map((p) => ({ ...p, etiquette: realisation.libelle }));
        const visibles = realisation.images.slice(0, VIGNETTES_PAR_REALISATION);
        const reste = realisation.images.length - visibles.length;
        return (
          <li key={realisation.id}>
            {realisation.libelle && <p className="text-sm text-muted mb-2">{realisation.libelle}</p>}
            <div className="grid grid-cols-3 gap-2">
              {visibles.map((photo, i) => (
                <Vignette
                  key={photo.url} photo={photo} alt={realisation.libelle || "Réalisation"}
                  plus={i === visibles.length - 1 ? reste : 0} onClick={() => onOuvrir(photos, i)}
                />
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Galerie du profil public : « Avant / après » et « Travaux réalisés » (badge « Vérifié »). */
export default function PortfolioArtisan({ uid }) {
  const { data } = useQuery(["artisan-portfolio", uid], () => artisanService.portfolio(uid).then((r) => r.data), {
    enabled: !!uid, staleTime: 60 * 1000,
  });
  const [onglet, setOnglet] = useState(null);
  const [visionneuse, setVisionneuse] = useState(null);
  // Pages chargées avec « Voir plus », par onglet : { resultats, suivant }.
  const [suites, setSuites] = useState({});
  const [chargement, setChargement] = useState(false);

  useEffect(() => { setSuites({}); }, [data]);

  const fermer = useCallback(() => setVisionneuse(null), []);
  const ouvrir = useCallback((photos, depart) => setVisionneuse({ photos, depart }), []);

  if (!data) return null;
  const etat = (cle) => {
    const premiere = data[cle] || { resultats: [], total: 0, suivant: null };
    const suite = suites[cle];
    return {
      resultats: [...premiere.resultats, ...(suite?.resultats || [])],
      total: premiere.total,
      suivant: suite ? suite.suivant : premiere.suivant,
    };
  };
  const onglets = [
    ["avant_apres", "Avant / après"],
    ["realisations", "Travaux réalisés"],
  ].map(([cle, libelle]) => ({ cle, libelle, ...etat(cle) })).filter((o) => o.total > 0);
  if (!onglets.length) return null;
  const actif = onglets.find((o) => o.cle === onglet) || onglets[0];

  const voirPlus = async () => {
    setChargement(true);
    try {
      const { data: page } = await artisanService.portfolio(uid, { onglet: actif.cle, page: actif.suivant });
      setSuites((s) => ({
        ...s,
        [actif.cle]: { resultats: [...(s[actif.cle]?.resultats || []), ...page.resultats], suivant: page.suivant },
      }));
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-line p-6">
      <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        <Images className="w-5 h-5" /> Réalisations
      </h2>
      {onglets.length > 1 && (
        <div className="inline-flex rounded-xl border border-line bg-canvas-soft p-1 mb-5" role="tablist">
          {onglets.map((o) => (
            <button
              key={o.cle} type="button" role="tab" aria-selected={actif.cle === o.cle} onClick={() => setOnglet(o.cle)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                actif.cle === o.cle ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {o.libelle} <span className="opacity-60">({o.total})</span>
            </button>
          ))}
        </div>
      )}
      {actif.cle === "avant_apres" && <AvantApres paires={actif.resultats} onOuvrir={ouvrir} />}
      {actif.cle === "realisations" && (
        <>
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4 inline-flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4" /> Travaux vérifiés par l’équipe Bricolibe (badge « Vérifié »)
          </p>
          <Realisations realisations={actif.resultats} onOuvrir={ouvrir} />
        </>
      )}
      {actif.suivant && (
        <div className="mt-5 text-center">
          <button
            type="button" onClick={voirPlus} disabled={chargement}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-canvas-soft disabled:opacity-60"
          >
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            Voir plus ({actif.total - actif.resultats.length})
          </button>
        </div>
      )}
      {visionneuse && <Visionneuse photos={visionneuse.photos} depart={visionneuse.depart} onFermer={fermer} />}
    </div>
  );
}
