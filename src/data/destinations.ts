// Dados reais aproximados. Tempos de viagem tomam como base missões que fizeram o trajeto:
// Apollo (Lua), Perseverance (Marte), Juno (Júpiter) e Cassini (Saturno).

export type PlanetType = 0 | 1 | 2 | 3 | 4

export interface Stop {
  id: string
  name: string
  type: PlanetType
  /** distância média da Terra, em km */
  distanceKm: number
  title: string
  body: string
  stats: { label: string; value: string }[]
  /** escala do planeta na tela */
  scale: number
}

export const STOPS: Stop[] = [
  {
    id: 'terra',
    name: 'Terra',
    type: 0,
    distanceKm: 0,
    title: 'Órbita',
    body: 'Viagens da Terra até Saturno, com saída garantida e volta também.',
    stats: [],
    scale: 1,
  },
  {
    id: 'lua',
    name: 'Lua',
    type: 1,
    distanceKm: 384_400,
    title: 'Um fim de semana a 384 mil km',
    body: 'Três dias de viagem, o mesmo trajeto da Apollo. Lá você pesa um sexto do que pesa aqui, então cada passo vira um salto.',
    stats: [
      { label: 'Viagem', value: '3 dias' },
      { label: 'Gravidade', value: '16,5%' },
      { label: 'Um dia lunar', value: '29,5 dias' },
    ],
    scale: 0.78,
  },
  {
    id: 'marte',
    name: 'Marte',
    type: 2,
    distanceKm: 225_000_000,
    title: 'Em Marte, o pôr do sol é azul',
    body: 'Sete meses até o planeta vermelho. No fim da tarde, a poeira fina espalha a luz e o céu em volta do Sol fica azul. Para quem gosta de trilha, o Monte Olimpo tem 22 km de altura, duas vezes e meia o Everest.',
    stats: [
      { label: 'Viagem', value: '7 meses' },
      { label: 'Gravidade', value: '38%' },
      { label: 'Um dia', value: '24 h 37 min' },
    ],
    scale: 0.9,
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    type: 3,
    distanceKm: 778_000_000,
    title: 'Júpiter não tem chão, tem vista',
    body: 'Cinco anos até o maior planeta do Sistema Solar. Não dá para pousar, então a estadia é em órbita, de frente para a Grande Mancha Vermelha: uma tempestade maior que a Terra inteira.',
    stats: [
      { label: 'Viagem', value: '5 anos' },
      { label: 'Gravidade', value: '2,5×' },
      { label: 'Um dia', value: '9 h 56 min' },
    ],
    scale: 1.18,
  },
  {
    id: 'saturno',
    name: 'Saturno',
    type: 4,
    distanceKm: 1_430_000_000,
    title: 'Saturno e seus anéis de 280 mil km',
    body: 'Sete anos até os anéis mais famosos do céu. De ponta a ponta eles passam de 280 mil km, mas a maior parte tem só uns 10 metros de espessura.',
    stats: [
      { label: 'Viagem', value: '7 anos' },
      { label: 'Gravidade', value: '107%' },
      { label: 'Um dia', value: '10 h 33 min' },
    ],
    scale: 0.82,
  },
]

const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
export const formatKm = (km: number) => `${fmt.format(Math.round(km))} km`
