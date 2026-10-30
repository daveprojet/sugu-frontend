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
            url('https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3">
            Parcourir par métier
          </h2>
          <p className="text-muted text-lg">
            Sélectionnez le type d'artisan dont vous avez besoin
          </p>
        </div>
        <MetierGrid />
      </section>

      {/* Comment ça marche */}
      <section className="bg-canvas-soft py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-ink mb-14"
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
                className="bg-white rounded-xl p-8 border border-line hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(22,48,91,.06)] transition-all duration-150 relative"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {step}
                </div>
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
                  <Icon className="w-8 h-8 text-indigo-700" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {title}
                </h3>
                <p className="text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA artisan */}
      <section className="bg-white py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-xl border border-line p-10 md:p-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
            Devenez partenaire de Bricolibe
          </h2>
          <p className="text-muted text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Entreprise, confiez vos interventions à nos artisans. Artisan,
            rejoignez l'équipe Bricolibe et intervenez pour nos partenaires.
          </p>
          <motion.a
            href="/devenir-partenaire"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 transition-colors duration-150"
          >
            Devenir partenaire
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </section>
    </main>
  );
}
