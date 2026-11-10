import type { Config } from '@netlify/functions'

const SITIO = 'https://sanisidrouniversitario.netlify.app'
const RUTAS = [
  '/.netlify/functions/lud-refresco-background',
  '/.netlify/functions/lud-refresco',
]

export default async () => {
  for (const ruta of RUTAS) {
    const url = SITIO + ruta
    try {
      const res = await fetch(url, { method: 'POST' })
      console.log('Refresco solicitado', url, res.status)
      if (res.status !== 404) return
    } catch (error) {
      console.error('No se pudo pedir el refresco', url, error)
    }
  }
  console.error('ERROR: no se pudo iniciar el refresco en ninguna ruta')
}

export const config: Config = {
  // 15:00 UTC = 12:00 de Uruguay, martes (2) y miércoles (3)
  schedule: '0 15 * * 2,3',
}
