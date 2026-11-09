import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Seccion({
  id,
  antetitulo,
  titulo,
  children,
  className,
  extra,
}: {
  id: string
  antetitulo?: string
  titulo: string
  children: ReactNode
  className?: string
  extra?: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`titulo-${id}`} className={cn('py-14 sm:py-20', className)}>
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {antetitulo && <p className="antetitulo mb-2">{antetitulo}</p>}
            <h2 id={`titulo-${id}`} className="titulo-seccion">
              {titulo}
            </h2>
          </div>
          {extra}
        </div>
        {children}
      </div>
    </section>
  )
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-input bg-white p-6 text-center text-muted-foreground">
      {children}
    </p>
  )
}
