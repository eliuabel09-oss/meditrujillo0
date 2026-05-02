# MedicoTrujillo

Plataforma médica digital que conecta pacientes con médicos especialistas en la ciudad de Trujillo. Permite a los usuarios buscar profesionales mediante inteligencia artificial (sintomatología), consultar disponibilidad y reservar citas en tiempo real. 

Los especialistas cuentan con perfiles administrables y planes de suscripción que determinan su visibilidad en el ecosistema de la plataforma.

---

## Tecnologías (Stack)

**Frontend:**
- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) - Renderizado ultrarrápido (SPA).
- [Tailwind CSS](https://tailwindcss.com/) - Diseño responsivo y moderno (Mobile First).
- [React Router DOM](https://reactrouter.com/) - Navegación y Code Splitting.

**Backend:**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) - API RESTful robusta.
- [Multer](https://github.com/expressjs/multer) - Gestión de carga de archivos (fotos de perfil, credenciales).
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) - Notificaciones automatizadas de reserva.

**Base de Datos y Autenticación:**
- [Firebase Firestore](https://firebase.google.com/docs/firestore) - Almacenamiento NoSQL en la nube.
- [Firebase Auth](https://firebase.google.com/docs/auth) - Gestión segura de sesiones de usuarios (Login con Google).

---

## Sistema de Planes (Visibilidad)

La plataforma utiliza una arquitectura orientada a la monetización mediante suscripciones. La visibilidad de los especialistas está estrictamente jerarquizada según su plan activo:

| Plan | Destacados (Home) | Atención Ahora | Orientación IA | Búsqueda Estándar |
| :--- | :---: | :---: | :---: | :---: |
| **Premium** | Si | Si | Si | Si (Prioridad Alta) |
| **Pro** | No | Si | Si | Si (Prioridad Media) |
| **Básico** | No | No | No | Si (Prioridad Baja) |

---

## Flujo de Trabajo (Especialistas)

El ingreso a la plataforma está regulado por un sistema de aprobación para garantizar la autenticidad y calidad médica:

1. **Registro:** El médico completa el formulario en `/eres-medico` anexando sus grados académicos y colegiatura. El sistema lo guarda en la colección `pending`.
2. **Validación:** El administrador evalúa la información a través del panel privado `/admin`.
3. **Activación:** Al ser aprobado, el perfil se mueve a la colección `doctors` (`status: active`) y su visibilidad comienza a regirse según el plan adquirido.

---

## Estructura del Proyecto

```text
MedicoTrujillo/
├── src/                      # Código fuente del Frontend (React)
│   ├── components/           # Componentes modulares (Header, DoctorProfile, UI)
│   ├── context/              # Estado Global (AppContext - Sesiones y Reservas)
│   ├── hooks/                # Hooks personalizados (useSEO para posicionamiento)
│   ├── pages/                # Vistas de la aplicación (Lazy loaded)
│   └── services/             # Capa de red (publicApi.js)
│
├── server/                   # Código fuente del Backend (Express)
│   ├── index.js              # Punto de entrada, rutas y endpoints
│   ├── firebase.js           # Configuración de base de datos
│   ├── public/               # Panel de administración HTML/JS
│   └── uploads/              # Almacenamiento local de archivos procesados
│
└── public/                   # Recursos estáticos
    └── images/               # Imágenes optimizadas en formato WebP
```

---

## Instalación y Despliegue Local

### Requisitos Previos
- Node.js (v18 o superior)
- NPM o Yarn
- Credenciales de Firebase

### Pasos
1. Clona este repositorio o descarga el código fuente.
2. Navega al directorio raíz y ejecuta:
   ```bash
   npm install
   ```
3. Copia el archivo `.env.example` y renómbralo a `.env`. Completa las variables necesarias:
   ```env
   VITE_API_URL=http://localhost:8787
   ADMIN_KEY=tu-clave-secreta
   # (Opcional) Variables de WhatsApp Cloud API
   ```
4. Inicia ambos servidores (Frontend y Backend) simultáneamente:
   ```bash
   npm start
   ```
   *El frontend correrá en el puerto `5173` y el backend en el `8787`.*

---

## Notas de Producción

- **CORS:** Asegúrese de definir correctamente `FRONTEND_URL` en las variables de entorno del servidor para permitir solicitudes seguras.
- **Mantener Activo (Render):** El backend incluye un sistema de auto-ping programado para evadir los periodos de inactividad de las capas gratuitas (free tiers).
- **SEO:** Las etiquetas Meta y títulos son inyectados dinámicamente usando el hook `useSEO` para optimizar el rastreo de motores de búsqueda.
