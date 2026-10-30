// Adaptado do Magic UI (MIT). Acrescentei `speedRef`: a velocidade da rolagem
// acelera o letreiro via Web Animations API (playbackRate), sem reiniciar a animação.
import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  reverse?: boolean
  repeat?: number
  /** função que devolve o multiplicador de velocidade atual (1 = normal) */
  getSpeed?: () => number
}

export function Marquee({ className, reverse = false, children, repeat = 4, getSpeed, ...props }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!getSpeed || !ref.current) return
    let raf = 0
    let current = 1
    const tick = () => {
      const anims = ref.current?.getAnimations({ subtree: true }) ?? []
      const target = getSpeed()
      current += (target - current) * 0.12
      anims.forEach((a) => (a.playbackRate = current))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [getSpeed])

  return (
    <div
      ref={ref}
      {...props}
      className={cn('group flex flex-row gap-(--gap) overflow-hidden [--duration:40s] [--gap:2rem]', className)}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn('flex shrink-0 animate-marquee flex-row justify-around gap-(--gap)', reverse && '[animation-direction:reverse]')}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
