import { useMemo, useState } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'
import type { Categoria, Partido } from '@/lib/datos'
import { TEXTO_RESULTADO, fechaTaco } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { Escudo, esPropio } from './Escudo'
import { FichaPartido } from './FichaPartido'
import { COLOR_RESULTADO } from './Resultados'
import { Seccion, Vacio } from './Seccion'

function Equipo({ partido, lado }: { partido: Partido; lado: 'local' | 'visitante' }) {
  const e = partido[lado]
  const goles = lado === 'local' ? partido.golesLocal : partido.golesVisitante
  return (
    <span className="flex items-center gap-2.5">
      <Escudo equipo={e} tam={26} />
      <span className={cn('min-w-0 flex-1 truncate', esPropio(e) ? 'font-bold text-azul' : 'font-medium text-foreground')}>{e.nombre}</span>
      {partido.estado === 'jugado' && <span className="font-display text-2xl leading-none font-extrabold text-azul tabular-nums">{goles}</span>}
    </span>
  )
}

/** Tarjeta del fixture: toda la tarjeta abre la ficha del partido. */
function TarjetaFixture({ partido, categoria }: { partido: Partido; categoria: string }) {
  const t = fechaTaco(partido)
  const jugado = partido.estado === 'jugado' && partido.resultado
  return (
    <li>
      <FichaPartido partido={partido} categoria={categoria}>
        <button
          type="button"
          aria-label={`${partido.ronda || 'Partido'}: ${partido.local.nombre} vs ${partido.visitante.nombre}, ${t.dia} ${t.num} ${t.mes}. Abrir ficha`}
          className="tarjeta-ficha group flex w-full items-stretch overflow-hidden rounded-2xl bg-white text-left ring-1 ring-border hover:ring-2 hover:ring-amarillo"
        >
          <span
            className={cn(
              'flex w-[4.25rem] shrink-0 flex-col items-center justify-center py-3 font-display leading-none',
              jugado ? 'bg-azul-claro text-azul' : 'rayas bg-azul text-white',
            )}
          >
            <span className="text-xs font-bold tracking-wider">{t.dia}</span>
            <span className="my-1 text-3xl font-extrabold">{t.num}</span>
            <span className={cn('text-xs font-bold tracking-wider', !jugado && 'text-amarillo')}>{t.mes}</span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-2 p-3.5 sm:p-4">
            <span className="flex items-center justify-between gap-2 text-[0.68rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              <span className="truncate">{partido.ronda || 'Sin información'}</span>
              {jugado ? (
                <span className={cn('flex items-center gap-1.5', COLOR_RESULTADO[partido.resultado!].texto)}>
                  <span aria-hidden="true" className={cn('size-2 rounded-full', COLOR_RESULTADO[partido.resultado!].fondo)} />
                  {TEXTO_RESULTADO[partido.resultado!]}
                </span>
              ) : (
                <span className="rounded bg-amarillo px-1.5 py-0.5 text-azul">{t.hora} h</span>
              )}
            </span>
            <Equipo partido={partido} lado="local" />
            <Equipo partido={partido} lado="visitante" />
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {partido.cancha ?? 'Sin información'}
            </span>
          </span>
          <span aria-hidden="true" className="flex w-7 shrink-0 items-center justify-center text-azul/40 transition-colors group-hover:bg-amarillo group-hover:text-azul">
            <ChevronRight className="size-4" />
          </span>
        </button>
      </FichaPartido>
    </li>
  )
}

export function Fixture({ categoria }: { categoria: Categoria }) {
  const fases = useMemo(() => {
    const orden: string[] = []
    for (const p of categoria.partidos) if (!orden.includes(p.fase)) orden.push(p.fase)
    return orden.reverse() // la fase en curso primero
  }, [categoria])
  const [fase, setFase] = useState(categoria.faseActual)
  const elegida = fases.includes(fase) ? fase : fases[0]
  const partidos = categoria.partidos.filter((p) => p.fase === elegida)

  return (
    <Seccion id="fixture" antetitulo={`${categoria.nombre} · ${categoria.divisional} · ${categoria.temporada}`} titulo="Fixture" className="rayas-amarillas bg-white">
      {fases.length > 1 && (
        <div role="group" aria-label="Fases del torneo" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {fases.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === elegida}
              onClick={() => setFase(f)}
              className={cn(
                'shrink-0 -skew-x-6 rounded-md border-2 px-4 py-2 font-display text-base font-bold tracking-wide whitespace-nowrap uppercase transition-colors',
                f === elegida ? 'border-azul bg-azul text-white' : 'border-azul/30 bg-white text-azul hover:border-azul',
              )}
            >
              <span className="inline-block skew-x-6">
                {f}
                {f === categoria.faseActual && <span className="ml-1.5 text-amarillo">●</span>}
              </span>
            </button>
          ))}
        </div>
      )}
      {partidos.length === 0 ? (
        <Vacio>Sin información</Vacio>
      ) : (
        <ol className="grid gap-3 md:grid-cols-2">
          {partidos.map((p) => (
            <TarjetaFixture key={p.id} partido={p} categoria={categoria.nombre} />
          ))}
        </ol>
      )}
    </Seccion>
  )
}
