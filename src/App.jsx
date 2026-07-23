import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from '@/context/AuthContext'
import { useGeoLocation } from '@/hooks/useGeoLocation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

import HomePage           from '@/pages/HomePage'
import AboutPage          from '@/pages/AboutPage'
import ContactPage        from '@/pages/ContactPage'
import ArtisansPage       from '@/pages/ArtisansPage'
import ArtisanDetailPage  from '@/pages/ArtisanDetailPage'
import AvisArtisanPage    from '@/pages/AvisArtisanPage'
import MonProfil from '@/pages/MonProfil'
import IdentitePiecePage from '@/pages/IdentitePiecePage'
import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import DashboardArtisanPage from '@/pages/DashboardArtisanPage'
import DashboardClientPage from '@/pages/DashboardClientPage'
import TermsPage from '@/pages/TermsPage'
import ConfidentialitePage from '@/pages/ConfidentialitePage'
import CommissionDashboardPage from '@/pages/CommissionDashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

// Route protégée
function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/connexion" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  useGeoLocation()
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/a-propos"          element={<AboutPage />} />
          <Route path="/contact"           element={<ContactPage />} />
          <Route path="/artisans"          element={<ArtisansPage />} />
          <Route path="/artisans/:uid"      element={<ArtisanDetailPage />} />
          <Route path="/artisans/:uid/avis"  element={<AvisArtisanPage />} />
          <Route path="/connexion"         element={<LoginPage />} />
          <Route path="/inscription"       element={<RegisterPage />} />
          <Route path="/inscription-artisan" element={<RegisterPage />} />
          <Route path="/mon-profil" element={
            <PrivateRoute><MonProfil /></PrivateRoute>
          } />
          <Route path="/mon-profil/identite" element={
            <PrivateRoute role="artisan"><IdentitePiecePage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan" element={
            <PrivateRoute role="artisan"><DashboardArtisanPage /></PrivateRoute>
          } />
          <Route path="/dashboard-artisan/commissions" element={
            <PrivateRoute role="artisan"><CommissionDashboardPage /></PrivateRoute>
          } />
          <Route path="/dashboard-client" element={
            <PrivateRoute role="client"><DashboardClientPage /></PrivateRoute>
          } />
          <Route path="/cgu"              element={<TermsPage />} />
          <Route path="/confidentialite"  element={<ConfidentialitePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
