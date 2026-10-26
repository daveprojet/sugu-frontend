import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { authService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import { KeyRound, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react'

const RESEND_COOLDOWN = 60

export default function ResetMotDePassePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const telephone = location.state?.telephone || ''

  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return undefined
    const timer = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Rediriger si pas de téléphone
  if (!telephone) {
    navigate('/mot-de-passe-oublie', { replace: true })
    return null
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authService.passwordResetRequest({ telephone })
      toast.success('Code renvoyé par SMS !')
      setResendCooldown(RESEND_COOLDOWN)
    } catch (err) {
      toast.error(extractApiError(err, 'Erreur lors de l\'envoi du code.'))
    } finally {
      setResending(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authService.passwordResetVerify({ telephone, code })
      setResetToken(data.reset_token)
      setStep(2)
      toast.success('Code vérifié !')
    } catch (err) {
      toast.error(extractApiError(err, 'Code invalide ou expiré.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      await authService.passwordResetConfirm({ reset_token: resetToken, password })
      toast.success('Mot de passe réinitialisé avec succès !')
      navigate('/connexion')
    } catch (err) {
      toast.error(extractApiError(err, 'Erreur lors de la réinitialisation.'))
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-3xl font-display">B</span>
            </div>
          </Link>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 1 ? 'bg-indigo-500 text-white' : 'bg-white/20 text-indigo-200'
            }`}>1</span>
            <span className="w-8 h-0.5 bg-white/30 rounded" />
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= 2 ? 'bg-indigo-500 text-white' : 'bg-white/20 text-indigo-200'
            }`}>2</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            {step === 1 ? 'Code de vérification' : 'Nouveau mot de passe'}
          </h1>
          <p className="text-indigo-200 text-sm mt-2">
            {step === 1
              ? `Un code à 6 chiffres a été envoyé au ${telephone}.`
              : 'Choisissez un mot de passe sécurisé.'}
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/30 shadow-2xl shadow-black/30">
          {step === 1 ? (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                  Code reçu par SMS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm text-center text-2xl tracking-[0.5em] font-bold"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || code.length !== 6}
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
                    Vérification...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Vérifier le code
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending
                    ? 'Envoi...'
                    : resendCooldown > 0
                      ? `Renvoyer le code (${resendCooldown}s)`
                      : 'Renvoyer un code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
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

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2 ml-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400 hover:text-indigo-200 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                    Réinitialisation...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Réinitialiser le mot de passe
                  </>
                )}
              </motion.button>
            </form>
          )}

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
