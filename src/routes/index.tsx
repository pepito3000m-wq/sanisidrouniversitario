import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ClaveCategoria } from '@/lib/datos'
import { leerDatos } from '@/lib/servidor'
import { AvisoActualizacion } from '@/components/club/AvisoActualizacion'
import { Institucion } from '@/components/club/Institucion'
import { Contacto } from '@/components/club/Contacto'
import { Encabezado } from '@/components/club/Encabezado'
import { Fixture } from '@/components/club/Fixture'
import { Pie } from '@/components/club/Pie'
import { Plantel } from '@/components/club/Plantel'
import { Portada } from '@/components/club/Portada'
import { ProximoPartido } from '@/components/club/ProximoPartido'
import { UltimosResultados } from '@/components/club/Resultados'
import { SelectorCategoria } from '@/components/club/SelectorCategoria'
import { TablaPosiciones } from '@/components/club/TablaPosiciones'

export const Route = createFileRoute('/')({
  // Los datos se leen en el servidor desde la última copia guardada (Blobs → data.json).
  loader: () => leerDatos(),
  // La CDN guarda la página; se invalida (etiqueta "lud-datos") cada vez que se actualizan los datos.
  headers: () => ({
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=604800',
    'Netlify-Cache-Tag': 'lud-datos',
  }),
  component: Inicio,
})

const CLAVE_CATEGORIA = 'csi-categoria'

function Inicio() {
  const datos = Route.useLoaderData()
  const [clave, setClave] = useState<ClaveCategoria>('sub20')

  useEffect(() => {
    let guardada: string | null = null
    try { guardada = localStorage.getItem(CLAVE_CATEGORIA) } catch { /* modo privado */ }
    if (guardada === 'sub20' || guardada === 'mayores') setClave(guardada)
  }, [])

  const cambiar = (c: ClaveCategoria) => {
    setClave(c)
    try {
      localStorage.setItem(CLAVE_CATEGORIA, c)
    } catch {
      /* modo privado */
    }
  }

  const categoria = datos.categorias.find((c) => c.clave === clave) ?? datos.categorias[0]

  return (
    <>
      <a href="#resultados" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <Encabezado />
      <main>
        <Portada categorias={datos.categorias} />
        {categoria ? (
          <>
            <ProximoPartido categoria={categoria} />
            <SelectorCategoria categorias={datos.categorias} activa={categoria.clave} onCambiar={cambiar} />
            <div className="mx-auto max-w-content px-4 pt-4 sm:px-6">
              <AvisoActualizacion datos={datos} />
            </div>
            <UltimosResultados categoria={categoria} />
            <Fixture key={`f-${categoria.clave}`} categoria={categoria} />
            <TablaPosiciones key={`t-${categoria.clave}`} categoria={categoria} />
            <Plantel key={`pl-${categoria.clave}`} categoria={categoria} />
          </>
        ) : (
          <p className="mx-auto max-w-content px-4 py-20 text-center text-muted-foreground">
            Sin información de partidos para mostrar.
          </p>
        )}
        <Institucion />
        <Contacto />
      </main>
      <Pie datos={datos} />
    </>
  )
}
