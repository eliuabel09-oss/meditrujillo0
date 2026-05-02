/**
 * ============================================================================
 * GLOBAL STATE (React Context)
 * ============================================================================
 * 
 * Este contexto (`AppContext`) es el "cerebro" del frontend.
 * 
 * RESPONSABILIDADES:
 * 1. Sesión de Usuario: Rastrea si el usuario está logueado (`session`) y si
 *    Firebase aún está verificando su estado (`authLoading`).
 * 2. Datos Médicos: Obtiene y almacena la lista global de doctores (`doctors`)
 *    y los destacados (`featuredDoctors`).
 * 3. Modal de Reservas: Controla qué doctor ha sido seleccionado para reservar
 *    una cita (`selectedDoctor`).
 * 4. Lógica de Reserva (`reserve`): Envía los datos al backend, permitiendo
 *    reservas tanto para invitados (guests) como para usuarios autenticados.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createDoctorApplication,
  getDoctors,
  getFeaturedDoctors,
  reserveAppointment
} from '../services/publicApi'
import {
  loginWithEmail,
  loginWithGoogle as googleAuth,
  registerWithEmail,
  signOutSession,
  subscribeToSession
} from '../lib/auth'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [featuredDoctors, setFeaturedDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  const reloadDoctors = async () => {
    setLoading(true)
    const earlyFeaturedPromise = window.__FEATURED_DOCTORS_PROMISE__
    const earlyDoctorsPromise = window.__DOCTORS_PROMISE__
    
    const [doctorsData, featuredData] = await Promise.all([
      earlyDoctorsPromise || getDoctors(),
      earlyFeaturedPromise || getFeaturedDoctors()
    ])

    window.__FEATURED_DOCTORS_PROMISE__ = null
    window.__DOCTORS_PROMISE__ = null

    const doctorItems = earlyDoctorsPromise ? (doctorsData?.items || []) : doctorsData
    const featuredItems = earlyFeaturedPromise ? (featuredData?.items || []) : featuredData

    setDoctors(doctorItems)
    setFeaturedDoctors(featuredItems)
    setLoading(false)
  }

  useEffect(() => {
    let unsubscribe = null
    const initSession = async () => {
      setAuthLoading(true)
      unsubscribe = await subscribeToSession((user) => {
        setSession(user)
        setAuthLoading(false)
      })
    }
    
    initSession()
    reloadDoctors()
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  const login = async (email, password) => {
    const user = await loginWithEmail(email, password)
    setSession(user)
    return user
  }

  const register = async (email, password, displayName) => {
    const user = await registerWithEmail(email, password, displayName)
    setSession(user)
    return user
  }

  const loginWithGoogle = async () => {
    const user = await googleAuth()
    if (user) setSession(user)
    return user
  }

  const logout = async () => {
    await signOutSession()
    setSession(null)
  }

  const submitDoctorApplication = async (payload) => createDoctorApplication(payload)

  const reserve = async ({ doctorId, day, slot, patientData, appointmentDate }) => {
    // allow guest reservations
    const result = await reserveAppointment({
      doctorId,
      day,
      slot,
      appointmentDate,
      patient: {
        uid: session?.uid || 'guest',
        email: session?.email || patientData.correo,
        ...patientData
      }
    })
    await reloadDoctors()
    return result
  }

  const value = useMemo(
    () => ({
      session,
      authLoading,
      doctors,
      featuredDoctors,
      selectedDoctor,
      setSelectedDoctor,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      reloadDoctors,
      reserve,
      submitDoctorApplication
    }),
    [session, authLoading, doctors, featuredDoctors, selectedDoctor, loading]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  return useContext(AppContext)
}