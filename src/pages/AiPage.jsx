import { useSEO } from '../hooks/useSEO'
import { AiOrientationTool } from '../components/AiOrientationTool'

const steps = [
  { n: '01', title: 'Describe lo que sientes', body: 'Escribe síntomas, zona del cuerpo, intensidad o desde cuándo. No necesitas términos médicos.', img: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400&q=80' },
  { n: '02', title: 'El sistema cruza especialidades', body: 'Comparamos tus palabras con 19 categorías médicas y detectamos niveles de urgencia.', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
  { n: '03', title: 'Te mostramos médicos reales', body: 'Filtramos por disponibilidad y plan para que puedas reservar directamente sin esperas.', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' },
]

export function AiPage() {
  useSEO({
    title: 'Orientación Médica por IA | MedicoTrujillo',
    description: 'Describe tus síntomas y nuestra IA te recomendará el especialista adecuado en Trujillo. Tecnología al servicio de tu salud.'
  })

  return (
    <main className="bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      
      {/* Direct AI Hero - Refined Premium Style */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-24 md:py-32 transition-colors border-b border-slate-100 dark:border-white/10 shadow-sm">
        {/* Animated Background Blobs - Subtle */}
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/15 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
        
        <div className="section-container relative z-10 max-w-5xl mx-auto pt-12 sm:pt-0">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-500/20 backdrop-blur-md mb-8">
              Guía de salud gratuita
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl lg:text-7xl">
              ¿A qué especialista <br /> <span className="text-brand-600 dark:text-brand-500">deberías acudir?</span>
            </h1>
            <p className="mt-6 text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl max-w-2xl mx-auto">
              Cuéntanos qué molestias tienes y nuestro sistema te recomendará la especialidad médica más adecuada para tu caso.
            </p>

            <div className="mt-16">
              <AiOrientationTool />
            </div>
          </div>
        </div>
      </section>

      {/* Steps / How it works */}
      <section className="section-container py-24">
        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="group relative rounded-[40px] bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-white/5 shadow-xl transition-all hover:-translate-y-2">
              <div className="text-5xl font-black text-brand-600/20 dark:text-brand-400/20 mb-6">{step.n}</div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white mb-4">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}