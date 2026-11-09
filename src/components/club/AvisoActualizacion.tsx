import type { RespuestaDatos } from '@/lib/datos'
import { fechaActualizado } from '@/lib/formato'
import { cn } from '@/lib/utils'

/** Aviso discreto con la fecha de los datos. Se marca en ámbar si están desactualizados. */
export function AvisoActualizacion({ datos, className }: { datos: RespuestaDatos; className?: string }) {
  return (
    <p
      className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}
      title={
        datos.desactualizado
          ? 'Hay datos pendientes de actualización; se conserva la última información disponible.'
          : undefined
      }
    >
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-full', datos.desactualizado ? 'bg-amber-500' : 'bg-victoria/70')}
      />
      <span>
        Datos actualizados el {fechaActualizado(datos.actualizado)}
        {datos.desactualizado && ' · mostrando la última copia guardada'}
      </span>
    </p>
  )
}
