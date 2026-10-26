import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { authService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import { Phone, ArrowLeft, Send } from 'lucide-react'

export default function MotDePasseOubliePage() {
  const navigate = useNavigate()
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.passwordResetRequest({ telephone })
      toast.success('Code envoyé par SMS !')
      navigate('/reset-mot-de-passe', { state: { telephone } })
    } catch (err) {
      toast.error(extractApiError(err, 'Erreur lors de l\'envoi du code.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900/85 via-indigo-600/60 to-purple-800/75" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-3xl font-display">B</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="text-indigo-200 text-sm mt-2">
            Entrez votre numéro de téléphone pour recevoir un code de réinitialisation.
          </p>
        </motion.div>

        <div className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30">
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
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Envoyer le code
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/connexion"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
