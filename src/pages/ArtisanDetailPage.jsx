import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useArtisan, useArtisanAvis } from "@/hooks/useArtisans";
import { useCreateDemande } from "@/hooks/useDemandes";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/common/StarRating";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  Send,
  X
} from "lucide-react";

export default function ArtisanDetailPage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const { data: artisan, isLoading } = useArtisan(uid);
  const { data: avis = [] } = useArtisanAvis(uid);
  const createDemande = useCreateDemande();
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [description, setDescription] = useState("");
  
  // Animation variants pour un effet d'apparition en cascade
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/artisans"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 hover:gap-2 transition-all duration-200 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux artisans
          </Link>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 items-start"
        >
          {/* Profil card - Premium */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent" />
              
              {artisan.photo ? (
                <img
                  src={artisan.photo}
                  alt={artisan.prenom}
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-5 shadow-md ring-4 ring-indigo-200/70"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-4xl font-display mx-auto mb-5 shadow-md ring-4 ring-indigo-200/70">
                  {artisan.prenom?.[0]}
                  {artisan.nom?.[0]}
                </div>
              )}

              <h1 className="font-display font-bold text-2xl text-gray-900">
                {artisan.prenom} {artisan.nom}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {Array.isArray(artisan.metier_label) ? (
                  artisan.metier_label.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/60"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/60">
                    {artisan.metier_label}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center mt-3">
                <div className="flex items-center gap-2">
                  <StarRating note={artisan.note_moyenne || 0} size="md" />
                  <span className="text-sm font-semibold text-gray-700">({avis.length})</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-600 bg-gray-50/80 rounded-full px-4 py-1.5 border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400" />
                {artisan.quartier}, {artisan.ville}
              </div>

              <div className="mt-4">
                {artisan.disponible ? (
                  <Badge variant="disponible">Disponible maintenant</Badge>
                ) : (
                  <Badge variant="default">Pas disponible</Badge>
                )}
              </div>

              {/* Contact buttons - Premium */}
              <div className="mt-6 flex flex-col gap-3">
                {artisan.whatsapp && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-3 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contacter sur WhatsApp
                  </a>
                )}
                {artisan.telephone && (
                  <a
                    href={`tel:${artisan.telephone}`}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 px-4 py-3 rounded-full shadow-sm transition-all duration-200 text-gray-700"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </a>
                )}
                {user && user.role !== "artisan" && (
                  <button
                    onClick={() => setShowDemandeForm(true)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-4 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
                  >
                    Demander un rendez-vous
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Détails + avis */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {artisan.bio && (
              <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6">
                <h2 className="font-display font-semibold text-gray-900 mb-3 text-lg">
                  À propos
                </h2>
                <p className="text-gray-600 leading-relaxed">{artisan.bio}</p>
              </motion.div>
            )}

            {/* Formulaire demande - Premium */}
            {showDemandeForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-indigo-300/50 shadow-2xl shadow-indigo-200/40 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-gray-900 text-lg">
                    Donnez une date et décrivez votre besoin 
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowDemandeForm(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleDemande} className="flex flex-col gap-4">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre besoin (ex: Fuite d'eau sous l'évier, besoin d'intervention rapide...)"
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                      disabled={createDemande.isLoading}
                    >
                      {createDemande.isLoading ? "Envoi..." : (
                        <>
                          Envoyer <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Avis - Premium */}
            <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6">
              <h2 className="font-display font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                Avis clients <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">({avis.length})</span>
              </h2>
              
              {avis.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  Aucun avis pour le moment.
                </p>
              ) : (
                <div className="flex flex-col gap-5">
                  {avis.map((a) => (
                    <div
                      key={a.id}
                      className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {a.client_nom}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <StarRating note={a.note} size="sm" showNote={false} />
                      </div>
                      {a.commentaire && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {a.commentaire}
                        </p>
                      )}
                      {a.reponse_artisan && (
                        <div className="mt-3 bg-indigo-50/80 border border-indigo-200/60 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <p className="text-xs font-semibold text-indigo-600">
                              Réponse de l'artisan
                            </p>
                            {a.reponse_artisan_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(a.reponse_artisan_at).toLocaleDateString("fr-FR")}
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}