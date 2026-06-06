import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
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

    // On valide rapidement le fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide (PNG, JPG).");
      return;
    }

    // 1. On crée le conteneur FormData
    // const formData = new FormData();
    // // 'photo' doit correspondre EXACTEMENT au nom du champ dans ton modèle/serializer Django
    // formData.append('photo', file);

    try {
      toast.info("Téléchargement de la photo...");

      // 2. On envoie le FormData via notre hook de mutation
      await updateArtisanPhoto.mutateAsync({
        uid: user.artisan_uid,
        file: file,
      });

      await fetchMe();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la photo.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-primary-600 font-medium mb-1">
            {isArtisan ? "Profil artisan" : "Profil client"}
          </p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Mon profil
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Consultez et modifiez vos informations personnelles.
          </p>
        </div>

        {isArtisan && user.artisan_uid && (
          <Link
            to={`/artisans/${user.artisan_uid}`}
            className="btn-secondary text-sm"
          >
            Voir mon profil public
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="card p-6">
          <div className="relative w-20 h-20 group mb-4">
            {artisan?.photo ? (
              <img
                src={artisan.photo}
                alt="Profil"
                className="w-20 h-20 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-display font-bold text-2xl uppercase">
                {user.prenom?.[0]}
                {user.nom?.[0]}
              </div>
            )}

            {/* Input invisible mais déclenché au clic sur l'icône */}
            {isArtisan && artisan && (
              <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-white text-xs font-medium">Changer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h2 className="font-display font-semibold text-gray-900">
            {user.prenom} {user.nom}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{user.telephone}</p>
          <span className="badge bg-sand-100 text-gray-700 mt-4">
            {isArtisan ? "Artisan" : "Client"}
          </span>

          {isArtisan && artisan && (
            <div className="mt-5 pt-5 border-t border-sand-100">
              <div className="flex flex-wrap gap-1 mb-2">
                {Array.isArray(artisan.metier_label) ? (
                  artisan.metier_label.map((label, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-0.5 rounded"
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
              <p className="text-sm text-gray-500">
                {artisan.quartier}, {artisan.ville}
              </p>
              <div className="mt-3">
                <StarRating note={artisan.note_moyenne || 0} size="sm" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {artisan.nb_avis || 0} avis
              </p>
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-5">
          <section className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">
              Informations du compte
            </h2>
            <form onSubmit={saveAccount} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prenom
                </label>
                <input
                  value={accountForm.prenom}
                  onChange={(e) => setAccount("prenom", e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom
                </label>
                <input
                  value={accountForm.nom}
                  onChange={(e) => setAccount("nom", e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={accountForm.telephone}
                  onChange={(e) => setAccount("telephone", e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingAccount}
                >
                  {savingAccount ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </section>

          {isArtisan && (
            <section className="card p-6">
              <h2 className="font-display font-semibold text-gray-900 mb-4">
                Informations artisan
              </h2>

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
                  className="grid md:grid-cols-2 gap-4"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Métiers (choix multiples)
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                      {METIERS.map((m) => {
                        const isChecked = artisanForm.metier?.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${isChecked ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-gray-50 text-gray-600"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMetierChange(m.id)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                            />
                            <span>{m.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quartier
                    </label>
                    <select
                      value={artisanForm.quartier}
                      onChange={(e) => setArtisan("quartier", e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Quartier</option>
                      {QUARTIERS_DAKAR.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ville
                    </label>
                    <select
                      value={artisanForm.ville}
                      onChange={(e) => setArtisan("ville", e.target.value)}
                      className="input-field"
                    >
                      {VILLES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Disponibilite
                    </label>
                    <select
                      value={artisanForm.disponible ? "true" : "false"}
                      onChange={(e) =>
                        setArtisan("disponible", e.target.value === "true")
                      }
                      className="input-field"
                    >
                      <option value="true">Disponible</option>
                      <option value="false">Indisponible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telephone public
                    </label>
                    <input
                      type="tel"
                      value={artisanForm.telephone}
                      onChange={(e) => setArtisan("telephone", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={artisanForm.whatsapp}
                      onChange={(e) => setArtisan("whatsapp", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Presentation
                    </label>
                    <textarea
                      value={artisanForm.bio}
                      onChange={(e) => setArtisan("bio", e.target.value)}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Presentez votre experience, vos specialites et votre zone d'intervention."
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={updateArtisan.isLoading}
                    >
                      {updateArtisan.isLoading
                        ? "Enregistrement..."
                        : "Enregistrer le profil artisan"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
