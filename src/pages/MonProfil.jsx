import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Camera, Check, Pencil, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useArtisan,
  useUpdateArtisan,
  useUploadArtisanPhoto,
} from "@/hooks/useArtisans";
import Spinner from "@/components/common/Spinner";
import StarRating from "@/components/common/StarRating";
import { METIERS, QUARTIERS_DAKAR, VILLES } from "@/utils/constants";

export default function MonProfil() {
  const { user, loading, updateMe, fetchMe } = useAuth();
  const isArtisan = user?.role === "artisan";
  const { data: artisan, isLoading: artisanLoading } = useArtisan(
    isArtisan ? user?.artisan_uid : null,
  );
  const updateArtisan = useUpdateArtisan();
  const updateArtisanPhoto = useUploadArtisanPhoto();

  const [accountForm, setAccountForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
  });
  const [artisanForm, setArtisanForm] = useState({
    metier: [],
    ville: "Dakar",
    quartier: "",
    bio: "",
    telephone: "",
    whatsapp: "",
    disponible: true,
  });
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    if (!user) return;
    setAccountForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      telephone: user.telephone || "",
    });
  }, [user]);

  useEffect(() => {
    if (!artisan) return;
    setArtisanForm({
      metier: artisan.metier || [],
      ville: artisan.ville || "Dakar",
      quartier: artisan.quartier || "",
      bio: artisan.bio || "",
      telephone: artisan.telephone || "",
      whatsapp: artisan.whatsapp || "",
      disponible: artisan.disponible ?? true,
    });
  }, [artisan]);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  if (!user) return <Navigate to="/connexion" replace />;

  const setAccount = (key, value) => {
    setAccountForm((form) => ({ ...form, [key]: value }));
  };

  const setArtisan = (key, value) => {
    setArtisanForm((form) => ({ ...form, [key]: value }));
  };

  const handleMetierChange = (metierId) => {
    const currentMetiers = artisanForm.metier || [];
    if (currentMetiers.includes(metierId)) {
      setArtisan(
        "metier",
        currentMetiers.filter((id) => id !== metierId),
      );
    } else {
      setArtisan("metier", [...currentMetiers, metierId]);
    }
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      await updateMe(accountForm);
      toast.success("Profil mis a jour.");
    } catch (error) {
      const detail =
        error.response?.data?.telephone?.[0] ||
        error.response?.data?.detail ||
        "Impossible de mettre a jour le profil.";
      toast.error(detail);
    } finally {
      setSavingAccount(false);
    }
  };

  const saveArtisan = async (e) => {
    e.preventDefault();
    await updateArtisan.mutateAsync({
      uid: user.artisan_uid,
      data: artisanForm,
    });
    await fetchMe();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide (PNG, JPG).");
      return;
    }

    try {
      toast.info("Téléchargement de la photo...");
      await updateArtisanPhoto.mutateAsync({
        uid: user.artisan_uid,
        file: file,
      });
      await fetchMe();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la photo.");
    }
  };

  // Container animation for smoother loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 bg-gray-50/30">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
      >
        <div>
          <p className="text-sm font-semibold text-indigo-600 mb-1 uppercase tracking-wider">
            {isArtisan ? "Espace Artisan" : "Espace Client"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Mon profil
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Consultez et modifiez vos informations personnelles.
          </p>
        </div>

        {isArtisan && user.artisan_uid && (
          <Link
            to={`/artisans/${user.artisan_uid}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200"
          >
            <User className="w-4 h-4" />
            Voir mon profil public
          </Link>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar - Profile Card */}
        <motion.aside variants={itemVariants} className="h-fit">
          <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent" />
            
            <div className="relative mx-auto w-28 h-28 group mb-5 mt-2">
              {artisan?.photo ? (
                <img
                  src={artisan.photo}
                  alt="Profil"
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-offset-2 ring-indigo-200/70 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-display font-bold text-3xl shadow-md ring-4 ring-offset-2 ring-indigo-200/70">
                  {user.prenom?.[0]}
                  {user.nom?.[0]}
                </div>
              )}

              {isArtisan && artisan && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 ring-2 ring-transparent hover:ring-white">
                  <div className="flex flex-col items-center text-white">
                    <Camera className="w-6 h-6 mb-0.5" />
                    <span className="text-[10px] font-medium">Changer</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h2 className="font-display text-xl font-bold text-gray-900">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{user.telephone}</p>
            
            <div className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {isArtisan ? "Artisan" : "Client"}
            </div>

            {isArtisan && artisan && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Array.isArray(artisan.metier_label) ? (
                    artisan.metier_label.map((label, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      {artisan.metier_label}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  {artisan.quartier}, {artisan.ville}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <StarRating note={artisan.note_moyenne || 0} size="sm" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {artisan.nb_avis || 0} avis
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          
          {/* Account Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Pencil className="w-4 h-4" />
              </div>
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Informations du compte
              </h2>
            </div>
            <form onSubmit={saveAccount} className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  value={accountForm.prenom}
                  onChange={(e) => setAccount("prenom", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  value={accountForm.nom}
                  onChange={(e) => setAccount("nom", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={accountForm.telephone}
                  onChange={(e) => setAccount("telephone", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {savingAccount ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" color="white" /> Enregistrement...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Artisan Form */}
          {isArtisan && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-display text-lg font-semibold text-gray-900">
                  Informations artisan
                </h2>
              </div>

              {artisanLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : !artisan ? (
                <p className="text-sm text-gray-400">
                  Profil artisan introuvable.
                </p>
              ) : (
                <form
                  onSubmit={saveArtisan}
                  className="grid md:grid-cols-2 gap-5"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Métiers (choix multiples)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-2xl max-h-48 overflow-y-auto bg-gray-50/30">
                      {METIERS.map((m) => {
                        const isChecked = artisanForm.metier?.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                              isChecked
                                ? "bg-indigo-50 border-indigo-300 shadow-sm text-indigo-700"
                                : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMetierChange(m.id)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                            />
                            <span className="text-sm font-medium">{m.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quartier
                    </label>
                    <select
                      value={artisanForm.quartier}
                      onChange={(e) => setArtisan("quartier", e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <select
                      value={artisanForm.ville}
                      onChange={(e) => setArtisan("ville", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                    >
                      {VILLES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilité
                    </label>
                    <select
                      value={artisanForm.disponible ? "true" : "false"}
                      onChange={(e) =>
                        setArtisan("disponible", e.target.value === "true")
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                    >
                      <option value="true">Disponible</option>
                      <option value="false">Indisponible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone public
                    </label>
                    <input
                      type="tel"
                      value={artisanForm.telephone}
                      onChange={(e) => setArtisan("telephone", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={artisanForm.whatsapp}
                      onChange={(e) => setArtisan("whatsapp", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Présentation
                    </label>
                    <textarea
                      value={artisanForm.bio}
                      onChange={(e) => setArtisan("bio", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none resize-none"
                      placeholder="Présentez votre expérience, vos spécialités et votre zone d'intervention."
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={updateArtisan.isLoading}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {updateArtisan.isLoading ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" color="white" /> Enregistrement...
                        </span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Enregistrer le profil
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}