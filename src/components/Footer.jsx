import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white dark:border-white/5 dark:bg-slate-950 transition-colors duration-300">
      {/* Map Section - Lazy Loaded */}
      <div 
        className="relative w-full h-[300px] overflow-hidden group border-b border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-slate-900 flex items-center justify-center cursor-pointer"
        onClick={() => {
          const iframe = document.getElementById('footer-map');
          if (iframe) iframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31593.44372584!2d-79.05!3d-8.1116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad3d6f4c0ed1a3%3A0xaece18e79d0b4e1a!2sTrujillo%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1700000000000";
          document.getElementById('map-placeholder').style.display = 'none';
          if (iframe) iframe.style.display = 'block';
        }}
      >
        <div id="map-placeholder" className="absolute inset-0 flex flex-col items-center justify-center transition-all group-hover:scale-105">
           <svg className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 6.75V15m6-8.25V15m-9 3.75h.008v.008H6V18.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0h.008v.008h-.008V18.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0h.008v.008h-.008V18.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.375 0h.008v.008h-.008V18.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 2.25C6.615 2.25 2.25 6.615 2.25 12s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"/></svg>
           <span className="text-[14px] font-black uppercase tracking-widest text-slate-400">Clic para activar el mapa</span>
        </div>
        <iframe
          id="footer-map"
          title="Ubicación MediTrujillo"
          className="w-full h-full border-0 hidden transition-all duration-700 dark:invert-[0.9] dark:hue-rotate-[180deg] dark:brightness-[0.8] dark:contrast-[1.2]"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="section-container pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="/images/logoclinica.webp" 
                alt="MediTrujillo" 
                width="73" 
                height="40"
                className="h-10 w-auto rounded-xl shadow-xl" 
              />
              <div>
                <div className="text-2xl font-black leading-none tracking-tight text-slate-950 dark:text-white">
                  <span className="text-brand-700">Medi</span>Trujillo
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Salud para Trujillo</div>
              </div>
            </div>
            <p className="text-[16px] leading-relaxed text-slate-600 dark:text-slate-400 max-w-[360px] mb-8">
              Conectamos a los mejores especialistas de la región con pacientes que buscan una atención médica de calidad, humana y profesional.
            </p>
            <div className="mb-10 flex items-center gap-3 text-slate-400">
               <svg className="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               <span className="text-[14px] font-bold">Trujillo, Perú · Sede Central</span>
            </div>
            <div className="flex gap-4">
              <SocialIcon href="https://facebook.com" ariaLabel="Visítanos en Facebook" icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>} />
              <SocialIcon href="https://instagram.com" ariaLabel="Síguenos en Instagram" icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>} />
              <SocialIcon href="https://twitter.com" ariaLabel="Síguenos en X (Twitter)" icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>} />
            </div>
          </div>

          <FootCol title="Pacientes" items={[
            { label: 'Encontrar doctor', to: '/buscar-doctor' },
            { label: 'Atención inmediata', to: '/atencion-ahora' },
            { label: 'Guía por IA', to: '/orientacion-ia' },
          ]} />
          <FootCol title="Médicos" items={[
            { label: 'Unirse como médico', to: '/eres-medico' },
            { label: 'Planes y precios', to: '/eres-medico#planes' },
            { label: 'Preguntas frecuentes', to: '/eres-medico#faq' },
          ]} />
          <FootCol title="Soporte" items={[
            { label: 'Acerca de nosotros', to: '/acerca-de' },
            { label: 'Políticas de privacidad', to: '/privacidad' },
            { label: 'Términos de servicio', to: '/terminos' },
            { label: 'Centro de ayuda', href: 'mailto:ayuda@meditrujillo.pe' },
          ]} />
        </div>

        <div className="mt-20 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[14px] font-bold text-slate-500 dark:text-slate-400">
            © 2026 MediTrujillo. Todos los derechos reservados.
          </div>
          <div className="flex gap-8">
            <a href="mailto:contacto@meditrujillo.pe" className="text-[14px] font-bold text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors">contacto@meditrujillo.pe</a>
            <a href="tel:+51949021141" className="text-[14px] font-bold text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors">+51 949 021 141</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon, ariaLabel }) {
  return (
    <a href={href} aria-label={ariaLabel} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-brand-600 hover:text-white dark:bg-white/5 dark:text-slate-500 dark:hover:bg-brand-600 dark:hover:text-white">
      {icon}
    </a>
  );
}

function FootCol({ title, items }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 border-l-2 border-brand-500 pl-3">{title}</h3>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.label}>
            {item.href
              ? <a href={item.href} className="inline-block text-[15px] font-bold text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-white transition-all hover:translate-x-1 active:scale-95">{item.label}</a>
              : <Link to={item.to} className="inline-block text-[15px] font-bold text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-white transition-all hover:translate-x-1 active:scale-95">{item.label}</Link>
            }
          </li>
        ))}
      </ul>
    </div>
  )
}
