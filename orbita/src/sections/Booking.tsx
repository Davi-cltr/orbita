import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { Button } from '@/components/ui/button'
import { RollText } from '@/components/RollText'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const ORBIT = 'M120 380C120 170 470 70 760 130S1120 390 900 520 330 600 190 500 120 420 120 380'

const lineVariants = {
  hidden: { y: '108%' },
  show: (delay: number) => ({ y: 0, transition: { duration: 1.1, delay, ease: [0.65, 0.05, 0, 1] as const } }),
}

// a máscara (pai) é que é observada: o filho começa escondido fora dela
function Line({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block" variants={lineVariants} custom={delay}>
        {children}
      </motion.span>
    </span>
  )
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 16 })
  const y = useSpring(0, { stiffness: 220, damping: 16 })
  return (
    <motion.div
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.35)
        y.set((e.clientY - r.top - r.height / 2) * 0.35)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="inline-block p-4 -m-4"
    >
      {children}
    </motion.div>
  )
}

/** Chamada final: a órbita se desenha com a rolagem e uma nave percorre o traço */
export function BookingCta({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const shipRef = useRef<SVGGElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const draw = useTransform(scrollYProgress, [0.05, 0.85], [0, 1])

  useMotionValueEvent(draw, 'change', (v) => {
    const path = pathRef.current
    const ship = shipRef.current
    if (!path || !ship) return
    const len = path.getTotalLength()
    const pt = path.getPointAtLength(len * v)
    const ahead = path.getPointAtLength(Math.min(len, len * v + 2))
    const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI
    ship.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`)
    ship.style.opacity = v > 0.01 ? '1' : '0'
  })

  return (
    <section ref={ref} id="reservar" aria-labelledby="reservar-titulo" className="relative overflow-hidden px-5 pt-40 pb-32 sm:px-10 sm:pt-56">
      <svg aria-hidden="true" viewBox="0 0 1000 640" className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-[min(1400px,160vw)] max-w-none -translate-x-[0%] opacity-90 max-sm:-left-[30vw]">
        <path d={ORBIT} fill="none" stroke="#c3bde6" strokeOpacity=".18" strokeWidth="1.2" strokeDasharray="3 8" />
        <motion.path ref={pathRef} d={ORBIT} fill="none" stroke="#ff5a1f" strokeWidth="2.4" strokeLinecap="round" style={{ pathLength: draw }} />
        <g ref={shipRef} style={{ opacity: 0 }}>
          <path d="M-16 -7h22l10 7-10 7h-22z" fill="#f1ecff" />
          <path d="M-12 -7l-7-8h9l6 8zM-12 7l-7 8h9l6-8z" fill="#ffc94a" />
          <circle cx="4" cy="0" r="2.4" fill="#10104a" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} id="reservar-titulo" className="font-display text-[clamp(2.8rem,9vw,8.5rem)] leading-[0.92] font-[800] tracking-[-0.055em]">
          <Line delay={0}>Seu assento</Line>
          <Line delay={0.12}>está esperando.</Line>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.19, 1, 0.22, 1] }}
          className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-md text-poeira/85">
            Escolha o destino, deixe seu nome e a Órbita guarda um lugar perto da janela. Tem saída toda semana, da Terra até Saturno.
          </p>
          <Magnetic>
            <Button size="lg" variant="light" onClick={onBook} className="h-16 px-9 text-base">
              <RollText>Reservar assento</RollText>
            </Button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  )
}

const DESTINOS = ['Lua', 'Marte', 'Júpiter', 'Saturno'] as const

export function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [destino, setDestino] = useState<(typeof DESTINOS)[number]>('Marte')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ nome?: string; email?: string }>({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => setDone(false), 300)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!nome.trim()) next.nome = 'Escreva seu nome para a lista de passageiros.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Use um e-mail completo, como voce@exemplo.com.'
    setErrors(next)
    const first = next.nome ? 'nome' : next.email ? 'email' : null
    if (first) document.getElementById(first)?.focus()
    else setDone(true)
  }

  const field = 'mt-2 h-12 w-full rounded-xl border border-vacuo/20 bg-white px-4 text-[1rem] text-vacuo outline-none transition-[border-color,box-shadow] focus:border-vacuo focus:shadow-[0_0_0_3px_rgba(255,90,31,0.35)] aria-[invalid=true]:border-[#a8301a]'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {done ? (
          <div className="py-4">
            <svg viewBox="0 0 64 64" className="mb-6 size-16" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="#ff5a1f" />
              <path d="M19 33l9 9 17-19" fill="none" stroke="#10104a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <DialogTitle>Assento reservado para {destino}</DialogTitle>
            <DialogDescription className="mt-3">
              Boa viagem, {nome.trim().split(' ')[0]}. A Órbita é uma agência de mentira, criada para esta demonstração: nenhum dado saiu do seu navegador.
            </DialogDescription>
            <Button className="mt-8" variant="default" onClick={() => onOpenChange(false)}>
              <RollText>Voltar ao site</RollText>
            </Button>
          </div>
        ) : (
          <>
            <div className="pr-10">
              <DialogTitle>Reservar assento</DialogTitle>
              <DialogDescription className="mt-2">Escolha o destino. A gente guarda um lugar perto da janela.</DialogDescription>
            </div>
            <form onSubmit={submit} noValidate className="grid gap-5">
              <fieldset>
                <legend className="text-sm font-medium">Destino</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DESTINOS.map((d) => (
                    <label key={d} className={cn('relative rounded-full border px-4 py-2 font-display text-sm transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foguete', destino === d ? 'border-vacuo bg-vacuo text-poeira' : 'border-vacuo/25 hover:border-vacuo')}>
                      <input type="radio" name="destino" value={d} checked={destino === d} onChange={() => setDestino(d)} className="sr-only" />
                      {d}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="nome" className="text-sm font-medium">Nome</label>
                <input id="nome" name="nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} aria-invalid={!!errors.nome} aria-describedby={errors.nome ? 'nome-erro' : undefined} className={field} />
                {errors.nome && <p id="nome-erro" aria-live="polite" className="mt-1.5 text-sm text-[#a8301a]">{errors.nome}</p>}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                <input id="email" name="email" spellCheck={false} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-erro' : undefined} className={field} />
                {errors.email && <p id="email-erro" aria-live="polite" className="mt-1.5 text-sm text-[#a8301a]">{errors.email}</p>}
              </div>
              <Button type="submit" size="lg" className="mt-1 w-full sm:w-auto sm:justify-self-start">
                <RollText>{`Reservar assento para ${destino}`}</RollText>
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
