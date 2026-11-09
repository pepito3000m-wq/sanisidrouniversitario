/**
 * Formato de los datos del equipo.
 *
 * Es el mismo formato que devuelve la función `/api/datos` y el que tiene
 * el archivo `data.json` de la raíz (editable a mano como respaldo).
 */

export type ClaveCategoria = 'sub20' | 'mayores'

export interface Equipo {
  /** id del equipo en lud-stats (null si se cargó a mano) */
  id: number | null
  nombre: string
  /** URL del escudo (puede ser null) */
  escudo: string | null
}

export type Resultado = 'V' | 'E' | 'D'

export interface Partido {
  id: number | string
  /** Fecha y hora local de Montevideo, formato "2026-11-07T15:30:00" */
  fecha: string
  estado: 'jugado' | 'programado'
  /** Fase del torneo, ej. "Copa Plata" */
  fase: string
  /** Ronda, ej. "Fecha 7" */
  ronda: string
  local: Equipo
  visitante: Equipo
  golesLocal: number | null
  golesVisitante: number | null
  detalle?: DetallePartido | null
  cancha: string | null
  /** true si San Isidro juega de local */
  somosLocal: boolean
  /** Resultado desde el punto de vista de San Isidro (null si no se jugó) */
  resultado: Resultado | null
}

export interface FilaTabla {
  posicion: number
  equipo: Equipo
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: number
  /** Puntos de esta fase */
  puntos: number
  /** Puntos arrastrados de fases anteriores (0 si no aplica) */
  arrastre: number
  /** Puntos totales (puntos + arrastre) */
  total: number
  /** Últimos resultados: "W" | "D" | "L" */
  forma: string[]
  esNuestro: boolean
}

export interface Tabla {
  fase: string
  filas: FilaTabla[]
}

export interface EventoPartido {
  tipo: string
  minuto: number | null
  equipo: number | null
  jugador: string | null
  entra: string | null
  sale: string | null
}
export interface JugadorFicha {
  id: number
  nombre: string
  numero: number | null
  titular: boolean
  capitan: boolean
  arquero: boolean
}
export interface DetallePartido {
  /** Planillas de ambos equipos tal como las publica la fuente */
  alineaciones?: { local: JugadorFicha[]; visitante: JugadorFicha[] }
  cancha?: string | null
  actualizado: string
  eventos: EventoPartido[]
}

export interface Jugador {
  id?: number
  numero?: number | null
  foto?: string | null
  nombre: string
  partidos: number
  titular: number
  goles: number
  minutos: number
}

export interface Categoria {
  clave: ClaveCategoria
  /** "Sub 20" | "Mayores" */
  nombre: string
  /** "Divisional C" */
  divisional: string
  temporada: number
  /** Fase en curso (la última con partidos) */
  faseActual: string
  partidos: Partido[]
  tablas?: Tabla[]
  tabla: Tabla | null
  plantel: Jugador[]
}

export interface Datos {
  avisos?: string[]
  /** Fecha ISO (UTC) de la última actualización correcta */
  actualizado: string
  /** De dónde salieron los datos */
  fuente: 'lud-stats' | 'manual'
  equipo: Equipo
  categorias: Categoria[]
}

/** Lo que devuelve `/api/datos`: los datos más un estado de frescura. */
export interface RespuestaDatos extends Datos {
  /** true si la fuente falló y se muestran los últimos datos guardados */
  desactualizado: boolean
}
