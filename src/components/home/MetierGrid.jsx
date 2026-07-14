import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { METIERS } from "@/utils/constants";
import {
  Wrench,
  Zap,
  Hammer,
  PaintBucket,
  Drill,
  Grid,
  Snowflake,
  Flame,
  Sprout,
  Sparkles,
  Car,
  Monitor,
  ArrowRight,
} from "lucide-react";

const metierAssets = {
  plombier: {
    icon: Wrench,
    gradient: "from-blue-500 to-cyan-600",
    iconColor: "text-blue-600",
    bgLight: "bg-blue-50",
    image:
      "https://plus.unsplash.com/premium_photo-1723874634715-246be2bb20ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  electricien: {
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    iconColor: "text-amber-600",
    bgLight: "bg-amber-50",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
  },
  menuisier: {
    icon: Drill,
    gradient: "from-amber-700 to-yellow-700",
    iconColor: "text-amber-700",
    bgLight: "bg-amber-50",
    image:
      "https://images.unsplash.com/photo-1756736668332-e921516c1305?q=80&w=800&auto=format&fit=crop",
  },
  macon: {
    icon: Hammer,
    gradient: "from-orange-500 to-red-500",
    iconColor: "text-orange-600",
    bgLight: "bg-orange-50",
    image:
      "https://images.unsplash.com/photo-1780849328094-228dc15a6e10?q=80&w=800&auto=format&fit=crop",
  },
  peintre: {
    icon: PaintBucket,
    gradient: "from-pink-500 to-rose-500",
    iconColor: "text-pink-600",
    bgLight: "bg-pink-50",
    image:
      "https://images.unsplash.com/photo-1522600579804-c66aa476298e?q=80&w=800&auto=format&fit=crop",
  },
  carreleur: {
    icon: Grid,
    gradient: "from-teal-500 to-emerald-600",
    iconColor: "text-teal-600",
    bgLight: "bg-teal-50",
    image:
      "https://images.unsplash.com/photo-1747729495628-e38c438f619b?q=80&w=800&auto=format&fit=crop",
  },
  climatisation: {
    icon: Snowflake,
    gradient: "from-sky-500 to-cyan-600",
    iconColor: "text-sky-600",
    bgLight: "bg-sky-50",
    image:
      "https://images.unsplash.com/photo-1665826254141-bfa10685e002?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  soudeur: {
    icon: Flame,
    gradient: "from-red-600 to-rose-700",
    iconColor: "text-red-600",
    bgLight: "bg-red-50",
    image:
      "https://images.unsplash.com/photo-1641893823219-38b433f736c0?q=80&w=800&auto=format&fit=crop",
  },
  jardinier: {
    icon: Sprout,
    gradient: "from-green-500 to-emerald-600",
    iconColor: "text-green-600",
    bgLight: "bg-green-50",
    image:
      "https://images.unsplash.com/photo-1758798482337-bd7c38e94186?q=80&w=800&auto=format&fit=crop",
  },
  menage: {
    icon: Sparkles,
    gradient: "from-[#F97316]-500 to-[#1256CC]-600",
    iconColor: "text-[#F97316]-600",
    bgLight: "bg-[#F97316]-50",
    image:
      "https://images.unsplash.com/photo-1740657254989-42fe9c3b8cce?q=80&w=2024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  chauffeur: {
    icon: Car,
    gradient: "from-cyan-500 to-blue-600",
    iconColor: "text-cyan-600",
    bgLight: "bg-cyan-50",
    image:
      "https://images.unsplash.com/photo-1482029255085-35a4a48b7084?q=80&w=800&auto=format&fit=crop",
  },
  informatique: {
    icon: Monitor,
    gradient: "from-slate-600 to-gray-800",
    iconColor: "text-slate-600",
    bgLight: "bg-slate-50",
    image:
      "https://plus.unsplash.com/premium_photo-1726862552907-4b86ad0fc728?q=80&w=2059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

export default function MetierGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {METIERS.map((m, idx) => {
        const asset = metierAssets[m.id] || {
          icon: Wrench,
          gradient: "from-gray-500 to-gray-600",
          iconColor: "text-gray-600",
          bgLight: "bg-gray-50",
        };
        const Icon = asset.icon;

        return (
          <motion.button
            key={m.id}
            onClick={() => navigate(`/artisans?metier=${m.id}`)}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07, duration: 0.4 }}
            whileHover={{
              y: -8,
              transition: { duration: 0.25, type: "spring", stiffness: 300 },
            }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
          >
            {/* Zone image ou dégradé avec icône */}
            <div
              className={`relative h-48 w-full overflow-hidden ${asset.image ? "" : `bg-gradient-to-br ${asset.gradient}`}`}
            >
              {asset.image ? (
                <>
                  <img
                    src={asset.image}
                    alt={m.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                </>
              )}
              <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-white/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Icon className={`w-7 h-7 ${asset.iconColor}`} />
              </div>
            </div>

            {/* Contenu texte */}
            <div className="p-6 pt-10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  {m.label}
                </h3>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Voir les professionnels
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
