import { useMemo, useState, useEffect, useRef } from 'react'
import { departments, plans, specialties } from '../data'
import { useAppContext } from '../context/AppContext'
import { useSEO } from '../hooks/useSEO'
import { Link, useLocation } from 'react-router-dom'

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const scheduleHours = Array.from({ length: 18 }, (_, index) => `${String(index + 6).padStart(2, '0')}:00`)

const emptyForm = {
  plan: 'basic',
  fullName: '',
  specialty: 'Medicina General',
  cmp: '',
  department: 'La Libertad',
  province: '',
  district: '',
  clinic: '',
  experience: '',
  price: '',
  email: '',
  whatsapp: '',
  googleMaps: '',
  highSchool: '',
  university: '',
  photo: null,
  titleImages: [],
  mastersImages: [],
  certificationsImages: [],
  schedules: days.reduce((acc, day) => {
    acc[day] = []
    return acc
  }, {})
}

const planData = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 'S/ 49',
    period: '/mes',
    desc: 'Ideal para médicos que inician su práctica privada.',
    color: 'text-sky-500',
    popular: false,
    features: [
      'Perfil visible en la red',
      'Hasta 30 citas mensuales',
      'Sello de verificado',
      'Soporte estándar'
    ]
  },
  {
    id: 'pro',
    name: 'Plan Profesional',
    price: 'S/ 99',
    period: '/mes',
    desc: 'Potencia tu consulta con visibilidad ilimitada.',
    color: 'text-slate-900 dark:text-white',
    popular: true,
    features: [
      'Citas ilimitadas',
      'Posicionamiento preferente',
      'Estadísticas de tráfico',
      'Gestión de reseñas',
      'Soporte prioritario'
    ]
  },
  {
    id: 'premium',
    name: 'Plan Elite',
    price: 'S/ 179',
    period: '/mes',
    desc: 'Lidera tu especialidad con máxima exposición.',
    color: 'text-violet-500',
    popular: false,
    features: [
      'Primero en búsquedas',
      'Destacado en Homepage',
      'Marketing personalizado',
      'Asistente dedicado',
      'WhatsApp API Integration'
    ]
  }
]

const benefits = [
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    title: 'Más pacientes para tu consulta',
    desc: 'Haz que tu perfil aparezca ante los miles de trujillanos que buscan especialistas en nuestra web cada mes.'
  },
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    title: 'Olvídate de coordinar citas',
    desc: 'Tus pacientes pueden solicitar una cita directamente. Nosotros te enviamos sus datos para que solo confirmes.'
  },
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: 'Tu perfil siempre verificado',
    desc: 'Genera confianza inmediata mostrando que tu CMP y especialidad han sido revisados por nuestro equipo.'
  },
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: 'Sigue tus resultados',
    desc: 'Mira cuántas personas visitan tu perfil y cuántas están interesadas en atenderse contigo cada semana.'
  },
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    title: 'Gestión sin complicaciones',
    desc: 'Actualiza tus horarios, sedes o fotos en cualquier momento y desde cualquier dispositivo.'
  },
  {
    icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    title: 'Comunidad médica local',
    desc: 'Forma parte del directorio de salud más consultado en Trujillo y toda la región La Libertad.'
  }
]

const stepsMeta = [
  {
    num: 1,
    title: 'Nivel de Exposición',
    desc: 'Selecciona el plan que mejor se adapte a tus objetivos.'
  },
  {
    num: 2,
    title: 'Configuración de Perfil',
    desc: 'Información profesional, académica y de contacto.'
  },
  {
    num: 3,
    title: 'Gestión de Agenda',
    desc: 'Define tus horarios de atención para reservas online.'
  }
]

const testimonials = [
  {
    name: 'Dra. Patricia Villanueva',
    specialty: 'Cardióloga · Trujillo',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80',
    text: 'Al principio no estaba segura, pero en el primer mes ya me estaban llegando varios pacientes nuevos. Lo mejor es que el perfil genera confianza antes de que lleguen al consultorio.'
  },
  {
    name: 'Dr. Rodrigo Salinas',
    specialty: 'Dermatólogo · Trujillo',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80',
    text: 'Me ahorra mucho tiempo con las llamadas. Mis pacientes ahora revisan mis horarios y reservan solos, así yo me enfoco solo en atenderlos bien.'
  },
  {
    name: 'Dra. Carmen Flores',
    specialty: 'Pediatra · Trujillo',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80',
    text: 'Aparecer en los primeros resultados me ha servido mucho. He empezado a recibir pacientes de zonas donde antes no me conocían. Muy recomendado.'
  },
  {
    name: 'Dr. Marco Huamán',
    specialty: 'Traumatólogo · Trujillo',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80',
    text: 'Es una plataforma muy fácil de usar, tanto para mí como para mis pacientes. Desde que me registré, mis consultas han subido de forma constante.'
  },
  {
    name: 'Dra. Lucía Mendoza',
    specialty: 'Neuróloga · Piura',
    photo: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=200&q=80',
    text: 'Mis pacientes valoran mucho poder reservar desde su celular. La verificación del CMP le da una seriedad enorme al perfil.'
  }
]

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function AnimatedStat({ value, label, prefix = '', suffix = '', started }) {
  const num = useCountUp(value, 2200, started)
  return (
    <div className="text-center">
      <div className="text-[52px] font-black leading-none tracking-tight text-slate-950 dark:text-white drop-shadow-sm">
        {prefix}{num.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-[14px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{label}</div>
    </div>
  )
}

export function DoctorSignupPage() {
  const { submitDoctorApplication } = useAppContext()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [messageMeta, setMessageMeta] = useState(null)
  const [preview, setPreview] = useState('/images/profile_picture.webp')
  const [statsStarted, setStatsStarted] = useState(false)
  const statsRef = useRef(null)
  const scrollRef = useRef(null)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#planes') {
      setStep(1)
    }
  }, [hash])

  useSEO({
    title: 'Registro de Médicos Especialistas | MedicoTrujillo',
    description: 'Únete a la red de médicos especialistas más grande de Trujillo. Haz crecer tu consulta con visibilidad premium y agenda online.'
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const canContinue = useMemo(() => {
    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const whatsappRegex = /^9\d{8}$/;
      const cmpRegex = /^\d{5,6}$/;
      const mapsRegex = /google\.com\/maps|maps\.app\.goo\.gl/;

      return [
        form.fullName.trim().split(' ').length >= 2, // Al menos nombre y apellido
        form.specialty,
        cmpRegex.test(form.cmp.trim()), // CMP de 5 o 6 dígitos
        form.department,
        form.province.trim().length > 2,
        form.district.trim().length > 2,
        form.clinic.trim().length > 2,
        Number(form.experience) > 0 && Number(form.experience) < 60,
        Number(form.price) >= 20, // Consulta mínima razonable
        emailRegex.test(form.email.trim()),
        whatsappRegex.test(form.whatsapp.trim()),
        mapsRegex.test(form.googleMaps.trim()),
        form.university.trim().length > 5,
        form.highSchool.trim().length > 3
      ].every(Boolean)
    }
    if (step === 3) {
      return Object.values(form.schedules).some((items) => items.length)
    }
    return true
  }, [step, form])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onPhotoChange = (file) => {
    setField('photo', file)
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: prev.schedules[day].length ? [] : ['08:00', '09:00', '10:00']
      }
    }))
  }

  const toggleSlot = (day, slot) => {
    setForm((prev) => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [day]: prev.schedules[day].includes(slot)
          ? prev.schedules[day].filter((item) => item !== slot)
          : [...prev.schedules[day], slot].sort()
      }
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    try {
      setIsSubmitting(true)
      const response = await submitDoctorApplication(form)
      const code = response.applicationCode || response.id || 'DOCTOR-PENDIENTE'
      const notification = response.notification || null
      setMessage(
        notification?.delivered
          ? `${code} enviado correctamente. La solicitud ya fue notificada al administrador.`
          : `${code} registrado correctamente. Nuestro equipo revisará tu solicitud.`
      )
      setMessageMeta(notification ? { delivered: notification.delivered, mode: notification.mode, code } : { code, delivered: false })

      if (notification && !notification.delivered && notification.waLink) {
        window.location.href = notification.waLink
      }

      setForm(emptyForm)
      setPreview('/images/profile_picture.webp')
      setStep(1)
    } catch (error) {
      console.error(error)
      alert('Error al enviar la solicitud: ' + (error.message || 'Error desconocido'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950">

      {/* Hero Section - Premium Theme Aware */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-24 md:py-32 transition-colors border-b border-slate-100 dark:border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="section-container relative z-10 grid gap-20 lg:grid-cols-2 lg:items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-[12px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-white/5">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
              Convocatoria Profesional 2026
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl lg:text-7xl leading-tight">
              Lleva tu consulta al <br /><span className="text-brand-600">siguiente nivel.</span>
            </h1>
            <p className="mt-8 text-lg font-bold text-slate-500 dark:text-slate-400 md:text-xl lg:max-w-xl leading-relaxed">
              Únete a la red médica más consultada de Trujillo. Haz que nuevos pacientes te encuentren, organiza tu agenda y gestiona tu consulta de forma sencilla.
            </p>
            <div className="mt-12 flex flex-wrap gap-5">
              <Link to="/eres-medico#registro" className="primary-pill h-16 px-12 text-[17px] flex items-center justify-center">Registrarme Ahora</Link>
              <div className="flex items-center gap-4 rounded-3xl bg-white p-4 border border-slate-100 shadow-sm dark:bg-white/5 dark:border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-[15px] font-black text-slate-700 dark:text-slate-300">+1,200 Médicos Activos</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in hidden lg:block">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80" alt="Doctor" className="rounded-[48px] aspect-[4/5] object-cover shadow-2xl shadow-brand-500/10 ring-1 ring-slate-200 dark:ring-white/10" />
                <div className="rounded-[32px] bg-white p-8 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">98%</div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">Satisfacción</div>
                </div>
              </div>
              <div className="space-y-8 pt-12">
                <div className="rounded-[32px] bg-brand-600 p-8 text-white shadow-xl shadow-brand-500/20">
                  <div className="text-3xl font-black">24/7</div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-brand-200 mt-1">Soporte Médico</div>
                </div>
                <img src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80" alt="Consult" className="rounded-[48px] aspect-[4/5] object-cover shadow-2xl shadow-brand-500/10 ring-1 ring-slate-200 dark:ring-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="section-container -mt-16 relative z-20">
        <div className="rounded-[40px] bg-white p-12 shadow-2xl shadow-brand-900/10 dark:bg-slate-900 border border-white dark:border-white/5">
          <div className="grid gap-12 text-center sm:grid-cols-2 lg:grid-cols-4">
            <AnimatedStat prefix="+" value={12000} label="Pacientes al mes" started={statsStarted} />
            <AnimatedStat prefix="+" value={1200} label="Médicos activos" started={statsStarted} />
            <AnimatedStat value={98} suffix="%" label="Tasa de éxito" started={statsStarted} />
            <AnimatedStat value={25} suffix="+" label="Especialidades" started={statsStarted} />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-slate-900/50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block rounded-xl bg-brand-50 px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Ventajas</div>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Digitaliza tu práctica con <span className="text-brand-600">MedicoTrujillo</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="premium-card group transition-all duration-500 hover:bg-brand-600 hover:border-brand-600"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl group-hover:bg-white/20 dark:bg-brand-500/10 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950 dark:text-white group-hover:text-white transition-colors">{benefit.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 group-hover:text-brand-50 transition-colors">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="section-container">
          <div className="flex items-end justify-between mb-12">
            <div className="max-w-xl">
              <div className="section-eyebrow">Testimonios</div>
              <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white md:text-5xl">Colegas que ya confían</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => scroll('left')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-900 transition-all hover:bg-brand-600 hover:text-white active:scale-90 dark:bg-slate-900 dark:border-white/10 dark:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 text-slate-900 transition-all hover:bg-brand-600 hover:text-white active:scale-90 dark:bg-slate-900 dark:border-white/10 dark:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="snap-rail pb-10 scroll-smooth">
            {testimonials.map((t, i) => (
              <div key={i} className="snap-start shrink-0 w-[340px] md:w-[420px] rounded-[40px] bg-white p-10 shadow-xl shadow-brand-900/5 dark:bg-slate-900 border border-white dark:border-white/5">
                <div className="flex items-center gap-5 mb-8">
                  <img src={t.photo} alt={t.name} className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
                  <div>
                    <div className="text-[17px] font-black text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-[13px] font-bold text-brand-600 dark:text-brand-400">{t.specialty}</div>
                  </div>
                </div>
                <p className="text-[16px] leading-relaxed text-slate-600 dark:text-slate-400 italic">"{t.text}"</p>
                <div className="mt-8 flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => <svg key={s} className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="registro" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-white/5 scroll-mt-24">
        <div id="planes" className="scroll-mt-32"></div>
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* Steps & Info */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="sticky top-32">
                <h2 className="text-3xl font-black text-slate-950 dark:text-white">Registro de Especialista</h2>
                <p className="mt-4 text-slate-500 font-medium">Complete los siguientes campos para la validación de su perfil profesional. La información proporcionada será auditada por nuestro comité médico.</p>

                <div className="mt-12 space-y-4">
                  {stepsMeta.map((item) => (
                    <div
                      key={item.num}
                      className={`flex items-start gap-5 p-6 rounded-3xl transition-all ${step === item.num ? 'bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500' : 'bg-slate-50 dark:bg-white/5'}`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black ${step >= item.num ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {step > item.num ? '✓' : item.num}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="mt-1 text-[13px] text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 rounded-[48px] bg-slate-50 p-8 md:p-12 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-2xl shadow-brand-900/5">
              {message && (
                <div className="mb-10 rounded-[32px] bg-emerald-50 p-8 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">✓</div>
                    <div className="text-xl font-black">¡Solicitud Enviada!</div>
                  </div>
                  <p className="mt-4 font-bold opacity-80">{message}</p>
                  {messageMeta?.waLink && (
                    <button onClick={() => window.open(messageMeta.waLink)} className="mt-6 primary-pill bg-emerald-600 hover:bg-emerald-700">Notificar por WhatsApp</button>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white">Selecciona tu nivel de visibilidad</h3>
                  <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {planData.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setField('plan', plan.id)}
                        className={`relative flex flex-col items-start rounded-[32px] p-8 text-left transition-all duration-500 group ${form.plan === plan.id ? 'bg-brand-600 text-white shadow-2xl shadow-brand-600/30 ring-4 ring-brand-500/20' : 'bg-white dark:bg-slate-800 border-2 border-transparent hover:border-brand-500/20'}`}
                      >
                        <div className={`text-[12px] font-black uppercase tracking-widest ${form.plan === plan.id ? 'text-brand-100' : 'text-slate-400'}`}>{plan.name}</div>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-3xl font-black">{plan.price}</span>
                          <span className={`text-sm ${form.plan === plan.id ? 'text-brand-200' : 'text-slate-400'}`}>{plan.period}</span>
                        </div>
                        <ul className="mt-8 space-y-4">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[13px] font-bold">
                              <span className={form.plan === plan.id ? 'text-brand-300' : 'text-brand-500'}>✓</span> {f}
                            </li>
                          ))}
                        </ul>
                        {form.plan === plan.id && (
                          <div className="absolute top-4 right-4 text-2xl">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-10">Datos del Profesional</h3>
                  <div className="grid gap-10 md:grid-cols-[200px_1fr]">
                    <div className="space-y-4">
                      <div className="relative group overflow-hidden rounded-[40px] aspect-[3/4] bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl">
                        <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-white font-bold text-sm">Cambiar Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                      <p className="text-[11px] font-bold text-center text-slate-400 uppercase tracking-widest">Recomendado: 400x500px</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <InputField label="Nombre Completo *" value={form.fullName} onChange={(v) => setField('fullName', v)} placeholder="Ej. Dr. Ricardo Santos Vera" />
                      <SelectField label="Especialidad *" value={form.specialty} onChange={(v) => setField('specialty', v)} options={specialties} />
                      <InputField label="Número de CMP *" value={form.cmp} onChange={(v) => setField('cmp', v)} placeholder="Ej. 75421" />
                      <InputField label="Años de Experiencia *" type="number" value={form.experience} onChange={(v) => setField('experience', v)} placeholder="Ej. 12" />
                      <InputField label="WhatsApp de Citas *" value={form.whatsapp} onChange={(v) => setField('whatsapp', v)} placeholder="Ej. 949123456" />
                      <InputField label="Email Profesional *" type="email" value={form.email} onChange={(v) => setField('email', v)} placeholder="Ej. ricardo@meditrujillo.pe" />
                      <InputField label="Nombre de Clínica *" value={form.clinic} onChange={(v) => setField('clinic', v)} placeholder="Ej. Clínica San Pablo" />
                      <InputField label="Google Maps Link *" value={form.googleMaps} onChange={(v) => setField('googleMaps', v)} placeholder="Ej. https://maps.app.goo.gl/..." />
                      <SelectField label="Departamento *" value={form.department} onChange={(v) => setField('department', v)} options={departments || ['La Libertad', 'Lima', 'Piura', 'Lambayeque', 'Arequipa', 'Cusco']} />
                      <InputField label="Provincia *" value={form.province} onChange={(v) => setField('province', v)} placeholder="Ej. Trujillo" />
                      <InputField label="Distrito de Atención *" value={form.district} onChange={(v) => setField('district', v)} placeholder="Ej. Víctor Larco Herrera" />
                      <InputField label="Costo Consulta (S/) *" type="number" value={form.price} onChange={(v) => setField('price', v)} placeholder="Ej. 150" />
                      <InputField label="Universidad Egresada *" value={form.university} onChange={(v) => setField('university', v)} placeholder="Ej. Universidad Nacional de Trujillo" />
                      <InputField label="Colegio (Secundaria) *" value={form.highSchool} onChange={(v) => setField('highSchool', v)} placeholder="Ej. San Juan" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-3 mt-6 border-t border-slate-100 dark:border-white/5 pt-6 md:col-span-2">
                      <FileField label="Imágenes del título" onChange={(files) => setField('titleImages', files)} multiple />
                      <FileField label="Imágenes de maestrías" onChange={(files) => setField('mastersImages', files)} multiple />
                      <FileField label="Imágenes de certificados" onChange={(files) => setField('certificationsImages', files)} multiple />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4">Disponibilidad de Atención</h3>
                  <p className="text-slate-500 font-medium mb-10">Selecciona los días y rangos horarios en los que deseas recibir citas.</p>

                  <div className="space-y-4">
                    {days.map((day) => {
                      const enabled = form.schedules[day].length > 0
                      return (
                        <div key={day} className={`rounded-[32px] p-6 transition-all duration-500 ${enabled ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-brand-500/20' : 'bg-slate-100/50 dark:bg-white/5 opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button onClick={() => toggleDay(day)} className={`relative h-8 w-14 shrink-0 rounded-full transition-all duration-500 shadow-inner ${enabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-500 ${enabled ? 'left-7' : 'left-1'}`} />
                              </button>
                              <span className="text-lg font-black text-slate-900 dark:text-white">{day}</span>
                            </div>
                            {enabled && (
                              <span className="text-[12px] font-black uppercase tracking-widest text-brand-600">{form.schedules[day].length} turnos</span>
                            )}
                          </div>

                          {enabled && (
                            <div className="mt-8 flex flex-wrap gap-2 pt-8 border-t border-slate-50 dark:border-white/5">
                              {scheduleHours.map((slot) => (
                                <button
                                  key={slot}
                                  onClick={() => toggleSlot(day, slot)}
                                  className={`h-11 rounded-2xl px-6 text-[13px] font-bold transition-all duration-300 ${form.schedules[day].includes(slot) ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-brand-50 hover:text-brand-600'}`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-white/5 pt-10">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="h-14 px-8 rounded-2xl border-2 border-slate-200 dark:border-white/10 text-[15px] font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all w-full sm:w-auto"
                >
                  Anterior
                </button>
                <div className="flex gap-4 w-full sm:w-auto">
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      className={`primary-pill h-14 px-12 text-[15px] w-full sm:w-auto transition-all ${!canContinue ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                      {canContinue ? 'Siguiente Paso' : 'Completa los campos *'}
                    </button>
                  ) : (
                    <button
                      onClick={onSubmit}
                      disabled={!canContinue || isSubmitting}
                      className={`primary-pill h-14 px-12 text-[15px] bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 w-full sm:w-auto flex items-center justify-center gap-3 transition-all ${isSubmitting ? 'opacity-80' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Enviando Solicitud...</span>
                        </>
                      ) : (
                        'Finalizar y Enviar'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-950 scroll-mt-24 border-t border-slate-100 dark:border-white/5">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-16">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              <FaqItem
                question="¿Cómo verifican mi perfil?"
                answer="Revisamos personalmente tu número de colegiatura (CMP) en la base de datos oficial del Colegio Médico. También validamos los títulos y certificaciones que subas para asegurar que la información que ven los pacientes sea real."
              />
              <FaqItem
                question="¿Cuánto tarda en activarse mi cuenta?"
                answer="Una vez que envíes tus datos, nuestro equipo revisará todo en un plazo de 24 a 48 horas. Si todo está correcto, tu perfil aparecerá automáticamente en los resultados de búsqueda."
              />
              <FaqItem
                question="¿Puedo cambiar de plan más adelante?"
                answer="Sí, puedes subir o bajar de nivel de plan cuando lo necesites. Los cambios se aplican al momento para que siempre tengas el nivel de visibilidad que buscas."
              />
              <FaqItem
                question="¿Cómo recibo los pagos de las consultas?"
                answer="Los pacientes te pagan directamente a ti, ya sea en tu consultorio o por tus propios medios de pago. MedicoTrujillo no cobra comisiones por tus citas ni retiene tu dinero."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-[32px] border transition-all duration-500 ${open ? 'bg-white shadow-xl border-brand-500/20 dark:bg-slate-900' : 'bg-white/50 border-transparent dark:bg-white/5'}`}>
      <button className="flex w-full items-center justify-between p-8 text-left outline-none" onClick={() => setOpen(!open)}>
        <span className="text-[16px] font-bold text-slate-900 dark:text-white">{question}</span>
        <span className={`text-2xl transition-transform duration-500 ${open ? 'rotate-45 text-brand-600' : 'text-slate-400'}`}>+</span>
      </button>
      {open && (
        <div className="px-8 pb-8 animate-fade-in">
          <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
        </div>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</div>
      <input
        type={type}
        className="h-14 w-full rounded-2xl bg-white px-6 text-[15px] font-bold text-slate-900 outline-none ring-2 ring-transparent transition-all focus:ring-brand-500/20 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</div>
      <select
        className="h-14 w-full appearance-none rounded-2xl bg-white px-6 text-[15px] font-bold text-slate-900 outline-none ring-2 ring-transparent transition-all focus:ring-brand-500/20 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.id} value={typeof opt === 'string' ? opt : opt.id}>
            {typeof opt === 'string' ? opt : opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function FileField({ label, onChange, multiple = false }) {
  const [fileCount, setFileCount] = useState(0)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFileCount(files.length)
    onChange(files)
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</div>
      <label className="relative flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed border-slate-200 dark:border-slate-700/60 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-brand-50/50 dark:hover:bg-brand-500/10 rounded-[24px] cursor-pointer transition-all px-4 py-6 group">
        <input
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 group-hover:text-brand-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
             {fileCount > 0 ? (
               <span className="text-brand-600 dark:text-brand-400 block">{fileCount} archivo{fileCount !== 1 ? 's' : ''} seleccionado{fileCount !== 1 ? 's' : ''}</span>
             ) : (
               <span>Haz clic para subir o <br className="sm:hidden" />arrastra imágenes</span>
             )}
          </div>
        </div>
      </label>
    </div>
  )
}

const apiUrl = import.meta.env.VITE_API_URL || 'https://meditrujillo0.onrender.com'
const resolveAssetUrl = (value) => (value && value.startsWith('/uploads/')) ? apiUrl + value : value
