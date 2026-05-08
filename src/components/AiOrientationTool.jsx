import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { matchSymptoms } from '../services/publicApi'

export function AiOrientationTool({ compact = false }) {
  const { doctors, setSelectedDoctor } = useAppContext()
  const navigate = useNavigate()
  
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = () => {
    if (!symptoms.trim()) return
    setIsLoading(true)
    
    // Premium experience delay
    setTimeout(() => {
      const matched = matchSymptoms(symptoms, doctors)
      setResult(matched)
      setIsLoading(false)
      
      // If result is found and we are not in compact mode, scroll to results
      if (!compact) {
        const el = document.getElementById('ai-tool-results')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 1500)
  }

  return (
    <div className="w-full">
      {/* Input Section */}
      <div className={`bg-slate-50/50 dark:bg-white/5 backdrop-blur-2xl rounded-[48px] p-6 md:p-10 border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="relative text-left">
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Escribe aquí tus síntomas (ej. Me duele la espalda baja desde hace dos días y tengo algo de fiebre)..."
            className="w-full min-h-[180px] bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg md:text-2xl font-bold leading-relaxed resize-none outline-none"
          ></textarea>
          
          <div className="flex justify-end mt-6">
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || !symptoms.trim()}
              className="px-12 py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl shadow-2xl shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-95 text-[17px] tracking-tight disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? 'Analizando...' : 'Obtener Recomendación'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && !isLoading && (
        <div id="ai-tool-results" className="mt-16 animate-slide-up text-left">
          <div className="rounded-[40px] bg-brand-600 p-8 md:p-12 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden mb-12">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3 text-center md:text-left">Especialidad Sugerida</div>
                <div className="text-4xl md:text-6xl font-black text-center md:text-left">{result.specialties[0]}</div>
              </div>
              <div className="h-px w-full bg-white/10 md:h-20 md:w-px"></div>
              <div className="text-center">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3">Recomendación</div>
                <div className="text-xl md:text-2xl font-bold">Agenda con un experto</div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          </div>

          {result.doctors.length > 0 && (
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white px-4">Especialistas recomendados para ti:</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.doctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="premium-card group bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <img 
                        src={doctor.photoPath || doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0F172A&color=fff&bold=true`} 
                        alt={doctor.name} 
                        className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                      />
                      <div>
                        <div className="font-black text-slate-900 dark:text-white line-clamp-1">{doctor.name}</div>
                        <div className="text-sm font-bold text-brand-600 dark:text-brand-400">{doctor.specialty}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4">
                      <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">Desde</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">S/ {doctor.price}</div>
                      </div>
                      <Link 
                        to={`/doctor/${doctor.id}`}
                        className="h-12 px-6 rounded-xl bg-slate-900 dark:bg-white/10 text-[13px] font-black text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                      >
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
