import SearchBar from '@/components/home/SearchBar'
import MetierGrid from '@/components/home/MetierGrid'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Trouvez l'artisan qu'il vous faut,<br />
            <span className="text-primary-200">près de chez vous</span>
          </h1>
          <p className="text-primary-100 text-lg mb-10">
            Plombiers, électriciens, maçons, menuisiers... Plus besoin de demander aux voisins.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Parcourir par métier
        </h2>
        <p className="text-gray-500 mb-6">Sélectionnez le type d'artisan dont vous avez besoin</p>
        <MetierGrid />
      </section>

      {/* Comment ça marche */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center text-gray-900 mb-10">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Cherchez', desc: 'Entrez votre besoin et votre quartier' },
              { step: '2', icon: '👤', title: 'Choisissez', desc: 'Consultez les profils et avis clients' },
              { step: '3', icon: '📞', title: 'Contactez', desc: 'Appelez ou envoyez un message WhatsApp' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {icon}
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA artisan */}
      <section className="bg-sand-100 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
            Vous êtes artisan ?
          </h2>
          <p className="text-gray-600 mb-6">
            Créez votre profil gratuitement et recevez des demandes de clients dans votre quartier.
          </p>
          <a href="/inscription-artisan" className="btn-primary inline-block">
            Créer mon profil artisan →
          </a>
        </div>
      </section>
    </main>
  )
}
