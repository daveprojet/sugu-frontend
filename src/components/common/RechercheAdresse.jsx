import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { rechercherAdresses } from "@/utils/photon";

const LONGUEUR_MIN = 3;
const DELAI_SAISIE_MS = 350;

export default function RechercheAdresse({ onSelect }) {
  const [texte, setTexte] = useState("");
  const [resultats, setResultats] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [actif, setActif] = useState(-1);
  const conteneurRef = useRef(null);
  // Après un choix, le texte affiché ne doit pas relancer une recherche.
  const choixRef = useRef(false);

  useEffect(() => {
    if (choixRef.current) {
      choixRef.current = false;
      return undefined;
    }
    const recherche = texte.trim();
    setErreur(false);
    if (recherche.length < LONGUEUR_MIN) {
      setResultats([]);
      setChargement(false);
      return undefined;
    }

    const controleur = new AbortController();
    setChargement(true);
    const minuteur = setTimeout(async () => {
      try {
        const trouves = await rechercherAdresses(recherche, controleur.signal);
        setResultats(trouves);
        setActif(-1);
        setOuvert(true);
        setChargement(false);
      } catch (e) {
        if (e.name === "AbortError") return;
        setResultats([]);
        setErreur(true);
        setOuvert(true);
        setChargement(false);
      }
    }, DELAI_SAISIE_MS);

    return () => {
      clearTimeout(minuteur);
      controleur.abort();
    };
  }, [texte]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const fermerSiDehors = (e) => {
      if (!conteneurRef.current?.contains(e.target)) setOuvert(false);
    };
    document.addEventListener("mousedown", fermerSiDehors);
    return () => document.removeEventListener("mousedown", fermerSiDehors);
  }, [ouvert]);

  const choisir = (resultat) => {
    choixRef.current = true;
    setTexte(resultat.nom);
    setOuvert(false);
    setResultats([]);
    onSelect(resultat.latitude, resultat.longitude);
  };

  const gererClavier = (e) => {
    if (e.key === "Enter") {
      // Le champ est dans le formulaire d'inscription : Entrée ne doit jamais l'envoyer.
      e.preventDefault();
      if (ouvert && resultats.length) choisir(resultats[Math.max(actif, 0)]);
    } else if (e.key === "ArrowDown" && resultats.length) {
      e.preventDefault();
      setOuvert(true);
      setActif((i) => (i + 1) % resultats.length);
    } else if (e.key === "ArrowUp" && resultats.length) {
      e.preventDefault();
      setActif((i) => (i <= 0 ? resultats.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOuvert(false);
    }
  };

  const afficherListe = ouvert && texte.trim().length >= LONGUEUR_MIN && !chargement;

  return (
    <div className="relative" ref={conteneurRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      <input
        type="text"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onFocus={() => setOuvert(true)}
        onKeyDown={gererClavier}
        placeholder="Rechercher un quartier, un lieu ou une adresse"
        autoComplete="off"
        role="combobox"
        aria-label="Rechercher une adresse"
        aria-expanded={afficherListe}
        aria-controls="resultats-adresse"
        aria-autocomplete="list"
        className="w-full pl-9 pr-9 py-2.5 bg-canvas-soft border border-line rounded-lg text-ink text-sm placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150"
      />
      {chargement && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
      )}

      {afficherListe && (
        <ul
          id="resultats-adresse"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-[1100] bg-white border border-line rounded-lg shadow-lg overflow-hidden"
        >
          {erreur && (
            <li className="px-3 py-2.5 text-xs text-muted">
              La recherche est indisponible pour le moment. Cliquez directement sur la carte.
            </li>
          )}
          {!erreur && !resultats.length && (
            <li className="px-3 py-2.5 text-xs text-muted">
              Aucun résultat. Essayez un autre nom ou cliquez directement sur la carte.
            </li>
          )}
          {resultats.map((resultat, index) => (
            <li key={resultat.cle} role="option" aria-selected={index === actif}>
              <button
                type="button"
                onClick={() => choisir(resultat)}
                onMouseEnter={() => setActif(index)}
                className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors ${
                  index === actif ? "bg-indigo-50" : "bg-white"
                }`}
              >
                <MapPin className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">{resultat.nom}</span>
                  {resultat.details && (
                    <span className="block text-xs text-muted truncate">{resultat.details}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
