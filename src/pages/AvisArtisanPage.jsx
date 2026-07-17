import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useArtisan, useArtisanAvis } from "@/hooks/useArtisans";
import StarRating from "@/components/common/StarRating";
import Spinner from "@/components/common/Spinner";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function AvisArtisanPage() {
  const { uid } = useParams();
  const { data: artisan } = useArtisan(uid);
  const [page, setPage] = useState(1);
  const [allAvis, setAllAvis] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  const { data, isLoading, isFetching } = useArtisanAvis(uid, { page });

  useEffect(() => {
    if (data?.results) {
      setAllAvis((prev) => {
        const existingIds = new Set(prev.map((a) => a.id))
        const newItems = data.results.filter((a) => !existingIds.has(a.id))
        return [...prev, ...newItems]
      })
      setHasMore(!!data.next)
    }
  }, [data])

  useEffect(() => {
    setPage(1)
    setAllAvis([])
    setHasMore(true)
  }, [uid])

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1)
    }
  }, [hasMore, isFetching])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={`/artisans/${uid}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 hover:gap-2 transition-all duration-200 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au profil
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-indigo-500" />
            Avis clients
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {artisan
              ? `Avis laissés pour ${artisan.prenom} ${artisan.nom}`
              : "Chargement..."}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : allAvis.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm italic">
              Aucun avis pour le moment.
            </p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6"
            >
              <div className="flex flex-col gap-5">
                {allAvis.map((a) => (
                  <motion.div
                    key={a.id}
                    variants={itemVariants}
                    className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {a.client_nom}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <StarRating note={a.note} size="sm" showNote={false} />
                    </div>
                    {a.commentaire && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {a.commentaire}
                      </p>
                    )}
                    {a.reponse_artisan && (
                      <div className="mt-3 bg-indigo-50/80 border border-indigo-200/60 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="text-xs font-semibold text-indigo-600">
                            Réponse de l'artisan
                          </p>
                          {a.reponse_artisan_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(
                                a.reponse_artisan_at
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {a.reponse_artisan}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div ref={sentinelRef} className="h-4" />

            {isFetching && (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            )}

            {!hasMore && !isFetching && allAvis.length > 0 && (
              <p className="text-center text-sm text-gray-400 py-6">
                Fin des avis
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
