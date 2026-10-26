import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Camera } from 'lucide-react'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      if (mountedRef.current) {
        setError("Caméra non disponible. Autorisez l'accès à la caméra puis réessayez.")
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    startCamera()
    return () => {
      mountedRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [startCamera])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg', lastModified: Date.now() })
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }
        onCapture(file)
      },
      'image/jpeg',
      0.92
    )
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">Prendre un selfie</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Error */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Camera className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover bg-gray-800"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/40" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="px-5 py-4 flex flex-col items-center gap-3">
          {!error && (
            <button
              onClick={handleCapture}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
            >
              <Camera className="w-5 h-5" />
              Capturer
            </button>
          )}
          <p className="text-gray-400 text-xs text-center leading-relaxed">
            Assurez-vous que votre visage et votre pièce d'identité sont visibles
          </p>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white text-sm font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
