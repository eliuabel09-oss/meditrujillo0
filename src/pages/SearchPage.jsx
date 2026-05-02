import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { departments, specialties } from '../data'
import { useAppContext } from '../context/AppContext'
import { useSEO } from '../hooks/useSEO'
import { DoctorShowcase } from '../components/DoctorShowcase'

const priceRanges = [
  { label: 'Hasta S/60', test: (price) => price <= 60 },
  { label: 'S/61 - S/90', test: (price) => price >= 61 && price <= 90 },
  { label: 'S/91 - S/120', test: (price) => price >= 91 && price <= 120 },
  { label: 'Mas de S/120', test: (price) => price > 120 }
]

const normalizeString = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function SearchPage() {
  const { doctors } = useAppContext()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState({
    specialty: '',
    department: '',
    priceRange: '',
    availableNow: false
  })

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useSEO({
    title: 'Buscar Especialistas | MedicoTrujillo',
    description: 'Encuentra y agenda citas con los mejores médicos especialistas de Trujillo. Filtra por especialidad, precio y disponibilidad.'
  })

  const filteredDoctors = useMemo(() => {
    const queryNorm = normalizeString(query)
    const specialtyNorm = normalizeString(filters.specialty)
    const departmentNorm = normalizeString(filters.department)

    return doctors
      .filter((doctor) => doctor.status === 'active')
      .filter((doctor) => !filters.specialty || normalizeString(doctor.specialty) === specialtyNorm)
      .filter((doctor) => !filters.department || normalizeString(doctor.department) === departmentNorm)
      .filter((doctor) => !filters.availableNow || doctor.availableNow)
      .filter((doctor) => !filters.priceRange || priceRanges.find((item) => item.label === filters.priceRange)?.test(Number(doctor.price)))
      .filter((doctor) => {
        if (!queryNorm) return true
        const searchTarget = normalizeString(
          `${doctor.name} ${doctor.specialty} ${doctor.clinic} ${doctor.department} ${doctor.province || ''} ${doctor.district || ''}`
        )
        return searchTarget.includes(queryNorm)
      })
  }, [doctors, filters, query])

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      <div className="section-container pt-10">
        
        {/* Search Page Hero - Refined Premium Style */}
        <div className="relative overflow-hidden rounded-[40px] sm:rounded-[48px] bg-white dark:bg-slate-900 px-6 py-16 sm:px-12 sm:py-24 md:px-16 md:py-32 transition-colors border border-slate-200 dark:border-white/10 shadow-2xl">
          {/* Animated Blobs - Adjusted for Light Mode */}
          <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-brand-500/10 dark:bg-brand-500/20 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300 mb-6 border border-brand-500/20 mx-auto md:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-600 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600"></span>
              </span>
              Directorio Médico Trujillo
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Encuentra a tu <br />
              <span className="text-brand-600 dark:text-brand-400">especialista</span>
            </h1>
            
            <p className="mt-6 text-base sm:text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
              Busca por nombre, especialidad o clínica. Reserva tu cita en el momento que prefieras, directo desde tu celular.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container mt-8 lg:mt-12">
        <div className="grid gap-8 lg:gap-10 xl:grid-cols-[340px_1fr]">
          
          {/* Filters Sidebar */}
          <aside className="space-y-8">
            <div className="rounded-[40px] bg-white p-8 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Filtros</h2>
                <button 
                  onClick={() => {
                    setQuery('')
                    setFilters({ specialty: '', department: '', priceRange: '', availableNow: false })
                  }}
                  className="text-[13px] font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Limpiar
                </button>
              </div>

              <div className="mt-8 space-y-6">
                <SearchField label="Nombre o Clínica" value={query} onChange={setQuery} placeholder="Ej. Dr. Sanchez..." />
                
                <SelectField
                  label="Especialidad"
                  value={filters.specialty}
                  onChange={(value) => setFilters((prev) => ({ ...prev, specialty: value }))}
                  options={['', ...specialties]}
                  emptyLabel="Todas las especialidades"
                />

                <SelectField
                  label="Ubicación"
                  value={filters.department}
                  onChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
                  options={['', ...departments]}
                  emptyLabel="Todos los departamentos"
                />

                <SelectField
                  label="Rango de Precio"
                  value={filters.priceRange}
                  onChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))}
                  options={['', ...priceRanges.map((item) => item.label)]}
                  emptyLabel="Cualquier precio"
                />

                <div className="mt-8 rounded-3xl bg-slate-50 p-6 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-black text-slate-950 dark:text-white">Disponibles Ahora</div>
                      <div className="mt-1 text-[12px] font-medium text-slate-400">Ver solo los activos</div>
                    </div>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, availableNow: !prev.availableNow }))}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${filters.availableNow ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${filters.availableNow ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Help Card - Theme Aware */}
            <div className="rounded-[40px] bg-brand-50 p-8 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
              <h3 className="text-lg font-black text-brand-900 dark:text-white">¿No encuentras lo que buscas?</h3>
              <p className="mt-2 text-sm font-bold text-brand-700 dark:text-brand-200">Escríbenos por WhatsApp y te ayudaremos a encontrar al especialista adecuado para ti.</p>
              <a 
                href="https://wa.me/51949021141?text=Hola,%20necesito%20ayuda%20para%20encontrar%20un%20especialista%20en%20MedicoTrujillo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-brand-600 py-3 text-[14px] font-black text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95"
              >
                Contactar Soporte
              </a>
            </div>
          </aside>

          {/* Results Area */}
          <section className="animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Especialistas Disponibles</h2>
                <p className="mt-1 text-[15px] font-medium text-slate-500">{filteredDoctors.length} profesionales encontrados</p>
              </div>
            </div>
            
            {filteredDoctors.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                   <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-slate-300 mb-6">
                   <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No hay resultados</h3>
                <p className="mt-2 max-w-xs text-slate-500 font-medium">Intenta ajustar los filtros para encontrar más opciones.</p>
                <button 
                  onClick={() => setFilters({ specialty: '', department: '', priceRange: '', availableNow: false })}
                  className="mt-8 text-brand-600 font-black hover:underline"
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function SearchField({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <span className="text-[13px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="relative">
        <input 
          className="h-[52px] w-full rounded-2xl bg-slate-50 px-5 text-[15px] font-bold text-slate-900 outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-brand-500/20 dark:bg-white/5 dark:text-white dark:focus:bg-slate-800" 
          value={value} 
          onChange={(event) => onChange(event.target.value)} 
          placeholder={placeholder} 
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, emptyLabel }) {
  return (
    <div className="space-y-2">
      <span className="text-[13px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select 
        className="h-[52px] w-full appearance-none rounded-2xl bg-slate-50 px-5 text-[15px] font-bold text-slate-900 outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-brand-500/20 dark:bg-white/5 dark:text-white dark:focus:bg-slate-800" 
        value={value} 
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option || '__empty'} value={option}>
            {option || emptyLabel}
          </option>
        ))}
      </select>
    </div>
  )
}

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

// Internal Doctor Card for Grid View
function DoctorCard({ doctor }) {
  const navigate = useNavigate()
  const { setSelectedDoctor } = useAppContext()
  
  // Try all possible image fields in order of priority
  const rawImage = doctor.photoPath || doctor.image || doctor.photoUrl;
  const imageUrl = resolveAssetUrl(rawImage, doctor.name);

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
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
         <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="rounded-xl bg-white/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur-md">
              {doctor.experience} años exp.
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur-md">
              <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="text-[11px] font-black text-white">{Number(doctor.rating || 5).toFixed(1)}</span>
            </div>
         </div>
         {doctor.availableNow && (
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
               <span className="badge-pulse"><span className="badge-pulse-ring bg-white"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span></span>
               Disponible
            </div>
         )}
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

         <div className="mt-auto pt-8">
            <div className="flex items-center justify-between border-t border-slate-50 pt-6 dark:border-white/5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consulta</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">S/ {doctor.price}</div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(doctor)}
                className="h-[52px] rounded-2xl bg-brand-600 px-8 text-[14px] font-black text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95"
              >
                Reservar
              </button>
            </div>
         </div>
       </div>
    </article>
  )
}
