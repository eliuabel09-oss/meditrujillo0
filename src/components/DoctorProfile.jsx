import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getDoctorById } from '../services/publicApi'
import { useSEO } from '../hooks/useSEO'

const apiUrl = import.meta.env.VITE_API_URL || 'https://meditrujillo0.onrender.com'
const resolveAssetUrl = (value) => (value && value.startsWith('/uploads/')) ? `${apiUrl}${value}` : value

export function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setSelectedDoctor } = useAppContext()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  useSEO({
    title: doctor ? `Dr. ${doctor.name} - ${doctor.specialty} | MedicoTrujillo` : 'Perfil del Doctor',
    description: doctor ? `Reserva una cita con ${doctor.name}, especialista en ${doctor.specialty} en ${doctor.clinic || 'Trujillo'}.` : ''
  })

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const data = await getDoctorById(id)
        setDoctor(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDoctor()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-2xl dark:bg-slate-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-brand-600"></div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="section-container flex min-h-[60vh] items-center justify-center py-20">
        <div className="w-full max-w-[480px] rounded-[40px] bg-white p-12 text-center shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-white/5">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-slate-300">
               <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Perfil no disponible</h2>
          <p className="mt-4 text-slate-500">Lo sentimos, no pudimos encontrar al especialista que buscas.</p>
          <button onClick={() => navigate('/buscar-doctor')} className="primary-pill mt-10 w-full">Explorar otros médicos</button>
        </div>
      </div>
    )
  }

  const waMessage = `Hola Dr(a). ${doctor.name}, deseo información para una cita vía MedicoTrujillo.`
  let targetNumber = doctor.whatsapp || '51949021141'
  if (/^9\d{8}$/.test(targetNumber)) targetNumber = `51${targetNumber}`
  const waLink = `https://wa.me/${targetNumber}?text=${encodeURIComponent(waMessage)}`

  const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
  const imageUrl = resolveAssetUrl(doctor.image || doctor.photoUrl)
  const titleImages = normalizeCredentialImages(doctor.titleImages || doctor.titleImagesUrls, resolveAssetUrl)
  const mastersImages = normalizeCredentialImages(doctor.mastersImages || doctor.mastersImage || doctor.mastersImageUrl || doctor.mastersImagesUrls, resolveAssetUrl)
  const certificationsImages = normalizeCredentialImages(doctor.certificationsImages || doctor.certificationsImage || doctor.certificationsImageUrl || doctor.certificationsImagesUrls, resolveAssetUrl)

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50 pb-24">
      {/* Dynamic Background Header - Refined Theme Awareness */}
      <div className="h-64 w-full bg-brand-700 dark:bg-slate-900 relative overflow-hidden border-b border-slate-100 dark:border-white/10">
        <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-white/10 dark:bg-brand-500/10 blur-[100px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="section-container -mt-20 sm:-mt-32 relative z-20">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="group inline-flex items-center gap-2 text-[15px] font-bold text-white/70 transition-all hover:text-white">
            <span className="text-xl transition-transform group-hover:-translate-x-1">←</span> Volver a la búsqueda
          </button>
        </div>

        {/* Profile Identity Card */}
        <div className="rounded-[40px] bg-white p-8 shadow-2xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Identity Split */}
            <div className="flex flex-col md:flex-row gap-8 flex-1">
              <div className="relative shrink-0">
                <img 
                  src={imageUrl} 
                  alt={doctor.name} 
                  className="h-40 w-40 rounded-[32px] object-cover object-top shadow-2xl ring-8 ring-white dark:ring-slate-800"
                  onError={(e) => { e.currentTarget.src = '/images/profile_picture.webp' }}
                />
                {doctor.availableNow && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-lg ring-4 ring-white dark:ring-slate-900">
                    <span className="badge-pulse">
                      <span className="badge-pulse-ring bg-white"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                    </span>
                    Ahora
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">{doctor.name}</h1>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Verificado
                    </span>
                    {doctor.plan === 'premium' && (
                      <span className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 text-xl font-bold text-brand-600 dark:text-brand-400">{doctor.specialty}</div>
                
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-[14px]">
                  <div className="flex items-center gap-2.5 font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                       <svg className="h-4 w-4 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    {doctor.department}, {doctor.province}
                  </div>
                  <div className="flex items-center gap-2.5 font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                      <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    {doctor.rating?.toFixed(1) || '5.0'} <span className="text-slate-400 font-medium">· (12 reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                      <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    {doctor.experience} años de exp.
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Action Split */}
            <div className="w-full lg:w-[320px] shrink-0 border-t border-slate-100 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 dark:border-white/5">
              <div className="mb-6 rounded-3xl bg-slate-100 p-6 dark:bg-white/5">
                <div className="text-[12px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Costo de consulta</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-950 dark:text-white">S/ {doctor.price}</span>
                  <span className="text-[15px] font-bold text-slate-500">/ sesión</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button onClick={() => setSelectedDoctor(doctor)} className="primary-pill h-[60px] w-full text-[16px]">
                  Reservar Cita Ahora
                </button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="secondary-pill h-[60px] w-full text-[16px]">
                  Enviar Mensaje Directo
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-12 flex gap-8 sm:gap-10 border-b border-slate-100 dark:border-white/5 overflow-x-auto scrollbar-hide">
            {['info', 'reviews', 'map'].map((tab) => (
              <button 
                key={tab}
                className={`pb-5 text-[14px] sm:text-[15px] font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'info' ? 'Información' : tab === 'reviews' ? 'Opiniones' : 'Ubicación'}
                {activeTab === tab && <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-brand-600"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout */}
        <div className="mt-10 flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-8 animate-fade-in">
            
            {activeTab === 'info' && (
              <>
                {/* Biography */}
                <section className="rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                  <SectionTitle icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>} title="Sobre el Especialista" />
                  <div className="mt-8 text-[16px] leading-relaxed text-slate-600 dark:text-slate-400 space-y-4">
                    <p>
                      El Dr(a). <span className="font-bold text-slate-900 dark:text-white">{doctor.name}</span> es un reconocido especialista en <span className="font-bold text-brand-600">{doctor.specialty}</span> con una trayectoria de {doctor.experience} años brindando atención médica de primer nivel en la región de La Libertad.
                    </p>
                    <p>
                      Su enfoque se centra en la medicina preventiva y el tratamiento integral del paciente, utilizando las técnicas más avanzadas en su especialidad.
                      {doctor.university && ` Se formó profesionalmente en la ${doctor.university}.`}
                    </p>
                    <div className="mt-8 flex items-center gap-4 rounded-3xl bg-brand-50 p-6 dark:bg-brand-500/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Colegiatura Médica (CMP)</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{doctor.cmp || 'Verificada'}</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Services */}
                <section className="rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                  <SectionTitle icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.58.345l-2.333-.467a2 2 0 00-1.022.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.58.345l-2.333-.467a2 2 0 00-1.022.547"/></svg>} title="Nuestros Servicios" />
                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="group rounded-[32px] border-2 border-slate-50 bg-slate-50/50 p-8 transition-all hover:border-brand-200 hover:bg-white dark:border-white/5 dark:bg-white/5 dark:hover:bg-slate-800">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm dark:bg-slate-800">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <h4 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Consulta Médica</h4>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">Evaluación clínica detallada, diagnóstico y plan de tratamiento personalizado.</p>
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-white/5">
                        <span className="text-[14px] font-bold text-slate-400">30 - 45 min</span>
                        <span className="text-2xl font-black text-brand-600">S/ {doctor.price}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Credentials */}
                {(doctor.university || titleImages.length > 0) && (
                  <section className="rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                    <SectionTitle icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>} title="Formación Académica" />
                    <div className="mt-8 space-y-10">
                      {doctor.university && (
                        <div className="flex gap-8">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-brand-600">
                             <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                          </div>
                          <div>
                            <h4 className="text-[15px] font-black uppercase tracking-widest text-slate-400">Pregrado / Especialidad</h4>
                            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{doctor.university}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        <CredentialGallery title="Títulos y Grados" images={titleImages} />
                        <CredentialGallery title="Maestrías y Doctorados" images={mastersImages} />
                        <CredentialGallery title="Diplomados y Certificaciones" images={certificationsImages} />
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {activeTab === 'reviews' && (
               <section className="rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-white dark:border-white/5">
                 <SectionTitle icon={<svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>} title="Opiniones de Pacientes" />
                 <div className="mt-12 text-center py-12">
                   <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{doctor.rating?.toFixed(1) || '5.0'}</div>
                   <div className="flex justify-center gap-1 mb-6">
                     {[1, 2, 3, 4, 5].map(i => (
                       <svg key={i} className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                     ))}
                   </div>
                   <p className="text-slate-500 font-medium">Todas las opiniones son verificadas por nuestro equipo.</p>
                 </div>
               </section>
            )}

            {activeTab === 'map' && (
              <section className="rounded-[40px] bg-white p-2 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-white dark:border-white/5 overflow-hidden">
                <div className="h-[500px] w-full rounded-[38px] overflow-hidden relative group">
                  <iframe 
                    title="Ubicación"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(doctor.clinic || '')} ${encodeURIComponent(doctor.district || '')} ${encodeURIComponent(doctor.province || '')} Trujillo&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="grayscale contrast-125 dark:invert dark:opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:contrast-100"
                  ></iframe>
                  <div className="absolute top-6 left-6 right-6">
                    <div className="glass-card flex items-center gap-4 !p-4 !bg-white/80 dark:!bg-slate-900/80">
                      <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-brand-600 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </div>
                      <div>
                        <div className="text-[14px] font-black text-slate-900 dark:text-white">{doctor.clinic || 'Consultorio Privado'}</div>
                        <div className="text-[12px] font-medium text-slate-500">{doctor.district}, {doctor.province}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar Column */}
          <aside className="w-full lg:w-[380px] space-y-8">
            
            {/* Schedule Card - Fully Theme Aware */}
            <div className="rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
              <h3 className="flex items-center gap-3 text-xl font-black mb-8 text-slate-900 dark:text-white">
                <svg className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Horarios Disponibles
              </h3>
              <div className="space-y-4">
                {weekDays.map(day => {
                  const slots = doctor.schedules?.[day] || []
                  const isClosed = slots.length === 0
                  return (
                    <div key={day} className={`flex justify-between items-center rounded-2xl p-4 transition-all ${isClosed ? 'opacity-30' : 'bg-slate-50 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-white/10'}`}>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{day}</span>
                      {isClosed ? (
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cerrado</span>
                      ) : (
                        <span className="text-[14px] font-black text-slate-900 dark:text-white">{slots[0]} - {slots[slots.length-1]}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="mt-8 text-center text-[12px] font-medium text-slate-400">
                Los horarios pueden variar según festividades o emergencias médicas.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="rounded-[40px] bg-white/40 p-8 dark:bg-white/5 border border-white/40 dark:border-white/5">
              <div className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Médico Colegiado Verificado</span>
              </div>
              <div className="flex items-center gap-4 py-4 border-t border-slate-100 dark:border-white/5">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.22 0 2.383.218 3.46.616m.835 19.081c.242-.473.451-.96.626-1.456M15 11l2 2 4-4"/></svg>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Pagos Seguros y Encriptados</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
        {icon}
      </div>
      <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
    </div>
  )
}

function CredentialImage({ title, src }) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-3xl border-2 border-slate-50 bg-white transition-all hover:border-brand-300 dark:border-white/5 dark:bg-slate-800"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img src={src} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
      </div>
      <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md dark:bg-slate-900/90">
        <span className="text-[13px] font-bold text-slate-900 dark:text-white line-clamp-1">{title}</span>
        <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </div>
    </a>
  )
}

function CredentialGallery({ title, images }) {
  if (!images || images.length === 0) return null
  return (
    <div className="space-y-4">
      <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-400">{title}</h4>
      <div className="grid gap-4">
        {images.map((src, index) => (
          <CredentialImage key={index} title={title} src={src} />
        ))}
      </div>
    </div>
  )
}

function normalizeCredentialImages(value, resolveAssetUrl) {
  const items = Array.isArray(value) ? value : value ? [value] : []
  return items
    .map((item) => {
      if (!item) return ''
      if (typeof item === 'string') return resolveAssetUrl(item)
      return resolveAssetUrl(item.path || item.url || '')
    })
    .filter(Boolean)
}
