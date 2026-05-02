import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function SignupPage() {
  const { register } = useAppContext()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    terms: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.confirmPassword) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!form.terms) {
      setError('Debes aceptar los términos para continuar.')
      return
    }

    setLoading(true)
    try {
      const displayName = `${form.nombre.trim()} ${form.apellido.trim()}`
      await register(form.email.trim(), form.password, displayName)
      navigate('/')
    } catch (err) {
      setError('Ocurrió un error al registrar la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-slate-50 dark:bg-slate-900 px-5 py-12">
      <div className="w-full max-w-[500px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Registro de Paciente</h1>
          <p className="mt-2 text-[15px] text-slate-500 dark:text-slate-400">Crea tu cuenta para buscar médicos y agendar citas</p>
        </div>

        <div className="mt-8 rounded-[24px] bg-white dark:bg-slate-800 p-6 shadow-sm border dark:border-slate-700 md:p-8">
          {error && (
            <div className="mb-6 rounded-[12px] bg-red-50 dark:bg-red-900/20 p-4 text-[13px] font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
              <InputField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
            </div>

            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
            <InputField label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} />
            <InputField label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} />
            <InputField label="Confirmar Contraseña" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />

            <label className="flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="mt-1 rounded border-slate-300 dark:border-slate-600 text-brand-500"
              />
              <span className="text-[13.5px] text-slate-600 dark:text-slate-400">
                Acepto los términos y condiciones de MediTrujillo
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-brand-500 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-600 disabled:opacity-70"
            >
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-[15px] text-slate-900 dark:text-white outline-none focus:border-brand-500"
      />
    </div>
  )
}
