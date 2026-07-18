import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCreateContact } from "@/hooks/useContacts";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

// 1. IMPORT DE L'IMAGE DE FOND DU HERO (locale)
import heroBg from "/images/metiers/register-bg.jpg";

const contactEmail = "contact@bricolibe.com";
const contactPhone = "+221777234086";

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });

  const createContact = useCreateContact();
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createContact.mutate(form);
  };

  // Animation variants pour un effet d'apparition fluide
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* === NOUVEAU HERO AVEC IMAGE DE FOND === */}
        <section className="relative overflow-hidden rounded-3xl mb-10 p-10 md:p-14 shadow-2xl shadow-gray-200/60">
          {/* Image de fond */}
          <div className="absolute inset-0 -z-10">
            <img
              src={heroBg}
              alt="Hero contact"
              className="w-full h-full object-cover"
            />
            {/* Overlay clair pour que le texte reste lisible et s'intègre au thème clair */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/85 via-white/80 to-purple-50/85" />
          </div>

          {/* Contenu du Hero */}
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              Contact
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-gray-900 leading-tight drop-shadow-sm">
              Parlons de votre besoin
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-lg leading-relaxed">
              Une question, un souci avec une demande ou envie de rejoindre la
              plateforme ? Écrivez-nous.
            </p>
          </div>
        </section>
        {/* ====================================== */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-[1fr_360px] gap-8 items-start"
        >
          {/* Formulaire de contact - Premium Card (INCHANGÉ) */}
          <motion.section
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Envoyer un message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    value={form.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                    placeholder="Moussa Diallo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                    placeholder="moussa@diallo.sn"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => set("telephone", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                    placeholder="+221 77 000 00 00"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  Sujet
                </label>
                <input
                  value={form.sujet}
                  onChange={(e) => set("sujet", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                  placeholder="Question sur une demande"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm resize-none"
                  placeholder="Expliquez votre demande..."
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <motion.button
                  type="submit"
                  disabled={createContact.isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createContact.isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <>
                      Envoyer <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.section>

          {/* Sidebar Informations - Premium Cards (INCHANGÉ) */}
          <aside className="flex flex-col gap-6">
            <motion.section
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60"
            >
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">
                Coordonnées
              </h2>
              <div className="flex flex-col gap-4 text-sm">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  {contactEmail}
                </a>
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  {contactPhone}
                </a>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Dakar, Sénégal
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 backdrop-blur-sm p-6 rounded-3xl border border-indigo-200/40 shadow-2xl shadow-gray-200/60"
            >
              <h2 className="font-display text-lg font-semibold text-gray-900 mb-3">
                Besoin rapide ?
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Pour trouver un prestataire, consultez directement la liste des
                artisans disponibles.
              </p>
              <a
                href="/artisans"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 border border-gray-200 bg-white/60 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm hover:shadow-md group"
              >
                Voir les artisans
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.section>
          </aside>
        </motion.div>
      </motion.div>
    </main>
  );
}
