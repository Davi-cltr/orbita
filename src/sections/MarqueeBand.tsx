import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Marquee } from '@/components/magicui/marquee'
import { getLenis } from '@/lib/lenis'

const ROW_A = ['Gravidade opcional', 'Janela para Saturno', 'Saída da Terra', 'Bagagem de mão: 8 kg']
const ROW_B = ['Pôr do sol azul', 'Tempestade maior que a Terra', 'Saltos de seis metros', 'Anéis à vista']

function Dot() {
  return <span aria-hidden="true" className="inline-block size-[0.42em] translate-y-[-0.12em] self-center rounded-full bg-foguete" />
}

/** Dois letreiros em sentidos opostos; a rolagem acelera os dois */
export function MarqueeBand() {
  const speed = useRef(1)
  useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    const on = () => (speed.current = 1 + Math.min(Math.abs(lenis.velocity) * 0.18, 6))
    lenis.on('scroll', on)
    const decay = window.setInterval(() => (speed.current += (1 - speed.current) * 0.2), 80)
    return () => {
      lenis.off('scroll', on)
      window.clearInterval(decay)
    }
  }, [])
  const getSpeed = useCallback(() => speed.current, [])
  const [paused, setPaused] = useState(false)

  return (
    <section aria-label="O que está incluído" data-paused={paused} className="marquee-band relative z-10 -rotate-2 overflow-hidden bg-saturno py-6 text-vacuo sm:py-8">
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        aria-label={paused ? 'Continuar letreiro' : 'Pausar letreiro'}
        className="absolute top-2 right-3 z-10 grid size-9 place-items-center rounded-full bg-vacuo text-saturno transition-transform hover:scale-110 sm:right-6"
      >
        {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
      <Marquee getSpeed={getSpeed} className="[--duration:38s] [--gap:2.5rem]">
        {ROW_A.map((t) => (
          <span key={t} className="flex items-center gap-10 font-display text-[clamp(2rem,6vw,5rem)] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap">
            {t}
            <Dot />
          </span>
        ))}
      </Marquee>
      <Marquee reverse getSpeed={getSpeed} className="mt-3 [--duration:46s] [--gap:2.5rem]">
        {ROW_B.map((t) => (
          <span
            key={t}
            className="flex items-center gap-10 font-display text-[clamp(2rem,6vw,5rem)] leading-none font-light tracking-[-0.04em] whitespace-nowrap"
          >
            {t}
            <Dot />
          </span>
        ))}
      </Marquee>
    </section>
  )
}
