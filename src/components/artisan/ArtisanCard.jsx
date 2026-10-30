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
        <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && (
        <div className="relative w-3.5 h-3.5">
          <Star className="absolute w-3.5 h-3.5 text-gray-200 fill-gray-200" />
          <Star
            className="absolute w-3.5 h-3.5 text-amber-400 fill-amber-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
      ))}
    </div>
  );
};

export default function ArtisanCard({ artisan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-line p-4 hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(22,48,91,.06)] transition-all duration-150 flex flex-col gap-3.5"
    >
      {artisan.est_booste && (
        <span className="self-start rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
          Mis en avant
        </span>
      )}

      {/* En-tête */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {artisan.photo ? (
            <img
              src={artisan.photo}
              alt={`${artisan.prenom} ${artisan.nom}`}
              className="w-12 h-12 rounded-full object-cover border border-line"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-[15px] uppercase">
              {artisan.prenom?.[0]}
              {artisan.nom?.[0]}
            </div>
          )}
          {artisan.disponible && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"
              title="Disponible"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-bold text-ink truncate">
              {artisan.prenom} {artisan.nom}
            </h3>
            {artisan.est_verifie && (
              <BadgeCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" aria-label="Profil vérifié" />
            )}
          </div>
          {artisan.categories?.length > 0 && (
            <p className="text-xs text-muted mt-0.5 truncate">
              {artisan.categories.map((cat) => cat.nom).join(" · ")}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted min-w-0">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {artisan.quartier}, {artisan.ville}
            </span>
            {artisan.distance_km != null && (
              <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold whitespace-nowrap">
                <Navigation className="w-3 h-3" />
                {artisan.distance_km} km
              </span>
            )}
          </div>
        </div>

        <span
          className={`flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold whitespace-nowrap ${
            artisan.disponible
              ? "bg-[#dff3e8] text-[#1f6b45]"
              : "bg-canvas text-muted"
          }`}
        >
          {artisan.disponible ? "Disponible" : "Indisponible"}
        </span>
      </div>

      {/* Note */}
      <div className="flex items-center gap-2 bg-canvas-soft border border-line-soft rounded-lg px-2.5 py-2 text-xs text-muted">
        <StarRating note={artisan.note_moyenne || 0} />
        <b className="text-ink">{Number(artisan.note_moyenne || 0).toFixed(1)}</b>
        <span>({artisan.nb_avis || 0} avis)</span>
      </div>

      {/* Bio */}
      {artisan.bio && (
        <p className="text-[13px] text-muted line-clamp-2 leading-relaxed">
          {artisan.bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto">
        <Link
          to={`/artisans/${artisan.uid}`}
          className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold py-2.5 transition-colors duration-150"
        >
          Voir le profil
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
