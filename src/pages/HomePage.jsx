// Home Page
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { DoctorShowcase } from '../components/DoctorShowcase'
import { SectionHeader } from '../components/SectionHeader'
import { useSEO } from '../hooks/useSEO'
import { AiOrientationTool } from '../components/AiOrientationTool'

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
  const { featuredDoctors, doctors } = useAppContext()
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDistrict, setSearchDistrict] = useState('')

  const [showFullCarousel, setShowFullCarousel] = useState(false)

  const [aiSymptoms, setAiSymptoms] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const handleAiAnalyze = () => {
    if (!aiSymptoms.trim()) return
    setIsAiLoading(true)

    // Simulate premium thinking time
    setTimeout(() => {
      const result = matchSymptoms(aiSymptoms, doctors)
      setAiResult(result)
      setIsAiLoading(false)
    }, 1500)
  }

  const previewDoctor = doctors?.find(d => d.availableNow && d.status === 'active') || featuredDoctors?.[0] || {
    name: 'Médico Especialista',
    specialty: 'Atención Inmediata',
    rating: 5.0,
    reviews: 0
  };

  const previewImage = previewDoctor?.photoPath || previewDoctor?.image || previewDoctor?.photoUrl;
  const imageUrl = previewImage && previewImage !== '/images/doctor-placeholder.svg'
    ? previewImage
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(previewDoctor?.name || 'Doctor')}&background=0F172A&color=fff&bold=true`;

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
      <section className="relative min-h-[750px] md:min-h-[780px] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
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

        <div className="section-container relative z-10 flex flex-col items-center justify-center text-center pt-16 sm:pt-20 pb-8">
          <div className="animate-slide-up w-full max-w-5xl">
            

            <h1 className="text-[36px] sm:text-6xl md:text-[76px] font-black leading-[1.05] text-slate-950 dark:text-white tracking-tighter drop-shadow-sm">
              Tu salud merece a <br className="hidden sm:block" />
              <span className="text-brand-600 dark:text-brand-500 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500 dark:from-brand-400 dark:to-blue-400">los mejores</span>
            </h1>

            <p className="mt-6 sm:mt-8 mx-auto text-base sm:text-lg md:text-xl font-medium leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl drop-shadow-sm px-4">
              Encuentra especialistas verificados en Perú. Reserva tu cita en segundos, <span className="text-slate-900 dark:text-white font-bold">sin complicaciones</span> y desde cualquier dispositivo.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              let finalQuery = searchQuery;
              if (searchDistrict) finalQuery += ` ${searchDistrict}`;
              navigate(`/buscar-doctor?q=${encodeURIComponent(finalQuery.trim())}`);
            }} className="hero-search-bar mt-8 md:mt-10 mx-auto glass-card flex flex-col sm:flex-row items-center p-2 gap-2 sm:gap-0 max-w-3xl">
              <div className="flex items-center flex-1 px-4 gap-3 w-full">
                <label htmlFor="hero-search-input" className="sr-only">Nombre, especialidad o clínica</label>
                <svg className="h-6 w-6 text-brand-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="Especialidad"
                  className="bg-transparent w-full py-4 text-[15px] sm:text-[17px] font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
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
                  <option value="">Departamentos</option>
                  <option value="Tumbes">Tumbes</option>
                  <option value="Piura">Piura</option>
                  <option value="Lambayeque">Lambayeque</option>
                  <option value="La Libertad">La Libertad</option>
                  <option value="Ancash">Ancash</option>
                  <option value="Lima">Lima</option>
                  <option value="Ica">Ica</option>
                  <option value="Arequipa">Arequipa</option>
                  <option value="Moquegua">Moquegua</option>
                  <option value="Tacna">Tacna</option>
                  <option value="Cajamarca">Cajamarca</option>
                  <option value="Huánuco">Huánuco</option>
                  <option value="Pasco">Pasco</option>
                  <option value="Junín">Junín</option>
                  <option value="Huancavelica">Huancavelica</option>
                  <option value="Ayacucho">Ayacucho</option>
                  <option value="Apurímac">Apurímac</option>
                  <option value="Cusco">Cusco</option>
                  <option value="Puno">Puno</option>
                  <option value="Loreto">Loreto</option>
                  <option value="Amazonas">Amazonas</option>
                  <option value="San Martín">San Martín</option>
                  <option value="Ucayali">Ucayali</option>
                  <option value="Madre de Dios">Madre de Dios</option>

                </select>

              </div>
              <button type="submit" className="primary-pill w-full sm:w-auto px-10 py-5 shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all text-[15px]">
                Buscar
              </button>
            </form>

            <div className="mt-10 md:mt-12 flex justify-center flex-wrap gap-10 sm:gap-20">
              <Metric value="+120" label="Pacientes" />
              <Metric value="+25" label="Médicos" />
              <Metric value="100%" label="Satisfacción" />
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

      {/* Immediate Attention - Premium Feature */}
      <section className="py-24 bg-brand-50 dark:bg-slate-900/40 relative overflow-hidden transition-colors border-y border-brand-100 dark:border-white/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="section-container relative z-10 grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              En Línea Ahora
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl text-slate-950 dark:text-white">
              ¿Necesitas un médico <br /><span className="text-brand-600 dark:text-brand-400">ahora mismo</span>?
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Accede a consultas médicas sin esperas. Revisa el perfil completo, especialidad y reseñas del doctor antes de ingresar, para que sepas exactamente con quién te atiendes, incluso en una urgencia.
            </p>
            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">Transparencia Total</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-1">Conoce la trayectoria del especialista antes de tu consulta.</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">Sin Tiempos de Espera</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-1">Conecta con médicos que están en línea listos para atenderte.</div>
                </div>
              </div>
            </div>
            <Link to="/buscar-doctor?available=true" className="primary-pill mt-12 px-10 py-5 text-[17px]">
              Ver médicos disponibles
            </Link>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[40px] aspect-square shadow-2xl border border-brand-100 dark:border-white/5">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80" alt="Médico atendiendo ahora" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-emerald-400 shadow-lg">
                      <img src={imageUrl} alt={previewDoctor.name} className="h-full w-full object-cover" />
                      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white line-clamp-1">{previewDoctor.name}</div>
                      <div className="text-brand-200 font-bold text-sm line-clamp-1">{previewDoctor.specialty} · En línea</div>
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <span className="text-xs font-bold text-white">{Number(previewDoctor.rating || 5).toFixed(1)} ({previewDoctor.reviews || 0} reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Orientation Section */}
      <section id="orientacion" className="bg-white dark:bg-slate-900 py-24 md:py-32 relative overflow-hidden transition-colors duration-500">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="section-container relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-10 shadow-sm">
            Guía de salud gratuita
          </div>

          <h2 className="text-4xl font-black leading-[1.1] text-slate-950 dark:text-white md:text-7xl tracking-tighter">
            ¿A qué especialista <br />
            <span className="text-brand-600 dark:text-brand-500 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500 dark:from-brand-400 dark:to-blue-400">deberías acudir?</span>
          </h2>

          <p className="mt-8 text-lg md:text-xl font-medium leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Cuéntanos qué molestias tienes y nuestro sistema te recomendará la especialidad médica más adecuada para tu caso.
          </p>

          <div className="mt-12 md:mt-16">
            <AiOrientationTool />
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
              <StatCard value="+120" label="Pacientes" sub="Atendidos al mes" />
              <StatCard value="100%" label="Tasa de Éxito" sub="En diagnósticos" />
            </div>
          </div>
        </div>
      </section>

      {/* Clinics Carousel */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-24">
        <div className="section-container">
          <SectionHeader eyebrow="Instituciones" title="Centros Médicos" />
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
      <div className="text-4xl font-black leading-none text-slate-950 dark:text-white transition-all group-hover:scale-110 md:text-5xl tracking-tighter">
        {value}
      </div>
      <div className="mt-4 text-[11px] font-black uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">
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
