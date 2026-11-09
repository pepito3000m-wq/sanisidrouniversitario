import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Categoria, Partido, Resultado } from '@/lib/datos'
import { TEXTO_RESULTADO, fechaCorta } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { Escudo, esPropio } from './Escudo'
import { FichaPartido } from './FichaPartido'
import { Seccion, Vacio } from './Seccion'

export const COLOR_RESULTADO: Record<Resultado, { borde: string; texto: string; fondo: string }> = {
  V: { borde: 'border-t-victoria', texto: 'text-victoria', fondo: 'bg-victoria' },
  E: { borde: 'border-t-amarillo', texto: 'text-amber-700', fondo: 'bg-amarillo' },
  D: { borde: 'border-t-derrota', texto: 'text-derrota', fondo: 'bg-derrota' },
}

function Linea({ partido, lado }: { partido: Partido; lado: 'local' | 'visitante' }) {
  const e = partido[lado]
  const goles = lado === 'local' ? partido.golesLocal : partido.golesVisitante
  const otro = lado === 'local' ? partido.golesVisitante : partido.golesLocal
  const gano = (goles ?? 0) > (otro ?? 0)
  return (
    <span className="flex items-center gap-3">
      <Escudo equipo={e} tam={36} />
      <span className={cn('min-w-0 flex-1 text-base leading-tight', esPropio(e) ? 'font-bold text-foreground' : 'text-muted-foreground')}>
        {e.nombre}
      </span>
      <span className={cn('font-display text-4xl leading-none font-extrabold tabular-nums', gano ? 'text-azul' : 'text-azul/45')}>{goles}</span>
    </span>
  )
}

/** Tarjeta de resultado: toda la tarjeta es un botón que abre la ficha. */
export function TarjetaResultado({ partido, categoria }: { partido: Partido; categoria: string }) {
  const r = partido.resultado!
  return (
    <FichaPartido partido={partido} categoria={categoria}>
      <button
        type="button"
        aria-label={`${partido.local.nombre} ${partido.golesLocal} – ${partido.golesVisitante} ${partido.visitante.nombre}. Abrir ficha`}
        className={cn(
          'tarjeta-ficha block h-full w-full rounded-2xl border-t-[6px] bg-white p-5 text-left shadow-sm ring-1 ring-border hover:ring-azul/40',
          COLOR_RESULTADO[r].borde,
        )}
      >
        <span className="mb-4 flex items-start justify-between gap-3 text-[0.7rem] font-bold tracking-[0.14em] uppercase">
          <span className="text-muted-foreground">{[partido.ronda, fechaCorta(partido), partido.fase].filter(Boolean).join(' · ')}</span>
          <span className={COLOR_RESULTADO[r].texto}>{TEXTO_RESULTADO[r]}</span>
        </span>
        <span className="block space-y-3">
          <Linea partido={partido} lado="local" />
          <Linea partido={partido} lado="visitante" />
        </span>
      </button>
    </FichaPartido>
  )
}

export function UltimosResultados({ categoria }: { categoria: Categoria }) {
  const cinta = useRef<HTMLDivElement>(null)
  const [activo, setActivo] = useState(0)
  const jugados = categoria.partidos.filter((p) => p.estado === 'jugado' && p.resultado)
  // El más reciente primero: el carrusel se desliza hacia la derecha hacia los más viejos.
  const ultimos = [...jugados].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const resumen = jugados.reduce(
    (acc, p) => ({ ...acc, [p.resultado!]: acc[p.resultado!] + 1 }),
    { V: 0, E: 0, D: 0 } as Record<Resultado, number>,
  )

  useEffect(() => {
    const el = cinta.current
    if (!el) return
    el.scrollTo({ left: 0 })
    setActivo(0)
    const alMover = () => {
      const tarjeta = el.firstElementChild as HTMLElement | null
      if (!tarjeta) return
      const paso = tarjeta.offsetWidth + 16
      setActivo(Math.min(ultimos.length - 1, Math.round(el.scrollLeft / paso)))
    }
    el.addEventListener('scroll', alMover, { passive: true })
    return () => el.removeEventListener('scroll', alMover)
  }, [categoria.clave, ultimos.length])

  const ir = (i: number) => {
    const el = cinta.current
    const tarjeta = el?.children[i] as HTMLElement | undefined
    if (!el || !tarjeta) return
    const relleno = parseFloat(getComputedStyle(el).paddingLeft) || 0
    const left = el.scrollLeft + tarjeta.getBoundingClientRect().left - el.getBoundingClientRect().left - relleno
    el.scrollTo({ left, behavior: 'smooth' })
  }

  return (
    <Seccion
      id="resultados"
      antetitulo={`${categoria.nombre} · Temporada ${categoria.temporada}`}
      titulo="Últimos resultados"
      extra={
        jugados.length > 0 && (
          <dl className="flex gap-2 text-center" aria-label="Balance de la temporada">
            {(['V', 'E', 'D'] as const).map((k) => (
              <div key={k} className="min-w-16 rounded-xl bg-white px-3 py-2 ring-1 ring-border">
                <dt className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">{TEXTO_RESULTADO[k]}s</dt>
                <dd className={cn('font-display text-3xl font-extrabold', COLOR_RESULTADO[k].texto)}>{resumen[k]}</dd>
              </div>
            ))}
          </dl>
        )
      }
    >
      {ultimos.length === 0 ? (
        <Vacio>Sin información · todavía no hay partidos jugados en esta temporada.</Vacio>
      ) : (
        <>
          <div
            ref={cinta}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Resultados, del más reciente al más antiguo"
            className="carrusel -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0"
          >
            {ultimos.map((p) => (
              <div key={p.id} className="w-[84%] max-w-sm shrink-0 snap-start sm:w-[330px]">
                <TarjetaResultado partido={p} categoria={categoria.nombre} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Resultado anterior"
              disabled={activo === 0}
              onClick={() => ir(Math.max(0, activo - 1))}
              className="inline-flex size-10 items-center justify-center rounded-full border-2 border-azul text-azul hover:bg-azul hover:text-white disabled:opacity-30"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <div className="flex max-w-[60vw] flex-wrap justify-center gap-1.5" role="group" aria-label="Indicadores del carrusel">
              {ultimos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Ir al resultado ${i + 1} de ${ultimos.length}`}
                  aria-current={i === activo ? 'true' : undefined}
                  onClick={() => ir(i)}
                  className={cn('h-2 rounded-full transition-all', i === activo ? 'w-6 bg-azul' : 'w-2 bg-azul/25 hover:bg-azul/50')}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Resultado siguiente"
              disabled={activo >= ultimos.length - 1}
              onClick={() => ir(Math.min(ultimos.length - 1, activo + 1))}
              className="inline-flex size-10 items-center justify-center rounded-full border-2 border-azul text-azul hover:bg-azul hover:text-white disabled:opacity-30"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </Seccion>
  )
}
