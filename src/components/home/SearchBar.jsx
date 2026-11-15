import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Search, Briefcase, Building2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useZones } from "@/hooks/useZones";
import SelectRecherche from "@/components/common/SelectRecherche";
import BoutonAutour from "@/components/common/BoutonAutour";

export default function SearchBar() {
  const [ville, setVille] = useState("");
  const [quartier, setQuartier] = useState("");
  const [categorie, setCategorie] = useState("");
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: zones = [] } = useZones();
  const villeChoisie = zones.find((v) => String(v.id) === ville);

  // Changer de ville rend le quartier choisi caduc.
  const handleVille = (valeur) => {
    setVille(valeur);
    setQuartier("");
  };

const handleSearch = (e) => {
  e.preventDefault();
  const params = new URLSearchParams();

  if (categorie) {
    params.set("categorie", categorie);
  }

  if (ville) {
    params.set("ville", ville);
    if (quartier) params.set("quartier", quartier);
  }

  navigate(`/artisans?${params.toString()}`);
};


  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-line shadow-2xl shadow-gray-200/60 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3"
    >
      <div className="relative min-w-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#F97316]-500">
          <Briefcase className="w-5 h-5" />
        </div>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border border-line rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
        >
          <option value="">Type de depannage ?</option>
          {categories.map((c) => (
            <option key={c.uid} value={c.uid}>{c.nom}</option>
          ))}
        </select>
      </div>

      <div className="relative min-w-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#F97316]-500">
          <Building2 className="w-5 h-5" />
        </div>
        <select
          value={ville}
          onChange={(e) => handleVille(e.target.value)}
          aria-label="Ville"
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border border-line rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
        >
          <option value="">Quelle ville ?</option>
          {zones.map((v) => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
      </div>

      <div className="relative min-w-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#F97316]-500">
          <MapPin className="w-5 h-5" />
        </div>
        <SelectRecherche
          value={quartier}
          onChange={setQuartier}
          disabled={!villeChoisie}
          ariaLabel="Quartier"
          placeholderRecherche="Rechercher un quartier…"
          options={[
            { value: "", label: villeChoisie ? "Tous les quartiers" : "Choisissez d'abord une ville" },
            ...(villeChoisie?.quartiers || []).map((q) => ({ value: String(q.id), label: q.nom })),
          ]}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 border border-line rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 md:px-10 bg-gradient-to-r from-[#F97316] -600 to- [#1256CC]-600 hover:from-[#F97316] -700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 whitespace-nowrap"
      >
        <Search className="w-5 h-5" />
        Chercher
      </motion.button>

      {/* Sans remplir ville ni quartier : les artisans les plus proches (métier facultatif) */}
      <BoutonAutour
        categorie={categorie}
        className="sm:col-span-2 lg:col-span-4 w-full py-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 transition-colors"
      >
        Autour de moi
      </BoutonAutour>
    </form>
  );
}
