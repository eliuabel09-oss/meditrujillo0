import { useSEO } from '../hooks/useSEO'

export function PrivacyPage() {
  useSEO({
    title: 'Privacidad | MedicoTrujillo',
    description: 'Te explicamos cómo cuidamos tus datos personales en nuestra plataforma.'
  })

  return (
    <main className="bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-80px)] py-24">
      <div className="section-container max-w-4xl">
        <div className="inline-block rounded-xl bg-slate-100 px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-slate-500 dark:bg-white/5 dark:text-slate-400 mb-6">Información Legal</div>
        <h1 className="text-4xl font-black text-slate-950 dark:text-white md:text-5xl">Política de Privacidad</h1>
        <p className="mt-4 text-[15px] font-bold text-slate-400">Última actualización: 1 de mayo de 2026</p>

        <div className="mt-16 space-y-12">
          {[
            {
              title: '1. Compromiso Legal y Ético',
              text: 'En cumplimiento con la Ley N° 29733, Ley de Protección de Datos Personales de Perú, MedicoTrujillo garantiza la confidencialidad de la información de sus usuarios. Nuestra plataforma actúa bajo principios éticos médicos, asegurando que el tratamiento de sus datos sea legítimo y proporcional.'
            },
            {
              title: '2. Tratamiento de Datos Personales',
              text: 'Recopilamos datos de identificación (nombre, DNI) y de contacto (email, teléfono). En el caso de los médicos, validamos información profesional pública del Colegio Médico del Perú. No almacenamos historias clínicas; nuestra labor se limita a facilitar la conexión y gestión de citas entre paciente y especialista.'
            },
            {
              title: '3. Finalidad y Consentimiento',
              text: 'Al utilizar nuestra plataforma, usted otorga su consentimiento libre e informado para que sus datos sean utilizados exclusivamente para: (a) Gestión de reservas médicas, (b) Validación de credenciales profesionales y (c) Notificaciones relacionadas con su atención. Nunca transferimos sus datos a terceros con fines comerciales.'
            },
            {
              title: '4. Seguridad y Derechos ARCO',
              text: 'Implementamos medidas técnicas de seguridad de nivel bancario. Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) enviando una solicitud formal a nuestro oficial de privacidad. Su bienestar y privacidad son nuestra prioridad.'
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
           <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">¿Dudas sobre tus datos?</h3>
           <p className="text-[15px] font-medium text-slate-500 mb-8">Escríbenos directamente y nuestro oficial de privacidad te atenderá.</p>
           <a href="mailto:privacidad@meditrujillo.pe" className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand-600 px-8 text-[15px] font-black text-white shadow-xl shadow-brand-500/20">privacidad@meditrujillo.pe</a>
        </div>
      </div>
    </main>
  )
}
