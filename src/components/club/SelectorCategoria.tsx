import type { Categoria, ClaveCategoria } from '@/lib/datos'
import { cn } from '@/lib/utils'

export function SelectorCategoria({
  categorias,
  activa,
  onCambiar,
}: {
  categorias: Categoria[]
  activa: ClaveCategoria
  onCambiar: (c: ClaveCategoria) => void
}) {
  if (categorias.length < 2) return null
  return (
    <div className="sticky top-[4.5rem] z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-content px-4 py-2.5 sm:px-6">
        <div role="group" aria-label="Elegí la categoría" className="grid grid-cols-2 gap-1 rounded-xl bg-azul-claro p-1 sm:inline-grid sm:min-w-[26rem]">
          {categorias.map((c) => {
            const sel = c.clave === activa
            return (
              <button
                key={c.clave}
                type="button"
                aria-pressed={sel}
                onClick={() => onCambiar(c.clave)}
                className={cn(
                  'rounded-lg px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none',
                  sel ? 'bg-azul text-white shadow-sm' : 'text-azul hover:bg-white/70',
                )}
              >
                <span className="block font-display text-lg leading-none font-bold uppercase">{c.nombre}</span>
                <span className={cn('block text-xs font-semibold', sel ? 'text-amarillo' : 'text-muted-foreground')}>
                  {c.divisional}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
