import { motion, useReducedMotion } from 'motion/react'
import { STOPS } from '@/data/destinations'
import type { Reservation } from '@/lib/reservation'

const PLANET_COLORS: Record<string, [string, string]> = {
  Lua: ['#c9c5de', '#8f8aae'],
  Marte: ['#e8743b', '#b8391f'],
  Júpiter: ['#f2d9a6', '#c9804f'],
  Saturno: ['#f4c977', '#e2ab5c'],
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** barras de largura variável, sempre as mesmas para o mesmo código */
function bars(code: string) {
  let h = hash(code)
  const out: { x: number; w: number }[] = []
  let x = 0
  while (x < 200) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
    const w = 1 + (h % 4)
    const gap = 1 + ((h >>> 8) % 3)
    if (x + w > 200) break
    out.push({ x, w })
    x += w + gap
  }
  return out
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })

export function BoardingPass({ r }: { r: Reservation }) {
  const reduce = useReducedMotion()
  const stop = STOPS.find((s) => s.name === r.destino)
  const viagem = stop?.stats.find((s) => s.label === 'Viagem')?.value ?? ''
  const saida = new Date(r.criadoEm)
  saida.setDate(saida.getDate() + 7)
  const h = hash(r.codigo)
  const embarque = `${String(5 + (h % 4)).padStart(2, '0')}:${String((h >>> 4) % 6)}${(h >>> 8) % 2 ? '5' : '0'}`
  const plataforma = 1 + ((h >>> 12) % 6)
  const [c1, c2] = PLANET_COLORS[r.destino] ?? PLANET_COLORS.Marte
  const janela = r.assento.endsWith('A') || r.assento.endsWith('F')

  const Field = ({ label, value, big = false }: { label: string; value: string; big?: boolean }) => (
    <div className="min-w-0">
      <dt className="text-[0.72rem] text-vacuo/60">{label}</dt>
      <dd className={big ? 'font-display text-[1.6rem] leading-none font-bold tracking-tight' : 'mt-0.5 truncate font-display text-[0.95rem] font-semibold'}>{value}</dd>
    </div>
  )

  return (
    <motion.article
      aria-label={`Cartão de embarque para ${r.destino}, assento ${r.assento}`}
      initial={reduce ? false : { y: 60, rotate: -4, opacity: 0 }}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 16 }}
      className="relative overflow-hidden rounded-[20px] bg-white text-vacuo shadow-[0_18px_40px_-18px_rgba(16,16,74,0.6)] sm:grid sm:grid-cols-[1fr_auto_auto]"
    >
      {/* parte principal */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-sm font-bold" translate="no">
            <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
              <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#ffc94a" strokeWidth="2.5" transform="rotate(-20 16 16)" />
              <circle cx="16" cy="16" r="7" fill="#ff5a1f" />
            </svg>
            órbita
          </p>
          <p className="text-[0.72rem] text-vacuo/60">Cartão de embarque</p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div>
            <p className="text-[0.72rem] text-vacuo/60">De</p>
            <p className="font-display text-[1.7rem] leading-none font-extrabold tracking-[-0.04em]">Terra</p>
          </div>
          <div className="relative mx-1 h-6 flex-1" aria-hidden="true">
            <svg viewBox="0 0 120 24" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M2 20 Q60 -8 118 20" fill="none" stroke="#10104a" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="3 4" />
            </svg>
            <motion.svg
              viewBox="-10 -8 20 16"
              className="absolute top-0 left-0 size-5"
              initial={reduce ? false : { left: '0%', top: '60%' }}
              animate={{ left: ['0%', '45%', '90%'], top: ['60%', '-10%', '60%'] }}
              transition={{ duration: 1.6, delay: 0.35, ease: [0.65, 0.05, 0, 1] }}
            >
              <path d="M-8 -3h10l5 3-5 3h-10z" fill="#ff5a1f" />
            </motion.svg>
          </div>
          <div className="text-right">
            <p className="text-[0.72rem] text-vacuo/60">Para</p>
            <p className="flex items-center justify-end gap-2 font-display text-[1.7rem] leading-none font-extrabold tracking-[-0.04em]">
              <svg viewBox="0 0 20 20" className="size-5 shrink-0" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill={c1} />
                <path d="M1 10a9 9 0 0 0 18 0" fill={c2} />
              </svg>
              {r.destino}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-[auto_auto_auto] sm:justify-between sm:gap-x-6">
          <div className="col-span-2 sm:col-span-3">
            <Field label="Passageiro" value={r.nome} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field label="Saída" value={`${dateFmt.format(saida)}, ${embarque}`} />
          </div>
          <Field label="Plataforma" value={String(plataforma)} />
          <Field label="Viagem" value={viagem} />
        </dl>
      </div>

      {/* picote */}
      <div aria-hidden="true" className="relative mx-5 border-t-2 border-dashed border-vacuo/20 sm:mx-0 sm:my-5 sm:border-t-0 sm:border-l-2">
        <span className="absolute -top-[11px] -left-[31px] size-5 rounded-full bg-poeira sm:-top-[31px] sm:-left-[11px]" />
        <span className="absolute -top-[11px] -right-[31px] size-5 rounded-full bg-poeira sm:top-auto sm:-bottom-[31px] sm:-left-[11px]" />
      </div>

      {/* canhoto */}
      <div className="flex items-end justify-between gap-5 p-5 sm:w-44 sm:flex-col sm:items-start sm:p-6">
        <dl className="grid gap-3">
          <div>
            <dt className="text-[0.72rem] text-vacuo/60">Assento</dt>
            <dd className="font-display text-[2.2rem] leading-none font-extrabold tracking-[-0.04em] text-foguete">{r.assento}</dd>
            {janela && <dd className="mt-1 text-[0.78rem] text-vacuo/70">na janela</dd>}
          </div>
          <div>
            <dt className="text-[0.72rem] text-vacuo/60">Código</dt>
            <dd className="font-display text-[0.95rem] font-semibold tracking-[0.12em]" translate="no">{r.codigo}</dd>
          </div>
        </dl>
        <svg viewBox="0 0 200 60" className="h-12 w-32 sm:w-full" aria-hidden="true" preserveAspectRatio="none">
          {bars(r.codigo).map((b, i) => (
            <motion.rect
              key={i}
              x={b.x}
              y={0}
              width={b.w}
              height={60}
              fill="#10104a"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'bottom', transformBox: 'fill-box' }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.012, ease: [0.19, 1, 0.22, 1] }}
            />
          ))}
        </svg>
      </div>
    </motion.article>
  )
}
