import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, type MotionValue, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { PosterEuropa, PosterJupiter, PosterLua, PosterMarte, PosterSaturno } from '@/components/Posters'

const CARDS: { art: ReactNode; title: string; caption: string; color: string }[] = [
  { art: <PosterLua />, title: 'Salte seis vezes mais alto', caption: 'Na Lua, a gravidade é 16,5% da gravidade da Terra.', color: 'bg-poeira text-vacuo' },
  { art: <PosterMarte />, title: 'Veja o pôr do sol azul', caption: 'A poeira de Marte espalha a luz azul em volta do Sol.', color: 'bg-foguete text-vacuo' },
  { art: <PosterJupiter />, title: 'Primeira fila para a tempestade', caption: 'Na Grande Mancha Vermelha cabe a Terra inteira.', color: 'bg-saturno text-vacuo' },
  { art: <PosterEuropa />, title: 'Patine no gelo de Europa', caption: 'A lua de Júpiter é coberta por uma casca de gelo riscada.', color: 'bg-netuno text-vacuo' },
  { art: <PosterSaturno />, title: 'Anéis vistos da janela', caption: 'São mais de 280 mil km de uma ponta à outra.', color: 'bg-poeira text-vacuo' },
]

function Card({ c, i, skew }: { c: (typeof CARDS)[number]; i: number; skew: MotionValue<number> }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })
  const reduce = useReducedMotion()
  return (
    <motion.figure
      style={{ rotateX: srx, rotateY: sry, skewX: reduce ? 0 : skew, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 14)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      className={`relative w-[clamp(250px,27vw,360px)] shrink-0 rounded-[22px] p-3 ${c.color} ${i % 2 ? 'mt-14' : ''}`}
    >
      <div className="aspect-[300/360] overflow-hidden rounded-[14px]">{c.art}</div>
      <figcaption className="px-2 pt-4 pb-2">
        <p className="font-display text-[1.15rem] leading-tight font-bold tracking-[-0.02em]">{c.title}</p>
        <p className="mt-1.5 text-[0.9rem] leading-snug opacity-75">{c.caption}</p>
      </figcaption>
    </motion.figure>
  )
}

/** Galeria horizontal presa na tela (como o "Hall da Fama" dos capacetes do Lando) */
export function Postcards() {
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      const t = trackRef.current
      if (t) setOverflow(Math.max(0, t.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -overflow])
  const vel = useVelocity(scrollYProgress)
  const skew = useSpring(useTransform(vel, [-2, 2], [6, -6], { clamp: true }), { stiffness: 120, damping: 20 })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section ref={ref} id="cartoes" aria-labelledby="cartoes-titulo" className="relative" style={{ height: `calc(100vh + ${overflow}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-start gap-6 px-5 sm:gap-8 sm:px-10">
          <div className="flex w-[min(80vw,26rem)] shrink-0 flex-col justify-between self-stretch pr-6">
            <div>
              <h2 id="cartoes-titulo" className="font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-[0.98] font-bold tracking-[-0.04em]">
                Cartões-postais de bordo
              </h2>
              <p className="mt-5 max-w-[22rem] text-poeira/80">
                Cinco cenas da viagem para mandar a quem ficou na Terra. Role para passar os cartões.
              </p>
            </div>
            <div className="mt-10 h-[3px] w-40 overflow-hidden rounded-full bg-poeira/15" aria-hidden="true">
              <motion.div style={{ width: bar }} className="h-full bg-foguete" />
            </div>
          </div>
          {CARDS.map((c, i) => (
            <Card key={c.title} c={c} i={i} skew={skew} />
          ))}
          <div className="w-[8vw] shrink-0" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
