/**
 * ============================================================================
 * MEDITRUJILLO - BACKEND (Express API)
 * ============================================================================
 * 
 * ARQUITECTURA GENERAL:
 * Este archivo es el punto de entrada principal del backend. Funciona como una 
 * API REST que sirve al frontend en React. Maneja el registro de doctores, 
 * reservas de citas, notificaciones por WhatsApp y acciones administrativas.
 * 
 * FLUJO DE DATOS Y ALMACENAMIENTO:
 * 1. Base de datos: Utiliza Firebase Firestore (a través de `firebase.js`) 
 *    para almacenar colecciones como 'doctors', 'pending', 'appointments', etc.
 * 2. Archivos estáticos: Las fotos de perfil y credenciales subidas por los 
 *    doctores se guardan localmente en la carpeta `server/uploads/` usando Multer.
 * 
 * FLUJO DE REGISTRO DE DOCTORES:
 * - Frontend envía datos (texto + imágenes) a `/api/doctors/pending`.
 * - Multer procesa las imágenes y las guarda.
 * - El registro se guarda en la colección 'pending' (estado pendiente).
 * - El administrador (en `/admin`) revisa y aprueba el perfil, moviéndolo a 'doctors'.
 * 
 * SISTEMA DE PLANES (Visibilidad):
 * Los doctores tienen planes ('premium', 'pro', 'basic') que determinan su 
 * prioridad en el buscador del frontend y en las sugerencias de la IA.
 * 
 * NOTIFICACIONES (WhatsApp):
 * Al realizarse una reserva (`/api/appointments/reserve`), el sistema invoca
 * `notifyDoctorReservation()` para enviar un mensaje automatizado al doctor.
 */

// Dependencias principales

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { readCollection, writeCollection, uploadFile } from './firebase.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, 'uploads')
const publicDir  = path.join(__dirname, 'public')

fs.mkdirSync(uploadsDir, { recursive: true })
fs.mkdirSync(publicDir,  { recursive: true })

// Multer: saves uploaded files to server/uploads/ with a timestamped filename
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`
    callback(null, safeName)
  }
})

const upload = multer({ storage })
const doctorApplicationUpload = upload.fields([
  { name: 'photo',                maxCount: 1 },
  { name: 'titleImages',          maxCount: 8 },
  { name: 'mastersImages',        maxCount: 8 },
  { name: 'certificationsImages', maxCount: 8 },
  { name: 'mastersImage',         maxCount: 1 },
  { name: 'certificationsImage',  maxCount: 1 }
])

const app  = express()
const port = Number(process.env.PORT || 8787)
const adminKey              = process.env.ADMIN_KEY              || 'meditrujillo-admin'
const whatsappNotifyNumber  = process.env.WHATSAPP_NOTIFY_NUMBER || '51949021141'
const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
const whatsappAccessToken   = process.env.WHATSAPP_ACCESS_TOKEN   || ''
const whatsappTemplateName  = process.env.WHATSAPP_TEMPLATE_NAME  || ''

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://meditrujillo0.vercel.app',
    'https://meditrujillo0.vercel.app/',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter(Boolean)
}))
app.use(express.json({ limit: '25mb' }))
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

console.log('--- SERVER CONFIG ---')
console.log('Uploads directory:', uploadsDir)
console.log('---------------------')

// Serving static files with explicit CORS for images
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}, express.static(uploadsDir))

app.use('/admin', express.static(publicDir))

// ─── Datos por defecto (solo se usan si Firestore esta vacio) ──────────────

const defaultDoctors = [
  {
    id: 'doc-1',
    name: 'Dra. Valeria Mena',
    specialty: 'Dermatología',
    cmp: 'CMP 45921',
    department: 'La Libertad',
    province: 'Trujillo',
    district: 'Víctor Larco',
    clinic: 'Clínica San Pablo Trujillo',
    experience: 12,
    price: 95,
    rating: 4.9,
    plan: 'premium',
    status: 'active',
    image: '/uploads/doctor-01.webp',
    photoPath: '/uploads/doctor-01.webp',
    email: 'vmena@meditrujillo.pe',
    whatsapp: '51987654321',
    availableNow: true,
    attentionNow: true,
    featured: true,
    subscriptionStartedAt: '2026-03-01',
    subscriptionEndsAt: '2026-05-30',
    schedules: {
      Lunes:    ['08:00', '10:00', '17:00'],
      Martes:   ['09:00', '11:00', '18:00'],
      Miércoles:['08:00', '12:00', '19:00'],
      Jueves:   ['10:00', '17:00'],
      Viernes:  ['09:00', '11:00', '18:00'],
      Sábado:   ['09:00', '10:00']
    }
  },
  {
    id: 'doc-2',
    name: 'Dr. José Rodríguez',
    specialty: 'Cardiología',
    cmp: 'CMP 40876',
    department: 'La Libertad',
    province: 'Trujillo',
    district: 'Trujillo',
    clinic: 'Centro Cardiovascular Norte',
    experience: 15,
    price: 120,
    rating: 4.8,
    plan: 'premium',
    status: 'active',
    image: '/uploads/doctor-02.webp',
    photoPath: '/uploads/doctor-02.webp',
    email: 'jrodriguez@meditrujillo.pe',
    whatsapp: '51912345678',
    availableNow: true,
    attentionNow: true,
    featured: true,
    subscriptionStartedAt: '2026-03-01',
    subscriptionEndsAt: '2026-05-30',
    schedules: {
      Lunes:  ['09:00', '11:00', '16:00'],
      Martes: ['08:00', '10:00', '17:00'],
      Jueves: ['09:00', '11:00'],
      Sábado: ['09:00', '10:00']
    }
  },
  {
    id: 'doc-3',
    name: 'Dra. Carmen Llanos',
    specialty: 'Pediatría',
    cmp: 'CMP 38741',
    department: 'La Libertad',
    province: 'Trujillo',
    district: 'El Porvenir',
    clinic: 'Hospital Regional Docente',
    experience: 10,
    price: 80,
    rating: 4.7,
    plan: 'pro',
    status: 'active',
    image: '/uploads/doctor-03.webp',
    photoPath: '/uploads/doctor-03.webp',
    email: 'cllanos@meditrujillo.pe',
    whatsapp: '51923456789',
    availableNow: true,
    attentionNow: true,
    featured: false,
    subscriptionStartedAt: '2026-03-01',
    subscriptionEndsAt: '2026-05-30',
    schedules: {
      Lunes:  ['10:00', '11:00', '12:00', '17:00'],
      Martes: ['09:00', '10:00', '18:00'],
      Jueves: ['09:00', '16:00'],
      Sábado: ['08:00', '09:00']
    }
  }
]

// ─── Bootstrap: solo siembra Firestore si esta vacio ──────────────────────

async function bootstrap() {
  try {
    console.log('--- System Ready: Ensuring cloud and local data synergy ---')
    let cloudDoctors = await readCollection('doctors')
    
    // Read local "extra" doctors if file exists
    const localPath = path.join(__dirname, 'data', 'doctors.json')
    let localDoctors = []
    if (fs.existsSync(localPath)) {
      try {
        localDoctors = JSON.parse(fs.readFileSync(localPath, 'utf8'))
      } catch (e) {
        console.warn('Error reading local doctors.json:', e.message)
      }
    }
    
    // Add missing doctors from local to cloud
    let addedCount = 0
    for (const localDoc of localDoctors) {
      if (!cloudDoctors.find(d => d.id === localDoc.id)) {
        cloudDoctors.push(localDoc)
        addedCount++
      }
    }

    if (addedCount > 0) {
      await writeCollection('doctors', cloudDoctors)
      console.log(`--- Added ${addedCount} local doctors to the cloud ---`)
    } else {
      console.log('--- Cloud database is up to date with local extras ---')
    }
  } catch (error) {
    console.error('Bootstrap error:', error)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

// ─── Helpers ────────────────────────────────────────────────────────────────
// requireAdmin: blocks requests without the correct x-admin-key header
function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== adminKey) {
    res.status(401).json({ error: 'admin key invalid' })
    return
  }
  next()
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function planWeight(plan) {
  return { premium: 3, pro: 2, basic: 1 }[plan] ?? 0
}

function addNinetyDays() {
  const today = new Date()
  today.setDate(today.getDate() + 90)
  return today.toISOString().slice(0, 10)
}

function withSubscriptionState(doctor) {
  const daysLeft = daysUntil(doctor.subscriptionEndsAt)
  let renewalState = 'active'
  if (daysLeft < 0) renewalState = 'expired'
  else if (daysLeft <= 15) renewalState = 'due_soon'
  return { ...doctor, renewalState, daysLeft }
}

function daysUntil(dateText) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateText)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
}

function capitalizePlan(plan) {
  return { basic: 'Básico', pro: 'Pro', premium: 'Premium' }[plan] || plan
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizeImageList(list) {
  if (!list) return []
  if (typeof list === 'string') return [list]
  return Array.isArray(list) ? list : []
}

function getPublicBaseUrl(req) {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL
  const protocol = req.protocol
  const host = req.get('host')
  return `${protocol}://${host}`
}

function fileUploadInfo(file, publicBaseUrl) {
  if (!file) return { path: '', url: '' }
  return {
    path: `/uploads/${file.filename}`,
    url:  `${publicBaseUrl}/uploads/${file.filename}`
  }
}

function fileUploadList(files = [], publicBaseUrl) {
  return files.map((file) => fileUploadInfo(file, publicBaseUrl))
}

function hasWhatsAppCloudConfig() {
  return false
}

function buildWhatsAppPayload(message, target = whatsappNotifyNumber) {
  if (whatsappTemplateName) {
    return {
      messaging_product: 'whatsapp',
      to: target,
      type: 'template',
      template: {
        name: whatsappTemplateName,
        language: { code: 'es_PE' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: message.slice(0, 1024) }] }]
      }
    }
  }
  return {
    messaging_product: 'whatsapp',
    to: target,
    type: 'text',
    text: { preview_url: false, body: message.slice(0, 4096) }
  }
}

async function sendWhatsAppTextMessage(message, target = whatsappNotifyNumber) {
  const response = await fetch(`https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${whatsappAccessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildWhatsAppPayload(message, target))
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body?.error?.message || 'WhatsApp text API error')
  return body
}

async function sendWhatsAppPhotoMessage(item) {
  const response = await fetch(`https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${whatsappAccessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: whatsappNotifyNumber,
      type: 'image',
      image: { link: item.photoUrl, caption: `${item.applicationCode} - ${item.fullName}` }
    })
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body?.error?.message || 'WhatsApp image API error')
  return body
}

function buildDoctorApplicationMessage(item) {
  const scheduleSummary = Object.entries(item.schedules || {})
    .filter(([, slots]) => Array.isArray(slots) && slots.length)
    .map(([day, slots]) => `${day}: ${slots.join(', ')}`)
    .join(' | ')

  return [
    `Nueva solicitud de medico - ${item.applicationCode}`,
    `Fecha: ${new Date(item.createdAt).toLocaleString('es-PE')}`,
    `Plan seleccionado: ${capitalizePlan(item.plan)}`,
    `Nombre: ${item.fullName}`,
    `Especialidad: ${item.specialty}`,
    `CMP: ${item.cmp}`,
    `Ubicacion: ${item.department}, ${item.province}, ${item.district}`,
    `Clinica: ${item.clinic}`,
    `Experiencia: ${item.experience} años`,
    `Precio: S/ ${item.price}`,
    `Email: ${item.email}`,
    `WhatsApp medico: ${item.whatsapp}`,
    `Foto: ${item.photoUrl}`,
    `Horarios seleccionados: ${scheduleSummary || 'No definidos'}`
  ].join('\n')
}

async function notifyDoctorApplication(item) {
  const message = buildDoctorApplicationMessage(item)
  const notifications = await readCollection('notifications')

  if (hasWhatsAppCloudConfig()) {
    const photoResponse = item.photoPath.startsWith('/uploads/')
      ? await sendWhatsAppPhotoMessage(item)
      : null
    const textResponse = await sendWhatsAppTextMessage(message)
    const deliveredItem = {
      id: nextId('notify'),
      createdAt: new Date().toISOString(),
      target: whatsappNotifyNumber,
      delivered: true,
      mode: 'whatsapp-cloud-api',
      message,
      response: { photo: photoResponse, text: textResponse }
    }
    await writeCollection('notifications', [deliveredItem, ...notifications])
    return deliveredItem
  }

  const fallbackItem = {
    id: nextId('notify'),
    createdAt: new Date().toISOString(),
    target: whatsappNotifyNumber,
    delivered: false,
    mode: 'pending-config',
    message,
    waLink: `https://wa.me/${whatsappNotifyNumber}?text=${encodeURIComponent(message)}`
  }
  await writeCollection('notifications', [fallbackItem, ...notifications])
  return fallbackItem
}

async function notifyDoctorReservation(appointment, doctor) {
  const message = [
    `*NUEVA RESERVA - MEDITRUJILLO*`,
    `Hola Dr(a). ${doctor.name}, tienes una nueva solicitud de cita desde la plataforma.`,
    ``,
    `*DATOS DEL PACIENTE*`,
    `- Nombre: ${appointment.patient.nombres} ${appointment.patient.apellidos}`,
    `- DNI: ${appointment.patient.dni}`,
    `- Edad: ${appointment.patient.edad} años`,
    `- WhatsApp: https://wa.me/${appointment.patient.telefono.startsWith('51') ? appointment.patient.telefono : '51' + appointment.patient.telefono}`,
    `- Correo: ${appointment.patient.correo}`,
    `- Motivo: ${appointment.patient.motivo}`,
    ``,
    `*DETALLES DE LA CITA*`,
    `- Fecha: ${appointment.appointmentDate} (${appointment.day})`,
    `- Hora: ${appointment.slot}`,
    ``,
    `Por favor, póngase en contacto con el paciente para confirmar la atención.`
  ].join('\n')

  const notifications = await readCollection('notifications')
  let targetNumber = doctor.whatsapp || whatsappNotifyNumber
  if (/^9\d{8}$/.test(targetNumber)) targetNumber = `51${targetNumber}`

  if (hasWhatsAppCloudConfig()) {
    const textResponse = await sendWhatsAppTextMessage(message, targetNumber)
    let adminResponse = null
    if (targetNumber !== whatsappNotifyNumber) {
      try {
        adminResponse = await sendWhatsAppTextMessage(`*COPIA ADMINISTRADOR*\n\n${message}`, whatsappNotifyNumber)
      } catch (e) {
        console.error('Error enviando copia a admin:', e)
      }
    }
    const deliveredItem = {
      id: nextId('notify'),
      createdAt: new Date().toISOString(),
      target: targetNumber,
      delivered: true,
      mode: 'whatsapp-cloud-api',
      message,
      response: { text: textResponse, admin: adminResponse }
    }
    await writeCollection('notifications', [deliveredItem, ...notifications])
    return deliveredItem
  }

  const fallbackItem = {
    id: nextId('notify'),
    createdAt: new Date().toISOString(),
    target: targetNumber,
    delivered: false,
    mode: 'pending-config',
    message,
    waLink: `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`,
    adminWaLink: `https://wa.me/${whatsappNotifyNumber}?text=${encodeURIComponent('*COPIA ADMINISTRADOR*\n\n' + message)}`
  }
  await writeCollection('notifications', [fallbackItem, ...notifications])
  return fallbackItem
}

async function nextDoctorApplicationCode() {
  const [pending, doctors] = await Promise.all([
    readCollection('pending'),
    readCollection('doctors')
  ])
  const total = pending.length + doctors.length + 1
  return `DOCTOR-${String(total).padStart(3, '0')}`
}

// ─── Rutas ────────────────────────────────────────────────────────────────

// ─── Public Routes ──────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/', (_req, res) => {
  res.redirect('/admin')
})

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const { specialty, department, availableNow } = req.query
    const items = doctors
      .filter((item) => item.status === 'active')
      .filter((item) => !specialty    || item.specialty  === specialty)
      .filter((item) => !department   || item.department === department)
      .filter((item) => !availableNow || String(item.availableNow) === 'true')
      .sort((a, b) => planWeight(b.plan) - planWeight(a.plan) || b.rating - a.rating)
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/doctors/featured', async (_req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const items = doctors
      .filter((item) => item.status === 'active' && item.plan === 'premium')
      .sort((a, b) => b.rating - a.rating)
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const [doctors, appointments] = await Promise.all([
      readCollection('doctors'),
      readCollection('appointments')
    ])
    const doctor = doctors.find((item) => item.id === req.params.id && item.status === 'active')
    if (!doctor) {
      res.status(404).json({ error: 'Doctor no encontrado' })
      return
    }
    const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id && a.status === 'booked')
    res.json({ doctor: { ...doctor, appointments: doctorAppointments } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/doctors/pending', doctorApplicationUpload, async (req, res) => {
  try {
    const pending = await readCollection('pending')
    const applicationCode = await nextDoctorApplicationCode()
    const publicBaseUrl = getPublicBaseUrl(req)
    
    // Process main photo
    const photoFile = req.files?.photo?.[0]
    let photoPath = '/images/doctor-placeholder.svg'
    
    if (photoFile) {
      const webpFilename = `${path.parse(photoFile.filename).name}.webp`
      const webpAbsPath = path.join(uploadsDir, webpFilename)
      await sharp(photoFile.path).webp({ quality: 85 }).toFile(webpAbsPath)
      try { fs.unlinkSync(photoFile.path) } catch (e) {}
      photoPath = `/uploads/${webpFilename}`
    }

    // Process additional images (titles, masters, etc)
    const processFileList = async (files) => {
      if (!files) return []
      return Promise.all(files.map(async (f) => {
        const webpName = `${path.parse(f.filename).name}.webp`
        const webpPath = path.join(uploadsDir, webpName)
        await sharp(f.path).webp({ quality: 80 }).toFile(webpPath)
        try { fs.unlinkSync(f.path) } catch (e) {}
        return `/uploads/${webpName}`
      }))
    }

    const titleImages = await processFileList(req.files?.titleImages)
    const mastersImages = await processFileList(req.files?.mastersImages || req.files?.mastersImage)
    const certificationsImages = await processFileList(req.files?.certificationsImages || req.files?.certificationsImage)

    const item = {
      id: nextId('pending'),
      applicationCode,
      createdAt: new Date().toISOString(),
      status: 'pending',
      plan: req.body.plan,
      fullName: req.body.fullName,
      specialty: req.body.specialty,
      cmp: req.body.cmp,
      department: req.body.department,
      province: req.body.province,
      district: req.body.district,
      clinic: req.body.clinic,
      experience: Number(req.body.experience),
      price: Number(req.body.price),
      email: req.body.email,
      whatsapp: req.body.whatsapp,
      googleMaps: req.body.googleMaps,
      highSchool: req.body.highSchool,
      university: req.body.university,
      titleImages,
      mastersImages,
      certificationsImages,
      schedules: JSON.parse(req.body.schedules || '{}'),
      photoPath: photoPath,
      photoUrl:  `${publicBaseUrl}${photoPath}`
    }

    await writeCollection('pending', [item, ...pending])

    const notification = await notifyDoctorApplication(item).catch((error) => ({
      delivered: false,
      mode: 'failed',
      target: whatsappNotifyNumber,
      error: error.message
    }))

    res.status(201).json({
      ...item,
      notification: {
        delivered: notification.delivered,
        mode: notification.mode,
        target: notification.target,
        messagePreview: notification.message
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/appointments/reserve', async (req, res) => {
  try {
    const [blockedUsers, blockedEmails, appointments, doctors] = await Promise.all([
      readCollection('blocked-users'),
      readCollection('blocked-emails'),
      readCollection('appointments'),
      readCollection('doctors')
    ])

    const { doctorId, day, slot, patient, appointmentDate } = req.body

    if (blockedUsers.some((item) => item.uid === patient.uid)) {
      res.status(403).json({ error: 'Usuario bloqueado temporalmente' })
      return
    }
    if (blockedEmails.some((item) => normalizeEmail(item.email) === normalizeEmail(patient.email))) {
      res.status(403).json({ error: 'Correo bloqueado temporalmente' })
      return
    }

    const targetDoctor = doctors.find(d => d.id === doctorId)
    if (!targetDoctor) {
      res.status(404).json({ error: 'Doctor no encontrado' })
      return
    }

    // Check if slot exists in doctor's general schedule for that day
    const daySchedule = targetDoctor.schedules?.[day] ?? []
    if (!daySchedule.includes(slot)) {
      res.status(409).json({ error: 'Este horario no está configurado para este día' })
      return
    }

    // Check if appointment already exists for this specific date and slot
    const isTaken = appointments.some(a => 
      a.doctorId === doctorId && 
      a.appointmentDate === appointmentDate && 
      a.slot === slot && 
      a.status === 'booked'
    )

    if (isTaken) {
      res.status(409).json({ error: 'Este horario ya ha sido reservado para esta fecha' })
      return
    }

    // Validate daily booking limit by plan
    const dailyLimits = { basic: 15, pro: 40, premium: Infinity }
    const doctorPlan = targetDoctor.plan || 'basic'
    const limit = dailyLimits[doctorPlan] ?? 15

    if (limit !== Infinity) {
      const dailyBookings = appointments.filter(a =>
        a.doctorId === doctorId &&
        a.appointmentDate === appointmentDate &&
        a.status === 'booked'
      ).length

      if (dailyBookings >= limit) {
        res.status(429).json({ error: `Este doctor ha alcanzado el límite de ${limit} reservas diarias para su plan.` })
        return
      }
    }

    const appointment = {
      id: nextId('appt'),
      doctorId,
      day,
      slot,
      patient,
      status: 'booked',
      appointmentDate,
      createdAt: new Date().toISOString()
    }

    await writeCollection('appointments', [appointment, ...appointments])

    let notification = null
    try {
      notification = await notifyDoctorReservation(appointment, targetDoctor)
    } catch (e) {
      console.error('Error notifying doctor:', e)
    }

    res.json({ ok: true, appointment, notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
  try {
    const [doctors, pending, appointments, blockedUsers, blockedEmails, notifications] = await Promise.all([
      readCollection('doctors'),
      readCollection('pending'),
      readCollection('appointments'),
      readCollection('blocked-users'),
      readCollection('blocked-emails'),
      readCollection('notifications')
    ])
    res.json({
      doctors: doctors.map(withSubscriptionState),
      pending,
      appointments,
      blockedUsers,
      blockedEmails,
      notifications
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/pending/:id/approve', requireAdmin, async (req, res) => {
  try {
    const [doctors, pending] = await Promise.all([
      readCollection('doctors'),
      readCollection('pending')
    ])
    const item = pending.find((entry) => entry.id === req.params.id)
    if (!item) {
      res.status(404).json({ error: 'not found' })
      return
    }

    const doctor = {
      id: nextId('doc'),
      name: item.fullName,
      specialty: item.specialty,
      cmp: item.cmp,
      department: item.department,
      province: item.province,
      district: item.district,
      clinic: item.clinic,
      experience: item.experience,
      price: item.price,
      rating: 5,
      plan: item.plan,
      status: 'active',
      image: item.photoPath,
      email: item.email,
      whatsapp: item.whatsapp,
      googleMaps: item.googleMaps,
      highSchool: item.highSchool,
      university: item.university,
      titleImages: item.titleImages || [],
      mastersImages: item.mastersImages || [],
      certificationsImages: item.certificationsImages || [],
      availableNow: true,
      attentionNow: item.plan !== 'basic',
      featured: item.plan === 'premium',
      subscriptionStartedAt: new Date().toISOString().slice(0, 10),
      subscriptionEndsAt: addNinetyDays(),
      autoRenew: false,
      schedules: item.schedules || {}
    }

    await Promise.all([
      writeCollection('doctors', [doctor, ...doctors]),
      writeCollection('pending', pending.filter((entry) => entry.id !== req.params.id))
    ])

    res.json({ ok: true, doctor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/pending/:id/reject', requireAdmin, async (req, res) => {
  try {
    const pending = await readCollection('pending')
    await writeCollection('pending', pending.filter((entry) => entry.id !== req.params.id))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/appointments/:id/release', requireAdmin, async (req, res) => {
  try {
    const appointments = await readCollection('appointments')
    const appointment = appointments.find((entry) => entry.id === req.params.id)
    if (!appointment) {
      res.status(404).json({ error: 'not found' })
      return
    }

    const nextAppointments = appointments.map((entry) =>
      entry.id === appointment.id ? { ...entry, status: 'cancelled' } : entry
    )

    await writeCollection('appointments', nextAppointments)

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/users/block', requireAdmin, async (req, res) => {
  try {
    const blockedUsers = await readCollection('blocked-users')
    const uid = req.body.uid
    if (!uid) {
      res.status(400).json({ error: 'uid required' })
      return
    }
    const next = blockedUsers.some((item) => item.uid === uid)
      ? blockedUsers
      : [{ id: uid, uid, createdAt: new Date().toISOString() }, ...blockedUsers]
    await writeCollection('blocked-users', next)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/emails/block', requireAdmin, async (req, res) => {
  try {
    const blockedEmails = await readCollection('blocked-emails')
    const email = normalizeEmail(req.body.email)
    if (!email) {
      res.status(400).json({ error: 'email required' })
      return
    }
    const next = blockedEmails.some((item) => normalizeEmail(item.email) === email)
      ? blockedEmails
      : [{ id: email, email, createdAt: new Date().toISOString() }, ...blockedEmails]
    await writeCollection('blocked-emails', next)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/users/:uid/unblock', requireAdmin, async (req, res) => {
  try {
    const blockedUsers = await readCollection('blocked-users')
    const uid = req.params.uid
    // Filter by both item.uid and item.id to be safe
    const next = blockedUsers.filter((item) => item.uid !== uid && item.id !== uid)
    await writeCollection('blocked-users', next)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/emails/unblock', requireAdmin, async (req, res) => {
  try {
    const blockedEmails = await readCollection('blocked-emails')
    const email = normalizeEmail(req.body.email)
    if (!email) return res.status(400).json({ error: 'Email required' })
    
    // Filter checking both email field and id field
    const next = blockedEmails.filter((item) => {
      const itemEmail = normalizeEmail(item.email || item.id)
      return itemEmail !== email
    })
    await writeCollection('blocked-emails', next)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/admin/doctors/:id', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const nextDoctors = doctors.filter((doc) => doc.id !== req.params.id)
    if (doctors.length === nextDoctors.length) {
      res.status(404).json({ error: 'not found' })
      return
    }
    await writeCollection('doctors', nextDoctors)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/doctors', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const body = req.body || {}
    const doctor = {
      id: nextId('doc'),
      name: body.name,
      specialty: body.specialty,
      cmp: body.cmp,
      department: body.department,
      province: body.province,
      district: body.district,
      clinic: body.clinic,
      experience: Number(body.experience || 0),
      price: Number(body.price || 0),
      rating: Number(body.rating || 5),
      plan: body.plan,
      status: 'active',
      image: body.image || '/images/doctor-placeholder.svg',
      email: body.email,
      whatsapp: body.whatsapp,
      googleMaps: body.googleMaps,
      highSchool: body.highSchool,
      university: body.university,
      titleImages: normalizeImageList(body.titleImages),
      mastersImages: normalizeImageList(body.mastersImages || body.mastersImage),
      certificationsImages: normalizeImageList(body.certificationsImages || body.certificationsImage),
      availableNow: Boolean(body.availableNow),
      attentionNow: body.plan !== 'basic',
      featured: body.plan === 'premium',
      subscriptionStartedAt: body.subscriptionStartedAt || new Date().toISOString().slice(0, 10),
      subscriptionEndsAt: body.subscriptionEndsAt || addNinetyDays(),
      autoRenew: Boolean(body.autoRenew),
      schedules: body.schedules || {}
    }
    await writeCollection('doctors', [doctor, ...doctors])
    res.status(201).json({ ok: true, doctor: withSubscriptionState(doctor) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/admin/doctors/:id', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const index = doctors.findIndex(d => d.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Doctor no encontrado' })
    
    const body = req.body || {}
    const doctor = doctors[index]
    
    const updatedDoctor = {
      ...doctor,
      name: body.name || doctor.name,
      specialty: body.specialty || doctor.specialty,
      cmp: body.cmp || doctor.cmp,
      department: body.department || doctor.department,
      province: body.province || doctor.province,
      district: body.district || doctor.district,
      clinic: body.clinic || doctor.clinic,
      experience: Number(body.experience || doctor.experience),
      price: Number(body.price || doctor.price),
      plan: body.plan || doctor.plan,
      image: body.image || doctor.image,
      email: body.email || doctor.email,
      whatsapp: body.whatsapp || doctor.whatsapp,
      googleMaps: body.googleMaps || doctor.googleMaps,
      highSchool: body.highSchool || doctor.highSchool,
      university: body.university || doctor.university,
      titleImages: body.titleImages && body.titleImages.length ? normalizeImageList(body.titleImages) : doctor.titleImages,
      mastersImages: body.mastersImages && body.mastersImages.length ? normalizeImageList(body.mastersImages) : doctor.mastersImages,
      certificationsImages: body.certificationsImages && body.certificationsImages.length ? normalizeImageList(body.certificationsImages) : doctor.certificationsImages,
      subscriptionEndsAt: body.subscriptionEndsAt || doctor.subscriptionEndsAt,
      schedules: Object.keys(body.schedules || {}).length ? body.schedules : doctor.schedules
    }
    
    doctors[index] = updatedDoctor
    await writeCollection('doctors', doctors)
    res.json({ ok: true, doctor: withSubscriptionState(updatedDoctor) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/doctors/:id/renew', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const nextDoctors = doctors.map((doctor) => {
      if (doctor.id !== req.params.id) return doctor
      return {
        ...doctor,
        subscriptionStartedAt: new Date().toISOString().slice(0, 10),
        subscriptionEndsAt: addNinetyDays(),
        status: 'active'
      }
    })
    await writeCollection('doctors', nextDoctors)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/doctors/:id/toggle-renew', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const nextDoctors = doctors.map((doctor) => {
      if (doctor.id !== req.params.id) return doctor
      return { ...doctor, autoRenew: !doctor.autoRenew }
    })
    await writeCollection('doctors', nextDoctors)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/doctors/:id/toggle-status', requireAdmin, async (req, res) => {
  try {
    const doctors = await readCollection('doctors')
    const nextDoctors = doctors.map((doctor) => {
      if (doctor.id !== req.params.id) return doctor
      return { ...doctor, status: doctor.status === 'active' ? 'inactive' : 'active' }
    })
    await writeCollection('doctors', nextDoctors)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Arranque ─────────────────────────────────────────────────────────────

bootstrap().then(() => {
  app.listen(port, '0.0.0.0', () => {
    const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`
    console.log(`MediTrujillo server en ${publicUrl}`)
    console.log(`Admin dashboard en ${publicUrl}/admin`)
    console.log(`Admin key: ${adminKey}`)
    console.log(`WhatsApp notify: ${whatsappNotifyNumber}`)

    // Auto-ping cada 14 minutos para no dormir en Render (plan gratuito)
    if (process.env.RENDER_EXTERNAL_URL) {
      setInterval(() => {
        fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`)
          .then(() => console.log('[keep-alive] ping OK'))
          .catch((err) => console.warn('[keep-alive] ping failed:', err.message))
      }, 14 * 60 * 1000)
    }
  })
}).catch((err) => {
  console.error('Error fatal al iniciar:', err)
  process.exit(1)
})