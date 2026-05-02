/**
 * ============================================================================
 * MEDITRUJILLO - FRONTEND (React + Vite)
 * ============================================================================
 * 
 * ARQUITECTURA DEL FRONTEND:
 * Aplicación de una sola página (SPA) construida con React. Utiliza `react-router-dom`
 * para la navegación entre las diferentes pantallas (Inicio, Búsqueda, Perfil, etc.).
 * 
 * COMPONENTES PRINCIPALES:
 * - AppProvider: Maneja el estado global (sesión, doctor seleccionado).
 * - AppShell: Estructura base (Header, Main, Footer y modales globales).
 * - Suspense/lazy: Optimización de carga (Code Splitting) para que las páginas
 *   pesadas solo se descarguen cuando el usuario las visita.
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/AppShell'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })))
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })))
const AttentionPage = lazy(() => import('./pages/AttentionPage').then(module => ({ default: module.AttentionPage })))
const AiPage = lazy(() => import('./pages/AiPage').then(module => ({ default: module.AiPage })))
const DoctorSignupPage = lazy(() => import('./pages/DoctorSignupPage').then(module => ({ default: module.DoctorSignupPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const DoctorProfile = lazy(() => import('./components/DoctorProfile').then(module => ({ default: module.DoctorProfile })))
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/buscar-doctor" element={<SearchPage />} />
              <Route path="/atencion-ahora" element={<AttentionPage />} />
              <Route path="/orientacion-ia" element={<AiPage />} />
              <Route path="/eres-medico" element={<DoctorSignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/acerca-de" element={<AboutPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />
              <Route path="/terminos" element={<TermsPage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App