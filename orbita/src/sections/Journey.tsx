import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { STOPS, formatKm } from '@/data/destinations'
import type { PlanetScene, PlanetSlot } from '@/three/PlanetScene'
import { getLenis, scrollToTarget } from '@/lib/lenis'
import { Button } from '@/components/ui/button'
import { RollText } from '@/components/RollText'
import { clamp, easeInOut, easeOut, lerp, prefersReducedMotion, range } from '@/lib/utils'

const N = STOPS.length
/** altura de rolagem de cada passagem, em telas */
const SEG = 1.25

// Cada passagem vai de 0 a 1: o texto sai até .28, os planetas trocam em [.28, .7]
// e o texto novo entra em etapas a partir de .64. Os dois textos nunca aparecem juntos.
const OUT_END = 0.16
const IN_START = 0.64

function layout(k: number, aspect: number) {
  const stop = STOPS[k]
  if (aspect >= 1) {
    if (k === 0) return { x: 0, y: -0.02, scale: 1.02 }
    const s = stop.type === 4 ? 0.66 : stop.scale
    return { x: aspect * (stop.type === 3 ? 0.56 : 0.5), y: 0, scale: s }
  }
  if (k === 0) return { x: 0, y: 0.14, scale: Math.min(0.85, aspect * 1.0) }
  const s = stop.type === 4 ? Math.min(0.62, aspect * 0.62) : Math.min(stop.scale, aspect * 1.05)
  return { x: 0, y: 0.42, scale: s }
}

const logLerp = (a: number, b: number, t: number) =>
  Math.pow(10, lerp(Math.log10(a + 1), Math.log10(b + 1), t)) - 1

function Words({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word-mask">
            <span data-word={i}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

export function Journey({ onBook }: { onBook: () => void }) {
  const wrapRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelsRef = useRef<(HTMLDivElement | null)[]>([])
  const titleRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const counterNameRef = useRef<HTMLSpanElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const [active, setActive] = useState(0)
  const [webgl, setWebgl] = useState(true)

  // posição de rolagem (px) em que cada parada fica centrada
  const yFor = (k: number) => {
    const el = wrapRef.current
    if (!el) return 0
    const top = el.getBoundingClientRect().top + window.scrollY
    const max = el.offsetHeight - window.innerHeight
    return top + (k / (N - 1)) * max
  }
  const goTo = (k: number) => {
    const from = Math.round(currentP.current)
    scrollToTarget(yFor(k), Math.min(3.2, 1.2 + Math.abs(k - from) * 0.45))
  }
  const currentP = useRef(0)

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const reduced = prefersReducedMotion()
    let scene: PlanetScene | null = null
    let disposed = false
    import('@/three/PlanetScene')
      .then(({ PlanetScene }) => {
        if (disposed) return
        try {
          scene = new PlanetScene(canvas, reduced)
          resize()
        } catch {
          setWebgl(false)
        }
      })
      .catch(() => setWebgl(false))

    let mouse: { x: number; y: number } | null = null
    let inView = true
    let raf = 0
    let lastActive = -1
    const start = performance.now()

    const resize = () => scene?.resize(canvas.clientWidth, canvas.clientHeight)
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => (mouse = null)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const io = new IntersectionObserver(([en]) => (inView = en.isIntersecting), { rootMargin: '100px' })
    io.observe(wrap)

    const panels = panelsRef.current

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!inView) return
      const rect = wrap.getBoundingClientRect()
      const max = Math.max(1, rect.height - window.innerHeight)
      const p = clamp(-rect.top / max) * (N - 1)
      currentP.current = p
      const i = Math.min(Math.floor(p), N - 2)
      const t = p - i
      const intro = reduced ? 1 : easeOut(clamp((performance.now() - start - 250) / 1500))

      // --- textos das paradas
      panels.forEach((panel, k) => {
        if (!panel) return
        const parts = panel.querySelectorAll<HTMLElement>('[data-j]')
        const n = parts.length
        let vis = 0
        parts.forEach((el) => {
          const j = Number(el.dataset.j)
          let inJ: number, outJ: number
          if (reduced) {
            inJ = k === 0 || p >= k - 0.5 ? 1 : 0
            outJ = k < N - 1 && p > k + 0.5 ? 1 : 0
          } else {
            inJ = k === 0 ? 1 : easeOut(range(p - (k - 1), IN_START + j * 0.06, IN_START + j * 0.06 + 0.2))
            const o0 = (n - 1 - j) * 0.04
            outJ = k === N - 1 ? 0 : range(p - k, o0, o0 + OUT_END)
          }
          const op = inJ * (1 - outJ)
          vis = Math.max(vis, op)
          el.style.opacity = String(op)
          el.style.transform = `translate3d(0, ${(1 - inJ) * 26 - outJ * 16}px, 0)`
        })
        // palavras do título sobem de dentro da máscara
        if (k > 0) {
          panel.querySelectorAll<HTMLElement>('[data-word]').forEach((w) => {
            const wi = Number(w.dataset.word)
            const a = reduced ? (p >= k - 0.5 ? 1 : 0) : easeOut(range(p - (k - 1), IN_START + wi * 0.035, IN_START + wi * 0.035 + 0.22))
            w.style.transform = `translate3d(0, ${(1 - a) * 110}%, 0)`
          })
        }
        panel.style.visibility = vis > 0.001 ? 'visible' : 'hidden'
      })

      // título gigante da abertura (atrás do planeta)
      if (titleRef.current) {
        const out = reduced ? (p > 0.5 ? 1 : 0) : range(p, 0, 0.3)
        titleRef.current.style.opacity = String(1 - out)
        titleRef.current.style.transform = `translate3d(0, ${-out * 12}vh, 0) scale(${1 - out * 0.06})`
      }

      const nowActive = Math.round(p)
      if (nowActive !== lastActive) {
        lastActive = nowActive
        setActive(nowActive)
      }

      // --- planetas: o atual sobe como uma cortina, o próximo vem de baixo
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight)
      let e = easeInOut(range(t, 0.28, 0.66))
      let eb = easeInOut(range(t, 0.3, 0.72))
      if (reduced) e = eb = t >= 0.5 ? 1 : 0
      const la = layout(i, aspect)
      const lb = layout(i + 1, aspect)
      const a: PlanetSlot = {
        type: STOPS[i].type,
        visible: e < 1,
        x: lerp(la.x, lb.x, e * 0.35),
        y: la.y + e * 2.9 + (i === 0 ? (1 - intro) * -0.25 : 0),
        scale: la.scale * (1 - e * 0.18) * (i === 0 ? lerp(0.6, 1, intro) : 1),
      }
      const b: PlanetSlot = {
        type: STOPS[i + 1].type,
        visible: eb > 0,
        x: lerp(la.x, lb.x, 0.35 + eb * 0.65),
        y: lb.y - (1 - eb) * 2.8,
        scale: lb.scale * lerp(0.82, 1, eb),
      }
      const warp = reduced ? 0 : Math.sin(Math.PI * range(t, 0.2, 0.74)) * (t > 0 ? 1 : 0)

      scene?.render({
        a,
        b,
        warp,
        reveal: reduced ? 0.85 * (p < 0.5 ? 1 : 0) : (1 - range(p, 0.02, 0.22)) * intro,
        mouse,
        revealRadius: aspect >= 1 ? 120 : 80,
      })

      // --- contador de distância e régua
      const dt = reduced ? (t >= 0.5 ? 1 : 0) : range(t, 0.24, 0.7)
      const km = logLerp(STOPS[i].distanceKm, STOPS[i + 1].distanceKm, dt)
      if (counterRef.current) counterRef.current.textContent = formatKm(km)
      if (counterNameRef.current) {
        const moving = t > 0.2 && t < 0.8
        counterNameRef.current.textContent = moving ? `a caminho de ${STOPS[i + 1].name}` : `da Terra até ${STOPS[nowActive].name}`
      }
      if (markerRef.current) markerRef.current.style.left = `${(p / (N - 1)) * 100}%`
      if (railRef.current) {
        const show = range(p, 0.15, 0.6)
        railRef.current.style.opacity = String(show)
        railRef.current.style.transform = `translate3d(0, ${(1 - show) * 24}px, 0)`
        railRef.current.inert = show < 0.5
      }
      if (hintRef.current) hintRef.current.style.opacity = String((1 - range(p, 0, 0.12)) * clamp((performance.now() - start - 1600) / 600))
    }
    raf = requestAnimationFrame(frame)

    // --- encaixe: cada gesto de rolagem leva a uma parada inteira
    let snapTimer = 0
    let dir = 1
    let snapping = false
    const lenis = getLenis()
    const snap = () => {
      if (snapping || reduced) return
      const p = currentP.current
      if (p <= 0.001 || p >= N - 1.001) return
      const frac = p - Math.floor(p)
      if (frac < 0.008 || frac > 0.992) return
      const target = dir > 0 ? (frac > 0.1 ? Math.ceil(p) : Math.floor(p)) : frac < 0.9 ? Math.floor(p) : Math.ceil(p)
      snapping = true
      lenis?.scrollTo(yFor(target), {
        duration: 1.5 * Math.max(0.45, Math.abs(target - p)),
        easing: easeInOut,
        onComplete: () => (snapping = false),
      })
      window.setTimeout(() => (snapping = false), 2200)
    }
    const onScroll = (l: { direction: number }) => {
      if (l.direction) dir = l.direction
      window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(snap, 170)
    }
    lenis?.on('scroll', onScroll)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      lenis?.off('scroll', onScroll)
      window.clearTimeout(snapTimer)
      scene?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={wrapRef}
      id="destinos"
      aria-label="A viagem, da Terra até Saturno"
      style={{ height: `${100 + (N - 1) * SEG * 100}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* órbitas ao fundo */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          {[180, 260, 350, 450, 570, 700].map((r, i) => (
            <ellipse key={r} cx="500" cy="500" rx={r * 1.35} ry={r * 0.62} fill="none" stroke="#c3bde6" strokeWidth={i === 2 ? 1.4 : 0.8} strokeDasharray={i % 2 ? '2 7' : undefined} transform="rotate(-14 500 500)" />
          ))}
        </svg>

        {/* título gigante: fica ATRÁS do planeta */}
        <div ref={titleRef} className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center will-change-transform" aria-hidden="true">
          <div className="flex overflow-hidden pb-[0.06em] font-display text-[clamp(5rem,23vw,24rem)] leading-[0.82] font-[850] tracking-[-0.06em] text-saturno">
            {'órbita'.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.07, ease: [0.65, 0.05, 0, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full" aria-hidden="true" />
        {!webgl && (
          <p className="absolute inset-x-6 top-24 z-20 text-sm text-poeira-2">
            Seu navegador não liberou o WebGL, então os planetas em 3D não aparecem. O resto da viagem funciona normalmente.
          </p>
        )}

        {/* textos das paradas */}
        {STOPS.map((stop, k) => (
          <div
            key={stop.id}
            ref={(el) => {
              panelsRef.current[k] = el
            }}
            inert={active !== k}
            className={
              k === 0
                ? 'absolute inset-x-0 bottom-0 z-20 px-5 pb-8 sm:px-10 sm:pb-10'
                : 'absolute inset-x-0 bottom-0 z-20 px-5 pb-36 max-[999px]:bg-gradient-to-t max-[999px]:from-vacuo max-[999px]:via-vacuo/85 max-[999px]:to-transparent max-[999px]:pt-24 min-[1000px]:top-0 min-[1000px]:flex min-[1000px]:items-center min-[1000px]:px-10 min-[1000px]:pb-0'
            }
          >
            {k === 0 ? (
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.0, ease: [0.19, 1, 0.22, 1] }}
                  className="max-w-lg"
                >
                  <div data-j="0">
                    <h1 className="sr-only">Órbita: viagens para o Sistema Solar</h1>
                    <p className="font-display text-[clamp(1.15rem,2vw,1.5rem)] leading-snug font-medium text-balance">
                      {stop.body}
                    </p>
                  </div>
                  <div data-j="1" className="mt-6 flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => goTo(1)}>
                      <RollText>Escolher destino</RollText>
                    </Button>
                    <Button size="lg" variant="outline" onClick={onBook}>
                      <RollText>Reservar assento</RollText>
                    </Button>
                  </div>
                </motion.div>
                <p ref={hintRef} className="max-w-[16rem] text-sm text-poeira-2 opacity-0 md:text-right">
                  <span className="hidden [@media(hover:hover)]:inline">Passe o cursor sobre a Terra para ver o mapa térmico.</span>
                  <span className="[@media(hover:hover)]:hidden">Toque e arraste sobre a Terra para ver o mapa térmico.</span>
                </p>
              </div>
            ) : (
              <div className="max-w-[34rem]">
                <p data-j="0" className="mb-3 flex items-center gap-3 font-display text-sm text-saturno">
                  <span className="inline-block h-px w-8 bg-saturno" aria-hidden="true" />
                  Parada {k} de {N - 1}: {stop.name}
                </p>
                <h2 data-j="1" className="font-display text-[clamp(1.9rem,4.4vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
                  <Words text={stop.title} />
                </h2>
                <p data-j="2" className="mt-5 max-w-[30rem] text-[1.02rem] text-poeira/85 max-[999px]:text-[0.95rem]">
                  {stop.body}
                </p>
                <dl data-j="3" className="mt-7 grid grid-cols-3 gap-4 border-t border-poeira/20 pt-5 max-[999px]:mt-5 max-[999px]:pt-4">
                  {stop.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[0.78rem] text-poeira-2">{s.label}</dt>
                      <dd className="mt-1 font-display text-[clamp(1rem,1.8vw,1.35rem)] font-semibold tabular-nums">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        ))}

        {/* régua de distância */}
        <div ref={railRef} className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] opacity-0 sm:px-10 sm:pb-7">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <p className="font-display text-[clamp(0.95rem,2.4vw,1.6rem)] font-semibold whitespace-nowrap tabular-nums" aria-live="off">
              <span ref={counterRef}>0 km</span>
            </p>
            <p className="text-right text-[0.8rem] text-poeira-2">
              <span ref={counterNameRef}>da Terra</span>
            </p>
          </div>
          <div className="relative">
            <div className="absolute top-[7px] right-0 left-0 h-px bg-poeira/25" aria-hidden="true" />
            <div ref={markerRef} className="absolute top-0 size-[15px] -translate-x-1/2 rounded-full bg-foguete shadow-[0_0_0_5px_rgba(255,90,31,0.25)]" aria-hidden="true" />
            <ol className="relative flex justify-between">
              {STOPS.map((s, k) => (
                <li key={s.id} className={k === 0 ? 'text-left' : k === N - 1 ? 'text-right' : 'text-center'}>
                  <button
                    type="button"
                    onClick={() => goTo(k)}
                    aria-current={active === k ? 'step' : undefined}
                    className="roll-host -mx-2 flex flex-col items-center gap-2 px-2 pt-[3px] text-[0.78rem] text-poeira-2 transition-colors aria-[current=step]:text-poeira first:items-start last:items-end sm:text-sm"
                  >
                    <span className="size-[9px] rounded-full border border-poeira/60 bg-vacuo" aria-hidden="true" />
                    <RollText>{s.name}</RollText>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
