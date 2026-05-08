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
import { 
  readCollection, writeCollection, uploadFile, saveDocument, 
  deleteDocument, getDocument, db, runTransaction, queryCollection, query, where, orderBy 
} from './firebase.js'
import { createNotificationService } from './services/notificationService.js'
import * as utils from './utils.js'
import { doc, collection, getDocs } from 'firebase/firestore' // Needed for transactions

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

// ─── Singletons & Cache ─────────────────────────────────────────────────────

// Initialize Notification Service (Singleton)
const notificationService = createNotificationService(
  { whatsappNotifyNumber, whatsappPhoneNumberId, whatsappAccessToken, whatsappTemplateName },
  { 
    readCollection: async (col) => readCollection(col), 
    writeCollection: async (col, data) => writeCollection(col, data),
    nextId: utils.nextId,
    capitalizePlan: utils.capitalizePlan
  }
)

// In-memory cache for plans/settings (valid for 10 minutes)
let plansCache = null
let plansCacheExpiry = 0

async function getCachedPlans() {
  const now = Date.now()
  if (plansCache && now < plansCacheExpiry) return plansCache
  
  const settings = await getDocument('settings', 'plans') || {}
  const defaults = { 
    basic: 15, pro: 25, premium: 999999, 
    priceBasic: 0, pricePro: 50, pricePremium: 100 
  }
  
  plansCache = { ...defaults, ...settings }
  plansCacheExpiry = now + (10 * 60 * 1000) 
  return plansCache
}

function clearPlansCache() {
  plansCache = null
  plansCacheExpiry = 0
}

// ─── Middleware ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://meditrujillo0.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter(Boolean)
}))
app.use(express.json({ limit: '25mb' }))
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// Serving static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}, express.static(uploadsDir))

app.use('/admin', express.static(publicDir))

// ─── Helpers & Middleware ───────────────────────────────────────────────────

const mapDoctor = (doc) => utils.withSubscriptionState(doc)
const mapDoctors = (docs) => docs.map(mapDoctor)

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'admin key invalid' })
  }
  next()
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

async function nextDoctorApplicationCode() {
  // Scalable approach: Use a timestamp-based short code instead of counting everything
  const shortId = Date.now().toString().slice(-6)
  return `DOCTOR-${shortId}`
}

// ─── Rutas ────────────────────────────────────────────────────────────────

// ─── Public Routes ──────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const distDir = path.join(__dirname, '../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/uploads')) {
      return next()
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  app.get('/', (_req, res) => {
    res.redirect('/admin')
  })
}

// ─── Public Routes ──────────────────────────────────────────────────────────

app.get('/api/settings/plans', utils.asyncHandler(async (req, res) => {
  const plans = await getCachedPlans()
  res.json(plans)
}))

app.get('/api/doctors', utils.asyncHandler(async (req, res) => {
  const { specialty, department, availableNow } = req.query
  
  const constraints = [where('status', '==', 'active')]
  if (specialty) constraints.push(where('specialty', '==', specialty))
  if (department) constraints.push(where('department', '==', department))
  if (availableNow === 'true') constraints.push(where('availableNow', '==', true))

  const doctors = await queryCollection('doctors', ...constraints)
  
  const items = mapDoctors(doctors)
    .sort((a, b) => 
      utils.planWeight(b.plan) - utils.planWeight(a.plan) || 
      (b.rating || 0) - (a.rating || 0)
    )
  
  res.json({ items })
}))

app.get('/api/doctors/featured', utils.asyncHandler(async (_req, res) => {
  const items = await queryCollection('doctors', 
    where('status', '==', 'active'),
    where('plan', '==', 'premium')
  )
  res.json({ items: mapDoctors(items).sort((a, b) => (b.rating || 0) - (a.rating || 0)) })
}))

app.get('/api/doctors/:id', utils.asyncHandler(async (req, res) => {
  const [doctor, appointments] = await Promise.all([
    getDocument('doctors', req.params.id),
    queryCollection('appointments', 
      where('doctorId', '==', req.params.id),
      where('status', '==', 'booked')
    )
  ])
  if (!doctor || doctor.status !== 'active') return res.status(404).json({ error: 'Doctor no encontrado' })

  res.json({ 
    doctor: mapDoctor(doctor), 
    appointments 
  })
}))

app.post('/api/doctors/pending', doctorApplicationUpload, utils.asyncHandler(async (req, res) => {
  const applicationCode = await nextDoctorApplicationCode()
  
  // Process images using the central utility
  const [photoPath] = await utils.processWebpImages(req.files?.photo, uploadsDir)
  const titleImages = await utils.processWebpImages(req.files?.titleImages, uploadsDir)
  const mastersImages = await utils.processWebpImages(req.files?.mastersImages || req.files?.mastersImage, uploadsDir)
  const certificationsImages = await utils.processWebpImages(req.files?.certificationsImages || req.files?.certificationsImage, uploadsDir)

  const publicBaseUrl = getPublicBaseUrl(req)
    

  const photo = photoPath || '/images/doctor-placeholder.svg'

  const doctor = utils.mapDoctorData(req.body)
  const item = {
    ...doctor,
    id: utils.nextId('pending'),
    applicationCode,
    createdAt: new Date().toISOString(),
    status: 'pending',
    photoPath: photo,
    photoUrl:  `${publicBaseUrl}${photo}`,
    titleImages,
    mastersImages,
    certificationsImages
  }

  await saveDocument('pending', item.id, item)

  const delivered = await notificationService.notifyDoctorApplication(item).catch((error) => ({
    delivered: false,
    mode: 'failed',
    target: whatsappNotifyNumber,
    error: error.message
  }))

  res.status(201).json({
    ok: true,
    id: item.id,
    applicationCode: item.applicationCode,
    notification: delivered
  })
}))

app.post('/api/appointments/reserve', utils.asyncHandler(async (req, res) => {
  const { doctorId, day, slot, patient, appointmentDate } = req.body

  if (!patient) return res.status(400).json({ error: 'Datos del paciente requeridos' })

  const [userDoc, emailDoc, userQuery, emailQuery] = await Promise.all([
    getDocument('blocked-users', patient.uid),
    getDocument('blocked-emails', utils.normalizeEmail(patient.email)),
    getDocs(query(collection(db, 'blocked-users'), where('uid', '==', patient.uid))),
    getDocs(query(collection(db, 'blocked-emails'), where('email', '==', utils.normalizeEmail(patient.email))))
  ])

  const isUserBlocked = userDoc || !userQuery.empty
  const isEmailBlocked = emailDoc || !emailQuery.empty

  if (isUserBlocked || isEmailBlocked) {
    return res.status(403).json({ error: 'No puedes hacer una reserva' })
  }

  // 2. Atomic Transaction for booking
  const result = await runTransaction(db, async (transaction) => {
    const doctorRef = doc(db, 'doctors', doctorId)
    const doctorSnap = await transaction.get(doctorRef)
    if (!doctorSnap.exists()) throw new Error('Doctor no encontrado')
    const doctorData = doctorSnap.data()

    if (!(doctorData.schedules?.[day] || []).includes(slot)) {
      throw new Error('Este horario no está disponible')
    }

    const aptId = `apt-${doctorId}-${appointmentDate}-${slot.replace(/\s+/g, '')}`
    const aptRef = doc(db, 'appointments', aptId)
    const aptSnap = await transaction.get(aptRef)

    if (aptSnap.exists() && aptSnap.data().status === 'booked') {
      throw new Error('Este horario ya ha sido reservado')
    }

    // 2. Validate daily booking limits based on plan
    const dailyAppointmentsQuery = query(collection(db, 'appointments'), 
      where('doctorId', '==', doctorId),
      where('appointmentDate', '==', appointmentDate),
      where('status', '==', 'booked')
    )
    
    // We cannot use a query inside transaction.get() in the client SDK. We must use getDocs.
    const [dailySnap, limits] = await Promise.all([
      getDocs(dailyAppointmentsQuery),
      getCachedPlans()
    ])

    const dailyCount = dailySnap.size
    const limit = Number(limits[doctorData.plan || 'basic']) || 15

    if (dailyCount >= limit) {
      throw new Error(`El doctor ha alcanzado el límite de reservas diarias para su plan (${limit}).`)
    }

    const appointment = {
      id: aptId,
      doctorId,
      day,
      slot,
      patient,
      status: 'booked',
      appointmentDate,
      createdAt: new Date().toISOString()
    }

    transaction.set(aptRef, appointment)
    return { appointment, doctorData }
  })

  const notification = await notificationService.notifyDoctorReservation(result.appointment, result.doctorData).catch(() => null)
  res.json({ ok: true, appointment: result.appointment, notification })
}))








// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────
const adminRouter = express.Router()
adminRouter.use(requireAdmin)

adminRouter.get('/overview', utils.asyncHandler(async (_req, res) => {
  const [doctors, pending, appointments, blockedUsers, blockedEmails, notifications] = await Promise.all([
    readCollection('doctors'),
    readCollection('pending'),
    readCollection('appointments'),
    readCollection('blocked-users'),
    readCollection('blocked-emails'),
    readCollection('notifications')
  ])
  res.json({
    doctors: mapDoctors(doctors),
    pending,
    appointments,
    blockedUsers,
    blockedEmails,
    notifications
  })
}))

adminRouter.post('/pending/:id/approve', utils.asyncHandler(async (req, res) => {
  const item = await getDocument('pending', req.params.id)
  if (!item) return res.status(404).json({ error: 'not found' })

  const doctor = utils.mapDoctorData(
    { ...item, name: item.fullName, image: item.photoPath }, 
    { id: utils.nextId('doc') }
  )

  await runTransaction(db, async (transaction) => {
    const docRef = doc(db, 'doctors', doctor.id)
    const pendingRef = doc(db, 'pending', req.params.id)
    transaction.set(docRef, doctor)
    transaction.delete(pendingRef)
  })

  res.json({ ok: true, doctor })
}))

adminRouter.post('/pending/:id/reject', utils.asyncHandler(async (req, res) => {
  await deleteDocument('pending', req.params.id)
  res.json({ ok: true })
}))

adminRouter.post('/appointments/:id/release', utils.asyncHandler(async (req, res) => {
  const appointment = await getDocument('appointments', req.params.id)
  if (!appointment) return res.status(404).json({ error: 'not found' })

  await saveDocument('appointments', req.params.id, { ...appointment, status: 'cancelled' })
  res.json({ ok: true })
}))

adminRouter.post('/users/block', utils.asyncHandler(async (req, res) => {
  const uid = req.body.uid
  if (!uid) return res.status(400).json({ error: 'uid required' })
  await saveDocument('blocked-users', uid, { id: uid, uid, createdAt: new Date().toISOString() })
  res.json({ ok: true })
}))

adminRouter.post('/emails/block', utils.asyncHandler(async (req, res) => {
  const email = utils.normalizeEmail(req.body.email)
  if (!email) return res.status(400).json({ error: 'email required' })
  await saveDocument('blocked-emails', email, { id: email, email, createdAt: new Date().toISOString() })
  res.json({ ok: true })
}))

adminRouter.post('/users/:uid/unblock', utils.asyncHandler(async (req, res) => {
  await deleteDocument('blocked-users', req.params.uid)
  res.json({ ok: true })
}))

adminRouter.post('/emails/unblock', utils.asyncHandler(async (req, res) => {
  const email = utils.normalizeEmail(req.body.email)
  if (!email) return res.status(400).json({ error: 'Email required' })
  await deleteDocument('blocked-emails', email)
  res.json({ ok: true })
}))

adminRouter.delete('/doctors/:id', utils.asyncHandler(async (req, res) => {
  await deleteDocument('doctors', req.params.id)
  res.json({ ok: true })
}))

adminRouter.post('/doctors', utils.asyncHandler(async (req, res) => {
  const doctor = utils.mapDoctorData(req.body || {}, { id: utils.nextId('doc') })
  await saveDocument('doctors', doctor.id, doctor)
  res.status(201).json({ ok: true, doctor: utils.withSubscriptionState(doctor) })
}))

adminRouter.put('/doctors/:id', utils.asyncHandler(async (req, res) => {
  const doctor = await getDocument('doctors', req.params.id)
  if (!doctor) return res.status(404).json({ error: 'Doctor no encontrado' })
  const updatedDoctor = utils.mapDoctorData(req.body || {}, doctor)
  await saveDocument('doctors', req.params.id, updatedDoctor)
  res.json({ ok: true, doctor: utils.withSubscriptionState(updatedDoctor) })
}))

adminRouter.post('/doctors/:id/renew', utils.asyncHandler(async (req, res) => {
  const doctor = await getDocument('doctors', req.params.id)
  if (!doctor) return res.status(404).json({ error: 'not found' })
  
  const updated = {
    ...doctor,
    subscriptionStartedAt: new Date().toISOString().slice(0, 10),
    subscriptionEndsAt: utils.addNinetyDays(),
    status: 'active'
  }
  await saveDocument('doctors', req.params.id, updated)
  res.json({ ok: true })
}))

adminRouter.post('/doctors/:id/toggle-renew', utils.asyncHandler(async (req, res) => {
  const doctor = await getDocument('doctors', req.params.id)
  if (!doctor) return res.status(404).json({ error: 'not found' })

  const updated = { ...doctor, autoRenew: !doctor.autoRenew }
  await saveDocument('doctors', req.params.id, updated)
  res.json({ ok: true })
}))

adminRouter.post('/doctors/:id/toggle-status', utils.asyncHandler(async (req, res) => {
  const doctor = await getDocument('doctors', req.params.id)
  if (!doctor) return res.status(404).json({ error: 'not found' })

  const updated = { ...doctor, status: doctor.status === 'active' ? 'inactive' : 'active' }
  await saveDocument('doctors', req.params.id, updated)
  res.json({ ok: true })
}))

adminRouter.get('/settings/plans', utils.asyncHandler(async (req, res) => {
  const plans = await getCachedPlans()
  res.json(plans)
}))

adminRouter.post('/settings/plans', utils.asyncHandler(async (req, res) => {
  const { basic, pro, premium, priceBasic, pricePro, pricePremium } = req.body
  await saveDocument('settings', 'plans', {
    basic: Number(basic),
    pro: Number(pro),
    premium: Number(premium),
    priceBasic: Number(priceBasic),
    pricePro: Number(pricePro),
    pricePremium: Number(pricePremium),
    updatedAt: new Date().toISOString()
  })
  clearPlansCache()
  res.json({ ok: true })
}))

// ─── Arranque ─────────────────────────────────────────────────────────────
// ─── Arranque ─────────────────────────────────────────────────────────────

app.use('/api/admin', adminRouter)

// Error handling middleware (MUST be last)
app.use(utils.errorMiddleware)

const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`
  console.log('--- SERVER CONFIG ---')
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log('---------------------')
  console.log(`MediTrujillo server en ${publicUrl}`)
  console.log(`Admin dashboard en ${publicUrl}/admin`)
  console.log(`Admin key: ${adminKey}`)
  console.log(`WhatsApp notify: ${whatsappNotifyNumber}`)
  
  // Auto-ping every 14 mins to avoid Render free-tier sleep
  if (process.env.RENDER_EXTERNAL_URL) {
    setInterval(() => {
      fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`)
        .then(() => console.log('[keep-alive] ping OK'))
        .catch((err) => console.warn('[keep-alive] ping failed:', err.message))
    }, 14 * 60 * 1000)
  }
})

// Heartbeat to keep process alive (Scalability & Stability)
setInterval(() => {
  // This keeps the event loop active even if app.listen has issues
}, 10000)