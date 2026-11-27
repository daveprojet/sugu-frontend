import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { espaceParDefaut } from "@/utils/redirection";
import {
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Wrench,
  Menu,
  X,
  Rocket,
  LifeBuoy,
  Palette,
} from "lucide-react";
import NotificationBell from "@/components/layout/NotificationBell";
import { LiensRoleBureau, estEspaceTravail, useLiensRole } from "@/components/layout/NavigationRole";

import logo from "/images/logo.png";

// Onglet actif en orange (trait dessous sur ordinateur, fond clair dans le menu mobile).
const classeLienBureau = ({ isActive }) =>
  `relative font-medium transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors ${
    isActive ? "text-primary-500 after:bg-primary-500" : "text-gray-600 hover:text-primary-500 after:bg-transparent"
  }`;
const classeLienMobile = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive ? "bg-primary-50 text-primary-600" : "text-gray-700 hover:bg-primary-50 hover:text-primary-500"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const navigate = useNavigate();
  const liensRole = useLiensRole();
  // Dans un espace de travail, le menu latéral remplace les liens du haut.
  const { pathname } = useLocation();
  const menuLateral = estEspaceTravail(pathname);
  const artisanIndependant = user?.role === "artisan" && user.independant !== false;

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <nav className={`bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm sticky top-0 z-50 transition-all duration-200 ${menuLateral ? "md:hidden" : ""}`}>
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

        {/* Nav desktop : pages de travail du rôle connecté, liens publics sinon */}
        {user ? (
          <div className="hidden md:flex items-center gap-6">
            {!menuLateral && <LiensRoleBureau liens={liensRole} />}
          </div>
        ) : (
        <div className="hidden md:flex items-center gap-6">
          <NavLink
            to="/a-propos"
            className={classeLienBureau}
          >
            À propos
          </NavLink>
          <NavLink
            to="/artisans"
            className={classeLienBureau}
          >
            Trouver un artisan
          </NavLink>
          <NavLink
            to="/marketplace"
            className={classeLienBureau}
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/devenir-partenaire"
            className={classeLienBureau}
          >
            Devenir partenaire
          </NavLink>
          <NavLink
            to="/contact"
            className={classeLienBureau}
          >
            Contact
          </NavLink>
        </div>
        )}

        {/* Actions / Profil Utilisateur */}
        <div className="flex items-center gap-2 md:gap-3">
          {user && <NotificationBell />}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="group flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:shadow-md hover:ring-2 hover:ring-primary-500/20 transition-all duration-200 bg-transparent hover:bg-gray-50/80"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm uppercase shadow-sm">
                  {user.prenom?.[0]}
                  {user.nom?.[0]}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-primary-500 transition-colors">
                  {user.prenom}
                </span>
                <ChevronDown
                  className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
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
                      to={espaceParDefaut(user)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Mon tableau de bord
                    </Link>
                    <Link
                      to="/mon-profil"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    {artisanIndependant && (
                      <Link
                        to="/dashboard-artisan/abonnements"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Rocket className="w-4 h-4" />
                        Abonnements
                      </Link>
                    )}
                    <Link
                      to="/contact"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LifeBuoy className="w-4 h-4" />
                      Aide et contact
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
                className="inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-gray-200 bg-white/80 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 shadow-sm transition-all duration-200"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="inline-flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                S'inscrire
              </Link>
            </>
          )}

          {/* Burger (téléphone, visiteurs) : connecté, la barre d'onglets le remplace */}
          {!user && (
          <button
            onClick={() => setBurgerOpen(!burgerOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
            aria-label="Menu de navigation"
          >
            {burgerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {burgerOpen && !user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm"
          >
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1.5">
              <NavLink
                to="/a-propos"
                onClick={() => setBurgerOpen(false)}
                className={classeLienMobile}
              >
                À propos
              </NavLink>
              <NavLink
                to="/artisans"
                onClick={() => setBurgerOpen(false)}
                className={classeLienMobile}
              >
                <Wrench className="w-4 h-4 text-gray-400" />
                Trouver un artisan
              </NavLink>
              <NavLink
                to="/marketplace"
                onClick={() => setBurgerOpen(false)}
                className={classeLienMobile}
              >
                <Palette className="w-4 h-4 text-gray-400" />
                Marketplace
              </NavLink>
              <NavLink
                to="/devenir-partenaire"
                onClick={() => setBurgerOpen(false)}
                className={classeLienMobile}
              >
                Devenir partenaire
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setBurgerOpen(false)}
                className={classeLienMobile}
              >
                Contact
              </NavLink>

              {!user && (
                <>
                  <hr className="my-2 mx-3 border-gray-100" />
                  <Link
                    to="/inscription"
                    onClick={() => setBurgerOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-500/30 transition-all duration-200"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
