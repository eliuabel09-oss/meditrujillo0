import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { matchSymptoms } from '../services/publicApi'
import { useSEO } from '../hooks/useSEO'
import { DoctorShowcase } from '../components/DoctorShowcase'

const apiUrl = import.meta.env.VITE_API_URL || 'https://meditrujillo0.onrender.com'
const resolveAssetUrl = (value) => (value && value.startsWith('/uploads/')) ? `${apiUrl}${value}` : value

const SYMPTOM_MAP = {
  Cardiología: {
    keywords: ['pecho', 'corazón', 'palpitaciones', 'taquicardia', 'arritmia', 'infarto', 'presión alta', 'hipertensión', 'angina', 'latidos', 'soplo', 'cardiovascular', 'colesterol', 'electrocardiograma'],
    redFlags: ['dolor en el pecho', 'palpitaciones fuertes', 'infarto', 'presión muy alta'],
  },
  Neurología: {
    keywords: ['cabeza', 'migraña', 'cefalea', 'mareo', 'vértigo', 'convulsión', 'epilepsia', 'temblor', 'parkinson', 'memoria', 'alzheimer', 'nervio', 'hormigueo', 'entumecimiento', 'desmayo', 'pérdida de conocimiento'],
    redFlags: ['convulsión', 'pérdida de conocimiento', 'desmayo', 'parálisis'],
  },
  Gastroenterología: {
    keywords: ['estómago', 'abdomen', 'vientre', 'náuseas', 'vómito', 'diarrea', 'estreñimiento', 'acidez', 'reflujo', 'colitis', 'gastritis', 'hígado', 'intestino', 'colon', 'úlcera', 'hinchazón', 'digestión'],
    redFlags: ['sangre en heces', 'vómito con sangre', 'dolor abdominal intenso'],
  },
  Traumatología: {
    keywords: ['hueso', 'fractura', 'rodilla', 'columna', 'espalda', 'lumbar', 'articulación', 'músculo', 'tendón', 'ligamento', 'cadera', 'hombro', 'codo', 'muñeca', 'tobillo', 'pie', 'contractura', 'lesión'],
    redFlags: ['fractura', 'no puedo mover', 'golpe fuerte'],
  },
  Dermatología: {
    keywords: ['piel', 'manchas', 'acné', 'sarpullido', 'alergia', 'picazón', 'comezón', 'urticaria', 'psoriasis', 'eczema', 'lunar', 'verruga', 'cabello', 'uñas', 'caspa', 'dermatitis'],
    redFlags: ['lunar que creció', 'sangrado en piel', 'quemadura grave'],
  },
  Psiquiatría: {
    keywords: ['ansiedad', 'depresión', 'tristeza', 'pánico', 'angustia', 'insomnio', 'no puedo dormir', 'estrés', 'fobia', 'obsesión', 'alucinación', 'bipolar', 'trastorno', 'suicidio', 'autolesión'],
    redFlags: ['pensamientos de hacerme daño', 'no quiero vivir', 'suicidio'],
  },
  Oftalmología: {
    keywords: ['ojo', 'ojos', 'visión', 'vista', 'lentes', 'conjuntivitis', 'lagrimeo', 'ojo rojo', 'glaucoma', 'catarata', 'miopía', 'astigmatismo', 'párpado'],
    redFlags: ['pérdida repentina de visión', 'ojo muy rojo con dolor'],
  },
  Otorrinolaringología: {
    keywords: ['oído', 'oídos', 'nariz', 'garganta', 'amígdalas', 'sinusitis', 'ronquera', 'tos', 'resfriado', 'gripe', 'moco', 'congestión', 'zumbido', 'sordera', 'voz'],
    redFlags: ['sangrado por nariz sin parar', 'no escucho de un oído'],
  },
  Endocrinología: {
    keywords: ['diabetes', 'tiroides', 'glucosa', 'azúcar en sangre', 'insulina', 'hormona', 'peso', 'obesidad', 'hipotiroidismo', 'hipertiroidismo', 'metabolismo', 'cansancio extremo'],
    redFlags: ['glucosa muy alta', 'desmayo por azúcar'],
  },
  Urología: {
    keywords: ['riñón', 'vejiga', 'orina', 'ardor al orinar', 'infección urinaria', 'próstata', 'cálculo', 'piedra en riñón', 'sangre en orina', 'incontinencia'],
    redFlags: ['sangre en orina', 'no puedo orinar', 'dolor renal intenso'],
  },
  Ginecología: {
    keywords: ['menstruación', 'período', 'ovario', 'útero', 'vagina', 'embarazo', 'anticonceptivo', 'flujo', 'mama', 'seno', 'menopausia', 'quiste', 'mioma', 'papanicolau'],
    redFlags: ['sangrado fuera del período', 'dolor pélvico agudo'],
  },
  Neumología: {
    keywords: ['pulmón', 'respirar', 'falta de aire', 'asma', 'bronquio', 'bronquitis', 'neumonía', 'tos con sangre', 'EPOC', 'oxígeno', 'ahogo', 'disnea'],
    redFlags: ['falta de aire intensa', 'tos con sangre', 'no puedo respirar'],
  },
}

const URGENCY_PHRASES = [
  'no puedo respirar', 'dolor en el pecho', 'pérdida de conocimiento', 'convulsión',
  'sangre abundante', 'parálisis', 'no puedo mover', 'desmayo', 'suicidio',
  'pensamientos de hacerme daño', 'vómito con sangre', 'tos con sangre'
]

const DURATION_HINTS = [
  { pattern: /hace (varios|muchos) (días|semanas|meses|años)/i, label: 'Crónico' },
  { pattern: /hace (un|1|dos|2|tres|3) (día|días)/i, label: 'Reciente' },
  { pattern: /de repente|de pronto|ahora mismo|en este momento/i, label: 'Agudo' },
  { pattern: /desde (ayer|anoche|esta mañana|hoy)/i, label: 'Agudo' },
]

const INTENSITY_HINTS = [
  { pattern: /leve|poco|suave|ligero/i, label: 'Leve' },
  { pattern: /moderado|regular|medio/i, label: 'Moderado' },
  { pattern: /fuerte|intenso|severo|mucho|bastante/i, label: 'Intenso' },
  { pattern: /insoportable|terrible|extremo|no aguanto/i, label: 'Severo' },
]

function analyzeSymptoms(text) {
  if (!text.trim()) return null
  const lower = text.toLowerCase()

  const scores = Object.entries(SYMPTOM_MAP).map(([specialty, data]) => {
    const hits = data.keywords.filter(k => lower.includes(k))
    const redFlagHits = data.redFlags.filter(r => lower.includes(r))
    return { specialty, score: hits.length + redFlagHits.length * 3, hits, redFlagHits }
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score)

  const isUrgent = URGENCY_PHRASES.some(p => lower.includes(p)) || scores.some(s => s.redFlagHits.length > 0)
  const duration = DURATION_HINTS.find(d => d.pattern.test(text))
  const intensity = INTENSITY_HINTS.find(i => i.pattern.test(text))

  return {
    specialties: scores.slice(0, 3).map(s => s.specialty),
    topMatch: scores[0] || null,
    secondMatch: scores[1] || null,
    isUrgent,
    duration: duration?.label || null,
    intensity: intensity?.label || null,
    confidence: scores[0] ? Math.min(Math.round((scores[0].score / 6) * 100), 97) : 0,
  }
}

const steps = [
  { n: '01', title: 'Describe lo que sientes', body: 'Escribe síntomas, zona del cuerpo, intensidad o desde cuándo. No necesitas términos médicos.', img: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400&q=80' },
  { n: '02', title: 'El sistema cruza especialidades', body: 'Comparamos tus palabras con 19 categorías médicas y detectamos niveles de urgencia.', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
  { n: '03', title: 'Te mostramos médicos reales', body: 'Filtramos por disponibilidad y plan para que puedas reservar directamente sin esperas.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
]

export function AiPage() {
  const { doctors } = useAppContext()
  const [symptoms, setSymptoms] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [history, setHistory] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useSEO({
    title: 'Orientación Médica por IA | MedicoTrujillo',
    description: 'Describe tus síntomas y nuestra IA te recomendará el especialista adecuado en Trujillo. Tecnología al servicio de tu salud.'
  })

  const analysis = useMemo(() => analyzeSymptoms(submitted), [submitted])
  const apiResult = useMemo(() => submitted ? matchSymptoms(submitted, doctors) : { specialties: [], doctors: [] }, [submitted, doctors])

  const onAnalyze = () => {
    if (!symptoms.trim()) return
    setIsAnalyzing(true)
    
    // Simulate AI thinking for a premium feel
    setTimeout(() => {
      setSubmitted(symptoms)
      const local = analyzeSymptoms(symptoms)
      setHistory((prev) => [{
        id: crypto.randomUUID(),
        input: symptoms,
        specialties: local?.specialties ?? [],
        confidence: local?.confidence ?? 0,
        urgent: local?.isUrgent ?? false,
      }, ...prev])
      setIsAnalyzing(false)
      
      // Scroll to results
      const resultsEl = document.getElementById('ai-results')
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' })
    }, 1200)
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      
      {/* Direct AI Hero - Refined Premium Style */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-24 md:py-32 transition-colors border-b border-slate-100 dark:border-white/10 shadow-sm">
        {/* Animated Background Blobs - Subtle */}
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
        
        <div className="section-container relative z-10 max-w-4xl mx-auto pt-12 sm:pt-0">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-500/20 backdrop-blur-md mb-8">
              Guía de salud gratuita
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl lg:text-7xl">
              ¿A qué especialista <br /> <span className="text-brand-600 dark:text-brand-500">deberías acudir?</span>
            </h1>
            <p className="mt-6 text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl">
              Cuéntanos qué molestias tienes y nuestro sistema te recomendará la especialidad médica más adecuada para tu caso.
            </p>

            <div className="mt-12 relative max-w-3xl mx-auto">
                <div className="relative rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 shadow-2xl focus-within:ring-4 focus-within:ring-brand-500/20 transition-all">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Escribe aquí tus síntomas (ej. Me duele la espalda baja desde hace dos días y tengo algo de fiebre)..."
                    className="min-h-[160px] md:min-h-[140px] w-full resize-none rounded-[32px] bg-transparent p-4 md:p-8 text-base md:text-xl font-bold leading-relaxed text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                  />
                  <div className="flex justify-end p-2 md:p-3">
                    <button 
                      className={`h-12 md:h-16 px-6 md:px-12 rounded-[24px] bg-brand-600 text-[14px] md:text-[16px] font-black text-white shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-3 w-full md:w-auto justify-center ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-700 hover:scale-105'}`} 
                      onClick={onAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? 'Analizando...' : 'Obtener Recomendación'}
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Inline Results */}
          {analysis && submitted && !isAnalyzing && (
            <div className="mt-12 animate-slide-up rounded-[40px] bg-brand-600 p-8 md:p-12 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                     <div className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3">Especialidad Sugerida</div>
                     <div className="text-4xl md:text-5xl font-black">{analysis.topMatch?.specialty}</div>

                  </div>
                  <div className="h-px w-full bg-white/10 md:h-20 md:w-px"></div>
                  <div className="text-center">
                     <div className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-200 mb-3">Nivel de Confianza</div>
                     <div className="text-4xl font-black">{analysis.confidence}%</div>
                  </div>
               </div>
               {/* Decoration */}
               <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Specialists */}
      <section className="section-container py-20">
         <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            
            <div className="min-w-0">
               {apiResult.doctors.length > 0 && (
                  <div className="animate-fade-in">
                     <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-10">Médicos en Trujillo</h3>
                     <div className="grid gap-6 sm:grid-cols-2">
                        {apiResult.doctors.map(doctor => (
                           <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                     </div>
                  </div>
               )}
            </div>

            <aside className="space-y-8">
               {/* Sidebar removed as per simplification request */}
            </aside>
         </div>
      </section>
    </main>
  )
}

function DoctorCard({ doctor }) {
  const navigate = useNavigate()
  const { setSelectedDoctor } = useAppContext()
  const imageUrl = resolveAssetUrl(doctor.image || doctor.photoUrl)

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
            onError={(e) => { e.currentTarget.src = '/images/profile_picture.webp' }}
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
       </div>

       <div className="mt-6 flex-1 flex flex-col">
         <div className="flex items-start justify-between">
           <div>
             <h3 className="text-xl font-black text-slate-950 dark:text-white line-clamp-1">{doctor.name}</h3>
             <p className="mt-1 text-[15px] font-bold text-brand-600 dark:text-brand-400">{doctor.specialty}</p>
           </div>
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