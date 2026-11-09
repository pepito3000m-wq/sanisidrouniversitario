/**
 * Actualización automática: martes y miércoles a las 12:00 de Uruguay (UTC−3),
 * que son los días en que la Liga suele cargar planillas y resultados.
 * El cron de Netlify funciona en UTC: 12:00 UY = 15:00 UTC.
 *
 * Una función programada tiene 30 s como máximo, por eso solo dispara
 * `lud-refresco` (función en segundo plano, hasta 15 min), que hace la descarga.
 */
import type { Config } from '@netlify/functions'

export default async () => {
  const base = Netlify.env.get('URL')
  if (!base) return
  const res = await fetch(new URL('/.netlify/functions/lud-refresco', base), { method: 'POST' }).catch(
    (error) => {
      console.error('No se pudo pedir el refresco programado', error)
      return null
    },
  )
  console.log('Refresco programado solicitado', res?.status ?? 'sin respuesta')
}

export const config: Config = {
  // minuto hora díaMes mes díaSemana → 15:00 UTC los martes (2) y miércoles (3)
  schedule: '0 15 * * 2,3',
}
