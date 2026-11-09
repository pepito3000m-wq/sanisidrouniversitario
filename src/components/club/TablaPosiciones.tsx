import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import type { Categoria, Tabla } from '@/lib/datos'
import { cn } from '@/lib/utils'
import { Escudo } from './Escudo'
import { Seccion, Vacio } from './Seccion'

const FORMA: Record<string, { clase: string; texto: string }> = {
  W: { clase: 'bg-victoria', texto: 'G' },
  D: { clase: 'bg-amarillo text-azul', texto: 'E' },
  L: { clase: 'bg-derrota', texto: 'P' },
}

/**
 * Pestañas: la tabla de la Primera Rueda y la de la fase siguiente, con el
 * nombre real que le da la Liga a cada categoría (sale de LUD Stats, p. ej.
 * "Copa Plata" en Sub 20 o "Segunda Rueda Título" en Mayores).
 */
export function TablaPosiciones({ categoria }: { categoria: Categoria }) {
  const todas = categoria.tablas ?? (categoria.tabla ? [categoria.tabla] : [])
  const primera = todas.find((t) => /primera rueda/i.test(t.fase)) ?? null
  const segunda = todas.filter((t) => t !== primera).at(-1) ?? null
  const pestanas = [
    { clave: 'primera', titulo: 'Primera rueda', tabla: primera },
    { clave: 'segunda', titulo: segunda?.fase ?? 'Segunda fase', tabla: segunda },
  ]
  const [elegida, setElegida] = useState(segunda ? 'segunda' : 'primera')

  return (
    <Seccion id="tablas" antetitulo={`${categoria.nombre} · ${categoria.divisional} · ${categoria.temporada}`} titulo="Tablas">
      <Tabs.Root value={elegida} onValueChange={setElegida}>
        <Tabs.List aria-label="Fase de la tabla" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-azul-claro p-1 sm:inline-grid sm:min-w-[28rem]">
          {pestanas.map((t) => (
            <Tabs.Trigger
              key={t.clave}
              value={t.clave}
              className="rounded-lg px-3 py-2.5 font-display text-base leading-tight font-bold text-azul uppercase transition-colors hover:bg-white/70 data-[state=active]:bg-azul data-[state=active]:text-white data-[state=active]:shadow-sm sm:text-lg"
            >
              {t.titulo}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {pestanas.map((t) => (
          <Tabs.Content key={t.clave} value={t.clave} className="outline-none">
            <TablaFase categoria={categoria} tabla={t.tabla} />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Seccion>
  )
}

function TablaFase({ categoria, tabla }: { categoria: Categoria; tabla: Tabla | null }) {
  const conArrastre = !!tabla?.filas.some((f) => f.arrastre > 0)
  const nuestra = tabla?.filas.find((f) => f.esNuestro)
  return (
    <>
      {nuestra && (
        <p className="mb-4 inline-flex items-baseline gap-2 rounded-xl bg-azul px-4 py-2 text-white">
          <span className="text-[0.65rem] font-bold tracking-widest text-amarillo uppercase">San Isidro</span>
          <span className="font-display text-3xl font-extrabold">{nuestra.posicion}º</span>
          <span className="text-sm text-white/80">con {conArrastre ? nuestra.total : nuestra.puntos} pts</span>
        </p>
      )}
      {!tabla ? (
        <Vacio>Sin información</Vacio>
      ) : (
        <>
          <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:ring-1 sm:ring-border">
            <table className="w-full min-w-[34rem] border-collapse bg-white text-sm tabular-nums">
              <caption className="sr-only">
                Tabla de posiciones de {categoria.nombre} {categoria.divisional}, {tabla.fase}
              </caption>
              <thead className="bg-azul text-xs font-bold tracking-wider text-white uppercase">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-10 bg-azul py-3 pl-4 text-left">#</th>
                  <th scope="col" className="sticky left-10 z-10 bg-azul py-3 pr-2 text-left">Equipo</th>
                  <th scope="col" className="px-2 py-3"><abbr title="Partidos jugados" className="no-underline">PJ</abbr></th>
                  <th scope="col" className="px-2 py-3"><abbr title="Ganados" className="no-underline">G</abbr></th>
                  <th scope="col" className="px-2 py-3"><abbr title="Empatados" className="no-underline">E</abbr></th>
                  <th scope="col" className="px-2 py-3"><abbr title="Perdidos" className="no-underline">P</abbr></th>
                  <th scope="col" className="hidden px-2 py-3 sm:table-cell"><abbr title="Goles a favor y en contra" className="no-underline">GF:GC</abbr></th>
                  <th scope="col" className="px-2 py-3"><abbr title="Diferencia de goles" className="no-underline">DG</abbr></th>
                  {conArrastre && (
                    <th scope="col" className="px-2 py-3"><abbr title="Puntos arrastrados de la fase anterior" className="no-underline">Arr.</abbr></th>
                  )}
                  <th scope="col" className="px-3 py-3 text-amarillo">Pts</th>
                  <th scope="col" className="hidden py-3 pr-4 md:table-cell">Últimos</th>
                </tr>
              </thead>
              <tbody>
                {tabla.filas.map((f) => {
                  const fondo = f.esNuestro ? 'bg-amarillo-suave' : 'bg-white'
                  return (
                    <tr
                      key={f.equipo.nombre}
                      className={cn('border-b border-border last:border-b-0', f.esNuestro && 'font-bold text-azul')}
                      aria-current={f.esNuestro ? 'true' : undefined}
                    >
                      <td className={cn('sticky left-0 z-10 py-3 pl-4 font-display text-lg font-bold', fondo, f.esNuestro && 'shadow-[inset_4px_0_0_var(--amarillo)]')}>
                        {f.posicion}
                      </td>
                      <th scope="row" className={cn('sticky left-10 z-10 py-3 pr-2 text-left font-semibold', fondo)}>
                        <span className="flex items-center gap-2.5">
                          <Escudo equipo={f.equipo} tam={26} />
                          <span className="max-w-[9.5rem] truncate sm:max-w-none">{f.equipo.nombre}</span>
                        </span>
                      </th>
                      <td className={cn('px-2 py-3 text-center', fondo)}>{f.pj}</td>
                      <td className={cn('px-2 py-3 text-center', fondo)}>{f.pg}</td>
                      <td className={cn('px-2 py-3 text-center', fondo)}>{f.pe}</td>
                      <td className={cn('px-2 py-3 text-center', fondo)}>{f.pp}</td>
                      <td className={cn('hidden px-2 py-3 text-center sm:table-cell', fondo)}>{f.gf}:{f.gc}</td>
                      <td className={cn('px-2 py-3 text-center', fondo)}>{f.dg > 0 ? `+${f.dg}` : f.dg}</td>
                      {conArrastre && <td className={cn('px-2 py-3 text-center text-muted-foreground', fondo)}>{f.arrastre}</td>}
                      <td className={cn('px-3 py-3 text-center font-display text-xl font-extrabold text-azul', fondo)}>
                        {conArrastre ? f.total : f.puntos}
                      </td>
                      <td className={cn('hidden py-3 pr-4 md:table-cell', fondo)}>
                        <span className="flex justify-center gap-1">
                          {f.forma.slice(-5).map((r, i) => (
                            <span key={i} className={cn('inline-flex size-5 items-center justify-center rounded text-[0.65rem] font-bold text-white', FORMA[r]?.clase ?? 'bg-muted')}>
                              {FORMA[r]?.texto ?? '–'}
                            </span>
                          ))}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {conArrastre && (
            <p className="mt-3 text-sm text-muted-foreground">
              Los puntos (Pts) incluyen el arrastre (Arr.) de la fase anterior.
            </p>
          )}
        </>
      )}
    </>
  )
}
