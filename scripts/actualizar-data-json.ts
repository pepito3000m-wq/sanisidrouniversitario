/**
 * Regenera `data.json` (respaldo editable a mano) desde la fuente.
 * Uso: node scripts/actualizar-data-json.ts   (Node 22.18+ ejecuta TS directo)
 */
import { readFile, writeFile } from 'node:fs/promises'
import { obtenerDatosLud } from '../netlify/lib/lud.ts'

const ruta = new URL('../data.json', import.meta.url)
const previos = await readFile(ruta, 'utf8').then(JSON.parse).catch(() => null)
const datos = await obtenerDatosLud({ timeoutMs: 90_000, previos })
await writeFile(ruta, JSON.stringify(datos, null, 2) + '\n')
console.log(
  `data.json actualizado: ${datos.categorias
    .map((c) => `${c.nombre} ${c.divisional} (${c.partidos.length} partidos, ${c.tabla?.filas.length ?? 0} en tabla, ${c.plantel.length} jugadores)`)
    .join(' · ')}`,
)
