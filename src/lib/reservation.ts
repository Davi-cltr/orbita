// A reserva fica só no navegador de quem reservou (localStorage).
// Guardamos o mínimo: nome, destino, assento, código e data. O e-mail não é salvo.

export type Destino = 'Lua' | 'Marte' | 'Júpiter' | 'Saturno'

export interface Reservation {
  nome: string
  destino: Destino
  assento: string
  codigo: string
  criadoEm: string
}

const KEY = 'orbita:reserva'

export function loadReservation(): Reservation | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const r = JSON.parse(raw) as Reservation
    return r && r.nome && r.destino && r.assento && r.codigo ? r : null
  } catch {
    return null
  }
}

export function saveReservation(r: Reservation) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(r))
  } catch {
    // sem armazenamento (aba anônima, bloqueio): a reserva vale só até fechar a página
  }
}

export function clearReservation() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* nada a limpar */
  }
}

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function createReservation(nome: string, destino: Destino): Reservation {
  const fila = 1 + Math.floor(Math.random() * 32)
  const lado = Math.random() < 0.5 ? 'A' : 'F' // sempre na janela
  const codigo = Array.from({ length: 6 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join('')
  return { nome: nome.trim(), destino, assento: `${fila}${lado}`, codigo, criadoEm: new Date().toISOString() }
}
