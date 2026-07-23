import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, ChevronRight, BadgeCheck, Navigation } from "lucide-react";

const StarRating = ({ note }) => {
  const fullStars = Math.floor(note);
  const hasHalf = note - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalf && (
        <div className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-gray-200 fill-gray-200" />
          <Star
            className="absolute w-4 h-4 text-yellow-400 fill-yellow-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-200 fill-gray-200" />
      ))}
    </div>
  );
};

export default function ArtisanCard({ artisan }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/60 border border-gray-100 hover:border-indigo-200 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-white/0 to-purple-50/0 group-hover:to-indigo-50/20 transition-all duration-500 pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start gap-5 z-10">
        <div className="relative flex-shrink-0">
          {artisan.photo ? (
            <img
              src={artisan.photo}
              alt={`${artisan.prenom} ${artisan.nom}`}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/40 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl font-display ring-2 ring-offset-2 ring-indigo-400/50 shadow-md">
              {artisan.prenom?.[0]}
              {artisan.nom?.[0]}
            </div>
          )}
          {artisan.disponible && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-sm animate-pulse"
              title="Disponible"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-gray-900 truncate text-lg leading-tight">
            {artisan.prenom} {artisan.nom}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {artisan.categories?.map((cat) => (
              <span
                key={cat.uid}
                className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/60"
              >
                {cat.nom}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate font-medium">
              {artisan.quartier}, {artisan.ville}
            </span>
          </div>
          {artisan.distance_km != null && (
            <div className="flex items-center gap-1.5 mt-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-xs text-indigo-600 font-medium">
                {artisan.distance_km} km de vous
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats & Availability */}
      <div className="flex items-center justify-between z-10 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <StarRating note={artisan.note_moyenne || 0} />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {artisan.nb_avis || 0} avis
          </span>
        </div>
        <div className="flex items-center gap-2">
          {artisan.est_verifie && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full ring-1 ring-inset ring-emerald-200/60">
              <BadgeCheck className="w-3 h-3" /> Vérifié
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
              artisan.disponible
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                : "bg-gray-100 text-gray-500 ring-gray-400/20"
            }`}
          >
            {artisan.disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>
      </div>

      {/* Bio */}
      {artisan.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-indigo-300/60 pl-3 z-10">
          {artisan.bio}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 z-10">
        <Link
          to={`/artisans/${artisan.uid}`}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/50 shadow-sm hover:shadow-md transition-all duration-200 py-2.5 text-sm font-medium"
        >
          Voir le profil
          <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
