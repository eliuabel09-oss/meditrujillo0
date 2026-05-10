import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'

// Optimized Inline SVGs
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/buscar-doctor', label: 'Buscar Doctor' },
  { to: '/atencion-ahora', label: 'Atención Ahora' },
  { to: '/orientacion-ia', label: 'Orientación IA' },
  { to: '/eres-medico', label: '¿Eres médico?' }
]

export function Header() {
  const { session, authLoading, logout } = useAppContext()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  const onSearch = (e) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    navigate(`/buscar-doctor?q=${encodeURIComponent(query)}`)
  }

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-slate-100 bg-white/70 backdrop-blur-2xl transition-all duration-300 dark:border-white/5 dark:bg-slate-950/70">
        <div className="section-container flex h-20 items-center justify-between gap-4 md:gap-8">

          {/* Logo - Premium Style */}
          <NavLink to="/" className="flex shrink-0 items-center gap-4 group" onClick={closeMenu} aria-label="MedicoTrujillo - Inicio">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-brand-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src="/images/logoclinica.webp" 
                alt="Logo MedicoTrujillo" 
                width="92" 
                height="50"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                className="relative h-10 w-[73px] rounded-xl object-contain shadow-2xl transition-transform group-hover:scale-105" 
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950 shadow-sm"></div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[18px] font-black leading-none tracking-tight text-slate-950 dark:text-white">
                <span className="text-brand-600">Medi</span>Trujillo
              </div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Salud al Instante</div>
            </div>
          </NavLink>

          {/* Desktop nav - Focused & Clean */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-[13px] font-black transition-all duration-300 rounded-2xl ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Desktop search */}
            <form onSubmit={onSearch} className="hidden h-12 items-center rounded-2xl bg-slate-50 px-5 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 dark:bg-white/5 dark:focus-within:bg-slate-900 xl:flex border border-transparent focus-within:border-brand-500/30">
              <label htmlFor="desktop-search" className="sr-only">Buscar especialista</label>
              <input
                id="desktop-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar especialista..."
                className="w-[200px] bg-transparent text-[13px] font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </form>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition-all hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5 dark:text-yellow-400 dark:hover:bg-yellow-400/10"
              aria-label="Cambiar modo"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth */}
            <div className="hidden md:flex items-center">
              {authLoading ? (
                <div className="h-11 w-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10"></div>
              ) : session ? (
                <button 
                  className="flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-6 text-[13px] font-black text-white transition-all hover:bg-slate-800 active:scale-95 dark:bg-white/10 dark:hover:bg-white/20 whitespace-nowrap" 
                  onClick={logout}
                >
                  Salir
                </button>
              ) : (
                <button 
                  className="flex h-11 items-center justify-center rounded-2xl bg-brand-600 px-6 text-[13px] font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95 whitespace-nowrap" 
                  onClick={() => navigate('/login')}
                >
                  Acceder
                </button>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white/10" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menú de navegación">
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white animate-fade-in dark:bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-12">
            <NavLink to="/" className="flex items-center gap-4" onClick={closeMenu}>
              <img 
                src="/images/logoclinica.webp" 
                alt="MedicoTrujillo" 
                width="73" 
                height="40"
                className="h-10 w-auto rounded-xl shadow-xl" 
              />
              <div className="text-2xl font-black text-slate-950 dark:text-white">
                MediTrujillo
              </div>
            </NavLink>
            <button 
              className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-900 transition-all active:scale-90 dark:bg-white/5 dark:text-white" 
              onClick={closeMenu}
              aria-label="Cerrar menú"
            >
              <XIcon />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <form onSubmit={onSearch} className="mb-10 flex h-16 items-center rounded-[32px] bg-slate-50 px-8 dark:bg-white/5">
              <label htmlFor="mobile-search" className="sr-only">¿Qué buscas hoy?</label>
              <input
                id="mobile-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué buscas hoy?"
                className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <svg className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </form>

            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center h-14 px-8 rounded-2xl text-[18px] font-black transition-all ${isActive ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20' : 'text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="pt-10 border-t border-slate-100 dark:border-white/5">
            {session ? (
              <button className="w-full h-16 rounded-3xl bg-slate-950 text-lg font-black text-white dark:bg-white/10" onClick={() => { logout(); closeMenu(); }}>
                Cerrar Sesión
              </button>
            ) : (
              <button className="w-full h-16 rounded-3xl bg-brand-600 text-lg font-black text-white shadow-2xl shadow-brand-500/30" onClick={() => { closeMenu(); navigate('/login'); }}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
