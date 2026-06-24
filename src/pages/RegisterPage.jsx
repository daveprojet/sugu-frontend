import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { METIERS, QUARTIERS_DAKAR, VILLES } from "@/utils/constants";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Wrench,
  Phone,
  Lock,
  Check,
} from "lucide-react";

// 1. IMPORT DE L'IMAGE DE FOND
import bgImage from '/images/metiers/register-bg.jpg';

// Mapping des icônes métier
const metierIconMap = {
  plombier: Wrench,
  electricien: Wrench, 
  macon: Wrench,
  peintre: Wrench,
  menuisier: Wrench,
  couvreur: Wrench,
  climaticien: Wrench,
  vitrier: Wrench,
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const isArtisanFlow = params.get("role") === "artisan" || pathname === "/inscription-artisan";

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    password: "",
    role: isArtisanFlow ? "artisan" : "client",
    metier: [],
    quartier: "",
    ville: "Dakar",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleMetierChange = (metierId) => {
    const currentMetiers = form.metier || [];
    if (currentMetiers.includes(metierId)) {
      set("metier", currentMetiers.filter((id) => id !== metierId));
    } else {
      set("metier", [...currentMetiers, metierId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Compte créé avec succès !");
      navigate(form.role === "artisan" ? "/dashboard-artisan" : "/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Animation d'entrée en douceur
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* === IMAGE DE FOND AVEC OVERLAY VIOLET/BLEU PROFOND === */}
      <div className="absolute inset-0 -z-10">
        <img 
          src={bgImage} 
          alt="Arrière-plan" 
          className="w-full h-full object-cover"
        />
        {/* Overlay dégradé pour créer l'ambiance derrière la vitre */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-indigo-600/60 to-purple-800/75 mix-blend-multiply" />
      </div>
      {/* ========================================== */}

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-md">
            Créer un compte
          </h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium drop-shadow-sm">
            Rejoignez <span className="text-purple-300 font-semibold">Sugu.sn</span> en quelques secondes
          </p>
        </div>

        {/* === LE FORMULAIRE EN EFFET "VITRE" (GLASSMORPHISM) === */}
        <div className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30">
          
          {/* Toggle client / artisan - également en verre dépoli */}
          <div className="flex bg-white/20 backdrop-blur-sm p-1.5 rounded-2xl mb-6 relative">
            {[
              { key: "client", label: "Client", Icon: User },
              { key: "artisan", label: "Artisan", Icon: Wrench },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => set("role", key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  form.role === key
                    ? "bg-white shadow-sm text-indigo-800 scale-105"
                    : "text-indigo-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Prénom</label>
                <input
                  value={form.prenom}
                  onChange={(e) => set("prenom", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="Moussa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Nom</label>
                <input
                  value={form.nom}
                  onChange={(e) => set("nom", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="Diallo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => set("telephone", e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="6 caractères minimum"
                />
              </div>
            </div>

            {/* Champs artisan avec animation */}
            <AnimatePresence>
              {form.role === "artisan" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-5 overflow-hidden pt-2 border-t border-white/30"
                >
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                      Métiers (choix multiples)
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 border border-white/30 rounded-2xl max-h-48 overflow-y-auto bg-white/10 backdrop-blur-sm">
                      {METIERS.map((m) => {
                        const Icon = metierIconMap[m.id] || Wrench;
                        const isChecked = form.metier?.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                              isChecked
                                ? "bg-white/40 border-white/50 shadow-sm text-indigo-900"
                                : "bg-transparent border-transparent hover:border-white/40 hover:bg-white/20 text-indigo-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMetierChange(m.id)}
                              className="w-4 h-4 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-400 accent-indigo-500 bg-white/20"
                            />
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{m.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                        Quartier
                      </label>
                      <select
                        value={form.quartier}
                        onChange={(e) => set("quartier", e.target.value)}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm appearance-none"
                      >
                        <option value="">Sélectionnez un quartier</option>
                        {QUARTIERS_DAKAR.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                        Ville
                      </label>
                      <select
                        value={form.ville}
                        onChange={(e) => set("ville", e.target.value)}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm appearance-none"
                      >
                        {VILLES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                      Présentation (optionnel)
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm resize-none"
                      placeholder="Décrivez votre expérience, vos spécialités..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="flex items-start gap-3 text-sm text-indigo-200">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-400 accent-indigo-500 bg-white/20"
              />
              <span>
                J&apos;accepte les{" "}
                <Link to="/cgu" target="_blank" className="text-white font-semibold hover:text-purple-200 hover:underline transition-colors">
                  Conditions Générales d&apos;Utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/confidentialite" target="_blank" className="text-white font-semibold hover:text-purple-200 hover:underline transition-colors">
                  Politique de Confidentialité
                </Link>
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={loading || !acceptedTerms}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Créer mon compte
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-indigo-200 mt-6 pt-6 border-t border-white/30">
            Déjà un compte ?{" "}
            <Link
              to="/connexion"
              className="text-white font-semibold hover:text-purple-200 hover:underline transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}