import { useState, useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { useAppContext } from '../context/AppContext'

// Extreme Code Splitting: Lazy load heavy UI components
const Footer = lazy(() => import('./Footer').then(m => ({ default: m.Footer })))
const ReservationModal = lazy(() => import('./ReservationModal').then(m => ({ default: m.ReservationModal })))

export function AppShell({ children }) {
  const { pathname, hash } = useLocation()
  const { selectedDoctor, setSelectedDoctor, reserve } = useAppContext()
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        // Small timeout to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  const onReserve = async (doctorId, day, slot, patientData, appointmentDate) => {
    try {
      setBookingError('')
      const result = await reserve({ doctorId, day, slot, patientData, appointmentDate })
      return result
    } catch (error) {
      setBookingError(error.message)
      throw error
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer />
        {selectedDoctor && (
          <ReservationModal
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
            onReserve={onReserve}
            error={bookingError}
          />
        )}
      </Suspense>
    </div>
  )
}
