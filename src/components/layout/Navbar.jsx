import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Wrench,
} from "lucide-react";

import logo from "/images/logo.png";

export default function Navbar() {
  const { user, logout, isArtisan } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-50 transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center transform group-hover:scale-105 transition-all duration-200">
            <img
              src={logo}
              alt="logo"
              // className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Nav desktop - Liens Premium */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/a-propos"
            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
          >
            À propos
          </Link>
          <Link
            to="/artisans"
            className="text-gray-600 hover:text-info-600 font-medium transition-colors duration-200"
          >
            Trouver un artisan
          </Link>
          {!isArtisan && (
            <Link
              to="/inscription-artisan"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              Devenir prestataire
            </Link>
          )}
          <Link
            to="/contact"
            className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        {/* Actions / Profil Utilisateur */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="group flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:shadow-md hover:ring-2 hover:ring-indigo-500/20 transition-all duration-200 bg-transparent hover:bg-gray-50/80"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm uppercase shadow-sm">
                  {user.prenom?.[0]}
                  {user.nom?.[0]}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                  {user.prenom}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Menu Dropdown avec Animation Framer Motion */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 py-2 z-50 overflow-hidden"
                  >
                    <Link
                      to={
                        isArtisan ? "/dashboard-artisan" : "/dashboard-client"
                      }
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Mon tableau de bord
                    </Link>
                    <Link
                      to="/mon-profil"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    <hr className="my-1.5 mx-3 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/connexion"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-sm transition-all duration-200"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="hidden md:inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
