/**
 * Función en segundo plano (hasta 15 min): descarga los datos de la fuente y
 * guarda una copia nueva. La fuente (servidor gratuito) puede tardar en
 * "despertar", por eso se usa un tiempo de espera largo.
 */
import { edadHoras, leerGuardados, refrescar } from '../lib/almacen.ts'

export default async () => {
  const guardados = await leerGuardados()
  if (guardados && edadHoras(guardados) < 0.25) return // recién actualizado

  try {
    const datos = await refrescar(120_000)
    console.log('Datos actualizados', datos.actualizado)
  } catch (error) {
    // Se conserva la copia anterior; la web mostrará el aviso de fecha.
    console.error('La fuente falló; se mantiene la última copia', error)
  }
}

