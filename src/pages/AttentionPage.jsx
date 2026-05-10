import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useSEO } from '../hooks/useSEO'
import { DoctorShowcase } from '../components/DoctorShowcase'

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://meditrujillo0.onrender.com')

const resolveAssetUrl = (value, name) => {
  if (!value || value === '/images/doctor-placeholder.svg') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=0F172A&color=fff&bold=true`;
  }
  if (value.startsWith('http') || value.startsWith('data:image')) return value;
  if (value.startsWith('/uploads/')) return `${apiUrl}${value}`;
  return value;
}

export function AttentionPage() {
  const { doctors } = useAppContext()

  useSEO({
    title: 'Atención Inmediata | MedicoTrujillo',
    description: 'Médicos disponibles ahora mismo en Trujillo para consultas médicas inmediatas. Sin esperas.'
  })

  const activeDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.availableNow && doctor.status === 'active'),
    [doctors]
  )

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50">
      {/* High-Impact Hero - Refined Premium Style */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-24 md:py-32 transition-colors border-b border-slate-100 dark:border-white/10 shadow-sm">
        {/* Animated Background Blobs - Subtle */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
        
        <div className="section-container relative z-10 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="animate-slide-up pt-12 sm:pt-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-600 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
              </span>
              Médicos atendiendo ahora mismo
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl lg:text-7xl leading-tight">
              Tu salud no <br />
              <span className="text-emerald-600 dark:text-emerald-500">puede esperar.</span>
            </h1>
            <p className="mt-8 text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl lg:max-w-xl">
              Encuentra especialistas en Perú con disponibilidad inmediata. Sin colas ni esperas largas, atención directa hoy mismo con total transparencia sobre el profesional que te atenderá.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
               <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 px-6 py-4 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-3xl font-black text-slate-950 dark:text-white">&lt; 30s</div>
                  <div className="text-[12px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Respuesta<br/>Promedio</div>
               </div>
               <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 px-6 py-4 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-3xl font-black text-slate-950 dark:text-white">{activeDoctors.length}</div>
                  <div className="text-[12px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Especialistas<br/>en Línea</div>
               </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
             <div className="relative overflow-hidden rounded-[48px] aspect-square shadow-2xl shadow-brand-500/20">
                <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80" alt="Immediate Care" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -right-6 rounded-[32px] bg-white p-8 shadow-2xl dark:bg-slate-900 animate-bounce-subtle border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                   </div>
                   <div className="text-lg font-black text-slate-900 dark:text-white">Verificación 24/7</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Available Doctors Section */}
      <section className="py-24">
        <div className="section-container">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <div className="inline-block rounded-xl bg-brand-50 px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Resultados</div>
              <h2 className="mt-4 text-3xl font-black text-slate-950 dark:text-white md:text-4xl">Especialistas Activos</h2>
            </div>
            <div className="flex items-center gap-3 text-[15px] font-bold text-slate-500">
               Mostrando {activeDoctors.length} profesionales listos para atenderte
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {activeDoctors.length > 0 ? (
              activeDoctors.map((doctor) => (
                 <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                 <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-slate-300">
                       <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">Sin especialistas disponibles en este momento</h3>
                 <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">Por favor, intente nuevamente en unos minutos o consulte el directorio médico completo.</p>
                 <a href="/buscar-doctor" className="mt-10 inline-block primary-pill h-[60px] px-10">Consultar Directorio Médico</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-100 dark:border-white/5 transition-colors">
         <div className="section-container">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-black text-slate-950 dark:text-white md:text-4xl leading-tight">Atención en 3 simples pasos</h2>
               <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 font-bold">Olvídate de las largas esperas y las llamadas interminables.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
               {[
                 { n: '01', t: 'Elige al Especialista', d: 'Revisa los perfiles activos y selecciona el que mejor se adapte a tu necesidad médica.' },
                 { n: '02', t: 'Reserva al Instante', d: 'Selecciona un turno para hoy mismo y completa tus datos de contacto rápidamente.' },
                 { n: '03', t: 'Recibe tu Consulta', d: 'Asiste al consultorio o inicia tu teleconsulta. ¡Así de fácil y rápido!' },
               ].map((item, i) => (
                  <div key={i} className="premium-card group hover:border-brand-500 transition-all duration-300">
                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-black text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 transition-colors">
                        {item.n}
                     </div>
                     <h3 className="mt-6 text-xl font-black text-slate-950 dark:text-white">{item.t}</h3>
                     <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{item.d}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section - Theme Aware */}
      <section className="py-24">
         <div className="section-container">
            <div className="relative overflow-hidden rounded-[48px] bg-brand-50 dark:bg-brand-500/10 px-8 py-16 text-center md:px-16 md:py-24 border border-brand-100 dark:border-white/5">
               <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-3xl font-black text-slate-950 dark:text-white md:text-5xl leading-tight">¿Es usted un profesional colegiado?</h2>
               <p className="mt-6 text-lg font-bold text-slate-600 dark:text-brand-200">Integre su consultorio a nuestra red y gestione su disponibilidad inmediata de manera profesional.</p>
  <Link to="/eres-medico" className="mt-10 inline-flex min-h-[60px] items-center justify-center px-8 md:px-12 rounded-3xl bg-brand-600 text-base md:text-lg font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95 w-full sm:w-auto">
                    Registro de Especialista
                  </Link>
               </div>
               {/* Decorative background circle */}
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"></div>
               <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-700/10 blur-3xl"></div>
            </div>
         </div>
      </section>
    </main>
  )
}

function DoctorCard({ doctor }) {
  const navigate = useNavigate()
  const { setSelectedDoctor } = useAppContext()
  const imageUrl = resolveAssetUrl(doctor.photoPath || doctor.image || doctor.photoUrl, doctor.name)

  return (
    <article className="premium-card group h-full flex flex-col">
       <div 
        className="relative aspect-[16/10] overflow-hidden rounded-[24px] cursor-pointer"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
       >
         <img 
            src={imageUrl} 
            alt={doctor.name} 
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { 
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=0F172A&color=fff&bold=true`;
            }}
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
         <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="rounded-xl bg-white/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              {doctor.experience} años exp.
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur-md">
              <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="text-[11px] font-black text-white">{Number(doctor.rating || 5).toFixed(1)}</span>
            </div>
         </div>
         <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            <span className="badge-pulse"><span className="badge-pulse-ring bg-white"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span></span>
            Disponible
         </div>
       </div>

       <div className="mt-6 flex-1 flex flex-col">
         <div className="flex items-start justify-between">
           <div>
             <h3 className="text-xl font-black text-slate-950 dark:text-white line-clamp-1">{doctor.name}</h3>
             <p className="mt-1 text-[15px] font-bold text-brand-600 dark:text-brand-400">{doctor.specialty}</p>
           </div>
         </div>

         <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
           <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
           <span className="line-clamp-1">{doctor.clinic}</span>
         </div>

         <div className="mt-auto pt-5">
            <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2 border-t border-slate-50 pt-5 dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consulta</span>
                <div className="text-[22px] font-black text-slate-900 dark:text-white whitespace-nowrap leading-none mt-1">
                  S/ {doctor.price}
                </div>
              </div>
              <div className="flex flex-1 gap-2 min-w-[180px] sm:flex-none">
                <button 
                  onClick={() => navigate(`/doctor/${doctor.id}`)}
                  className="h-[44px] flex-1 rounded-xl bg-slate-100 text-[13px] font-black text-slate-600 transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 flex items-center justify-center"
                >
                  Perfil
                </button>
                <button 
                  onClick={() => setSelectedDoctor(doctor)}
                  className="h-[44px] flex-[1.5] rounded-xl bg-brand-600 text-[13px] font-black text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95 flex items-center justify-center"
                >
                  Reservar
                </button>
              </div>
            </div>
         </div>
       </div>
    </article>
  )
}