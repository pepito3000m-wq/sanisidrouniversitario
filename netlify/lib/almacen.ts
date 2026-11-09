/**
 * Última copia buena de los datos, guardada en Netlify Blobs.
 * Si la fuente falla, la web sigue mostrando esta copia.
 */
import { getStore } from '@netlify/blobs'
import { purgeCache } from '@netlify/functions'
import type { Datos } from '../../src/lib/datos.ts'
import semilla from '../../data.json' with { type: 'json' }
import { obtenerDatosLud } from './lud.ts'

const CLAVE_DATOS = 'ultimo'
const CLAVE_PEDIDO = 'refresco-pedido'
const CLAVE_ESTADO = 'estado-fuente'

/**
 * La actualización corre martes y miércoles; entre el miércoles y el martes
 * siguiente pasan 6 días. Pasado este plazo sin datos nuevos se marca el aviso
 * (la fecha de actualización se muestra siempre, de forma discreta).
 */
export const HORAS_AVISO = 7.5 * 24
/** Etiqueta de caché de la CDN para las respuestas que dependen de los datos. */
export const ETIQUETA_CACHE = 'lud-datos'

const almacen = () => getStore('lud-datos')

export const datosManuales = semilla as unknown as Datos

export const edadHoras = (d: Datos) =>
  (Date.now() - new Date(d.actualizado).getTime()) / 3_600_000

export async function leerGuardados(): Promise<Datos | null> {
  try {
    return ((await almacen().get(CLAVE_DATOS, { type: 'json' })) as Datos | null) ?? null
  } catch (error) {
    console.error('No se pudo leer la copia guardada')
    return null
  }
}

/**
 * Devuelve la copia más nueva entre la guardada (Blobs) y `data.json`.
 * Así, si la fuente deja de funcionar, alcanza con editar `data.json`
 * (y su campo "actualizado") para que la web muestre esos datos.
 */
export function masNuevos(guardados: Datos | null): Datos {
  if (!guardados) return datosManuales
  return new Date(guardados.actualizado) >= new Date(datosManuales.actualizado)
    ? guardados
    : datosManuales
}

/** Descarga de la fuente y guarda. Lanza si la fuente falla. */
export async function refrescar(timeoutMs: number): Promise<Datos> {
  const previos = masNuevos(await leerGuardados())
  try {
    const nuevos = await obtenerDatosLud({ timeoutMs, previos })
    await almacen().setJSON(CLAVE_DATOS, nuevos)
    await almacen().setJSON(CLAVE_ESTADO, { fallo: false, en: nuevos.actualizado })
    // La portada y /api/datos se cachean en la CDN: se invalidan al guardar.
    await purgeCache({ tags: [ETIQUETA_CACHE] }).catch((e) => console.error('No se pudo purgar la caché', e))
    return nuevos
  } catch (error) {
    await almacen().setJSON(CLAVE_ESTADO, { fallo: true, en: new Date().toISOString() }).catch(() => {})
    await purgeCache({ tags: [ETIQUETA_CACHE] }).catch(() => {})
    throw error
  }
}

/** Evita disparar muchos refrescos seguidos (uno cada 15 minutos como máximo). */
export async function reservarRefresco(): Promise<boolean> {
  const store = almacen()
  try {
    const pedido = (await store.get(CLAVE_PEDIDO, { type: 'json' })) as { en: string } | null
    if (pedido && Date.now() - new Date(pedido.en).getTime() < 15 * 60_000) return false
    await store.setJSON(CLAVE_PEDIDO, { en: new Date().toISOString() })
    return true
  } catch {
    return false
  }
}

/** Estado de la última consulta, separado de la última respuesta válida. */
export async function falloFuente(): Promise<boolean> {
  try {
    const estado = await almacen().get(CLAVE_ESTADO, { type: 'json' }) as { fallo: boolean } | null
    return estado?.fallo ?? false
  } catch {
    return false
  }
}

/** Datos listos para mostrar: última copia buena + si corresponde el aviso. */
export async function datosParaMostrar() {
  const [guardados, fallo] = await Promise.all([leerGuardados(), falloFuente()])
  const datos = masNuevos(guardados)
  return {
    guardados,
    datos: {
      ...datos,
      desactualizado: fallo || !!datos.avisos?.length || edadHoras(datos) > HORAS_AVISO,
    },
  }
}
