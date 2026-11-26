import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "react-toastify";
import { extractApiError } from "@/utils/errors";
import { motion } from "framer-motion";
import PhoneField from "@/components/common/PhoneField";
import { User, Wrench, Lock, Check, Eye, EyeOff, MapPin, Info, ArrowLeft, ArrowRight } from "lucide-react";
import MapPicker from "@/components/common/MapPicker";
import ChampsZone from "@/components/common/ChampsZone";
import ChoixCategories from "@/components/common/ChoixCategories";
import { chercherZoneProche } from "@/hooks/useZones";
import { avecRedirection, redirectionDemandee } from "@/utils/redirection";
import { marquerRappelIdentiteVu } from "@/utils/rappelIdentite";

import bgImage from '/images/metiers/register-bg.webp';

const ETAPES_ARTISAN = ["Vos infos", "Votre métier", "Votre position"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const isArtisanFlow = params.get("role") === "artisan" || pathname === "/inscription-artisan";
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    whatsapp: "",
    whatsapp_identique: true,
    password: "",
    role: isArtisanFlow ? "artisan" : "client",
    categories: [],
    autres_metiers: "",
    quartier: "",
    ville: "Dakar",
    zone_ville: null,
    zone_quartier: null,
    bio: "",
    latitude: null,
    longitude: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Option « Autres » : métiers absents de la liste, validés ensuite par l'assistance.
  const [autresCoche, setAutresCoche] = useState(false);
  // Artisan : inscription en 3 étapes (le formulaire d'un seul tenant décourageait sur téléphone).
  const [etape, setEtape] = useState(1);
  const carteRef = useRef(null);
  const estArtisan = form.role === "artisan";
  const derniereEtape = !estArtisan || etape === ETAPES_ARTISAN.length;

  const allerA = (n) => {
    setEtape(n);
    carteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const metiersSaisis = () =>
    autresCoche ? form.autres_metiers.split(",").map((nom) => nom.trim()).filter(Boolean) : [];

  const metiersValides = () => {
    const autres = metiersSaisis();
    if (!form.categories.length && !autres.length) {
      toast.error("Choisissez au moins une catégorie ou indiquez votre métier dans « Autres ».");
      return false;
    }
    if (autres.length > 3) {
      toast.error("Indiquez au maximum 3 métiers dans « Autres ».");
      return false;
    }
    return true;
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCategoryChange = (catUid) => {
    const current = form.categories || [];
    if (current.includes(catUid)) {
      set("categories", current.filter((uid) => uid !== catUid));
    } else {
      set("categories", [...current, catUid]);
    }
  };

  const handlePositionChange = async ({ latitude, longitude, quartier, commune, noms, communes }) => {
    setForm((f) => ({
      ...f,
      latitude,
      longitude,
      quartier: quartier || f.quartier,
      ville: commune || f.ville,
    }));
    const zone = await chercherZoneProche(latitude, longitude, noms ?? [quartier], communes);
    if (zone.ville) {
      setForm((f) => ({ ...f, zone_ville: zone.ville.id, zone_quartier: zone.quartier?.id ?? null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Étapes intermédiaires : le navigateur a déjà vérifié les champs requis affichés.
    if (estArtisan && !derniereEtape) {
      if (etape === 2 && !metiersValides()) return;
      allerA(etape + 1);
      return;
    }
    const autresMetiers = metiersSaisis();
    if (form.role === "artisan") {
      if (!metiersValides()) {
        allerA(2);
        return;
      }
      if (form.latitude == null || form.longitude == null) {
        toast.error("Placez votre position sur la carte pour que les clients proches vous trouvent.");
        document.getElementById("position-artisan")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    setLoading(true);
    try {
      const { whatsapp_identique: whatsappIdentique, ...donnees } = form;
      await register({
        ...donnees,
        autres_metiers: autresMetiers,
        // Artisan : WhatsApp seulement s'il diffère du téléphone (sinon, le téléphone).
        whatsapp: form.role === "artisan" && !whatsappIdentique ? form.whatsapp : "",
      });
      toast.success("Compte créé avec succès !");
      // Un client venu d'une fiche artisan y retourne, formulaire de demande ouvert.
      const redirect = redirectionDemandee(params);
      if (form.role === "artisan") {
        // Écran de bienvenue : ajouter ses photos lui-même, ou tout envoyer sur WhatsApp
        // (pièce d'identité comprise) pour que l'assistance remplisse le profil. Le rappel
        // d'identité reste en place pour les connexions suivantes, masqué pour cette session.
        marquerRappelIdentiteVu();
        navigate("/bienvenue-artisan");
      } else {
        navigate(redirect || "/", { replace: !!redirect });
      }
    } catch (err) {
      toast.error(extractApiError(err, "Erreur lors de l'inscription"));
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
            
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-md">
            Créer un compte
          </h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium drop-shadow-sm">
            Rejoignez <span className="text-purple-300 font-semibold">Bricolibe</span> en quelques secondes
          </p>
        </div>

        {/* === LE FORMULAIRE EN EFFET "VITRE" (GLASSMORPHISM) === */}
        <div ref={carteRef} className="scroll-mt-24 bg-white/20 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30">
          
          {/* Toggle client / artisan - également en verre dépoli */}
          <div className="flex bg-white/20 backdrop-blur-sm p-1.5 rounded-2xl mb-6 relative">
            {[
              { key: "client", label: "Client", Icon: User },
              { key: "artisan", label: "Artisan", Icon: Wrench },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { set("role", key); setEtape(1); }}
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

          {estArtisan && (
            <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Étapes de l’inscription">
              {ETAPES_ARTISAN.map((titre, i) => {
                const n = i + 1;
                const faite = n < etape;
                return (
                  <li key={titre} aria-current={n === etape ? "step" : undefined}>
                    <button
                      type="button"
                      disabled={n >= etape}
                      onClick={() => allerA(n)}
                      className="w-full text-left disabled:cursor-default"
                    >
                      <span className={`block h-1.5 rounded-full transition-colors ${n <= etape ? "bg-white" : "bg-white/25"}`} />
                      <span className={`mt-2 flex items-center gap-1 text-xs font-semibold ${n <= etape ? "text-white" : "text-indigo-200/70"}`}>
                        {faite ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <span aria-hidden="true">{n}.</span>}
                        {titre}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {(!estArtisan || etape === 1) && (<>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Prénom <span className="text-red-300">*</span></label>
                <input
                  value={form.prenom}
                  onChange={(e) => set("prenom", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/90 border border-white/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="Ex. : Moussa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Nom <span className="text-red-300">*</span></label>
                <input
                  value={form.nom}
                  onChange={(e) => set("nom", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/90 border border-white/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="Ex. : Diallo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Téléphone <span className="text-red-300">*</span></label>
              <PhoneField
                variant="glass"
                value={form.telephone}
                onChange={(telephone) => set("telephone", telephone)}
                required
              />
              {form.role === "artisan" && (
                <>
                  <label className="flex items-center gap-2 text-sm text-indigo-100 ml-1 mt-2.5 cursor-pointer">
                    <input
                      type="checkbox" checked={form.whatsapp_identique}
                      onChange={(e) => set("whatsapp_identique", e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    C’est aussi mon numéro WhatsApp
                  </label>
                  {!form.whatsapp_identique && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Numéro WhatsApp <span className="text-red-300">*</span></label>
                      <PhoneField
                        variant="glass"
                        value={form.whatsapp}
                        onChange={(whatsapp) => set("whatsapp", whatsapp)}
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">Mot de passe <span className="text-red-300">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-white/90 border border-white/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  placeholder="6 caractères minimum"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400 hover:text-indigo-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            </>)}

            {/* Étape 2 : métier */}
            {estArtisan && etape === 2 && (
                <motion.div
                  key="etape-2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2">
                      Catégories (choix multiples) <span className="text-red-300">*</span>
                    </label>
                    <ChoixCategories
                      categories={categories}
                      selection={form.categories || []}
                      onToggle={handleCategoryChange}
                      autresCoche={autresCoche}
                      onToggleAutres={() => setAutresCoche((v) => !v)}
                    />
                    {autresCoche && (
                      <div className="mt-3">
                        <input
                          value={form.autres_metiers}
                          onChange={(e) => set("autres_metiers", e.target.value)}
                          maxLength={190}
                          placeholder="Ex. : Tapissier, Ferronnier"
                          className="w-full px-4 py-3 bg-white/90 border border-white/60 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50"
                        />
                        <p className="text-xs text-indigo-200 mt-1.5 ml-1">
                          Votre métier n'est pas dans la liste ? Indiquez-le (3 au maximum, séparés par des virgules).
                          Il apparaîtra sur Bricolibe après validation par notre équipe.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                      Présentation (optionnel)
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/90 border border-white/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm resize-none"
                      placeholder="Décrivez votre expérience, vos spécialités..."
                    />
                  </div>
                </motion.div>
            )}

            {/* Étape 3 : position */}
            {estArtisan && etape === 3 && (
                <motion.div
                  key="etape-3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <label id="position-artisan" className="block text-sm font-medium text-indigo-200 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Votre position géographique <span className="text-red-300">*</span>
                    </label>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-200 leading-relaxed">
                          Obligatoire : cliquez sur la carte, utilisez « Ma position » ou tapez votre
                          adresse puis choisissez une suggestion. Elle correspond à l&apos;endroit où vous
                          travaillez ou habitez habituellement.
                        </p>
                      </div>
                    </div>
                    <MapPicker
                      value={
                        form.latitude && form.longitude
                          ? { latitude: form.latitude, longitude: form.longitude }
                          : null
                      }
                      onChange={handlePositionChange}
                    />
                  </div>

                  <p className="-mb-2 text-xs text-indigo-200 ml-1">
                    Ville et quartier se remplissent depuis la carte ; corrigez-les si besoin.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ChampsZone
                      zoneVille={form.zone_ville}
                      zoneQuartier={form.zone_quartier}
                      onChange={(zone) => setForm((f) => ({ ...f, ...zone }))}
                      labelClass="block text-sm font-medium text-indigo-200 mb-2 ml-1"
                      champClass="w-full px-4 py-3 bg-white/90 border border-white/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                    />
                  </div>

                </motion.div>
            )}

            {!derniereEtape && (
              <div className="flex gap-3 mt-2">
                {etape > 1 && (
                  <button
                    type="button"
                    onClick={() => allerA(etape - 1)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Retour
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200"
                >
                  Continuer <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {derniereEtape && (<>
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

            <div className="flex gap-3 mt-4">
            {estArtisan && (
              <button
                type="button"
                onClick={() => allerA(etape - 1)}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Retour
              </button>
            )}
            <motion.button
              type="submit"
              disabled={loading || !acceptedTerms}
              aria-describedby={!acceptedTerms ? "aide-cgu" : undefined}
              whileHover={acceptedTerms && !loading ? { scale: 1.02, y: -2 } : undefined}
              whileTap={acceptedTerms && !loading ? { scale: 0.98 } : undefined}
              className="flex-1 whitespace-nowrap py-3.5 px-3 sm:px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 disabled:opacity-40 disabled:saturate-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>
            {!acceptedTerms && (
              <p id="aide-cgu" className="-mt-2 text-center text-xs text-indigo-200">
                Cochez la case ci-dessus pour pouvoir créer votre compte.
              </p>
            )}
            </>)}
          </form>

          <p className="text-center text-sm text-indigo-200 mt-6 pt-6 border-t border-white/30">
            Déjà un compte ?{" "}
            <Link
              to={avecRedirection("/connexion", params)}
              className="text-white font-semibold hover:text-purple-200  hover:underline transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}