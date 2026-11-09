import { useState } from 'react'
import { Goal, Users } from 'lucide-react'
import type { Categoria } from '@/lib/datos'
import type { Jugador } from '@/lib/datos'
import { imagen, iniciales } from '@/lib/formato'
import { Seccion, Vacio } from './Seccion'

const VISIBLES = 12

export function Plantel({ categoria }: { categoria: Categoria }) {
  const [todos, setTodos] = useState(false)
  const plantel = categoria.plantel
  const goleador = plantel.reduce<(typeof plantel)[number] | null>(
    (max, j) => (j.goles > (max?.goles ?? 0) ? j : max),
    null,
  )
  const golesEquipo = categoria.partidos.reduce(
    (t, p) => t + (p.estado === 'jugado' ? ((p.somosLocal ? p.golesLocal : p.golesVisitante) ?? 0) : 0),
    0,
  )
  const lista = todos ? plantel : plantel.slice(0, VISIBLES)

  return (
    <Seccion id="plantel" antetitulo={`${categoria.nombre} · Temporada ${categoria.temporada}`} titulo="Plantel y estadísticas" className="bg-white">
      {plantel.length === 0 ? (
        <Vacio>Sin información</Vacio>
      ) : (
        <>
          <dl className="mb-8 grid grid-cols-3 gap-3">
            <Dato icono={<Users className="size-5" />} titulo="Jugadores" valor={plantel.length} />
            <Dato icono={<Goal className="size-5" />} titulo="Goles" valor={golesEquipo} />
            <div className="col-span-3 rounded-2xl bg-azul p-4 text-white sm:col-span-1">
              <dt className="text-[0.65rem] font-bold tracking-widest text-amarillo uppercase">Goleador</dt>
              <dd className="mt-1 font-display text-2xl leading-tight font-bold uppercase">
                {goleador ? (
                  <>
                    {goleador.nombre} <span className="text-amarillo">· {goleador.goles}</span>
                  </>
                ) : (
                  'Sin información'
                )}
              </dd>
            </div>
          </dl>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((j) => (
              <li key={j.id ?? j.nombre} className="flex items-center gap-3 rounded-2xl bg-background p-3 ring-1 ring-border">
                <Avatar jugador={j} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{j.nombre}</p>
                  <dl className="mt-1 grid grid-cols-3 gap-1 text-center">
                    <Stat titulo="Goles" valor={j.goles} />
                    <Stat titulo="Minutos" valor={j.minutos} />
                    <Stat titulo="Partidos" valor={j.partidos} />
                  </dl>
                </div>
              </li>
            ))}
          </ul>
          {plantel.length > VISIBLES && (
            <button
              type="button"
              onClick={() => setTodos((v) => !v)}
              aria-expanded={todos}
              className="mt-6 w-full rounded-lg border-2 border-azul py-3 font-display text-lg font-bold tracking-[0.12em] text-azul uppercase hover:bg-azul hover:text-white sm:w-auto sm:px-8"
            >
              {todos ? 'Ver menos' : `Ver plantel completo (${plantel.length})`}
            </button>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Jugadores que sumaron minutos en {categoria.temporada}, según las planillas de la Liga publicadas en LUD Stats. Dorsal de la última planilla disponible; S/N indica que no hay número informado.
          </p>
        </>
      )}
    </Seccion>
  )
}

function Dato({ icono, titulo, valor }: { icono: React.ReactNode; titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl bg-azul-claro p-4 text-azul">
      <dt className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-widest uppercase">
        <span aria-hidden="true">{icono}</span>
        {titulo}
      </dt>
      <dd className="mt-1 font-display text-4xl font-extrabold">{valor}</dd>
    </div>
  )
}

/** Foto del jugador si existe; si no, avatar con dorsal e iniciales. */
function Avatar({ jugador: j }: { jugador: Jugador }) {
  const [error, setError] = useState(false)
  if (j.foto && !error) {
    return <img src={imagen(j.foto, 112)} alt="" width={56} height={56} loading="lazy" onError={() => setError(true)} className="size-14 shrink-0 rounded-full object-cover ring-2 ring-amarillo" />
  }
  return (
    <span aria-hidden="true" className="rayas relative inline-flex size-14 shrink-0 flex-col items-center justify-center rounded-full bg-azul leading-none text-white ring-2 ring-amarillo">
      <span className="font-display text-xl font-extrabold text-amarillo">{j.numero ?? 'S/N'}</span>
      <span className="mt-0.5 text-[0.65rem] font-bold tracking-wider">{iniciales(j.nombre)}</span>
    </span>
  )
}

function Stat({ titulo, valor }: { titulo: string; valor: number | null | undefined }) {
  return (
    <div className="rounded-md bg-white px-1 py-1 ring-1 ring-border">
      <dt className="text-[0.6rem] font-bold tracking-wider text-muted-foreground uppercase">{titulo}</dt>
      <dd className="font-display text-lg leading-none font-bold text-azul tabular-nums">{valor ?? <span className="text-[0.55rem] font-sans">Sin información</span>}</dd>
    </div>
  )
}
