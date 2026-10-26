import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, HelpCircle, Scale, Heart } from "lucide-react";
import logo from "/images/logo.png";

export default function Footer() {
  // Animation d'entrée en cascade
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

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="bg-white/90 backdrop-blur-md border-t border-gray-200/80 shadow-sm mt-auto"
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
        >
          {/* Colonne 1 : Branding */}
          <motion.div
            variants={itemVariants}
            className="col-span-2 md:col-span-1"
          >
            <Link to="/" className="flex items-center gap-2.5 mb-3 group">
              <div className="w-9 h-9 flex items-center justify-center transform group-hover:scale-105 transition-all duration-200">
                <img
                  src={logo}
                  alt="logo"
                  // className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Trouvez les meilleurs artisans près de chez vous au Sénégal.
            </p>
          </motion.div>

          {/* Colonne 2 : Services */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-indigo-500" />
              <h4 className="font-semibold text-gray-900 text-sm tracking-wide">
                Services
              </h4>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link
                  to="/artisans"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  Chercher un artisan
                </Link>
              </li>
              <li>
                <Link
                  to="/inscription-artisan"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  Devenir artisan
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 3 : Aide */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <h4 className="font-semibold text-gray-900 text-sm tracking-wide">
                Aide
              </h4>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link
                  to="/a-propos#comment-ca-marche"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  Comment ça marche ?
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  Nous contacter
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 4 : Légal */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-4 h-4 text-indigo-500" />
              <h4 className="font-semibold text-gray-900 text-sm tracking-wide">
                Légal
              </h4>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>
                <Link
                  to="/cgu"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  to="/confidentialite"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Separator & Copyright */}
        <motion.div
          variants={itemVariants}
          className="border-t border-gray-200/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400"
        >
          <span>
            © {new Date().getFullYear()} Bricolibe by
            <Link to="https://daveprocode.com"> Dave Procode</Link>
          </span>
        </motion.div>
      </div>
    </motion.footer>
  );
}
