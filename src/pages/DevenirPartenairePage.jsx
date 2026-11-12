import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Building2, Wrench, Check, CheckCircle2, UserCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useArtisan } from "@/hooks/useArtisans";
import { partenaireService } from "@/services/api";
import { useCategories } from "@/hooks/useCategories";
import { VILLES } from "@/utils/constants";
import { extractApiError } from "@/utils/errors";
import PhoneField from "@/components/common/PhoneField";

import bgImage from "/images/metiers/register-bg.jpg";

const inputClass =
  "w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-white/40 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm";
const labelClass = "block text-sm font-medium text-indigo-200 mb-2 ml-1";

const PROFILS = [
  {
    key: "ENTREPRISE",
    label: "Je suis une entreprise",
    Icon: Building2,
    intro:
      "Hôtel, agence, syndic, commerce… Confiez vos interventions aux artisans Bricolibe, sélectionnés et suivis par notre équipe.",
  },
  {
    key: "ARTISAN",
    label: "Je suis un artisan",
    Icon: Wrench,
    intro:
      "Rejoignez les artisans Bricolibe et intervenez pour nos entreprises partenaires. Notre équipe étudie votre candidature et vous recontacte.",
  },
];

const SECTEURS = [
  "Hôtellerie / Restauration",
  "Immobilier / Syndic",
  "Commerce",
  "Bureaux / Services",
  "Santé",
  "Éducation",
  "Industrie",
  "Autre",
];

const initialForm = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  ville: "Dakar",
  quartier: "",
  raison_sociale: "",
  secteur: "",
  categories: [],
  annees_experience: "",
  message: "",
};

export default function DevenirPartenairePage() {
  const { data: categories = [] } = useCategories();
  const { user, isArtisan } = useAuth();
  const [type, setType] = useState("ENTREPRISE");
  const [form, setForm] = useState(initialForm);
  // Artisan connecté : « compte » (candidature avec son compte actuel) ou
  // « nouveau » (futur compte distinct, donc avec un autre numéro).
  const [modeCompte, setModeCompte] = useState(null);
  // Profil de l'artisan connecté : ses métiers et sa zone sont pré-remplis.
  const { data: profil_artisan } = useArtisan(isArtisan ? user?.artisan_uid : null);
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const choisirMode = (mode) => {
    setModeCompte(mode);
    setForm(
      mode === "compte"
        ? { ...initialForm, prenom: user.prenom || "", nom: user.nom || "", telephone: user.telephone || "" }
        : initialForm,
    );
  };
  const avecMonCompte = isArtisan && modeCompte === "compte";

  useEffect(() => {
    if (!avecMonCompte || !profil_artisan) return;
    setType("ARTISAN");
    setForm((f) => ({
      ...f,
      categories: f.categories.length
        ? f.categories
        : (profil_artisan.categories || []).map((cat) => cat.uid).filter(Boolean),
      ville: VILLES.includes(profil_artisan.ville) ? profil_artisan.ville : f.ville,
      quartier: f.quartier || profil_artisan.quartier || "",
    }));
  }, [avecMonCompte, profil_artisan]);
  const isEntreprise = type === "ENTREPRISE";
  const profil = PROFILS.find((p) => p.key === type);

  const toggleCategorie = (uid) =>
    set(
      "categories",
      form.categories.includes(uid)
        ? form.categories.filter((c) => c !== uid)
        : [...form.categories, uid],
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEntreprise && form.categories.length === 0) {
      toast.error("Choisissez au moins un métier.");
      return;
    }
    setLoading(true);
    try {
      await partenaireService.candidater({
        ...form,
        avec_mon_compte: avecMonCompte,
        type_partenaire: type,
        annees_experience: form.annees_experience === "" ? null : Number(form.annees_experience),
      });
      setEnvoye(true);
    } catch (err) {
      toast.error(extractApiError(err, "Impossible d'envoyer votre candidature"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-indigo-600/60 to-purple-800/75 mix-blend-multiply" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-md">
            Devenir partenaire
          </h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium drop-shadow-sm">
            Travaillons ensemble avec <span className="text-purple-300 font-semibold">Bricolibe</span>
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30">
          {envoye ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-14 h-14 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Candidature envoyée</h2>
              <p className="text-indigo-100 mb-6">
                Merci {form.prenom} ! Notre équipe étudie votre demande et vous recontacte au{" "}
                <span className="font-semibold text-white">{form.telephone}</span>.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 rounded-xl bg-white text-indigo-800 font-semibold shadow-sm hover:bg-indigo-50 transition"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : isArtisan && !modeCompte ? (
            <div className="flex flex-col gap-4">
              <p className="text-indigo-100 text-sm px-1">
                Vous êtes connecté avec votre compte artisan ({user.telephone}). Comment souhaitez-vous continuer ?
              </p>
              <button
                type="button"
                onClick={() => choisirMode("compte")}
                className="flex items-start gap-3 text-left p-4 rounded-2xl bg-white/30 border border-white/40 hover:bg-white/40 transition"
              >
                <UserCheck className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <span>
                  <span className="block font-semibold text-white">Continuer avec ce compte</span>
                  <span className="block text-sm text-indigo-100">
                    Votre candidature est liée à votre compte actuel et à votre numéro.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => choisirMode("nouveau")}
                className="flex items-start gap-3 text-left p-4 rounded-2xl bg-white/10 border border-white/30 hover:bg-white/20 transition"
              >
                <UserPlus className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <span>
                  <span className="block font-semibold text-white">Créer un autre compte</span>
                  <span className="block text-sm text-indigo-100">
                    Un numéro ne peut être lié qu'à un seul compte : il vous faudra un autre numéro de téléphone.
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <>
              {isArtisan && (
                <p className="text-indigo-100 text-xs mb-4 px-1">
                  {avecMonCompte
                    ? "Candidature avec votre compte actuel."
                    : "Nouveau compte : indiquez un autre numéro que celui de votre compte actuel."}{" "}
                  <button type="button" onClick={() => setModeCompte(null)} className="underline text-white">
                    Changer
                  </button>
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/20 backdrop-blur-sm p-1.5 rounded-2xl mb-4">
                {PROFILS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    aria-pressed={type === key}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      type === key
                        ? "bg-white shadow-sm text-indigo-800"
                        : "text-indigo-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-indigo-100 text-sm mb-6 px-1">{profil.intro}</p>
              {isEntreprise && (
                <p className="text-sm mb-6 px-4 py-3 rounded-xl bg-white/15 text-white">
                  Dès que votre candidature est acceptée, votre espace entreprise est créé et vous recevez un SMS.
                  Vous y décrivez vos besoins en ligne (jusqu'à 5 comptes pour votre équipe) : un inspecteur Bricolibe
                  envoie les artisans et contrôle leur travail. Déjà un compte ?{" "}
                  <Link to="/connexion" className="font-semibold underline">Connectez-vous</Link>.
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {isEntreprise && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nom de l'entreprise</label>
                      <input
                        value={form.raison_sociale}
                        onChange={(e) => set("raison_sociale", e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Hôtel Teranga"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Secteur d'activité</label>
                      <select
                        value={form.secteur}
                        onChange={(e) => set("secteur", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Choisir…</option>
                        {SECTEURS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{isEntreprise ? "Prénom du contact" : "Prénom"}</label>
                    <input
                      value={form.prenom}
                      onChange={(e) => set("prenom", e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Awa"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{isEntreprise ? "Nom du contact" : "Nom"}</label>
                    <input
                      value={form.nom}
                      onChange={(e) => set("nom", e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Ndiaye"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    {avecMonCompte ? (
                      <input value={form.telephone} readOnly className={`${inputClass} opacity-80`} />
                    ) : (
                      <PhoneField
                        variant="glass"
                        value={form.telephone}
                        onChange={(telephone) => set("telephone", telephone)}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>E-mail {isEntreprise ? "" : "(optionnel)"}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required={isEntreprise}
                      className={inputClass}
                      placeholder="contact@exemple.sn"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ville</label>
                    <select
                      value={form.ville}
                      onChange={(e) => set("ville", e.target.value)}
                      className={inputClass}
                    >
                      {VILLES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Quartier (optionnel)</label>
                    <input
                      value={form.quartier}
                      onChange={(e) => set("quartier", e.target.value)}
                      className={inputClass}
                      placeholder="Plateau"
                    />
                  </div>
                </div>

                {!isEntreprise && (
                  <>
                    <div>
                      <label className={labelClass}>Vos métiers</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white/10 p-3 rounded-2xl border border-white/20">
                        {categories.map((cat) => {
                          const checked = form.categories.includes(cat.uid);
                          return (
                            <label
                              key={cat.uid}
                              className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200 border ${
                                checked
                                  ? "bg-white/40 border-white/50 text-indigo-900"
                                  : "border-transparent text-indigo-100 hover:bg-white/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={() => toggleCategorie(cat.uid)}
                              />
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  checked ? "bg-indigo-600 border-indigo-600" : "border-white/60"
                                }`}
                              >
                                {checked && <Check className="w-3 h-3 text-white" />}
                              </span>
                              {cat.nom}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="sm:w-1/2">
                      <label className={labelClass}>Années d'expérience (optionnel)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={form.annees_experience}
                        onChange={(e) => set("annees_experience", e.target.value)}
                        className={inputClass}
                        placeholder="5"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelClass}>
                    {isEntreprise ? "Vos besoins (optionnel)" : "Parlez-nous de vous (optionnel)"}
                  </label>
                  <textarea
                    rows="4"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder={
                      isEntreprise
                        ? "Types d'interventions, fréquence, nombre de sites…"
                        : "Vos réalisations, vos disponibilités…"
                    }
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-white text-indigo-800 font-semibold shadow-lg hover:bg-indigo-50 transition disabled:opacity-60"
                >
                  {loading ? "Envoi…" : "Envoyer ma candidature"}
                </motion.button>
              </form>

              {!isEntreprise && !isArtisan && (
                <p className="text-center text-indigo-200 text-xs mt-6">
                  Vous préférez travailler en indépendant ?{" "}
                  <Link to="/inscription-artisan" className="underline text-white hover:text-indigo-100">
                    Créez directement votre compte artisan
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
