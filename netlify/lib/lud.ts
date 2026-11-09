/**
 * Obtención y normalización de los datos de Colegio San Isidro desde la API
 * que usa lud-stats.vercel.app (sitio no oficial de estadísticas de la LUD).
 *
 * Se usa desde las Netlify Functions (`netlify/functions/*`) y desde
 * `scripts/actualizar-data-json.ts` para regenerar `data.json`.
 */
import type {
  Categoria,
  ClaveCategoria,
  Datos,
  Equipo,
  FilaTabla,
  Jugador,
  JugadorFicha,
  Partido,
  Resultado,
} from '../../src/lib/datos.ts'

export const API_BASE = 'https://lud-backend-ld7d.onrender.com/api'
export const EQUIPO_ID = 39 // "COLEGIO SAN ISIDRO" en lud-stats
export const EQUIPO_NOMBRE_API = 'COLEGIO SAN ISIDRO'

/** Categorías que muestra la web (nombre tal cual lo usa la API). */
export const CATEGORIAS: { clave: ClaveCategoria; nombre: string }[] = [
  { clave: 'sub20', nombre: 'Sub 20' },
  { clave: 'mayores', nombre: 'Mayores' },
]

// ---------------------------------------------------------------------------
// Tipos mínimos de la API (solo los campos que usamos)
// ---------------------------------------------------------------------------
interface ApiEquipo {
  id: number
  name: string
  logo_url: string | null
}
interface ApiPartido {
  id: number
  date: string
  status: string
  round: { name: string } | null
  phase: {
    id: number
    name: string
    tournament_name: string
    category_name?: string
    season_year: number
  }
  home_team: ApiEquipo
  away_team: ApiEquipo
  home_score: number | null
  away_score: number | null
  venue: { name: string } | null
}
interface ApiFila {
  team: ApiEquipo
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  points_carried?: number | null
  total_points?: number | null
  form?: string[] | null
}
interface ApiTabla {
  standings: ApiFila[]
}
interface ApiPlantelFase {
  phase_id: number
  category: string
  season_year: number
  players: {
    id: number
    name: string
    matches: number
    minutes: number
    goals: number
    starts: number
  }[]
}
interface ApiFixtureFinde {
  categories: Record<
    string,
    {
      local: string
      visitante: string
      cancha: string | null
      serie: string | null
      match_id: number | null
      datetime_iso: string | null
    }[]
  >
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
async function pedir<T>(ruta: string, timeoutMs: number): Promise<T> {
  const res = await fetch(`${API_BASE}${ruta}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`${ruta} respondió ${res.status}`)
  return (await res.json()) as T
}

const MINUSCULAS = new Set(['y', 'e', 'de', 'del'])

/** "COLEGIO SAN ISIDRO" → "Colegio San Isidro", respetando siglas (DFC, XXIII, H3O). */
export function nombrePropio(texto: string): string {
  return texto
    .trim()
    .split(/\s+/)
    .map((palabra, i) => {
      const limpia = palabra.replace(/[^\p{L}\d]/gu, '')
      if (!limpia) return palabra
      if (i > 0 && MINUSCULAS.has(palabra.toLocaleLowerCase('es'))) return palabra.toLocaleLowerCase('es')
      if (/\d/.test(limpia)) return palabra.toUpperCase()
      if (limpia.length > 1 && /^X{0,3}(IX|IV|V?I{0,3})$/i.test(limpia)) return palabra.toUpperCase()
      if (!/[AEIOUÁÉÍÓÚaeiouáéíóú]/.test(limpia)) return palabra.toUpperCase()
      if (/\.\p{L}/u.test(palabra)) return palabra.toUpperCase() // J.M.L.M
      const lower = palabra.toLocaleLowerCase('es')
      return lower.replace(/\p{L}/u, (c) => c.toLocaleUpperCase('es'))
    })
    .join(' ')
}

const esFechaLibre = (p: ApiPartido) =>
  /FECHA LIBRE/i.test(p.home_team.name) ||
  /FECHA LIBRE/i.test(p.away_team.name) ||
  /NO SE JUEGA/i.test(p.venue?.name ?? '')

function equipo(e: ApiEquipo): Equipo {
  return { id: e.id, nombre: nombrePropio(e.name), escudo: e.logo_url }
}

function resultadoDe(nuestros: number, rival: number): Resultado {
  if (nuestros > rival) return 'V'
  if (nuestros < rival) return 'D'
  return 'E'
}

function normalizarPartido(p: ApiPartido): Partido {
  const somosLocal = p.home_team.id === EQUIPO_ID
  const jugado =
    p.status === 'finished' && p.home_score !== null && p.away_score !== null
  return {
    id: p.id,
    fecha: p.date.slice(0, 19),
    estado: jugado ? 'jugado' : 'programado',
    fase: p.phase.name,
    ronda: p.round?.name ?? '',
    local: equipo(p.home_team),
    visitante: equipo(p.away_team),
    golesLocal: jugado ? p.home_score : null,
    golesVisitante: jugado ? p.away_score : null,
    cancha: p.venue?.name ? nombrePropio(p.venue.name) : null,
    somosLocal,
    resultado: jugado
      ? somosLocal
        ? resultadoDe(p.home_score!, p.away_score!)
        : resultadoDe(p.away_score!, p.home_score!)
      : null,
  }
}

function normalizarTabla(t: ApiTabla): FilaTabla[] {
  return t.standings.map((f, i) => {
    const arrastre = f.points_carried ?? 0
    return {
      posicion: i + 1,
      equipo: equipo(f.team),
      pj: f.played,
      pg: f.won,
      pe: f.drawn,
      pp: f.lost,
      gf: f.goals_for,
      gc: f.goals_against,
      dg: f.goal_difference,
      puntos: f.points,
      arrastre,
      total: f.total_points ?? f.points + arrastre,
      forma: f.form ?? [],
      esNuestro: f.team.id === EQUIPO_ID,
    }
  })
}

function normalizarPlantel(fases: ApiPlantelFase[]): Jugador[] {
  const porId = new Map<number, Jugador>()
  for (const fase of fases) {
    for (const j of fase.players) {
      const previo = porId.get(j.id) ?? {
        id: j.id,
        nombre: nombrePropio(j.name),
        partidos: 0,
        titular: 0,
        goles: 0,
        minutos: 0,
      }
      previo.partidos += j.matches
      previo.titular += j.starts
      previo.goles += j.goals
      previo.minutos += j.minutes
      porId.set(j.id, previo)
    }
  }
  return [...porId.values()].sort(
    (a, b) => b.partidos - a.partidos || b.minutos - a.minutos,
  )
}

// ---------------------------------------------------------------------------
// Armado completo
// ---------------------------------------------------------------------------

/**
 * Descarga todo de la API y lo devuelve normalizado.
 * `previos` (los últimos datos guardados) se usa para conservar canchas que
 * solo aparecen en el fixture de fin de semana y luego la API deja en blanco.
 * Lanza un error si la fuente no responde o cambió de formato.
 */
export async function obtenerDatosLud(
  opciones: { timeoutMs?: number; previos?: Datos | null } = {},
): Promise<Datos> {
  const timeoutMs = opciones.timeoutMs ?? 25_000
  const previos = opciones.previos ?? null
  const avisos: string[] = []

  const [crudos, plantelCrudo, finde] = await Promise.all([
    pedir<ApiPartido[]>(`/teams/${EQUIPO_ID}/matches/`, timeoutMs),
    pedir<ApiPlantelFase[]>(`/teams/${EQUIPO_ID}/season-players/`, timeoutMs).catch(
      () => { avisos.push('No se pudo actualizar el plantel'); return [] as ApiPlantelFase[] },
    ),
    pedir<ApiFixtureFinde>('/weekend-fixture/', timeoutMs).catch(() => { avisos.push('No se pudo actualizar el fixture de fin de semana'); return null }),
  ])

  if (!Array.isArray(crudos) || crudos.length === 0 || !crudos[0]?.phase) {
    throw new Error('Formato inesperado en /teams/:id/matches/')
  }

  const canchasPrevias = new Map<string, string>()
  for (const c of previos?.categorias ?? [])
    for (const p of c.partidos) if (p.cancha) canchasPrevias.set(String(p.id), p.cancha)

  const categorias: Categoria[] = []

  for (const cat of CATEGORIAS) {
    const propios = crudos.filter(
      (p) =>
        (p.phase.category_name ?? p.phase.tournament_name).startsWith(cat.nombre) &&
        !esFechaLibre(p),
    )
    if (propios.length === 0) {
      avisos.push(`Sin información nueva para ${cat.nombre}`)
      const anterior = previos?.categorias.find((c) => c.clave === cat.clave)
      if (anterior) categorias.push(anterior)
      continue
    }

    const temporada = Math.max(...propios.map((p) => p.phase.season_year))
    const deTemporada = propios
      .filter((p) => p.phase.season_year === temporada)
      .sort((a, b) => a.date.localeCompare(b.date))

    const ultimo = deTemporada[deTemporada.length - 1]
    const divisional = ultimo.phase.tournament_name.replace(cat.nombre, '').trim()

    const partidos = deTemporada.map(normalizarPartido)
    for (const p of partidos) if (!p.cancha) p.cancha = canchasPrevias.get(String(p.id)) ?? null

    // Fixture de fin de semana: agrega cancha/hora y partidos aún no cargados.
    const delFinde = (finde?.categories?.[cat.nombre] ?? []).filter(
      (f) => f.local === EQUIPO_NOMBRE_API || f.visitante === EQUIPO_NOMBRE_API,
    )
    for (const f of delFinde) {
      const existente = partidos.find((p) => String(p.id) === String(f.match_id))
      if (existente) {
        if (!existente.cancha && f.cancha) existente.cancha = nombrePropio(f.cancha)
        if (existente.estado === 'programado' && f.datetime_iso)
          existente.fecha = f.datetime_iso.slice(0, 19)
        continue
      }
      if (!f.datetime_iso) continue
      const somosLocal = f.local === EQUIPO_NOMBRE_API
      const rivalNombre = somosLocal ? f.visitante : f.local
      const rival =
        partidos
          .flatMap((p) => [p.local, p.visitante])
          .find((e) => e.nombre === nombrePropio(rivalNombre)) ??
        ({ id: null, nombre: nombrePropio(rivalNombre), escudo: null } as Equipo)
      const nosotros = equipo({
        id: EQUIPO_ID,
        name: EQUIPO_NOMBRE_API,
        logo_url: crudos[0].home_team.id === EQUIPO_ID ? crudos[0].home_team.logo_url : null,
      })
      partidos.push({
        id: f.match_id ?? `finde-${f.datetime_iso}`,
        fecha: f.datetime_iso.slice(0, 19),
        estado: 'programado',
        fase: ultimo.phase.name,
        ronda: '',
        local: somosLocal ? nosotros : rival,
        visitante: somosLocal ? rival : nosotros,
        golesLocal: null,
        golesVisitante: null,
        cancha: f.cancha ? nombrePropio(f.cancha) : null,
        somosLocal,
        resultado: null,
      })
    }
    partidos.sort((a, b) => a.fecha.localeCompare(b.fecha))

    const fases = [...new Map(deTemporada.map((p) => [p.phase.id, p.phase])).values()]
    const tablas = (await Promise.all(fases.map(async (fase) => {
      try {
        const t = await pedir<ApiTabla>(`/standings/by-phase/${fase.id}/`, timeoutMs)
        if (!Array.isArray(t.standings)) throw new Error('Tabla inválida')
        return { fase: fase.name, filas: normalizarTabla(t) }
      } catch {
        avisos.push(`No se pudo actualizar la tabla ${cat.nombre}: ${fase.name}`)
        const anterior = previos?.categorias.find((c) => c.clave === cat.clave)
        return anterior?.tablas?.find((t) => t.fase === fase.name) ??
          (anterior?.tabla?.fase === fase.name ? anterior.tabla : null)
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null)
    const tabla = tablas.find((t) => t.fase === ultimo.phase.name) ?? null

    // Hasta cuatro consultas simultáneas para no saturar la fuente.
    const jugados = partidos.filter((p) => p.estado === 'jugado')
    for (let i = 0; i < jugados.length; i += 4) {
      await Promise.all(jugados.slice(i, i + 4).map(async (p) => {
        try {
          const ficha = await obtenerDetalle(p.id, Math.min(timeoutMs, 12_000))
          p.detalle = ficha
          p.cancha = ficha.cancha ?? p.cancha
        } catch {
          avisos.push(`No se pudo actualizar la ficha ${p.id}`)
          p.detalle = previos?.categorias.flatMap((c) => c.partidos)
            .find((v) => String(v.id) === String(p.id))?.detalle ?? null
        }
      }))
    }

    const fasesTemporada = new Set(deTemporada.map((p) => p.phase.id))
    const plantel = normalizarPlantel(
      plantelCrudo.filter((f) => fasesTemporada.has(f.phase_id)),
    )

    // Se usa el dorsal de la última planilla disponible, nunca el índice de la lista.
    for (const jugador of plantel) {
      const dorsal = [...partidos].reverse()
        .flatMap((p) => [...(p.detalle?.alineaciones?.local ?? []), ...(p.detalle?.alineaciones?.visitante ?? [])])
        .find((j) => j.id === jugador.id && j.numero !== null)
      jugador.numero = dorsal?.numero ?? null
    }

    categorias.push({
      clave: cat.clave,
      nombre: cat.nombre,
      divisional,
      temporada,
      faseActual: ultimo.phase.name,
      partidos,
      tabla,
      tablas,
      plantel:
        plantel.length > 0
          ? plantel
          : (previos?.categorias.find((c) => c.clave === cat.clave)?.plantel ?? []),
    })
  }

  if (categorias.length === 0) throw new Error('No se encontraron partidos del equipo')

  const escudo =
    crudos.find((p) => p.home_team.id === EQUIPO_ID)?.home_team.logo_url ??
    crudos.find((p) => p.away_team.id === EQUIPO_ID)?.away_team.logo_url ??
    null

  return {
    actualizado: new Date().toISOString(),
    fuente: 'lud-stats',
    avisos,
    equipo: { id: EQUIPO_ID, nombre: 'Colegio San Isidro', escudo },
    categorias,
  }
}

interface ApiEvento {
  event_type: string
  minute: number | null
  team: number | null
  detail?: {
    scorer?: { name: string }
    player?: { name: string }
    player_in?: { name: string }
    player_out?: { name: string }
  }
}

interface ApiLinea {
  player: { id: number; name: string }
  number: number | null
  is_starter?: boolean
  is_goalkeeper?: boolean
  is_captain?: boolean
}

const linea = (l: ApiLinea[] | null | undefined): JugadorFicha[] =>
  (Array.isArray(l) ? l : [])
    .map((j) => ({
      id: j.player.id,
      nombre: nombrePropio(j.player.name),
      numero: j.number ?? null,
      titular: j.is_starter !== false,
      capitan: !!j.is_captain,
      arquero: !!j.is_goalkeeper,
    }))
    // Arquero primero entre los titulares, como en una planilla.
    .sort((a, b) => Number(b.titular) - Number(a.titular) || Number(b.arquero) - Number(a.arquero))

export async function obtenerDetalle(id: number | string, timeoutMs = 20_000) {
  const [eventos, partido] = await Promise.all([
    pedir<ApiEvento[]>(`/matches/${id}/events/`, timeoutMs),
    pedir<{ home_team: ApiEquipo; venue: { name: string } | null;
      home_lineup: ApiLinea[] | null
      away_lineup: ApiLinea[] | null
    }>(`/matches/${id}/`, timeoutMs),
  ])
  if (!Array.isArray(eventos)) throw new Error('Formato de eventos inesperado')
  const local = linea(partido.home_lineup)
  const visitante = linea(partido.away_lineup)
  return {
    actualizado: new Date().toISOString(),
    cancha: partido.venue?.name ? nombrePropio(partido.venue.name) : null,
    alineaciones: { local, visitante },
    eventos: [...eventos]
      .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999))
      .map((e) => ({
        tipo: e.event_type,
        minuto: e.minute ?? null,
        equipo: e.team ?? null,
        jugador: e.detail?.scorer?.name ?? e.detail?.player?.name ?? null,
        entra: e.detail?.player_in?.name ?? null,
        sale: e.detail?.player_out?.name ?? null,
      })),
  }
}
