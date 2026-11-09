import { useState } from 'react'
import type { Equipo } from '@/lib/datos'
import { ESCUDO_PROPIO, imagen, iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'

export const esPropio = (e: Equipo) => e.id === 39 || /^colegio san isidro$/i.test(e.nombre)

/** Escudo de un equipo, optimizado con Netlify Image CDN. Si falla, muestra iniciales. */
export function Escudo({
  equipo,
  tam = 40,
  className,
}: {
  equipo: Equipo
  tam?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  const src = esPropio(equipo) ? ESCUDO_PROPIO : equipo.escudo

  if (!src || error) {
    return (
      <span
        aria-hidden="true"
        style={{ width: tam, height: tam, fontSize: Math.max(10, tam / 3) }}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-azul-claro font-display font-bold text-azul',
          className,
        )}
      >
        {iniciales(equipo.nombre) || '?'}
      </span>
    )
  }

  return (
    <img
      src={imagen(src, tam * 2)}
      alt=""
      width={tam}
      height={tam}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      style={{ width: tam, height: tam }}
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
