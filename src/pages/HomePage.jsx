import { motion } from "framer-motion";
import { Search, User, Phone, Wrench, Star, ArrowRight } from "lucide-react";
import SearchBar from "@/components/home/SearchBar";
import MetierGrid from "@/components/home/MetierGrid";

export default function HomePage() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - image de fond via CSS */}
      <section
        className="relative text-white overflow-hidden min-h-[600px] flex items-center"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(67, 56, 202, 0.85), rgba(147, 51, 234, 0.75)),
            url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80')
          `,
          backgroundSize: "cover",

          backgroundPosition: "center",
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Motif de fond (points) */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Blobs animés */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-blob animation-delay-2000" />

        {/* Contenu */}
        <div className="relative z-10 max-w-4xl mx-auto py-24 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg"
          >
            Trouvez l'artisan qu'il vous faut,
            <br />
            <span className="text-purple-200 drop-shadow-md">
              près de chez vous
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-indigo-100 text-lg md:text-xl mb-10 font-light tracking-wide max-w-2xl mx-auto"
          >
            Plombiers, électriciens, maçons, menuisiers... Plus besoin de
            demander aux voisins.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto transform transition-transform duration-300 hover:scale-[1.02]"
          >
            <SearchBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-indigo-200"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <Wrench className="w-4 h-4 text-white" />
              <span className="font-bold text-white">500+</span>
              <span>artisans disponibles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="font-bold text-white">4.8/5</span>
              <span>de satisfaction</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center md:text-left mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Parcourir par métier
          </h2>
          <p className="text-gray-500 text-lg">
            Sélectionnez le type d'artisan dont vous avez besoin
          </p>
        </div>
        <MetierGrid />
      </section>

      {/* Comment ça marche */}
      <section className="bg-gradient-to-br from-gray-50/50 to-indigo-50/30 py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14"
          >
            Comment ça marche ?
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "1",
                icon: Search,
                title: "Cherchez",
                desc: "Entrez votre besoin et votre quartier",
              },
              {
                step: "2",
                icon: User,
                title: "Choisissez",
                desc: "Consultez les profils et avis clients",
              },
              {
                step: "3",
                icon: Phone,
                title: "Contactez",
                desc: "Appelez ou envoyez un message WhatsApp",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <motion.div
                key={step}
                variants={fadeUpVariant}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 border border-gray-100/80 hover:border-indigo-200 transition-all duration-300 relative"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
                  {step}
                </div>
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA artisan */}
      <section className="relative bg-gradient-to-br from-indigo-50/50 to-purple-50/50 py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/40 border border-white/60 p-10 md:p-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vous êtes artisan ?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Créez votre profil gratuitement et recevez des demandes de clients
            dans votre quartier.
          </p>
          <motion.a
            href="/inscription-artisan"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-all duration-300"
          >
            Créer mon profil artisan
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </section>
    </main>
  );
}
