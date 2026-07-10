import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-toastify'
import { Phone, Lock, Eye, EyeOff } from 'lucide-react'

// 1. IMPORT DE L'IMAGE DE FOND (Assure-toi de l'avoir dans src/assets/images/)
import loginBg from '/images/metiers/register-bg.jpg'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ telephone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      toast.success('Bienvenue !')
      navigate('/')
    } catch {
      toast.error('Téléphone ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants pour un effet fluide de la page
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

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* === IMAGE DE FOND AVEC OVERLAY VIOLET/BLEU PROFOND === */}
      <div className="absolute inset-0 -z-10">
        <img 
          src={loginBg} 
          alt="Arrière-plan connexion" 
          className="w-full h-full object-cover"
        />
        {/* Overlay dégradé pour créer l'ambiance derrière la vitre */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-indigo-600/60 to-purple-800/75 mix-blend-multiply" />
      </div>
      {/* ========================================== */}

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight drop-shadow-md">
            Connexion
          </h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium drop-shadow-sm">
            Bon retour sur <span className="text-purple-300 font-semibold">Sugu.sn</span> !
          </p>
        </motion.div>

        {/* === LE FORMULAIRE EN EFFET "VITRE" (GLASSMORPHISM) === */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="+221 77 000 00 00"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400 hover:text-indigo-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Bouton CTA avec dégradé adapté au fond sombre */}
            <motion.button 
              type="submit" 
              disabled={loading} 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>
          
          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/30 text-center">
            <p className="text-sm text-indigo-200">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-white font-semibold hover:text-purple-200 hover:underline transition-colors">
                S'inscrire
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  )
}