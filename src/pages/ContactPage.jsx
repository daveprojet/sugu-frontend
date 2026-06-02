import { useState } from 'react'
import { toast } from 'react-toastify'

const contactEmail = 'contact@sugu.sn'
const contactPhone = '+221770000000'

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    sujet: '',
    message: '',
  })

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(form.sujet || 'Contact Sugu.sn')
    const body = encodeURIComponent(
      `Nom: ${form.nom}\nTelephone: ${form.telephone}\n\n${form.message}`
    )

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
    toast.success('Votre client mail va s ouvrir avec le message prepare.')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Contact</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Parlons de votre besoin</h1>
        <p className="text-gray-500 text-sm mt-2">
          Une question, un souci avec une demande ou envie de rejoindre la plateforme ? Ecrivez-nous.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Envoyer un message</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input
                value={form.nom}
                onChange={e => set('nom', e.target.value)}
                required
                className="input-field"
                placeholder="Moussa Diallo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={e => set('telephone', e.target.value)}
                className="input-field"
                placeholder="+221 77 000 00 00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
              <input
                value={form.sujet}
                onChange={e => set('sujet', e.target.value)}
                required
                className="input-field"
                placeholder="Question sur une demande"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                required
                rows={6}
                className="input-field resize-none"
                placeholder="Expliquez votre demande..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary">Envoyer</button>
            </div>
          </form>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">Coordonnees</h2>
            <div className="flex flex-col gap-3 text-sm">
              <a href={`mailto:${contactEmail}`} className="text-gray-700 hover:text-primary-600">
                {contactEmail}
              </a>
              <a href={`tel:${contactPhone}`} className="text-gray-700 hover:text-primary-600">
                {contactPhone}
              </a>
              <p className="text-gray-500">Dakar, Senegal</p>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-3">Besoin rapide ?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Pour trouver un prestataire, consultez directement la liste des artisans disponibles.
            </p>
            <a href="/artisans" className="btn-secondary inline-block">Voir les artisans</a>
          </section>
        </aside>
      </div>
    </main>
  )
}
