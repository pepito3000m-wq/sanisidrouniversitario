import { createServerFn } from '@tanstack/react-start'
import type { RespuestaDatos } from './datos'

/**
 * Lee los datos guardados del lado del servidor (Netlify Blobs → `data.json`).
 * Nunca consulta LUD Stats en el momento: la página se arma con la última copia
 * buena, así carga rápido aunque la fuente esté caída.
 */
export const leerDatos = createServerFn({ method: 'GET' }).handler(async (): Promise<RespuestaDatos> => {
  try {
    const { datosParaMostrar } = await import('../../netlify/lib/almacen.ts')
    return (await datosParaMostrar()).datos
  } catch (error) {
    console.error('No se pudieron leer los datos guardados; se usa data.json', error)
    const { default: respaldo } = await import('../../data.json')
    return { ...(respaldo as unknown as RespuestaDatos), desactualizado: true }
  }
})
