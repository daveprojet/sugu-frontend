import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Building2, Wrench, Check, CheckCircle2, UserCheck, UserPlus, MapPin, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useArtisan, useIdentite } from "@/hooks/useArtisans";
import { partenaireService } from "@/services/api";
import { useCategories } from "@/hooks/useCategories";
import { chercherZoneProche } from "@/hooks/useZones";
import { VILLES } from "@/utils/constants";
import { extractApiError } from "@/utils/errors";
import PhoneField from "@/components/common/PhoneField";
import MapPicker from "@/components/common/MapPicker";
import ChampsZone from "@/components/common/ChampsZone";
import EtapePieceIdentite from "@/components/partenaire/EtapePieceIdentite";

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
  autres_metiers: "",
  annees_experience: "",
  message: "",
  latitude: null,
  longitude: null,
  zone_ville: null,
  zone_quartier: null,
  password: "",
  confirmation: "",
};

const pieceVide = { type_piece: "cni", piece_recto: null, piece_verso: null, piece_selfie: null };

function Etapes({ etape }) {
  return (
    <ol className="grid grid-cols-2 gap-2 mb-6 text-sm">
      {["Vos informations", "Pièce d’identité"].map((libelle, index) => {
        const courante = etape === index + 1;
        const faite = etape > index + 1;
        return (
          <li
            key={libelle}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              courante ? "bg-white text-indigo-800 border-white" : "border-white/30 text-indigo-100"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              courante ? "bg-indigo-600 text-white" : faite ? "bg-emerald-400 text-white" : "bg-white/20"
            }`}>
              {faite ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>
            {libelle}
          </li>
        );
      })}
    </ol>
  );
}

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
  // Candidature artisan en deux étapes : informations, puis pièce d'identité.
  const [etape, setEtape] = useState(1);
  const [piece, setPiece] = useState(pieceVide);
  // Option « Autres » : métiers absents de la liste, validés ensuite par l'équipe.
  const [autresCoche, setAutresCoche] = useState(false);
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);

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
  // Artisan connecté qui a déjà envoyé sa pièce d'identité : pas de 2e étape.
  const { data: identiteExistante } = useIdentite(avecMonCompte ? user?.artisan_uid : null);
  const pieceDejaFournie = avecMonCompte && Boolean(identiteExistante?.recto);

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
  const avecEtapePiece = !isEntreprise && !pieceDejaFournie;
  // Artisan sans compte : il choisit son mot de passe pour se connecter dès l'acceptation.
  const avecMotDePasse = !isEntreprise && !avecMonCompte;

  const changerType = (nouveau) => {
    setType(nouveau);
    setEtape(1);
  };

  const handlePositionChange = async ({ latitude, longitude, quartier, commune, noms, communes }) => {
    setForm((f) => ({
      ...f, latitude, longitude, quartier: quartier || f.quartier,
      ville: VILLES.includes(commune) ? commune : f.ville,
    }));
    const zone = await chercherZoneProche(latitude, longitude, noms ?? [quartier], communes);
    if (zone.ville) {
      setForm((f) => ({ ...f, zone_ville: zone.ville.id, zone_quartier: zone.quartier?.id ?? null }));
    }
  };

  const autresMetiers = () => (autresCoche
    ? form.autres_metiers.split(",").map((nom) => nom.trim()).filter(Boolean)
    : []);

  const toggleCategorie = (uid) =>
    set(
      "categories",
      form.categories.includes(uid)
        ? form.categories.filter((c) => c !== uid)
        : [...form.categories, uid],
    );

  const informationsValides = () => {
    if (isEntreprise) return true;
    const autres = autresMetiers();
    if (form.categories.length === 0 && autres.length === 0) {
      toast.error("Choisissez au moins un métier ou indiquez-le dans « Autres ».");
      return false;
    }
    if (autres.length > 3) {
      toast.error("Indiquez au maximum 3 métiers dans « Autres ».");
      return false;
    }
    if (avecMotDePasse) {
      if (form.password.length < 6) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères.");
        return false;
      }
      if (form.password !== form.confirmation) {
        toast.error("Les deux mots de passe ne correspondent pas.");
        return false;
      }
    }
    if (!avecMonCompte && (form.latitude == null || form.longitude == null)) {
      toast.error("Placez votre position sur la carte.");
      document.getElementById("position-partenaire")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const pieceValide = () => {
    const manquantes = [
      !piece.piece_recto && "le recto",
      piece.type_piece !== "passeport" && !piece.piece_verso && "le verso",
      !piece.piece_selfie && "le selfie avec la pièce",
    ].filter(Boolean);
    if (manquantes.length) {
      toast.error(`Photo manquante : ${manquantes.join(", ")}.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (etape === 1) {
      if (!informationsValides()) return;
      if (avecEtapePiece) {
        setEtape(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } else if (!pieceValide()) {
      return;
    }
    setLoading(true);
    try {
      const { confirmation, password, ...champs } = form;
      const donnees = {
        ...champs,
        password: avecMotDePasse ? password : "",
        avec_mon_compte: avecMonCompte,
        type_partenaire: type,
        annees_experience: form.annees_experience === "" ? null : Number(form.annees_experience),
        autres_metiers: isEntreprise ? [] : autresMetiers(),
      };
      if (avecEtapePiece) {
        Object.assign(donnees, piece);
        if (piece.type_piece === "passeport") donnees.piece_verso = null;
      }
      await partenaireService.candidater(donnees);
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
                {type === "ARTISAN" && !avecMonCompte && (
                  <> Dès qu’elle est acceptée, vous recevez un SMS et vous vous connectez avec ce numéro et votre mot de passe.</>
                )}
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
                    onClick={() => changerType(key)}
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
              {avecEtapePiece && <Etapes etape={etape} />}
              {isEntreprise && (
                <p className="text-sm mb-6 px-4 py-3 rounded-xl bg-white/15 text-white">
                  Dès que votre candidature est acceptée, votre espace entreprise est créé et vous recevez un SMS.
                  Vous y décrivez vos besoins en ligne (jusqu'à 5 comptes pour votre équipe) : un inspecteur Bricolibe
                  envoie les artisans et contrôle leur travail. Déjà un compte ?{" "}
                  <Link to="/connexion" className="font-semibold underline">Connectez-vous</Link>.
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {etape === 2 ? (
                  <EtapePieceIdentite piece={piece} onChange={setPiece} />
                ) : (
                <>
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

                {avecMotDePasse && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Mot de passe <span className="text-red-300">*</span></label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={voirMotDePasse ? "text" : "password"}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                          minLength={6}
                          required
                          className={`${inputClass} pl-10 pr-11`}
                          placeholder="6 caractères minimum"
                        />
                        <button
                          type="button" onClick={() => setVoirMotDePasse((v) => !v)}
                          aria-label={voirMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                        >
                          {voirMotDePasse ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Confirmez le mot de passe <span className="text-red-300">*</span></label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={voirMotDePasse ? "text" : "password"}
                          autoComplete="new-password"
                          value={form.confirmation}
                          onChange={(e) => set("confirmation", e.target.value)}
                          required
                          className={`${inputClass} pl-10`}
                          placeholder="Le même mot de passe"
                        />
                      </div>
                    </div>
                    <p className="sm:col-span-2 text-xs text-indigo-200 -mt-2 ml-1">
                      Vous vous connecterez avec votre numéro et ce mot de passe dès que votre candidature sera acceptée.
                    </p>
                  </div>
                )}

                {(isEntreprise || avecMonCompte) && (
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
                )}

                {!isEntreprise && !avecMonCompte && (
                  <div>
                    <label id="position-partenaire" className={`${labelClass} flex items-center gap-2`}>
                      <MapPin className="w-4 h-4" /> Votre position <span className="text-red-300">*</span>
                    </label>
                    <p className="text-xs text-indigo-200 mb-2 ml-1">
                      Cliquez sur la carte, utilisez « Ma position » ou tapez votre adresse : l’endroit où vous
                      travaillez ou habitez habituellement. L’inspecteur s’en sert pour vous confier des missions proches.
                    </p>
                    <MapPicker
                      value={form.latitude && form.longitude ? { latitude: form.latitude, longitude: form.longitude } : null}
                      onChange={handlePositionChange}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <ChampsZone
                        zoneVille={form.zone_ville}
                        zoneQuartier={form.zone_quartier}
                        onChange={(zone) => setForm((f) => ({ ...f, ...zone }))}
                        labelClass={labelClass}
                        champClass={inputClass}
                      />
                    </div>
                  </div>
                )}

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
                        <label
                          className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200 border ${
                            autresCoche ? "bg-white/40 border-white/50 text-indigo-900" : "border-transparent text-indigo-100 hover:bg-white/20"
                          }`}
                        >
                          <input type="checkbox" className="sr-only" checked={autresCoche} onChange={() => setAutresCoche((v) => !v)} />
                          <span className={`w-4 h-4 rounded flex items-center justify-center border ${
                            autresCoche ? "bg-indigo-600 border-indigo-600" : "border-white/60"
                          }`}>
                            {autresCoche && <Check className="w-3 h-3 text-white" />}
                          </span>
                          Autres
                        </label>
                      </div>
                      {autresCoche && (
                        <div className="mt-3">
                          <input
                            value={form.autres_metiers}
                            onChange={(e) => set("autres_metiers", e.target.value)}
                            maxLength={190}
                            placeholder="Ex. : Tapissier, Ferronnier"
                            className={inputClass}
                          />
                          <p className="text-xs text-indigo-200 mt-1.5 ml-1">
                            Votre métier n’est pas dans la liste ? Indiquez-le (3 au maximum, séparés par des virgules).
                            Il sera ajouté après validation par notre équipe.
                          </p>
                        </div>
                      )}
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

                </>
                )}

                <div className="flex gap-3">
                  {etape === 2 && (
                    <button
                      type="button" onClick={() => setEtape(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl border border-white/50 text-white font-semibold hover:bg-white/10 transition"
                    >
                      <ArrowLeft className="w-4 h-4" /> Retour
                    </button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl bg-white text-indigo-800 font-semibold shadow-lg hover:bg-indigo-50 transition disabled:opacity-60"
                  >
                    {loading ? "Envoi…" : etape === 1 && avecEtapePiece ? "Continuer : pièce d’identité" : "Envoyer ma candidature"}
                  </motion.button>
                </div>
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
