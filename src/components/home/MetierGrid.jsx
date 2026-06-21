import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { METIERS } from "@/utils/constants";
import {
  Wrench,
  Zap,
  Hammer,
  PaintBucket,
  Drill,
  HardHat,
  Cog,
  GlassWater,
  ArrowRight,
} from "lucide-react";

// 1. On pointe directement vers le dossier public avec des chaînes de caractères
const metierAssets = {
  plombier: { 
    icon: Wrench, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-blue-500 to-indigo-600" 
  },
  electricien: { 
    icon: Zap, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-yellow-500 to-orange-500" 
  },
  macon: { 
    icon: Hammer, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-orange-500 to-red-500" 
  },
  peintre: { 
    icon: PaintBucket, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-pink-500 to-rose-500" 
  },
  menuisier: { 
    icon: Drill, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-amber-500 to-yellow-600" 
  },
  couvreur: { 
    icon: HardHat, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-emerald-500 to-teal-600" 
  },
  climaticien: { 
    icon: Cog, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-indigo-500 to-purple-600" 
  },
  vitrier: { 
    icon: GlassWater, 
    image: "/images/metiers/plombier.jpg", 
    color: "from-cyan-500 to-blue-600" 
  },
};

// Image de secours (au cas où)
const fallbackImage = "/images/metiers/plombier.jpg";

export default function MetierGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {METIERS.map((m, idx) => {
        const asset = metierAssets[m.id] || {
          icon: Wrench,
          image: fallbackImage,
          color: "from-gray-500 to-gray-600"
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
              y: -10, 
              transition: { duration: 0.25, type: "spring", stiffness: 300 } 
            }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer border border-gray-100"
          >
            {/* Zone de l'image locale */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-50">
              <img
                src={asset.image}
                alt={m.label}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Superposition dégradée premium */}
              <div className={`absolute inset-0 bg-gradient-to-t ${asset.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
              
              {/* Icône flottante en bas de carte */}
              <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 text-indigo-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Icon className="w-7 h-7" />
              </div>
            </div>

            {/* Contenu texte */}
            <div className="p-6 pt-10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  {m.label}
                </h3>
                
                {/* Flèche qui glisse au survol */}
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