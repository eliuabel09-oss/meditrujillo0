import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { getDoctorById } from '../services/publicApi'

const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const shortWeekDays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function ReservationModal({ doctor, onClose, onReserve, error }) {
  const { session, authLoading, loginWithGoogle } = useAppContext()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    edad: '',
    telefono: '',
    correo: session?.email || '',
    motivo: ''
  })
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notificationResult, setNotificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [localDoctor, setLocalDoctor] = useState(doctor)

  useEffect(() => {
    if (session?.email) {
      setForm(prev => ({ ...prev, correo: session.email }))
    }
  }, [session])

  useEffect(() => {
    let cancelled = false
    async function refreshDoctor() {
      if (!doctor?.id) { setLoadingAvailability(false); return }
      setLoadingAvailability(true)
      try {
        const full = await getDoctorById(doctor.id)
        if (!cancelled && full) setLocalDoctor(full)
      } catch (err) {
        console.error('Error refreshing doctor availability:', err)
      } finally {
        if (!cancelled) setLoadingAvailability(false)
      }
    }
    refreshDoctor()
    return () => { cancelled = true }
  }, [doctor?.id])

  const handleFieldChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const step1Valid = [
    form.nombres.trim() !== '',
    form.apellidos.trim() !== '',
    /^\d{8}$/.test(form.dni),
    form.edad.trim() !== '',
    /^9\d{8}$/.test(form.telefono),
    form.correo.trim() !== '',
    form.motivo.trim() !== ''
  ].every(Boolean)

  const handleNext = () => {
    if (step === 1 && step1Valid) setStep(2)
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
  }

  const handleReserve = async () => {
    if (!selectedDate || !selectedSlot || loading) return
    const dayIndex = selectedDate.getDay()
    const dayName = dayIndex === 0 ? 'Domingo' : weekDays[dayIndex - 1]

    try {
      setLoading(true)
      const appointmentDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      const res = await onReserve(doctor.id, dayName, selectedSlot, form, appointmentDate)
      setNotificationResult(res?.notification)
      setStep(3)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const availableWeekDays = weekDays.filter(day => localDoctor.schedules?.[day]?.length > 0)
  const availableDayIndexes = availableWeekDays.map(day => {
    if (day === 'Domingo') return 0
    return weekDays.indexOf(day) + 1
  })

  const calendarCells = []
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-10" />)
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 90)

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d)
    const isPast = dateObj.getTime() < today.getTime()
    const isTooFar = dateObj.getTime() > maxDate.getTime()
    const dayIdx = dateObj.getDay()
    const isAvailable = availableDayIndexes.includes(dayIdx) && !isPast && !isTooFar
    const isSelected = selectedDate?.getTime() === dateObj.getTime()

    calendarCells.push(
      <button
        key={d}
        disabled={!isAvailable}
        onClick={() => {
          setSelectedDate(dateObj)
          setSelectedSlot(null)
        }}
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl text-[14px] transition-all duration-300 ${
          isSelected
            ? 'bg-brand-600 text-white font-black shadow-lg shadow-brand-500/20'
            : isAvailable
            ? 'text-slate-900 dark:text-white hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5 font-bold'
            : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
        }`}
      >
        {d}
        {isAvailable && !isSelected && (
           <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-500"></span>
        )}
      </button>
    )
  }

  let selectedSlots = []
  if (selectedDate) {
    const dayIndex = selectedDate.getDay()
    const dayName = dayIndex === 0 ? 'Domingo' : weekDays[dayIndex - 1]
    const rawSlots = localDoctor.schedules?.[dayName] ?? []
    
    const appointmentDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    
    // Filtrar slots ya reservados para esta fecha específica
    const bookedSlots = (localDoctor.appointments || [])
      .filter(a => a.appointmentDate === appointmentDate && a.status === 'booked')
      .map(a => a.slot)

    selectedSlots = [...new Set(rawSlots)].filter(slot => !bookedSlots.includes(slot))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-[640px] overflow-y-auto max-h-[90dvh] rounded-[48px] bg-white dark:bg-slate-900 shadow-2xl relative border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-8 top-8 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-950 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">Reservar Cita</h2>
                <div className="mt-1 text-[15px] font-bold text-brand-600 dark:text-brand-400">{localDoctor.name}</div>
             </div>
          </div>

          {authLoading ? (
             <div className="mt-12 flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                <div className="mt-4 text-[14px] font-black text-slate-400">Verificando sesión...</div>
             </div>
          ) : (
            <div className="mt-10">
              {error && (
                <div className="mb-6 rounded-2xl bg-rose-50 px-5 py-4 text-[14px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField label="Nombres *" placeholder="Ej. Juan" value={form.nombres} onChange={(v) => handleFieldChange('nombres', v)} />
                    <InputField label="Apellidos *" placeholder="Ej. Perez" value={form.apellidos} onChange={(v) => handleFieldChange('apellidos', v)} />
                    <InputField label="DNI *" placeholder="8 dígitos" value={form.dni} onChange={(v) => handleFieldChange('dni', v)} />
                    <InputField label="Edad *" type="number" placeholder="Ej. 28" value={form.edad} onChange={(v) => handleFieldChange('edad', v)} />
                    <InputField label="Teléfono *" placeholder="999888777" value={form.telefono} onChange={(v) => handleFieldChange('telefono', v)} />
                    <InputField label="Correo Electrónico *" placeholder="ejemplo@correo.com" value={form.correo} onChange={(v) => handleFieldChange('correo', v)} disabled={!!session} />
                    <div className="md:col-span-2">
                      <InputField label="Motivo de consulta *" placeholder="Breve descripción del síntoma o consulta" value={form.motivo} onChange={(v) => handleFieldChange('motivo', v)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Selecciona Fecha y Hora</h3>
                      {loadingAvailability && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"></div>
                          <span className="text-[11px] font-bold text-slate-400">Verificando disponibilidad...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={prevMonth} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5">
                         <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                       </button>
                       <div className="min-w-[120px] text-center text-[15px] font-black text-slate-900 dark:text-white">{monthNames[month]} {year}</div>
                       <button onClick={nextMonth} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5">
                         <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-8">
                    {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(day => (
                      <div key={day} className="text-[11px] font-black text-slate-400 py-2">{day}</div>
                    ))}
                    {calendarCells}
                  </div>

                  {selectedDate && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 animate-fade-in">
                      <div className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-5">Horarios Disponibles</div>
                      {loadingAvailability ? (
                        <div className="flex flex-wrap gap-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="h-11 w-20 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                          ))}
                        </div>
                      ) : selectedSlots.length === 0 ? (
                        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-5 py-4 text-[14px] font-bold text-rose-600 dark:text-rose-400">
                          No hay horarios disponibles para esta fecha. Selecciona otro día.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedSlots.map(slot => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`h-11 rounded-2xl px-6 text-[13px] font-bold transition-all duration-300 ${selectedSlot === slot ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5 dark:text-slate-400'}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="mt-12 rounded-[40px] bg-emerald-50 dark:bg-emerald-500/10 p-12 text-center border border-emerald-100 dark:border-emerald-500/20 animate-slide-up">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="mt-8 text-2xl font-black text-emerald-950 dark:text-emerald-400">¡Reserva Enviada!</h3>
                  <p className="mt-4 text-[16px] font-bold text-emerald-800 dark:text-emerald-500/80">
                    Tu solicitud ha sido registrada. Confirma ahora por WhatsApp con el consultorio para finalizar tu cita.
                  </p>
                  
                  {notificationResult?.waLink && (
                    <button 
                      onClick={() => window.open(notificationResult.waLink)} 
                      className="mt-10 h-16 w-full flex items-center justify-center gap-3 rounded-3xl bg-[#25D366] text-lg font-black text-white shadow-xl shadow-[#25D366]/20 transition-transform active:scale-95"
                    >
                      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Confirmar WhatsApp
                    </button>
                  )}
                  
                  <button 
                    onClick={onClose} 
                    className="mt-6 text-[15px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Volver al perfil
                  </button>
                </div>
              )}

              {step < 3 && (
                <div className="mt-12 flex gap-4 border-t border-slate-100 dark:border-white/5 pt-10">
                  {step === 2 && (
                    <button 
                      onClick={handleBack} 
                      className="h-14 px-10 rounded-2xl border-2 border-slate-200 text-[15px] font-black text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 transition-all"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    onClick={step === 1 ? handleNext : handleReserve}
                    disabled={loading || loadingAvailability || (step === 1 ? !step1Valid : (!selectedDate || !selectedSlot))}
                    className={`h-14 flex-1 rounded-2xl bg-brand-600 text-[16px] font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-700 disabled:opacity-30 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white"></div>
                        <span>Procesando...</span>
                      </div>
                    ) : (step === 1 ? 'Continuar' : 'Confirmar Reserva')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</div>
      <input 
        type={type}
        className="h-13 w-full rounded-2xl bg-slate-50 px-5 text-[15px] font-bold text-slate-900 outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-brand-500/20 dark:bg-white/5 dark:text-white dark:focus:bg-slate-800 disabled:opacity-50"
        value={value} 
        onChange={(e) => onChange ? onChange(e.target.value) : null} 
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}