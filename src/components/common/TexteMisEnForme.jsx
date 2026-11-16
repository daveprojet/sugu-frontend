// Affiche un message rédigé par l'équipe (motif de rejet) :
// **gras**, _italique_, lignes « - » en liste, sauts de ligne conservés.
// Rendu en éléments React : aucun HTML venu du texte n'est interprété.

const MARQUES = /\*\*([^\n]+?)\*\*|_([^\n_]+?)_/g;
const PUCE = /^\s*[-•]\s+/;

// Récursif : « **_mot_** » donne du gras italique.
function enLigne(texte) {
  const morceaux = [];
  let position = 0;
  for (const trouve of texte.matchAll(MARQUES)) {
    if (trouve.index > position) morceaux.push(texte.slice(position, trouve.index));
    morceaux.push(
      trouve[1] !== undefined
        ? <strong key={trouve.index} className="font-bold">{enLigne(trouve[1])}</strong>
        : <em key={trouve.index}>{enLigne(trouve[2])}</em>
    );
    position = trouve.index + trouve[0].length;
  }
  if (position < texte.length) morceaux.push(texte.slice(position));
  return morceaux;
}

function decouper(texte) {
  const blocs = [];
  for (const ligne of (texte || "").replace(/\r\n?/g, "\n").split("\n")) {
    const dernier = blocs[blocs.length - 1];
    if (!ligne.trim()) {
      blocs.push(null);
    } else if (PUCE.test(ligne)) {
      if (dernier?.type === "liste") dernier.lignes.push(ligne.replace(PUCE, ""));
      else blocs.push({ type: "liste", lignes: [ligne.replace(PUCE, "")] });
    } else if (dernier?.type === "paragraphe") {
      dernier.lignes.push(ligne);
    } else {
      blocs.push({ type: "paragraphe", lignes: [ligne] });
    }
  }
  return blocs.filter(Boolean);
}

// Résumé court, sans marques : la première ligne du message (le titre du motif).
export function texteBrut(texte) {
  const premiere = (texte || "").split(/\r?\n/).find((ligne) => ligne.trim()) || "";
  return premiere.replace(PUCE, "").replace(/\*\*([^\n]+?)\*\*/g, "$1").replace(/_([^\n_]+?)_/g, "$1").trim();
}

export default function TexteMisEnForme({ texte, className = "" }) {
  return (
    <div className={`space-y-1.5 break-words ${className}`}>
      {decouper(texte).map((bloc, index) =>
        bloc.type === "liste" ? (
          <ul key={index} className="list-disc space-y-0.5 pl-5">
            {bloc.lignes.map((ligne, i) => <li key={i}>{enLigne(ligne)}</li>)}
          </ul>
        ) : (
          <p key={index}>
            {bloc.lignes.map((ligne, i) => <span key={i}>{i > 0 && <br />}{enLigne(ligne)}</span>)}
          </p>
        )
      )}
    </div>
  );
}
