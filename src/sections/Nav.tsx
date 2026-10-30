import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { RollText } from '@/components/RollText'
import { scrollToTarget } from '@/lib/lenis'

const LINKS = [
  { id: 'destinos', label: 'Destinos' },
  { id: 'cartoes', label: 'Cartões-postais' },
  { id: 'reservar', label: 'Reservar' },
]

export function Nav({ onBook, seat }: { onBook: () => void; seat?: string }) {
  // depois da viagem, o conteúdo passa por baixo do menu: ganha fundo
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => {
      const j = document.getElementById('destinos')
      setSolid(!!j && window.scrollY > j.offsetTop + j.offsetHeight - window.innerHeight * 1.02)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) scrollToTarget(el, 1.8)
  }
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.7, ease: [0.19, 1, 0.22, 1] }}
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-5 py-4 transition-[background-color,padding] duration-700 ease-(--ease-orbita) sm:px-10 ${solid ? 'bg-vacuo/80 backdrop-blur-md sm:py-4' : 'sm:py-6'}`}
    >
      <a href="#destinos" onClick={go('destinos')} className="roll-host flex items-center gap-2.5 font-display text-[1.05rem] font-bold tracking-tight">
        <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
          <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#ffc94a" strokeWidth="2" transform="rotate(-20 16 16)" />
          <circle cx="16" cy="16" r="7" fill="#ff5a1f" />
        </svg>
        <span translate="no"><RollText>órbita</RollText></span>
      </a>
      <nav aria-label="Seções" className="hidden items-center gap-1 rounded-full bg-vacuo/55 px-2 py-1 backdrop-blur-md md:flex">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="roll-host rounded-full px-4 py-2 text-sm text-poeira/85 transition-colors hover:text-poeira">
            <RollText>{l.label}</RollText>
          </a>
        ))}
      </nav>
      <Button size="sm" onClick={onBook} variant={seat ? 'light' : 'default'}>
        {seat ? (
          <>
            <RollText>Meu assento</RollText>
            <span className="rounded-full bg-foguete px-2 py-0.5 text-[0.7rem] text-vacuo">{seat}</span>
          </>
        ) : (
          <RollText>Reservar assento</RollText>
        )}
      </Button>
    </motion.header>
  )
}
