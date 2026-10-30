import { RollText } from '@/components/RollText'
import { scrollToTarget } from '@/lib/lenis'

export const REPO_URL = 'https://github.com/Davi-cltr/orbita'

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-poeira/15 px-5 pt-14 pb-8 sm:px-10">
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <p className="max-w-sm text-sm text-poeira-2">
          A Órbita é uma agência fictícia, criada como demonstração. Distâncias, tempos de viagem e gravidade são dados reais, arredondados.
        </p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <li>
            <button type="button" className="roll-host" onClick={() => scrollToTarget(0, 2.4)}>
              <RollText>Voltar para a Terra</RollText>
            </button>
          </li>
          <li>
            <a className="roll-host" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <RollText>Código no GitHub</RollText>
            </a>
          </li>
        </ul>
      </div>
      <p aria-hidden="true" className="group mt-16 flex justify-center font-display text-[clamp(4rem,24vw,22rem)] leading-[0.8] font-[850] tracking-[-0.06em] select-none">
        {'órbita'.split('').map((ch, i) => (
          <span
            key={i}
            className="inline-block text-vacuo-2 transition-[color,transform] duration-700 ease-(--ease-orbita) hover:-translate-y-[0.08em] hover:text-saturno"
          >
            {ch}
          </span>
        ))}
      </p>
    </footer>
  )
}
