/**
 * ============================================================================
 * API SERVICE LAYER (Comunicación Frontend -> Backend)
 * ============================================================================
 * 
 * Este archivo concentra todas las llamadas HTTP (fetch) que hace React hacia 
 * el servidor Express (backend).
 * 
 * FUNCIONES PRINCIPALES:
 * - getDoctors / getFeaturedDoctors: Obtiene la lista de doctores (activos/premium).
 * - createDoctorApplication: Envía el formulario `multipart/form-data` con las 
 *   imágenes y datos para registrar un nuevo doctor (estado 'pending').
 * - reserveAppointment: Envía la solicitud de reserva al backend.
 * 
 * SISTEMA DE PRIORIZACIÓN:
 * La función `matchSymptoms()` analiza síntomas mediante palabras clave para 
 * identificar especialidades. Los resultados se priorizan según el plan del 
 * doctor (Premium > Pro) utilizando la función `rankPlan`.
 */

import { keywordMap } from '../data'

// Points to local proxy in dev, production backend on Render otherwise
const url = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://meditrujillo0.onrender.com')

// Plan weight: premium=3, pro=2, basic=1 (used for sorting)
export const rankPlan = (plan) => ({ premium: 3, pro: 2, basic: 1 }[plan] ?? 0)

// Fetches active doctors filtered by specialty, department, or availability
export async function getDoctors(filters = {}) {
  try {
    const params = new URLSearchParams()
    if (filters.specialty) params.append('specialty', filters.specialty)
    if (filters.department) params.append('department', filters.department)
    if (filters.availableNow) params.append('availableNow', 'true')

    const response = await fetch(`${url}/api/doctors?${params.toString()}`)
    if (!response.ok) throw new Error('Error al obtener doctores')
    const data = await response.json()
    return data.items
  } catch (err) {
    console.error(err)
    return []
  }
}

// Fetches only premium doctors (used on Home page carousel)
export async function getFeaturedDoctors() {
  try {
    const response = await fetch(`${url}/api/doctors/featured`)
    if (!response.ok) throw new Error('Error al obtener destacados')
    const data = await response.json()
    return data.items
  } catch (err) {
    console.error(err)
    return []
  }
}

// Fetches a single doctor by ID (used on /doctor/:id profile page)
export async function getDoctorById(id) {
  try {
    const response = await fetch(`${url}/api/doctors/${id}`)
    if (!response.ok) throw new Error('Error al obtener doctor')
    const data = await response.json()
    return data.doctor
  } catch (err) {
    console.error(err)
    return null
  }
}

// Submits a new doctor application as multipart/form-data (photos + text fields)
// Saved as status: 'pending' until admin approves it
export async function createDoctorApplication(payload) {
  try {
    const formData = new FormData()

    // Append all text fields except file/schedule fields
    Object.keys(payload).forEach(key => {
      if (!['photo', 'titleImages', 'mastersImages', 'certificationsImages', 'schedules', 'services'].includes(key)) {
        formData.append(key, payload[key] || '')
      }
    })
    formData.append('schedules', JSON.stringify(payload.schedules || {}))
    formData.append('services', JSON.stringify(payload.services || []))

    // Append photo and credential image arrays
    if (payload.photo) formData.append('photo', payload.photo)
    const appendFiles = (key, files) => {
      if (Array.isArray(files)) files.forEach(f => formData.append(key, f))
    }
    appendFiles('titleImages', payload.titleImages)
    appendFiles('mastersImages', payload.mastersImages)
    appendFiles('certificationsImages', payload.certificationsImages)

    const response = await fetch(`${url}/api/doctors/pending`, { method: 'POST', body: formData })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al crear solicitud')
    }
    return await response.json()
  } catch (err) {
    console.error('Error creating application', err)
    throw err
  }
}

// Books an appointment slot for a patient — removes that slot from the doctor's schedule
export async function reserveAppointment(payload) {
  try {
    const response = await fetch(`${url}/api/appointments/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al reservar')
    }
    return await response.json()
  } catch (err) {
    console.error(err)
    throw err
  }
}

// Matches free-text symptoms to specialties using the keywordMap dictionary.
// Only returns pro/premium doctors (basic plan excluded from AI results).
export function matchSymptoms(symptoms, doctors) {
  const normalized = symptoms.toLowerCase()
  
  // Calculate scores for each specialty based on keyword hits
  const scores = {}
  
  Object.entries(keywordMap).forEach(([word, mappedSpecialties]) => {
    if (normalized.includes(word.toLowerCase())) {
      mappedSpecialties.forEach(spec => {
        scores[spec] = (scores[spec] || 0) + 1
      })
    }
  })

  // Sort specialties by score (descending)
  const sortedSpecialties = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([spec]) => spec)

  // Default to General Medicine if no matches
  const matches = sortedSpecialties.length ? sortedSpecialties : ['Medicina General']
  
  const prioritized = doctors
    .filter((doctor) => matches.includes(doctor.specialty) && doctor.status === 'active' && doctor.plan !== 'basic')
    .sort((a, b) => {
      // First: Sort by match score (how well the doctor's specialty matches the symptoms)
      const scoreA = matches.indexOf(a.specialty)
      const scoreB = matches.indexOf(b.specialty)
      if (scoreA !== scoreB) return scoreA - scoreB

      // Second: Sort by plan priority
      const planA = rankPlan(a.plan)
      const planB = rankPlan(b.plan)
      if (planA !== planB) return planB - planA

      // Third: Sort by rating
      return (b.rating || 5) - (a.rating || 5)
    })

  const premium = prioritized.filter((doctor) => doctor.plan === 'premium')
  const pro = prioritized.filter((doctor) => doctor.plan === 'pro')

  return {
    specialties: matches,
    doctors: premium.length ? premium : pro
  }
}
