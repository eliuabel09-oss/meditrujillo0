import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL || 'https://meditrujillo0.onrender.com'

// Resolves image path: prepends backend URL for /uploads/ paths
const resolveAssetUrl = (value, name) => {
  if (!value || value === '/images/doctor-placeholder.svg') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=0F172A&color=fff&bold=true`;
  }
  // If it's a Firebase URL, external link, or Base64 data, return as is
  if (value.startsWith('http') || value.startsWith('data:image')) return value;
  // If it's a local upload, let Vite proxy handle it
  if (value.startsWith('/uploads/')) return value;
  return value;
}

const PLAN_COLORS = {
  premium: 'bg-amber-500 shadow-amber-500/20',
  pro: 'bg-brand-600 shadow-brand-500/20',
  basic: 'bg-slate-500 shadow-slate-500/20'
}

export function DoctorShowcase({ doctors, compact = false }) {
  const { setSelectedDoctor } = useAppContext()
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const isInfinite = !compact && doctors.length >= 4

  const renderCard = (doctor, key) => (
    <article
      key={key}
      className="premium-card snap-item group shrink-0"
    >
      {/* Photo Section */}
      <div
        className="relative aspect-[4/4] w-full overflow-hidden rounded-[22px] cursor-pointer"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
      >
        <img
          src={resolveAssetUrl(doctor.photoPath || doctor.image || doctor.photoUrl, doctor.name)}
          alt={doctor.name}
          width="300"
          height="300"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { 
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=0F172A&color=fff&bold=true`;
          }}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <div className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${PLAN_COLORS[doctor.plan] || 'bg-slate-500'}`}>
            {doctor.plan}
          </div>
        </div>

        {doctor.availableNow && (
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
            <span className="badge-pulse">
              <span className="badge-pulse-ring bg-white"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            Disponible
          </div>
        )}

        {/* Experience Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
           <div className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
             {doctor.experience} años exp.
           </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 line-clamp-1 dark:text-white">{doctor.name}</h3>
            <p className="mt-1 text-[14px] font-bold text-brand-700 dark:text-brand-300">{doctor.specialty}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{Number(doctor.rating || 5).toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
          <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span className="line-clamp-1 font-medium">{doctor.clinic}</span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Consulta</span>
              <div className="text-[20px] font-black text-slate-900 dark:text-white">
                S/ {doctor.price}
              </div>
            </div>
            <button
              className="h-[48px] rounded-2xl bg-brand-700 px-6 text-[14px] font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-800 active:scale-95 dark:bg-brand-500"
              onClick={() => setSelectedDoctor(doctor)}
            >
              Reservar
            </button>
          </div>
          
          <button
            className="mt-3 w-full h-[44px] rounded-xl border border-slate-100 bg-slate-50 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={() => navigate(`/doctor/${doctor.id}`)}
          >
            Ver perfil completo
          </button>
        </div>
      </div>
    </article>
  )

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="text-6xl mb-6 opacity-20">🔍</div>
        <div className="text-[17px] font-bold text-slate-900 dark:text-white">No se encontraron especialistas</div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Prueba ajustando tus filtros de búsqueda.</p>
      </div>
    )
  }

  if (isInfinite) {
    return (
      <div className="overflow-hidden w-full relative">
        <div className={`flex w-max gap-6 py-4 hover:[animation-play-state:paused] ${isReady ? 'animate-marquee' : ''}`}>
          {doctors.map((d) => renderCard(d, d.id))}
          {isReady && doctors.map((d) => renderCard(d, `${d.id}-dup`))}
        </div>
      </div>
    )
  }

  return (
    <div className="snap-rail">
      {doctors.map((d) => renderCard(d, d.id))}
    </div>
  )
}
