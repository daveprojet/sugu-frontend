import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

// Ignore la casse et les accents : « electricite » trouve « Électricité ».
const normaliser = (texte) =>
  (texte || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

function Option({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-sm font-medium leading-snug transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        active
          ? "border-white/50 bg-white/40 text-indigo-900 shadow-sm"
          : "border-transparent text-indigo-100 hover:border-white/40 hover:bg-white/20"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          active ? "border-indigo-600 bg-indigo-600" : "border-white/60"
        }`}
        aria-hidden="true"
      >
        {active && <Check className="h-3 w-3 text-white" />}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </button>
  );
}

// Sélection multiple des métiers d'un artisan, en liste filtrable (une colonne sur mobile).
// La saisie des « autres » métiers reste à la charge de la page.
export default function ChoixCategories({ categories, selection, onToggle, autresCoche, onToggleAutres }) {
  const [recherche, setRecherche] = useState("");

  const visibles = useMemo(() => {
    const terme = normaliser(recherche);
    if (!terme) return categories;
    return categories.filter((cat) => normaliser(cat.nom).includes(terme));
  }, [categories, recherche]);

  const nbChoisis = selection.length + (autresCoche ? 1 : 0);

  return (
    <div className="rounded-2xl border border-white/30 bg-white/10 p-3 backdrop-blur-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un métier…"
          aria-label="Rechercher un métier"
          className="w-full rounded-xl border border-white/40 bg-white/40 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {recherche && (
          <button
            type="button"
            onClick={() => setRecherche("")}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-600 hover:bg-white/40"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 grid max-h-72 grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
        {visibles.map((cat) => (
          <Option key={cat.uid} active={selection.includes(cat.uid)} onClick={() => onToggle(cat.uid)}>
            {cat.nom}
          </Option>
        ))}
        {visibles.length === 0 && (
          <p className="py-1 text-sm sm:col-span-2 text-indigo-100">
            Aucun métier ne correspond. Choisissez « Autres » pour l'indiquer.
          </p>
        )}
        <Option active={autresCoche} onClick={onToggleAutres}>Autres</Option>
      </div>

      <p className="mt-2 text-xs text-indigo-200" aria-live="polite">
        {nbChoisis === 0
          ? "Aucun métier sélectionné"
          : `${nbChoisis} métier${nbChoisis > 1 ? "s" : ""} sélectionné${nbChoisis > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
