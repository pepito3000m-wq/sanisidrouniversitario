import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ESCUDO_PROPIO, imagen } from '@/lib/formato'

/** Todas las secciones de la página (menú y pie). */
export const SECCIONES = [
  { id: 'inicio', texto: 'Inicio' },
  { id: 'resultados', texto: 'Resultados' },
  { id: 'fixture', texto: 'Fixture' },
  { id: 'tablas', texto: 'Tablas' },
  { id: 'plantel', texto: 'Plantel y estadísticas' },
  { id: 'tecnicos', texto: 'Directores técnicos' },
  { id: 'club', texto: 'El club' },
  { id: 'contacto', texto: 'Contacto' },
]

export function Marca() {
  return (
    <a href="#inicio" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <img
        src={imagen(ESCUDO_PROPIO, 112)}
        alt="Escudo de Colegio San Isidro"
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full bg-white object-contain p-0.5"
      />
      <span className="min-w-0 leading-none">
        <span className="block truncate font-display text-[1.65rem] font-extrabold tracking-tight text-white uppercase">
          San Isidro
        </span>
        <span className="mt-0.5 block font-display text-sm font-bold tracking-[0.32em] text-amarillo uppercase">
          Universitario
        </span>
      </span>
    </a>
  )
}

export function Encabezado() {
  return (
      <header className="sticky top-0 z-40 border-b border-white/10 bg-azul/85 text-white backdrop-blur supports-[backdrop-filter]:bg-azul/70">
        <div className="mx-auto flex h-[4.5rem] max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <Marca />
          <nav aria-label="Secciones" className="hidden lg:block">
            <ul className="flex gap-1">
              {SECCIONES.filter((s) => ['resultados', 'fixture', 'tablas', 'plantel', 'club', 'contacto'].includes(s.id)).map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-amarillo">
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Sheet>
            <SheetTrigger
              className="inline-flex size-12 items-center justify-center rounded-lg bg-amarillo text-azul focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="rayas w-[82vw] max-w-sm bg-azul text-white">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl font-extrabold text-white uppercase">Menú</SheetTitle>
                <SheetDescription className="text-white/70">Colegio San Isidro · LUD</SheetDescription>
              </SheetHeader>
              <nav aria-label="Secciones" className="px-4">
                <ul className="flex flex-col">
                  {SECCIONES.map((s) => (
                    <li key={s.id}>
                      <SheetClose asChild>
                        <a
                          href={`#${s.id}`}
                          className="block border-b border-white/10 py-3.5 font-display text-2xl font-bold tracking-wide uppercase hover:text-amarillo"
                        >
                          {s.texto}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
  )
}
