import { useSEO } from '../hooks/useSEO'

export function AboutPage() {
  useSEO({
    title: 'Acerca de MedicoTrujillo | Nuestra Misión',
    description: 'Conoce la plataforma de salud líder en Trujillo, Perú. Conectamos pacientes con los mejores especialistas de la región.'
  })

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-80px)]">
      
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-24 md:py-32 transition-colors border-b border-slate-100 dark:border-white/10 shadow-sm">
         {/* Animated Background Blobs - Subtle */}
         <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
         
         <div className="section-container relative z-10 text-center max-w-4xl pt-12 sm:pt-0">
            <div className="inline-block rounded-full bg-brand-50 dark:bg-brand-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-500/20 mb-8">Nuestra Historia</div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
              Salud local con <br />
              <span className="text-brand-600 dark:text-brand-500">atención humana.</span>
            </h1>
            <p className="mt-8 text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl leading-relaxed">
              MedicoTrujillo nació para ayudar a que los trujillanos encuentren al médico adecuado de forma sencilla, conectando a pacientes con los mejores especialistas de nuestra ciudad.
            </p>
         </div>
      </section>

      <section className="section-container py-24">
         <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="animate-slide-up">
               <h2 className="text-3xl font-black text-slate-950 dark:text-white md:text-4xl">¿Qué es MedicoTrujillo?</h2>
               <div className="mt-8 space-y-6 text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  <p>
                    Somos la plataforma de salud diseñada específicamente para la realidad de Trujillo y la región La Libertad. Entendemos que encontrar al especialista adecuado no debería ser una tarea difícil ni tardada.
                  </p>
                  <p>
                    A través de nuestro directorio verificado y herramientas inteligentes como la orientación por IA y la disponibilidad en tiempo real, empoderamos a los pacientes para que tomen decisiones informadas sobre su bienestar.
                  </p>
               </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-3">
                  {[
                    { title: '120+', desc: 'Médicos Verificados', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> },
                    { title: '4.8k+', desc: 'Pacientes Atendidos', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
                    { title: '4.9/5', desc: 'Satisfacción Total', icon: <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> }
                  ].map((stat, i) => (
                    <div key={i} className="premium-card text-center p-8 flex flex-col items-center">
                       <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4 dark:bg-white/5">
                          {stat.icon}
                       </div>
                       <div className="text-2xl font-black text-brand-600 dark:text-brand-400">{stat.title}</div>
                       <div className="mt-2 text-[12px] font-black uppercase tracking-widest text-slate-400">{stat.desc}</div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="relative">
               <div className="aspect-[4/5] overflow-hidden rounded-[48px] shadow-2xl shadow-brand-500/10">
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80" alt="Medical Technology" className="h-full w-full object-cover" />
               </div>
               {/* Decorative badge */}
               <div className="absolute -bottom-6 -left-6 rounded-[32px] bg-brand-600 p-8 text-white shadow-2xl">
                  <div className="text-3xl font-black">100%</div>
                  <div className="text-[12px] font-black uppercase tracking-widest text-brand-100">Filtro de Calidad</div>
               </div>
            </div>
         </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white dark:bg-slate-900 py-24 border-y border-slate-100 dark:border-white/5">
         <div className="section-container text-center max-w-3xl">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white">Canales Oficiales de Atención</h2>
            <p className="mt-4 text-lg font-bold text-slate-500 mb-12">Nuestro equipo administrativo y de soporte está a su disposición para resolver cualquier requerimiento técnico o profesional.</p>
            
            <div className="grid gap-6 md:grid-cols-3">
               <a href="https://wa.me/51949021141" target="_blank" rel="noreferrer" className="premium-card p-8 flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 dark:bg-emerald-500/10">
                     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.006.332.013c.101.007.237-.038.37.281.144.345.491 1.197.534 1.285s.072.188.014.303c-.058.116-.087.188-.173.289l-.26.303c-.087.101-.177.211-.077.385.101.173.447.737.959 1.193.658.587 1.212.769 1.385.855.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086.158.058 1.011.477 1.184.564.173.087.289.129.332.202.043.073.043.419-.101.824z"/></svg>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white">WhatsApp</div>
                  <div className="mt-1 text-[13px] font-bold text-slate-500">+51 949 021 141</div>
               </a>

               <a href="mailto:contacto@meditrujillo.pe" className="premium-card p-8 flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 dark:bg-brand-500/10">
                     <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white">Email</div>
                  <div className="mt-1 text-[13px] font-bold text-slate-500">contacto@meditrujillo.pe</div>
               </a>

               <div className="premium-card p-8 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 dark:bg-white/5">
                     <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white">Ubicación</div>
                  <div className="mt-1 text-[13px] font-bold text-slate-500">Trujillo, Perú</div>
               </div>
            </div>
         </div>
      </section>
    </main>
  )
}
