import type { ReactElement } from 'react'
import { MapPin, X } from 'lucide-react'
import type { Equipo, EventoPartido, JugadorFicha, Partido } from '@/lib/datos'
import { enlaceMapa, fechaActualizado, fechaLarga } from '@/lib/formato'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Escudo } from './Escudo'

const SIN_INFO = 'Sin información'

/** La fuente publica minuto 0 cuando no lo informa: se muestra "Sin información". */
const minuto = (m: number | null) => (m === null || m <= 0 ? null : `${m}′`)

const esAmarilla = (t: string) => /yellow/i.test(t)
const esRoja = (t: string) => /red/i.test(t)

function Subtitulo({ children }: { children: string }) {
  return <h4 className="mt-6 mb-2 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase first:mt-0">{children}</h4>
}

function Vacio() {
  return <p className="py-1 text-sm text-muted-foreground">{SIN_INFO}</p>
}

function Minuto({ m }: { m: number | null }) {
  const texto = minuto(m)
  return (
    <span className={cn('shrink-0 text-right font-display font-bold tabular-nums', texto ? 'text-azul' : 'text-xs text-muted-foreground')}>
      {texto ?? SIN_INFO}
    </span>
  )
}

function ListaEventos({ eventos, icono }: { eventos: EventoPartido[]; icono: ReactElement }) {
  if (eventos.length === 0) return <Vacio />
  return (
    <ul className="divide-y divide-border">
      {eventos.map((e, i) => (
        <li key={i} className="flex items-center gap-3 py-2 text-sm">
          {icono}
          <span className="min-w-0 flex-1">{e.jugador ?? SIN_INFO}</span>
          <Minuto m={e.minuto} />
        </li>
      ))}
    </ul>
  )
}

const Pelota = () => <span aria-hidden="true">⚽</span>
const Tarjeta = ({ color }: { color: 'amarilla' | 'roja' }) => (
  <span aria-label={`Tarjeta ${color}`} className={cn('inline-block h-4 w-3 shrink-0 rounded-[2px]', color === 'amarilla' ? 'bg-amarillo' : 'bg-derrota')} />
)

/** Columna de un equipo: titulares, goles, cambios y tarjetas. */
function ColumnaEquipo({ partido, equipo, lado }: { partido: Partido; equipo: Equipo; lado: 'local' | 'visitante' }) {
  const d = partido.detalle
  const eventos = (d?.eventos ?? []).filter((e) => equipo.id !== null && e.equipo === equipo.id)
  const planilla: JugadorFicha[] = d?.alineaciones?.[lado] ?? []
  const titulares = planilla.filter((j) => j.titular)
  const goles = eventos.filter((e) => e.tipo === 'goal')
  const cambios = eventos.filter((e) => e.tipo === 'substitution')
  const amarillas = eventos.filter((e) => esAmarilla(e.tipo))
  const rojas = eventos.filter((e) => esRoja(e.tipo))

  return (
    <section aria-label={equipo.nombre} className={cn('p-5 sm:p-7', lado === 'local' ? 'bg-azul-claro/60' : 'bg-white')}>
      <h3 className="mb-5 flex items-center gap-3 font-display text-2xl leading-none font-extrabold text-azul uppercase">
        <Escudo equipo={equipo} tam={32} />
        {equipo.nombre}
      </h3>

      <Subtitulo>Goles</Subtitulo>
      <ListaEventos eventos={goles} icono={<Pelota />} />

      <Subtitulo>Titulares</Subtitulo>
      {titulares.length === 0 ? (
        <Vacio />
      ) : (
        <ol className="divide-y divide-border">
          {titulares.map((j) => (
            <li key={j.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-7 shrink-0 text-right font-display text-lg leading-none font-bold text-azul-vivo tabular-nums">{j.numero ?? '–'}</span>
              <span className="min-w-0 flex-1">
                {j.nombre}
                {j.capitan && <span className="ml-1 font-semibold text-muted-foreground">(C)</span>}
                {j.arquero && <span className="ml-1 text-xs text-muted-foreground">· arquero</span>}
              </span>
            </li>
          ))}
        </ol>
      )}

      <Subtitulo>Cambios</Subtitulo>
      {cambios.length === 0 ? (
        <Vacio />
      ) : (
        <ul className="divide-y divide-border">
          {cambios.map((e, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block font-bold text-entra">
                  <span aria-hidden="true">▲ </span>
                  <span className="sr-only">Entra: </span>
                  {e.entra ?? SIN_INFO}
                </span>
                <span className="block text-foreground">
                  <span aria-hidden="true" className="text-muted-foreground">▼ </span>
                  <span className="sr-only">Sale: </span>
                  {e.sale ?? SIN_INFO}
                </span>
              </span>
              <Minuto m={e.minuto} />
            </li>
          ))}
        </ul>
      )}

      <Subtitulo>Tarjetas amarillas</Subtitulo>
      <ListaEventos eventos={amarillas} icono={<Tarjeta color="amarilla" />} />

      <Subtitulo>Tarjetas rojas</Subtitulo>
      <ListaEventos eventos={rojas} icono={<Tarjeta color="roja" />} />
    </section>
  )
}

/**
 * Ficha de un partido. `children` es el elemento que la abre (toda la tarjeta
 * del resultado o del fixture). Al cerrar, el foco vuelve a esa tarjeta.
 */
export function FichaPartido({ partido: p, categoria, children }: { partido: Partido; categoria?: string; children: ReactElement }) {
  const jugado = p.estado === 'jugado'
  const meta = [p.cancha ?? `Cancha: ${SIN_INFO}`, categoria, p.fase || `Fase: ${SIN_INFO}`, p.ronda].filter(Boolean)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[92dvh] gap-0 overflow-y-auto border-0 p-0 sm:max-w-3xl">
        <header className="rayas relative bg-azul px-5 pt-8 pb-6 text-center text-white sm:px-8">
          <DialogClose className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Cerrar ficha</span>
          </DialogClose>
          <DialogTitle className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            <span className="flex flex-col items-center gap-2">
              <Escudo equipo={p.local} tam={56} className="rounded-full bg-white p-1" />
              <span className="font-display text-base leading-tight font-extrabold uppercase sm:text-2xl">{p.local.nombre}</span>
            </span>
            <span className="font-display text-5xl leading-none font-extrabold whitespace-nowrap text-amarillo tabular-nums sm:text-7xl">
              {jugado ? (
                <>
                  {p.golesLocal ?? '–'}
                  <span className="mx-1 text-white/60">–</span>
                  {p.golesVisitante ?? '–'}
                </>
              ) : (
                <span className="text-3xl text-white sm:text-4xl">vs</span>
              )}
            </span>
            <span className="flex flex-col items-center gap-2">
              <Escudo equipo={p.visitante} tam={56} className="rounded-full bg-white p-1" />
              <span className="font-display text-base leading-tight font-extrabold uppercase sm:text-2xl">{p.visitante.nombre}</span>
            </span>
          </DialogTitle>
          <DialogDescription className="mt-4 text-sm text-white/85">
            {fechaLarga(p)} · {meta.join(' · ')}
          </DialogDescription>
          {p.cancha && (
            <a
              href={enlaceMapa(p.cancha)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold tracking-wider text-amarillo uppercase hover:underline"
            >
              <MapPin className="size-3.5" aria-hidden="true" /> Cómo llegar
            </a>
          )}
        </header>

        {jugado ? (
          <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <ColumnaEquipo partido={p} equipo={p.local} lado="local" />
            <ColumnaEquipo partido={p} equipo={p.visitante} lado="visitante" />
          </div>
        ) : (
          <p className="p-8 text-center text-muted-foreground">Partido por jugar. La ficha se completa cuando la Liga carga la planilla.</p>
        )}

        <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-8">
          {p.detalle ? `Ficha actualizada el ${fechaActualizado(p.detalle.actualizado)} · ` : `Ficha: ${SIN_INFO} · `}
          Fuente: LUD Stats (no oficial)
        </p>
      </DialogContent>
    </Dialog>
  )
}
