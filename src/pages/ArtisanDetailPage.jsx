import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useArtisan, useArtisanAvis } from "@/hooks/useArtisans";
import { useCreateDemande } from "@/hooks/useDemandes";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/common/StarRating";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";

export default function ArtisanDetailPage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const { data: artisan, isLoading } = useArtisan(uid);
  const { data: avis = [] } = useArtisanAvis(uid);
  const createDemande = useCreateDemande();
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [description, setDescription] = useState("");
  
  if (isLoading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  if (!artisan)
    return (
      <div className="text-center py-24 text-gray-500">
        Artisan introuvable.
      </div>
    );

  const whatsappUrl = `https://wa.me/${artisan.whatsapp?.replace(/\D/g, "")}?text=Bonjour%20${artisan.prenom}%2C%20j'ai%20trouvé%20votre%20profil%20sur%20Sugu.sn%20!`;

  const handleDemande = async (e) => {
    e.preventDefault();
    await createDemande.mutateAsync({ artisan: artisan.id, description });
    setShowDemandeForm(false);
    setDescription("");
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/artisans"
        className="text-sm text-gray-500 hover:text-primary-500 mb-6 inline-block"
      >
        ← Retour aux artisans
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profil card */}
        <div className="md:col-span-1">
          <div className="card p-6 text-center">
            {artisan.photo ? (
              <img
                src={artisan.photo}
                alt={artisan.prenom}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl font-display mx-auto mb-4">
                {artisan.prenom?.[0]}
                {artisan.nom?.[0]}
              </div>
            )}

            <h1 className="font-display font-bold text-xl text-gray-900">
              {artisan.prenom} {artisan.nom}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Array.isArray(artisan.metier_label) ? (
                artisan.metier_label.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/10"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-primary-600 font-medium text-sm">
                  {artisan.metier_label}
                </span>
              )}
            </div>

            <div className="flex justify-center mt-2">
              <StarRating note={artisan.note_moyenne || 0} size="md" />
            </div>
            <p className="text-xs text-gray-400 mt-1">{avis.length} avis</p>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="text-gray-400 text-sm">📍</span>
              <span className="text-sm text-gray-600">
                {artisan.quartier}, {artisan.ville}
              </span>
            </div>

            <div className="mt-3">
              {artisan.disponible ? (
                <Badge variant="disponible">Disponible maintenant</Badge>
              ) : (
                <Badge variant="default">Pas disponible</Badge>
              )}
            </div>

            {/* Contact buttons */}
            <div className="mt-5 flex flex-col gap-2">
              {artisan.whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp justify-center"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contacter sur WhatsApp
                </a>
              )}
              {artisan.telephone && (
                <a
                  href={`tel:${artisan.telephone}`}
                  className="btn-secondary text-center"
                >
                  📞 Appeler
                </a>
              )}
              {user && user.role !== "artisan" && (
                <button
                  onClick={() => setShowDemandeForm(true)}
                  className="btn-primary"
                >
                  Envoyer une demande
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Détails + avis */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {artisan.bio && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-gray-900 mb-3">
                À propos
              </h2>
              <p className="text-gray-600 leading-relaxed">{artisan.bio}</p>
            </div>
          )}

          {/* Formulaire demande */}
          {showDemandeForm && (
            <div className="card p-6 border-2 border-primary-200">
              <h2 className="font-display font-semibold text-gray-900 mb-3">
                Envoyer une demande
              </h2>
              <form onSubmit={handleDemande} className="flex flex-col gap-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre besoin (ex: Fuite d'eau sous l'évier, besoin d'intervention rapide...)"
                  rows={4}
                  required
                  className="input-field resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createDemande.isLoading}
                  >
                    {createDemande.isLoading ? "Envoi..." : "Envoyer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDemandeForm(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Avis */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">
              Avis clients ({avis.length})
            </h2>
            {avis.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Aucun avis pour le moment.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {avis.map((a) => (
                  <div
                    key={a.id}
                    className="border-b border-sand-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800">
                        {a.client_nom}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <StarRating note={a.note} size="sm" showNote={false} />
                    {a.commentaire && (
                      <p className="text-sm text-gray-600 mt-1">
                        {a.commentaire}
                      </p>
                    )}
                    {a.reponse_artisan && (
                      <div className="mt-3 rounded-xl bg-sand-50 border border-sand-100 p-3">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="text-xs font-medium text-gray-500">
                            Reponse de l'artisan
                          </p>
                          {a.reponse_artisan_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(
                                a.reponse_artisan_at,
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {a.reponse_artisan}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
