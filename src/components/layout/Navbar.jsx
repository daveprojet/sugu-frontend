import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, logout, isArtisan } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-sand-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900">
            Sugu<span className="text-primary-500">.</span>sn
          </span>
        </Link>

        {/* Nav desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/a-propos" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            À propos
          </Link>
          <Link to="/artisans" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            Trouver un artisan
          </Link>
          {!isArtisan && (
            <Link to="/inscription-artisan" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Devenir prestataire
            </Link>
          )}
          <Link to="/contact" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            Contact
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-sand-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm uppercase">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.prenom}
                </span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-sand-100 py-1 z-50">
                  <Link
                    to={isArtisan ? '/dashboard-artisan' : '/dashboard-client'}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-sand-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mon tableau de bord
                  </Link>
                  <Link
                    to="/mon-profil"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-sand-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <hr className="my-1 border-sand-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/connexion" className="btn-secondary text-sm py-2 px-4">
                Connexion
              </Link>
              <Link to="/inscription" className="btn-primary text-sm py-2 px-4 hidden md:block">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
