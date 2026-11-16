import { Link } from "react-router-dom";
import { Award, Camera, Check, ChevronRight, IdCard, MapPin } from "lucide-react";
import ChoisirPhotoProfil from "@/components/artisan/ChoisirPhotoProfil";
import { texteBrut } from "@/components/common/TexteMisEnForme";

const TONS = {
  afaire: "bg-canvas text-muted",
  attente: "bg-amber-50 text-amber-700",
  refus: "bg-red-50 text-red-700",
};

function Etape({ fait, icone: Icone, titre, detail, statut, ton = "afaire", lien, photo, obligatoire }) {
  const contenu = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          fait ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
        }`}
      >
        {fait ? <Check className="h-4 w-4" /> : <Icone className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`flex flex-wrap items-center gap-x-2 text-sm font-semibold ${fait ? "text-muted line-through" : "text-ink"}`}>
          {titre}
          {obligatoire && !fait && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 no-underline">Obligatoire</span>
          )}
        </span>
        {!fait && detail && <span className="mt-0.5 block text-xs text-muted">{detail}</span>}
      </span>
      {!fait && statut && (
        <span className={`hidden shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex ${TONS[ton]}`}>
          {statut}
        </span>
      )}
      {!fait && <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />}
    </>
  );

  const classe = "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors";
  if (fait) return <li className={classe}>{contenu}</li>;
  return (
    <li>
      {photo ? (
        <ChoisirPhotoProfil className={`${classe} hover:bg-canvas-soft`}>
          {contenu}
        </ChoisirPhotoProfil>
      ) : (
        <Link to={lien} className={`${classe} hover:bg-canvas-soft`}>{contenu}</Link>
      )}
    </li>
  );
}

// Liste des étapes pour un profil complet. Masquée une fois tout terminé.
export default function CompleterProfil({ artisan, identite, dossierPro }) {
  const statutIdentite = identite?.statut;
  const etapes = [
    {
      cle: "identite",
      icone: IdCard,
      titre: "Pièce d'identité",
      obligatoire: true,
      fait: statutIdentite === "VERIFIEE",
      lien: "/mon-profil/identite",
      ...(statutIdentite === "EN_ATTENTE"
        ? { statut: "En vérification", ton: "attente", detail: "Vous serez visible dans la recherche après validation." }
        : statutIdentite === "REJETEE"
        ? { statut: "Refusée", ton: "refus", detail: `Envoyez une nouvelle pièce${identite.motif_rejet ? ` (motif : ${texteBrut(identite.motif_rejet)})` : ""}.` }
        : { statut: "À faire", detail: "Indispensable pour apparaître dans la recherche." }),
    },
    {
      cle: "photo",
      icone: Camera,
      titre: "Photo de profil",
      fait: Boolean(artisan?.photo),
      photo: true,
      statut: "À faire",
      detail: "Les clients font plus facilement confiance à un artisan dont ils voient le visage.",
    },
    {
      cle: "position",
      icone: MapPin,
      titre: "Position exacte sur la carte",
      fait: artisan?.position_renseignee !== false,
      lien: "/mon-profil#position",
      statut: "À faire",
      detail: "Pour apparaître au bon endroit et à la bonne distance des clients.",
    },
    {
      cle: "dossier",
      icone: Award,
      titre: "Dossier professionnel",
      fait: dossierPro?.statut === "VERIFIEE",
      lien: "/mon-profil/dossier",
      ...(dossierPro?.statut === "EN_ATTENTE"
        ? { statut: "En vérification", ton: "attente", detail: "Votre dossier est en cours de vérification." }
        : dossierPro?.statut === "REJETEE"
        ? { statut: "Refusé", ton: "refus", detail: `Dossier refusé${dossierPro.motif_rejet ? ` : ${texteBrut(dossierPro.motif_rejet)}` : ""}.` }
        : { statut: "À faire", detail: "Certificats et travaux réalisés, pour obtenir le badge « Vérifié »." }),
    },
  ];

  const faites = etapes.filter((e) => e.fait).length;
  if (faites === etapes.length) return null;
  const pourcentage = Math.round((faites / etapes.length) * 100);

  return (
    <section className="rounded-xl border border-line bg-white p-4 md:p-5" aria-labelledby="completer-profil-titre">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="completer-profil-titre" className="text-base font-bold text-ink">Complétez votre profil</h2>
          <p className="mt-0.5 text-xs text-muted">Un profil complet inspire confiance et reçoit plus facilement des demandes.</p>
        </div>
        <span className="shrink-0 text-sm font-bold text-indigo-700">{faites}/{etapes.length}</span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"
        role="progressbar"
        aria-valuenow={faites}
        aria-valuemin={0}
        aria-valuemax={etapes.length}
        aria-label="Progression du profil"
      >
        <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pourcentage}%` }} />
      </div>
      <ul className="mt-3 -mx-1 divide-y divide-line-soft">
        {etapes.map(({ cle, ...etape }) => <Etape key={cle} {...etape} />)}
      </ul>
    </section>
  );
}
