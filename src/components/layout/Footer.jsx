import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-sand-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-display font-bold text-lg">Sugu.sn</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Trouvez les meilleurs artisans près de chez vous au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/artisans" className="hover:text-primary-500">Chercher un artisan</Link></li>
              <li><Link to="/inscription-artisan" className="hover:text-primary-500">Devenir artisan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Aide</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/a-propos#comment-ca-marche" className="hover:text-primary-500">Comment ça marche ?</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500">Nous contacter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Légal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/cgu" className="hover:text-primary-500">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary-500">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-sand-100 mt-8 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Sugu.sn — Fait avec ❤️ au Sénégal
        </div>
      </div>
    </footer>
  )
}
