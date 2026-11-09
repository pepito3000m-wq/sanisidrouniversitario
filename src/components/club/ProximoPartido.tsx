import { CalendarDays, Clock, MapPin } from 'lucide-react'
import type { Categoria, Partido } from '@/lib/datos'
import { aFecha, enlaceMapa, fechaTaco } from '@/lib/formato'
import { Escudo } from './Escudo'

/**
 * Primer partido pendiente por fecha. Se calcula solo a partir del fixture:
 * se ordena por fecha y se toma el primero sin resultado que todavía no pasó
 * (con 3 h de margen para que se siga viendo mientras se juega).
 */
export function proximoPartido(c: Categoria, ahora = Date.now()): Partido | null {
  return (
    [...c.partidos]
      .filter((p) => p.estado === 'programado' && aFecha(p.fecha).getTime() > ahora - 3 * 3_600_000)
      .sort((a, b) => aFecha(a.fecha).getTime() - aFecha(b.fecha).getTime())[0] ?? null
  )
}

const SIN_INFO = 'Sin información'

/** Cinta horizontal a lo ancho de la página con el próximo partido de la categoría elegida. */
export function ProximoPartido({ categoria }: { categoria: Categoria }) {
  const p = proximoPartido(categoria)
  const t = p ? fechaTaco(p) : null

  return (
    <section id="proximo" aria-labelledby="titulo-proximo" className="cinta rayas-amarillas border-y-4 border-azul bg-amarillo text-azul shadow-lg">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <h2 id="titulo-proximo" className="flex items-baseline gap-2 font-display text-lg leading-none font-extrabold whitespace-nowrap uppercase sm:text-xl">
          Próximo partido
          <span className="rounded bg-azul px-1.5 py-0.5 text-xs tracking-wider text-amarillo">{categoria.nombre}</span>
        </h2>
        {p && t ? (
          <>
            <p className="flex min-w-0 items-center gap-2 font-display text-lg leading-none font-bold uppercase sm:text-xl">
              <Escudo equipo={p.local} tam={30} />
              <span className="truncate">{p.local.nombre}</span>
              <span className="text-sm opacity-60">vs</span>
              <Escudo equipo={p.visitante} tam={30} />
              <span className="truncate">{p.visitante.nombre}</span>
            </p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold sm:ml-auto">
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                <span className="sr-only">Fecha:</span>
                {t.dia} {t.num} {t.mes}
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                <span className="sr-only">Hora:</span>
                {t.hora} h
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" />
                <span className="sr-only">Cancha:</span>
                {p.cancha ? (
                  <a href={enlaceMapa(p.cancha)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline">
                    {p.cancha}
                  </a>
                ) : (
                  SIN_INFO
                )}
              </li>
            </ul>
          </>
        ) : (
          <p className="text-sm font-semibold">{SIN_INFO} · LUD Stats todavía no publicó un partido pendiente para {categoria.nombre}.</p>
        )}
      </div>
    </section>
  )
}
