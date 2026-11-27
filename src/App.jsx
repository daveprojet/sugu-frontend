import { lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { extraireUid } from '@/utils/liensArtisan'
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from '@/context/AuthContext'
import { getServerErrorMessage } from '@/utils/errors'
import { useGeoLocation } from '@/hooks/useGeoLocation'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PushPermissionBanner from '@/components/common/PushPermissionBanner'
import InstallAppBanner from '@/components/common/InstallAppBanner'
import Spinner from '@/components/common/Spinner'
import ScrollToTop from '@/components/common/ScrollToTop'
import { GestionSeo } from '@/hooks/useSeo'
import NotFoundPage from '@/pages/NotFoundPage'

import HomePage           from '@/pages/HomePage'
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
import RappelIdentiteModal from '@/components/common/RappelIdentiteModal'
import RappelAvisModal from '@/components/common/RappelAvisModal'
const ArtisansPage = lazy(() => import('@/pages/ArtisansPage'))
const ArtisanDetailPage = lazy(() => import('@/pages/ArtisanDetailPage'))
const AvisArtisanPage = lazy(() => import('@/pages/AvisArtisanPage'))
const MetierPage = lazy(() => import('@/pages/MetierPage'))
const MonProfil = lazy(() => import('@/pages/MonProfil'))
const IdentitePiecePage = lazy(() => import('@/pages/IdentitePiecePage'))
const DossierProPage = lazy(() => import('@/pages/DossierProPage'))
const MesRealisationsPage = lazy(() => import('@/pages/MesRealisationsPage'))
const BienvenueArtisanPage = lazy(() => import('@/pages/BienvenueArtisanPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardArtisanPage = lazy(() => import('@/pages/DashboardArtisanPage'))
const DashboardClientPage = lazy(() => import('@/pages/DashboardClientPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const DevenirArtistePage = lazy(() => import('@/pages/DevenirArtistePage'))
const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'))
const OeuvrePage = lazy(() => import('@/pages/OeuvrePage'))
const ArtisteMarketplacePage = lazy(() => import('@/pages/ArtisteMarketplacePage'))
const EspaceArtistePage = lazy(() => import('@/pages/EspaceArtistePage'))
const OeuvreFormPage = lazy(() => import('@/pages/OeuvreFormPage'))
const ConfirmerEmailArtistePage = lazy(() => import('@/pages/ConfirmerEmailArtistePage'))
const ConfidentialitePage = lazy(() => import('@/pages/ConfidentialitePage'))
const CommissionDashboardPage = lazy(() => import('@/pages/CommissionDashboardPage'))
const AbonnementsPage = lazy(() => import('@/pages/AbonnementsPage'))
const MotDePasseOubliePage = lazy(() => import('@/pages/MotDePasseOubliePage'))
const ResetMotDePassePage = lazy(() => import('@/pages/ResetMotDePassePage'))
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'))
const PaymentCancelPage = lazy(() => import('@/pages/PaymentCancelPage'))
const DevenirPartenairePage = lazy(() => import('@/pages/DevenirPartenairePage'))
const TableauEntreprisePage = lazy(() => import('@/pages/TableauEntreprisePage'))
const DemandesEntreprisePage = lazy(() => import('@/pages/DemandesEntreprisePage'))
const SitesEntreprisePage = lazy(() => import('@/pages/SitesEntreprisePage'))
const AbonnementEntreprisePage = lazy(() => import('@/pages/AbonnementEntreprisePage'))
const FacturesEntreprisePage = lazy(() => import('@/pages/FacturesEntreprisePage'))
const RapportsEntreprisePage = lazy(() => import('@/pages/RapportsEntreprisePage'))
const NouvelleDemandeEntreprisePage = lazy(() => import('@/pages/NouvelleDemandeEntreprisePage'))
const DemandeEntreprisePage = lazy(() => import('@/pages/DemandeEntreprisePage'))
const MissionEntreprisePage = lazy(() => import('@/pages/MissionEntreprisePage'))
const MissionsEntreprisesPage = lazy(() => import('@/pages/MissionsEntreprisesPage'))
const EquipeEntreprisePage = lazy(() => import('@/pages/EquipeEntreprisePage'))
import { BarreOnglets, avecBarreOnglets, estEspaceTravail } from '@/components/layout/NavigationRole'

const queryClient = new QueryClient({
  // Sans cela, une liste qui ne se charge pas à cause du serveur s'affiche comme vide.
  // Le toastId évite d'afficher le même message pour chaque requête en échec.
  queryCache: new QueryCache({
    onError: (error) => {
      const message = getServerErrorMessage(error)
      if (message) toast.error(message, { toastId: message })
    },
  }),
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

// Route protégée
const ACCUEIL_PARTENAIRE = '/dashboard-artisan/missions-entreprises'

// Un segment qui finit par un uid est un profil (…/avis : ses avis) ; sinon c'est une page métier.
function RouteArtisans() {
  const { uid: segment, suite } = useParams()
  if (extraireUid(segment)) {
    if (!suite) return <ArtisanDetailPage />
    return suite === 'avis' ? <AvisArtisanPage /> : <NotFoundPage />
  }
  return <MetierPage key={`${segment}/${suite || ''}`} />
}

function PrivateRoute({ children, role, independant = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/connexion" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  // Espace des artisans indépendants (demandes des clients, commissions, abonnements) :
  // un artisan uniquement partenaire ne travaille que pour les entreprises.
  if (independant && user.independant === false) return <Navigate to={ACCUEIL_PARTENAIRE} replace />
  return children
}

function AppRoutes() {
  useGeoLocation()
  const { user } = useAuth()
  const { requestPermissionAndRegister, hasRegisteredToken } = usePushNotifications(user)
  // Page mission : sa barre d'actions est fixée en bas, la bannière la masquerait.
  const { pathname } = useLocation()
  const barreActions = pathname.startsWith('/dashboard-artisan/missions-entreprises/')
  // Téléphone : barre d'onglets en bas une fois connecté, le contenu ne doit pas passer dessous.
  const onglets = avecBarreOnglets(user, pathname)
  // Espaces de travail (entreprise, ouvrier partenaire) : présentés comme un tableau de bord, sans pied de page.
  const espace = estEspaceTravail(pathname)

  return (
    <div className={`flex flex-col min-h-screen ${onglets ? 'pb-16 md:pb-0 avec-onglets' : ''}`}>
      <ScrollToTop />
      <GestionSeo />
      <Navbar />
      <div className="flex-1">
        {/* Pages téléchargées à la demande : le premier chargement ne contient que l'accueil. */}
        <Suspense fallback={<div className="flex justify-center py-24"><Spinner size="lg" /></div>}>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/a-propos"          element={<AboutPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/artisans"          element={<ArtisansPage />} />
          {/* /artisans/<prenom-nom>-<uid> : profil ; /artisans/<metier>[/<ville>] : page métier. */}
          <Route path="/artisans/:uid"        element={<RouteArtisans />} />
          <Route path="/artisans/:uid/:suite" element={<RouteArtisans />} />
          <Route path="/connexion"         element={<LoginPage />} />
          <Route path="/inscription"       element={<RegisterPage />} />
          <Route path="/inscription-artisan" element={<RegisterPage />} />
          {/* Les comptes entreprise naissent de l'acceptation de la candidature. */}
          <Route path="/inscription-entreprise" element={<Navigate to="/devenir-partenaire" replace />} />
          <Route path="/devenir-partenaire" element={<DevenirPartenairePage />} />
          {/* Marketplace : inscription des artistes (le suivi sert aussi d'espace artiste pour l'instant) */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/oeuvres/:segment" element={<OeuvrePage />} />
          <Route path="/marketplace/artistes/:segment" element={<ArtisteMarketplacePage />} />
          <Route path="/marketplace/devenir-artiste" element={<DevenirArtistePage />} />
          <Route path="/marketplace/confirmer-email" element={<ConfirmerEmailArtistePage />} />
          <Route path="/espace-artiste" element={<PrivateRoute><EspaceArtistePage /></PrivateRoute>} />
          <Route path="/espace-artiste/oeuvres/nouvelle" element={<PrivateRoute><OeuvreFormPage /></PrivateRoute>} />
          <Route path="/espace-artiste/oeuvres/:uid/modifier" element={<PrivateRoute><OeuvreFormPage /></PrivateRoute>} />
          <Route path="/mon-profil" element={
            <PrivateRoute><MonProfil /></PrivateRoute>
          } />
          <Route path="/mon-profil/identite" element={
            <PrivateRoute role="artisan"><IdentitePiecePage /></PrivateRoute>
          } />
          <Route path="/mon-profil/realisations" element={
            <PrivateRoute role="artisan"><MesRealisationsPage /></PrivateRoute>
          } />
          <Route path="/bienvenue-artisan" element={
            <PrivateRoute role="artisan"><BienvenueArtisanPage /></PrivateRoute>
          } />
          <Route path="/mon-profil/dossier" element={
            <PrivateRoute role="artisan"><DossierProPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan" element={
            <PrivateRoute role="artisan" independant><DashboardArtisanPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan/abonnements" element={
            <PrivateRoute role="artisan" independant><AbonnementsPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan/commissions" element={
            <PrivateRoute role="artisan" independant><CommissionDashboardPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan/missions-entreprises" element={
            <PrivateRoute role="artisan"><MissionsEntreprisesPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan/missions-entreprises/:uid" element={
            <PrivateRoute role="artisan"><MissionEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise" element={
            <PrivateRoute role="entreprise"><TableauEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/demandes" element={
            <PrivateRoute role="entreprise"><DemandesEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/rapports" element={
            <PrivateRoute role="entreprise"><RapportsEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/factures" element={
            <PrivateRoute role="entreprise"><FacturesEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/abonnement" element={
            <PrivateRoute role="entreprise"><AbonnementEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/sites" element={
            <PrivateRoute role="entreprise"><SitesEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/nouvelle-demande" element={
            <PrivateRoute role="entreprise"><NouvelleDemandeEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/equipe" element={
            <PrivateRoute role="entreprise"><EquipeEntreprisePage /></PrivateRoute>
          } />
          <Route path="/espace-entreprise/demandes/:uid" element={
            <PrivateRoute role="entreprise"><DemandeEntreprisePage /></PrivateRoute>
          } />
          <Route path="/dashboard-client" element={
            <PrivateRoute role="client"><DashboardClientPage /></PrivateRoute>
          } />
          <Route path="/cgu"              element={<TermsPage />} />
          <Route path="/confidentialite"  element={<ConfidentialitePage />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePage />} />
          <Route path="/reset-mot-de-passe"  element={<ResetMotDePassePage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </div>
      {!espace && <Footer />}
      {user?.role === 'artisan' && <RappelIdentiteModal artisanUid={user.artisan_uid} />}
      {user?.role === 'client' && <RappelAvisModal />}
      {/* Bannières du bas (installation, notifications) empilées : elles ne se recouvrent pas. */}
      {!barreActions && (
        <div className={`fixed left-4 right-4 md:left-auto md:right-4 md:w-[26rem] z-50 flex flex-col gap-3 pointer-events-none ${
          onglets ? 'bottom-20 md:bottom-4' : 'bottom-4'
        }`}>
          {user && (
            <PushPermissionBanner
              onAllow={requestPermissionAndRegister}
              hasRegisteredToken={hasRegisteredToken}
            />
          )}
          <InstallAppBanner />
        </div>
      )}
      <BarreOnglets />
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Animations coupées si le téléphone demande moins d'animations (accessibilité, appareils lents). */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  )
}
