import { useEffect, useState } from 'react'
import { Nav } from '@/sections/Nav'
import { Journey } from '@/sections/Journey'
import { MarqueeBand } from '@/sections/MarqueeBand'
import { Postcards } from '@/sections/Postcards'
import { BookingCta, BookingDialog } from '@/sections/Booking'
import { Footer } from '@/sections/Footer'
import { getLenis, startLenis, stopLenis } from '@/lib/lenis'
import { clearReservation, loadReservation, saveReservation, type Reservation } from '@/lib/reservation'

export default function App() {
  const [booking, setBooking] = useState(false)
  const [ready, setReady] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(() => loadReservation())

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    startLenis()
    setReady(true)
    return () => stopLenis()
  }, [])

  // trava a rolagem suave enquanto o formulário está aberto
  useEffect(() => {
    const l = getLenis()
    if (booking) l?.stop()
    else l?.start()
  }, [booking])

  const openBooking = () => setBooking(true)

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-poeira focus:px-4 focus:py-2 focus:text-vacuo">
        Pular para o conteúdo
      </a>
      <Nav onBook={openBooking} seat={reservation?.assento} />
      <main id="conteudo">
        {ready && <Journey onBook={openBooking} />}
        <MarqueeBand />
        <Postcards />
        <BookingCta onBook={openBooking} />
      </main>
      <Footer />
      <BookingDialog
        open={booking}
        onOpenChange={setBooking}
        reservation={reservation}
        onReserve={(r) => {
          saveReservation(r)
          setReservation(r)
        }}
        onCancel={() => {
          clearReservation()
          setReservation(null)
        }}
      />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
