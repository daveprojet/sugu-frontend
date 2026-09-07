import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useArtisan, useArtisanAvis } from "@/hooks/useArtisans";
import { useCreateDemande } from "@/hooks/useDemandes";
import { useCategorie } from "@/hooks/useCategories";
import { useAuth } from "@/context/AuthContext";
import { normalizeCoord } from "@/utils/geo";
import { toast } from "react-toastify";
import StarRating from "@/components/common/StarRating";
import Badge from "@/components/common/Badge";
import Spinner from "@/components/common/Spinner";
import {
  MapPin,
  Phone,
  MessageCircle,
  ArrowLeft,
  Send,
  X,
  BadgeCheck,
  Copy,
  Check,
  Tag,
  Navigation,
  AlertTriangle,
  LocateFixed,
  List,
  Maximize2,
  LogIn,
  Briefcase,
} from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const makePinIcon = (color) => L.divIcon({
  className: "",
  html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z"
      fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="13" r="5.5" fill="white"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

const artisanIcon = makePinIcon("#4f46e5");
const clientIcon = makePinIcon("#10b981");

function FitBounds({ artisanPos, clientPos }) {
  const map = useMap();
  useEffect(() => {
    if (artisanPos && clientPos) {
      map.fitBounds([artisanPos, clientPos], { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, artisanPos, clientPos]);
  return null;
}

export default function ArtisanDetailPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: artisan, isLoading } = useArtisan(uid);
  const { data: avisPage, isLoading: avisLoading } = useArtisanAvis(uid, { page: 1 });
  const avis = avisPage?.results || [];
  const totalAvis = avisPage?.count || 0;
  const createDemande = useCreateDemande();
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [selectedServiceUid, setSelectedServiceUid] = useState(null);
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(null);
  const [clientCoords, setClientCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [modePaiement, setModePaiement] = useState("en_ligne");

  const { data: categorieDetail } = useCategorie(selectedCategorie);
  const servicesList = categorieDetail?.services || [];

  useEffect(() => {
    if (artisan?.latitude && artisan?.longitude && !clientCoords && navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setClientCoords({ latitude: normalizeCoord(pos.coords.latitude), longitude: normalizeCoord(pos.coords.longitude) });
          setGeoLoading(false);
        },
        () => setGeoLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [artisan?.latitude, artisan?.longitude, clientCoords]);

  const retryGeo = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setClientCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCopy = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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

  const handleDemande = async (e) => {
    e.preventDefault();
    if (!selectedCategorie) {
      toast.error("Veuillez choisir une catégorie.", { position: "top-right" });
      return;
    }
    if (!selectedServiceUid) {
      toast.error("Veuillez choisir une prestation ou \"Autre\".", { position: "top-right" });
      return;
    }
    const payload = {
      artisan: artisan.id,
      description,
      mode_paiement: modePaiement,
    };
    if (selectedServiceUid !== "autre") {
      payload.service_element = selectedServiceUid;
    }
    if (clientCoords) {
      payload.latitude_client = clientCoords.latitude;
      payload.longitude_client = clientCoords.longitude;
    }
    await createDemande.mutateAsync(payload);
    setShowDemandeForm(false);
    setDescription("");
    setSelectedCategorie(null);
    setSelectedServiceUid(null);
  };

  const resetForm = () => {
    setShowDemandeForm(false);
    setSelectedCategorie(null);
    setSelectedServiceUid(null);
    setDescription("");
  };

  const openDemandeOrAuth = () => {
    if (!user) {
      setAuthModal("login");
    } else if (user.role === "artisan") {
      setAuthModal("artisan");
    } else {
      setShowDemandeForm(true);
    }
  };

  const goToLogin = () => {
    const redirect = encodeURIComponent(`/artisans/${uid}`);
    setAuthModal(null);
    navigate(`/connexion?redirect=${redirect}`);
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
          {/* Profil card */}
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
              {artisan.est_verifie && (
                <Badge variant="success" className="mt-2">
                  <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Vérifié
                </Badge>
              )}

              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {artisan.categories?.map((cat) => (
                  <span
                    key={cat.uid}
                    className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/60"
                  >
                    {cat.nom}
                  </span>
                ))}
              </div>

              <div className="flex flex-col items-center mt-3">
                <div className="flex items-center gap-2">
                  <StarRating note={artisan.note_moyenne || 0} size="md" />
                  <span className="text-sm font-semibold text-gray-700">({totalAvis})</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-600 bg-gray-50/80 rounded-full px-4 py-1.5 border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400" />
                {artisan.quartier}, {artisan.ville}
              </div>

              {artisan.distance_km != null && (
                <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-indigo-600">
                  <Navigation className="w-4 h-4" />
                  <span className="font-semibold">{artisan.distance_km} km</span>
                  <span className="text-gray-400">de vous</span>
                </div>
              )}

              {/* Map */}
              {artisan.latitude && artisan.longitude && (
                <div className="mt-5 rounded-2xl overflow-hidden border border-gray-200 relative" style={{ height: 180 }}>
                  <button
                    onClick={() => setMapFullscreen(true)}
                    className="absolute top-2 right-2 z-[1000] bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <MapContainer
                    center={[artisan.latitude, artisan.longitude]}
                    zoom={14}
                    scrollWheelZoom={false}
                    dragging={false}
                    doubleClickZoom={false}
                    zoomControl={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer attribution='&copy; <a href="https://osm.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[artisan.latitude, artisan.longitude]} icon={artisanIcon}>
                      <Popup>{artisan.prenom} {artisan.nom}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              <div className="mt-4">
                {artisan.bloque || artisan.bloque_refus ? (
                  <Badge variant="default">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Temporairement indisponible
                  </Badge>
                ) : artisan.disponible ? (
                  <Badge variant="disponible">Disponible maintenant</Badge>
                ) : (
                  <Badge variant="default">Pas disponible</Badge>
                )}
              </div>

              {/* Contact buttons */}
              {!artisan.bloque && !artisan.bloque_refus && (
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={openDemandeOrAuth}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-4 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
                  >
                    Demander un rendez-vous
                  </button>
                </div>
              )}
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

            {/* Formulaire demande */}
            {showDemandeForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-indigo-300/50 shadow-2xl shadow-indigo-200/40 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-gray-900 text-lg">
                    Décrivez votre besoin
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleDemande} className="flex flex-col gap-4">

                  {/* 1. Select catégorie */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                      Type de dépannage
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                        <List className="w-4 h-4" />
                      </div>
                      <select
                        value={selectedCategorie || ""}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          setSelectedCategorie(val);
                          setSelectedServiceUid(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
                      >
                        <option value="">-- Choisir une catégorie --</option>
                        {artisan.categories?.map((cat) => (
                          <option key={cat.uid} value={cat.uid}>{cat.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. Select service (affiché si catégorie réelle choisie) */}
                  {selectedCategorie && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                        Prestation
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                          <Tag className="w-4 h-4" />
                        </div>
                        <select
                          value={selectedServiceUid || ""}
                          onChange={(e) => setSelectedServiceUid(e.target.value || null)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
                        >
                          <option value="">-- Choisir une prestation --</option>
                          {servicesList.map((svc) => (
                            <option key={svc.uid} value={svc.uid}>
                              {svc.nom}
                            </option>
                          ))}
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Note pour la prestation "Autre" */}
                  {selectedServiceUid === "autre" && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      Vous pouvez décrire votre besoin dans la section ci-dessous. L'artisan fixera le prix après discussion avec vous.
                    </p>
                  )}

                  {/* 3. Textarea description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                      Description de votre besoin
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre problème en détail (ex: Fuite sous l'évier, besoin d'intervention rapide...). L'artisan fixera le prix après discussion."
                      rows={4}
                      required
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm resize-none"
                    />
                  </div>

                  {/* Geolocation status */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50/80 border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <LocateFixed className={`w-4 h-4 ${clientCoords ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {clientCoords ? (
                        <span className="text-emerald-700 font-medium">
                          Position captée
                        </span>
                      ) : geoLoading ? (
                        <span className="text-gray-500">Détection de votre position...</span>
                      ) : (
                        <span className="text-gray-400 italic">Position non disponible</span>
                      )}
                    </div>
                    {!clientCoords && !geoLoading && (
                      <button type="button" onClick={retryGeo} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        Activer
                      </button>
                    )}
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                      Moyen de paiement
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-start gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${modePaiement === "en_ligne" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50/80"}`}>
                        <input
                          type="radio"
                          name="mode_paiement"
                          value="en_ligne"
                          checked={modePaiement === "en_ligne"}
                          onChange={() => setModePaiement("en_ligne")}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">En ligne</span>
                          <span className="block text-xs text-gray-500">Wave, Orange Money, Free Money ou carte — paiement recommandé, sécurisé.</span>
                        </span>
                      </label>
                      <label className={`flex items-start gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${modePaiement === "especes" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50/80"}`}>
                        <input
                          type="radio"
                          name="mode_paiement"
                          value="especes"
                          checked={modePaiement === "especes"}
                          onChange={() => setModePaiement("especes")}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-gray-900">En espèces</span>
                          <span className="block text-xs text-gray-500">Paiement comptant à l'artisan, à confirmer sur la plateforme.</span>
                        </span>
                      </label>
                    </div>
                  </div>

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

            {/* Avis */}
            <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6">
              <h2 className="font-display font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                Avis clients <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">({totalAvis})</span>
              </h2>

              {totalAvis === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  Aucun avis pour le moment.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-5">
                    {avis.slice(0, 5).map((a) => (
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
                  {totalAvis > 5 && (
                    <Link
                      to={`/artisans/${uid}/avis`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:gap-3 transition-all duration-200"
                    >
                      Voir les {totalAvis} avis →
                    </Link>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen map modal */}
      {mapFullscreen && artisan.latitude && artisan.longitude && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMapFullscreen(false)} />
          <div className="absolute inset-0 m-4 md:m-8 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setMapFullscreen(false)}
              className="absolute top-3 right-3 z-[1000] bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <MapContainer
              center={[artisan.latitude, artisan.longitude]}
              zoom={14}
              scrollWheelZoom={true}
              dragging={true}
              doubleClickZoom={true}
              zoomControl={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer attribution='&copy; <a href="https://osm.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[artisan.latitude, artisan.longitude]} icon={artisanIcon}>
                <Popup>{artisan.prenom} {artisan.nom}</Popup>
              </Marker>
              {clientCoords && (
                <Marker position={[clientCoords.latitude, clientCoords.longitude]} icon={clientIcon}>
                  <Popup>Ma position</Popup>
                </Marker>
              )}
              {clientCoords && (
                <FitBounds
                  artisanPos={[artisan.latitude, artisan.longitude]}
                  clientPos={[clientCoords.latitude, clientCoords.longitude]}
                />
              )}
            </MapContainer>
            {clientCoords && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border border-gray-200 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Artisan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Vous
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Auth modal (visitor / artisan) */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setAuthModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                {authModal === "artisan" ? (
                  <Briefcase className="w-6 h-6 text-white" />
                ) : (
                  <LogIn className="w-6 h-6 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setAuthModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-display font-semibold text-gray-900 text-lg mb-2">
              {authModal === "artisan"
                ? "Connexion client requise"
                : "Connectez-vous pour envoyer votre demande"}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              {authModal === "artisan"
                ? "Les demandes de rendez-vous sont réservées aux comptes clients. Connectez-vous avec un compte client pour envoyer une demande à cet artisan."
                : "Pour envoyer une demande à cet artisan, vous devez être connecté : cela lui permet de vous recontacter, de suivre le statut de votre demande et de confirmer le prix depuis votre tableau de bord."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
              >
                <LogIn className="w-4 h-4" /> Se connecter
              </button>
              {authModal === "login" && (
                <Link
                  to="/inscription"
                  className="inline-flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Créer un compte
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
