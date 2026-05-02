// Home Page
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { DoctorShowcase } from '../components/DoctorShowcase'
import { SectionHeader } from '../components/SectionHeader'
import { useSEO } from '../hooks/useSEO'

const clinicTiles = [
  {
    city: 'La Libertad',
    name: 'Clínica San Pablo',
    line: 'Alta Complejidad · Trujillo',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=70'
  },
  {
    city: 'La Libertad',
    name: 'Hospital Regional',
    line: 'Docente · Especializado',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=70'
  },
  {
    city: 'La Libertad',
    name: 'Centro Médico Norte',
    line: 'Traumatología · Pediatría',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=70'
  }
]

const heroImages = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&q=75',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1000&q=75',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=1000&q=75'
]

export function HomePage() {
  const { featuredDoctors } = useAppContext()
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDistrict, setSearchDistrict] = useState('')

  const [showFullCarousel, setShowFullCarousel] = useState(false)

  useSEO({
    title: 'Tu médico ideal en Trujillo | MedicoTrujillo',
    description: 'Encuentra especialistas verificados en Trujillo. Agenda tu cita hoy mismo con los mejores médicos de La Libertad.'
  })

  useEffect(() => {
    // Activar el resto del carrusel después de la carga inicial
    const timer = setTimeout(() => setShowFullCarousel(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="overflow-x-hidden">
      {/* Hero Section - Flexible Height for Responsiveness */}
      <section className="relative min-h-[720px] sm:min-h-[800px] md:h-[840px] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
        {/* Animated Background Blobs - Deferred */}
        {showFullCarousel && (
          <>
            <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-brand-500/20 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-blue-500/15 blur-[150px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
          </>
        )}

        {(showFullCarousel ? heroImages : [heroImages[0]]).map((src, idx) => (
          <img 
            key={src}
            src={`${src.split('?')[0]}?w=500&q=50`}
            alt="Fondo Médico"
            width="500"
            height="323"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${currentImageIdx === idx ? 'opacity-50 dark:opacity-60' : 'opacity-0'}`}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchpriority={idx === 0 ? "high" : "low"}
          />
        ))}

        {/* Improved Overlay for better image visibility + text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white dark:from-slate-950/90 dark:via-slate-950/60 dark:to-slate-950 pointer-events-none" />
        
        <div className="section-container relative z-10 flex h-full flex-col items-center justify-center text-center pt-32 sm:pt-40 pb-16">
          <div className="animate-slide-up w-full max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 backdrop-blur-md px-5 py-2.5 text-[11px] sm:text-[13px] font-black uppercase tracking-[0.25em] text-brand-700 dark:text-brand-300 mb-8 sm:mb-10 border border-brand-500/20 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
              Plataforma Médica Trujillo
            </div>

            <h1 className="text-[40px] sm:text-7xl md:text-8xl font-black leading-[1.05] text-slate-950 dark:text-white tracking-tighter drop-shadow-sm">
              Tu salud merece a <br className="hidden sm:block" />
              <span className="text-brand-600 dark:text-brand-500 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500 dark:from-brand-400 dark:to-blue-400">los mejores</span>
            </h1>

            <p className="mt-8 sm:mt-10 mx-auto text-base sm:text-xl md:text-2xl font-medium leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl drop-shadow-sm px-4">
              Encuentra especialistas verificados en Trujillo. Reserva tu cita en segundos, <span className="text-slate-900 dark:text-white font-bold">sin complicaciones</span> y desde cualquier dispositivo.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              let finalQuery = searchQuery;
              if (searchDistrict) finalQuery += ` ${searchDistrict}`;
              navigate(`/buscar-doctor?q=${encodeURIComponent(finalQuery.trim())}`);
            }} className="hero-search-bar mt-10 md:mt-14 mx-auto glass-card flex flex-col sm:flex-row items-center p-2 gap-2 sm:gap-0 max-w-3xl">
              <div className="flex items-center flex-1 px-4 gap-3 w-full">
                <label htmlFor="hero-search-input" className="sr-only">¿Qué especialidad buscas?</label>
                <svg className="h-6 w-6 text-brand-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="¿Qué especialidad buscas?"
                  className="bg-transparent w-full py-4 text-[16px] sm:text-[18px] font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:block h-10 w-px bg-slate-200 dark:bg-white/10 mx-2" />
              <div className="flex items-center px-4 w-full sm:w-auto">
                <label htmlFor="hero-district-select" className="sr-only">Seleccionar distrito</label>
                <select
                  id="hero-district-select"
                  className="bg-transparent py-4 text-[15px] font-bold text-slate-700 outline-none dark:text-slate-300 w-full cursor-pointer appearance-none pr-8 relative"
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\' stroke-width=\'2.5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19.5 8.25l-7.5 7.5-7.5-7.5\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.2em' }}
                >
                  <option value="">Todo Trujillo</option>
                  <option value="Trujillo">Centro</option>
                  <option value="Victor Larco">Victor Larco</option>
                  <option value="Huanchaco">Huanchaco</option>
                </select>
              </div>
              <button type="submit" className="primary-pill w-full sm:w-auto px-10 py-5 shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all text-[16px]">
                Buscar
              </button>
            </form>

            <div className="mt-16 md:mt-20 flex justify-center flex-wrap gap-10 sm:gap-20 pb-12">
              <Metric value="+12k" label="Pacientes" />
              <Metric value="+1200" label="Médicos" />
              <Metric value="98%" label="Satisfacción" />
            </div>
          </div>
        </div>

        {/* Abstract Curve */}
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />
      </section>

      {/* Featured Doctors */}
      <section className="section-container py-24">
        <SectionHeader
          eyebrow="Calidad en la Atención"
          title="Especialistas Recomendados"
          action={
            <Link to="/buscar-doctor" className="flex items-center gap-2 text-[15px] font-bold text-brand-600 transition-all hover:gap-3 dark:text-brand-400">
              Ver todos los médicos <span className="text-xl">→</span>
            </Link>
          }
        />
        <div className="mt-12">
          <DoctorShowcase doctors={featuredDoctors} />
        </div>
      </section>

      {/* AI Orientation - Theme Aware */}
      <section className="bg-slate-50 dark:bg-slate-900/20 py-24 md:py-32 transition-colors">
        <div className="section-container grid items-center gap-16 lg:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-[48px] shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&q=70"
              alt="Inteligencia Artificial en Salud"
              width="500"
              height="281"
              decoding="async"
              className="w-full h-full border-0 opacity-80 transition-all duration-700 group-hover:opacity-100"
              loading="lazy"
            />
          </div>
          <div>
            <div className="section-eyebrow text-brand-700 dark:text-brand-300 font-bold">Ayuda Digital</div>
            <h2 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-6xl">
              ¿No sabes qué <br /> especialista necesitas?
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Nuestra inteligencia artificial analiza tus síntomas en segundos y te recomienda la especialidad médica más adecuada para tu caso.
            </p>
            <div className="mt-12 space-y-8">
              <Bullet title="Análisis de lenguaje natural" text="Describa su sintomatología con sus propias palabras para una evaluación preliminar." light />
              <Bullet title="Resultados en tiempo real" text="Identifique la especialidad médica pertinente de manera instantánea." light />
              <Bullet title="Conexión inmediata" text="Acceda a perfiles de especialistas con disponibilidad para atención inmediata." light />
            </div>
            <Link to="/orientacion-ia" className="primary-pill mt-12 px-12 py-5 text-[17px]">
              Iniciar consulta gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Doctor Join - Light Feature */}
      <section className="section-container py-24 md:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="section-eyebrow">Para Profesionales</div>
            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-6xl">
              Digitaliza tu <br /> consulta médica
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Únete a la plataforma de salud líder en Trujillo. Incrementa tu visibilidad y gestiona tus citas de manera eficiente.
            </p>
            <div className="mt-12 space-y-8">
              <Bullet title="Perfil profesional verificado" text="Fortalezca su credibilidad mediante un perfil médico validado." light />
              <Bullet title="Planes de visibilidad" text="Seleccione el nivel de exposición institucional adecuado para su práctica." light />
              <Bullet title="Gestión de agenda" text="Reciba solicitudes de reserva y consultas directamente en su plataforma." light />
            </div>
            <Link to="/eres-medico" className="primary-pill mt-12 px-12 py-5 text-[17px]">
              Registrarme ahora
            </Link>
          </div>
          <div className="order-1 flex flex-col gap-8 lg:order-2">
            <div className="relative aspect-video overflow-hidden rounded-[48px] shadow-2xl shadow-brand-500/10">
              <img
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=1000&q=70"
                alt="Médicos especialistas en Trujillo"
                width="1000"
                height="562"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatCard value="+12k" label="Pacientes" sub="Atendidos al mes" />
              <StatCard value="98%" label="Tasa de Éxito" sub="En diagnósticos" />
            </div>
          </div>
        </div>
      </section>

      {/* Clinics Carousel */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-24">
        <div className="section-container">
          <SectionHeader eyebrow="Instituciones" title="Centros Médicos Aliados" />
          <div className="snap-rail mt-10">
            {clinicTiles.map((tile) => (
              <div key={tile.name} className="group relative min-w-[340px] h-[460px] overflow-hidden rounded-[40px] snap-start">
                <img src={tile.image} alt={`Clínica ${tile.name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-10 flex flex-col justify-end">
                  <div className="text-[12px] font-bold uppercase tracking-widest text-brand-400 mb-2">{tile.city}</div>
                  <div className="text-2xl font-bold text-white mb-2">{tile.name}</div>
                  <div className="text-sm font-medium text-slate-300">{tile.line}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Metric({ value, label }) {
  return (
    <div className="group text-center sm:text-left">
      <div className="text-5xl font-black leading-none text-slate-950 dark:text-white transition-all group-hover:scale-110 md:text-6xl tracking-tighter">
        {value}
      </div>
      <div className="mt-4 text-[13px] font-black uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">
        {label}
      </div>
    </div>
  )
}

function StatCard({ value, label, sub }) {
  return (
    <div className="rounded-[40px] bg-white p-8 shadow-xl shadow-brand-500/5 transition-all hover:-translate-y-2 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
      <div className="text-4xl font-black text-slate-950 dark:text-white">{value}</div>
      <div className="mt-2 text-[13px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">{label}</div>
      <div className="mt-1 text-[12px] font-bold text-slate-400">{sub}</div>
    </div>
  )
}

function Bullet({ title, text, light = false }) {
  return (
    <div className="flex gap-6 group">
      <div className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-125">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <div className={`text-[18px] font-black leading-tight ${light ? 'text-slate-950 dark:text-white' : 'text-white'}`}>{title}</div>
        <div className={`mt-2 text-[16px] font-medium leading-relaxed ${light ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300'}`}>{text}</div>
      </div>
    </div>
  )
}
