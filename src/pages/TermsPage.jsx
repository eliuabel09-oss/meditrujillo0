import { useSEO } from '../hooks/useSEO'

export function TermsPage() {
  useSEO({
    title: 'Términos de Uso | MedicoTrujillo',
    description: 'Reglas claras para usar nuestra plataforma con confianza.'
  })

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-80px)] py-24">
      <div className="section-container max-w-4xl">
        <div className="inline-block rounded-xl bg-slate-100 px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-slate-500 dark:bg-white/5 dark:text-slate-400 mb-6">Información Legal</div>
        <h1 className="text-4xl font-black text-slate-950 dark:text-white md:text-5xl">Términos de Uso</h1>
        <p className="mt-4 text-[15px] font-bold text-slate-400">Última actualización: 1 de mayo de 2026</p>

        <div className="mt-16 space-y-12">
          {[
            {
              title: '1. Naturaleza del Servicio',
              text: 'MedicoTrujillo opera como una plataforma de intermediación tecnológica que facilita la conexión entre pacientes y profesionales de la salud debidamente colegiados. No somos una institución prestadora de servicios de salud (IPRESS) y, por lo tanto, no brindamos diagnósticos, tratamientos ni asesoría médica directa.'
            },
            {
              title: '2. Responsabilidad de los Especialistas',
              text: 'Cada médico registrado es legalmente responsable de la veracidad de la información contenida en su perfil, así como del acto médico realizado durante la consulta. MedicoTrujillo valida las credenciales básicas ante el Colegio Médico del Perú, pero no garantiza la idoneidad clínica individual de cada profesional.'
            },
            {
              title: '3. Propiedad Intelectual y Uso',
              text: 'El contenido de esta plataforma es para uso informativo y personal. Queda prohibida la reproducción total o parcial del directorio médico con fines comerciales externos. Los usuarios se comprometen a hacer un uso diligente y respetuoso de las herramientas de reserva.'
            },
            {
              title: '4. Jurisdicción y Ley Aplicable',
              text: 'Cualquier controversia derivada del uso de MedicoTrujillo se regirá por las leyes de la República del Perú, sometiéndose las partes a la jurisdicción de los jueces y tribunales de la ciudad de Trujillo, La Libertad.'
            }
          ].map(({ title, text }, i) => (
            <section key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">{title}</h2>
              <div className="text-[17px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                {text}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 rounded-[40px] bg-white dark:bg-slate-900 p-10 border border-slate-100 dark:border-white/5 shadow-sm">
           <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">¿Necesitas aclaraciones?</h3>
           <p className="text-[15px] font-medium text-slate-500 mb-8">Nuestro equipo legal está a tu disposición para resolver cualquier duda.</p>
           <a href="mailto:legal@meditrujillo.pe" className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand-600 px-8 text-[15px] font-black text-white shadow-xl shadow-brand-500/20">legal@meditrujillo.pe</a>
        </div>
      </div>
    </main>
  )
}
