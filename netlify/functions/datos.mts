/**
 * GET /api/datos — fixture, resultados, tablas, plantel y fichas de Colegio San Isidro.
 *
 * - Responde siempre con la última copia guardada (Blobs) o `data.json`, sin
 *   esperar a LUD Stats: carga rápido aunque la fuente esté caída.
 * - La actualización la hace la función programada (martes y miércoles).
 *   Solo si todavía no existe ninguna copia guardada (primer despliegue) se
 *   pide un refresco en segundo plano.
 */
import type { Config, Context } from '@netlify/functions'
import type { RespuestaDatos } from '../../src/lib/datos.ts'
import { ETIQUETA_CACHE, datosParaMostrar, reservarRefresco } from '../lib/almacen.ts'

export default async (req: Request, context: Context) => {
  const { guardados, datos } = await datosParaMostrar()

  if (!guardados && (await reservarRefresco())) {
    context.waitUntil(
      fetch(new URL('/.netlify/functions/lud-refresco', req.url), { method: 'POST' }).catch((error) =>
        console.error('No se pudo pedir el refresco', error),
      ),
    )
  }

  const cuerpo: RespuestaDatos = datos

  return Response.json(cuerpo, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=604800',
      'Netlify-Cache-Tag': ETIQUETA_CACHE,
    },
  })
}

export const config: Config = {
  path: '/api/datos',
  method: 'GET',
}
