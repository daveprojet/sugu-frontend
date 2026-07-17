import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  IdCard,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  FileImage,
  Camera,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useIdentite, useUploadIdentite } from '@/hooks/useArtisans'
import { STATUTS_IDENTITE } from '@/utils/constants'
import {
  TYPE_PIECES,
  resolveImageUrl,
  validateIdentityFile,
} from '@/utils/helpers'
import Spinner from '@/components/common/Spinner'
import CameraCapture from '@/components/common/CameraCapture'

export default function IdentitePiecePage() {
  const { user } = useAuth()
  const uid = user?.artisan_uid
  const { data: identite, isLoading, isError, error } = useIdentite(uid)
  const uploadIdentite = useUploadIdentite()

  const [typePiece, setTypePiece] = useState('cni')
  const [rectoFile, setRectoFile] = useState(null)
  const [versoFile, setVersoFile] = useState(null)
  const [rectoPreview, setRectoPreview] = useState(null)
  const [versoPreview, setVersoPreview] = useState(null)
  const [selfieFile, setSelfieFile] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    if (identite) {
      setTypePiece(identite.type_piece || 'cni')
    }
  }, [identite])

  const statut = identite?.statut || 'EN_ATTENTE'
  const statutConfig = STATUTS_IDENTITE[statut] || STATUTS_IDENTITE.EN_ATTENTE
  const isVerified = statut === 'VERIFIEE'
  const hasIdentity = !!identite

  const handleRectoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateIdentityFile(file)
    if (error) { toast.error(error); return }
    setRectoFile(file)
    setRectoPreview(URL.createObjectURL(file))
  }

  const handleVersoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateIdentityFile(file)
    if (error) { toast.error(error); return }
    setVersoFile(file)
    setVersoPreview(URL.createObjectURL(file))
  }

  const removeRecto = () => {
    setRectoFile(null)
    setRectoPreview(null)
  }

  const removeVerso = () => {
    setVersoFile(null)
    setVersoPreview(null)
  }

  const handleSelfieChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateIdentityFile(file)
    if (error) { toast.error(error); return }
    setSelfieFile(file)
    setSelfiePreview(URL.createObjectURL(file))
  }

  const removeSelfie = () => {
    setSelfieFile(null)
    setSelfiePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rectoFile && !selfieFile && !hasIdentity) {
      toast.error('Veuillez sélectionner un fichier pour le recto et le selfie.')
      return
    }

    const formData = new FormData()
    formData.append('type_piece', typePiece)
    if (rectoFile) formData.append('recto', rectoFile)
    if (selfieFile) formData.append('selfie', selfieFile)
    if (versoFile) formData.append('verso', versoFile)

    try {
      await uploadIdentite.mutateAsync({ uid, formData })
      setRectoFile(null)
      setVersoFile(null)
      setSelfieFile(null)
      setRectoPreview(null)
      setVersoPreview(null)
      setSelfiePreview(null)
    } catch {
      // handled by mutation onError
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    )
  }

  if (isError && error?.response?.status === 404 && !identite) {
    // 404 means no identity document yet — that's ok, show the form
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link
              to="/mon-profil"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-indigo-600 mb-0.5 uppercase tracking-wider">
                Espace Artisan
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
                Ma pièce d'identité
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        {hasIdentity && (
          <motion.div
            variants={itemVariants}
            className={`rounded-2xl border p-5 flex items-center gap-4 ${
              isVerified
                ? 'bg-emerald-50 border-emerald-200'
                : statut === 'REJETEE'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isVerified
                ? 'bg-emerald-100 text-emerald-600'
                : statut === 'REJETEE'
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-600'
            }`}>
              {isVerified ? <CheckCircle className="w-6 h-6" /> : statut === 'REJETEE' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statutConfig.color}`}>
                {statutConfig.label}
              </span>
              {statut === 'REJETEE' && identite?.motif_rejet && (
                <p className="mt-2 text-sm text-red-700 font-medium">
                  Motif : {identite.motif_rejet}
                </p>
              )}
              {statut === 'EN_ATTENTE' && (
                <p className="mt-1 text-sm text-amber-700">
                  Votre pièce d'identité est en cours de vérification par nos équipes.
                </p>
              )}
              {isVerified && (
                <p className="mt-1 text-sm text-emerald-700">
                  Votre identité a été vérifiée avec succès.
                </p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Current Documents Preview */}
          {hasIdentity && (identite.recto || identite.verso || identite.selfie) && (
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileImage className="w-4 h-4" />
                </div>
                <h2 className="font-display text-lg font-semibold text-gray-900">
                  Documents actuels
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {identite.recto && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Recto</p>
                    <img
                      src={rectoPreview || resolveImageUrl(identite.recto)}
                      alt="Recto pièce d'identité"
                      className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-64"
                    />
                  </div>
                )}
                {identite.selfie && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Selfie</p>
                    <img
                      src={selfiePreview || resolveImageUrl(identite.selfie)}
                      alt="Selfie avec pièce d'identité"
                      className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-64"
                    />
                  </div>
                )}
                {identite.verso && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Verso</p>
                    <img
                      src={versoPreview || resolveImageUrl(identite.verso)}
                      alt="Verso pièce d'identité"
                      className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-64"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Upload Form — hidden when verified */}
          {!isVerified && (
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Upload className="w-4 h-4" />
                </div>
                <h2 className="font-display text-lg font-semibold text-gray-900">
                  {hasIdentity ? 'Mettre à jour' : 'Ajouter'} ma pièce d'identité
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de pièce */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de pièce
                  </label>
                  <select
                    value={typePiece}
                    onChange={(e) => setTypePiece(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
                  >
                    {TYPE_PIECES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recto <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all duration-200 group">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                      <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">
                        {rectoFile ? rectoFile.name : 'Cliquez pour sélectionner'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 Mo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleRectoChange}
                        className="hidden"
                      />
                    </label>
                    {rectoPreview && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={rectoPreview}
                          alt="Aperçu recto"
                          className="h-40 w-32 rounded-xl border border-gray-200 object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeRecto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selfie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie avec votre pièce d'identité <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3 ml-1">
                    Prenez une photo de vous avec votre pièce d'identité visible à côté de votre visage
                  </p>
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => setShowCamera(true)}
                      className="flex-1 flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all duration-200 group"
                    >
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                      <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">
                        {selfieFile ? selfieFile.name : 'Prendre une photo avec la caméra'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 Mo</span>
                    </div>
                    {selfiePreview && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={selfiePreview}
                          alt="Aperçu selfie"
                          className="h-40 w-32 rounded-xl border border-gray-200 object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeSelfie}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verso <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all duration-200 group">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                      <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600">
                        {versoFile ? versoFile.name : 'Cliquez pour sélectionner'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 Mo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleVersoChange}
                        className="hidden"
                      />
                    </label>
                    {versoPreview && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={versoPreview}
                          alt="Aperçu verso"
                          className="h-40 w-32 rounded-xl border border-gray-200 object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeVerso}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploadIdentite.isLoading}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {uploadIdentite.isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" color="white" /> Envoi en cours...
                      </span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> Envoyer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            const err = validateIdentityFile(file)
            if (err) { toast.error(err); return }
            setSelfieFile(file)
            setSelfiePreview(URL.createObjectURL(file))
            setShowCamera(false)
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </main>
  )
}
