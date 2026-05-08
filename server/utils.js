import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

/**
 * server/utils.js
 * Generic helper functions for the backend.
 */

/**
 * Wraps async route handlers to catch errors and pass them to the error middleware.
 * This eliminates the need for repeated try-catch blocks in index.js.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Standard error response middleware.
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message)
  const status = err.status || 500
  res.status(status).json({
    ok: false,
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR'
  })
}

/**
 * Processes a list of files, converts them to WebP, and saves them to the uploads directory.
 * Returns an array of relative paths.
 */
export async function processWebpImages(files, uploadsDir) {
  if (!files) return []
  const fileList = Array.isArray(files) ? files : [files]

  return Promise.all(fileList.map(async (f) => {
    const webpName = `${path.parse(f.filename).name}.webp`
    const webpPath = path.join(uploadsDir, webpName)

    await sharp(f.path)
      .webp({ quality: 80 })
      .toFile(webpPath)

    try { fs.unlinkSync(f.path) } catch (e) { }
    return `/uploads/${webpName}`
  }))
}

export function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function planWeight(plan) {
  return { premium: 3, pro: 2, basic: 1 }[plan] ?? 0
}

export function addNinetyDays() {
  const today = new Date()
  today.setDate(today.getDate() + 90)
  return today.toISOString().slice(0, 10)
}

export function daysUntil(dateText) {
  if (!dateText) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateText)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
}

export function withSubscriptionState(doctor) {
  const daysLeft = daysUntil(doctor.subscriptionEndsAt)
  let renewalState = 'active'
  if (daysLeft < 0) renewalState = 'expired'
  else if (daysLeft <= 15) renewalState = 'due_soon'
  return { ...doctor, renewalState, daysLeft }
}

export function capitalizePlan(plan) {
  return { basic: 'Básico', pro: 'Pro', premium: 'Premium' }[plan] || plan
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function normalizeImageList(list) {
  if (!list) return []
  if (typeof list === 'string') return [list]
  return Array.isArray(list) ? list : []
}

export function fileUploadInfo(file, publicBaseUrl) {
  if (!file) return { path: '', url: '' }
  return {
    path: `/uploads/${file.filename}`,
    url: `${publicBaseUrl}/uploads/${file.filename}`
  }
}

export function fileUploadList(files = [], publicBaseUrl) {
  return files.map((file) => fileUploadInfo(file, publicBaseUrl))
}

/**
 * Normalizes and maps doctor data from request body.
 * Centralizing this prevents redundancy between CREATE and UPDATE routes.
 */
export function mapDoctorData(body, existing = {}) {
  const doctor = {
    ...existing,
    name: body.name || existing.name,
    specialty: body.specialty || existing.specialty,
    cmp: body.cmp || existing.cmp,
    department: body.department || existing.department,
    province: body.province || existing.province,
    district: body.district || existing.district,
    clinic: body.clinic || existing.clinic,
    experience: Number(body.experience || existing.experience || 0),
    price: Number(body.price || existing.price || 0),
    rating: Number(body.rating || existing.rating || 5),
    plan: body.plan || existing.plan || 'basic',
    status: body.status || existing.status || 'active',
    image: body.image || existing.image || '/images/doctor-placeholder.svg',
    email: body.email || existing.email,
    whatsapp: body.whatsapp || existing.whatsapp,
    googleMaps: body.googleMaps || existing.googleMaps,
    highSchool: body.highSchool || existing.highSchool,
    university: body.university || existing.university,
    titleImages: normalizeImageList(body.titleImages || existing.titleImages),
    mastersImages: normalizeImageList(body.mastersImages || body.mastersImage || existing.mastersImages),
    certificationsImages: normalizeImageList(body.certificationsImages || body.certificationsImage || existing.certificationsImages),
    availableNow: body.availableNow !== undefined ? Boolean(body.availableNow) : (existing.availableNow ?? true),
    schedules: (() => {
      try {
        const val = body.schedules || existing.schedules || {}
        return typeof val === 'string' ? JSON.parse(val) : val
      } catch (e) { return existing.schedules || {} }
    })(),
    services: (() => {
      try {
        const val = body.services || existing.services || []
        return typeof val === 'string' ? JSON.parse(val) : val
      } catch (e) { return existing.services || [] }
    })()
  }

  // Derived properties based on plan
  doctor.attentionNow = doctor.plan !== 'basic'
  doctor.featured = doctor.plan === 'premium'

  if (!doctor.subscriptionStartedAt) doctor.subscriptionStartedAt = new Date().toISOString().slice(0, 10)
  if (!doctor.subscriptionEndsAt) doctor.subscriptionEndsAt = addNinetyDays()

  return doctor
}
