import type { Equipo, Partido, Resultado } from './datos'

/** Uruguay usa UTC−3 todo el año. Las fechas de la fuente vienen en hora local. */
export const aFecha = (fechaLocal: string) => new Date(`${fechaLocal.slice(0, 19)}-03:00`)

const zona = { timeZone: 'America/Montevideo' } as const

const fmtDia = new Intl.DateTimeFormat('es-UY', { ...zona, weekday: 'long' })
const fmtDiaCorto = new Intl.DateTimeFormat('es-UY', { ...zona, weekday: 'short' })
const fmtMesCorto = new Intl.DateTimeFormat('es-UY', { ...zona, month: 'short' })
const fmtNumDia = new Intl.DateTimeFormat('es-UY', { ...zona, day: '2-digit' })
const fmtDiaMes = new Intl.DateTimeFormat('es-UY', { ...zona, day: '2-digit', month: '2-digit' })
const fmtHora = new Intl.DateTimeFormat('es-UY', { ...zona, hour: '2-digit', minute: '2-digit', hour12: false })
const fmtActualizado = new Intl.DateTimeFormat('es-UY', {
  ...zona,
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sinPunto = (s: string) => s.replace('.', '')

/** "Sábado 07/11, 15:30 h" */
export const fechaLarga = (p: Partido) => {
  const d = aFecha(p.fecha)
  return `${capital(fmtDia.format(d))} ${fmtDiaMes.format(d)}, ${fmtHora.format(d)} h`
}
/** "07/11" */
export const fechaCorta = (p: Partido) => fmtDiaMes.format(aFecha(p.fecha))
/** Partes para el "taco" de calendario: SÁB · 07 · NOV */
export const fechaTaco = (p: Partido) => {
  const d = aFecha(p.fecha)
  return {
    dia: sinPunto(fmtDiaCorto.format(d)).toUpperCase(),
    num: fmtNumDia.format(d),
    mes: sinPunto(fmtMesCorto.format(d)).toUpperCase(),
    hora: fmtHora.format(d),
  }
}
/** "9 de noviembre, 11:14" */
export const fechaActualizado = (iso: string) => fmtActualizado.format(new Date(iso))

export const TEXTO_RESULTADO: Record<Resultado, string> = {
  V: 'Victoria',
  E: 'Empate',
  D: 'Derrota',
}

export const rival = (p: Partido): Equipo => (p.somosLocal ? p.visitante : p.local)

export const enlaceMapa = (cancha: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cancha}, Montevideo, Uruguay`)}`

export const ESCUDO_PROPIO = '/img/escudo.png'

/** Imagen optimizada a través de Netlify Image CDN. */
export const imagen = (src: string, ancho: number) =>
  `/.netlify/images?url=${encodeURIComponent(src)}&w=${ancho}&fm=webp&q=75`

export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter((p) => /^\p{Lu}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
