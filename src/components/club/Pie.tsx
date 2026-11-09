import type { RespuestaDatos } from '@/lib/datos'
import { ESCUDO_PROPIO, imagen } from '@/lib/formato'
import { AvisoActualizacion } from './AvisoActualizacion'
import { SECCIONES } from './Encabezado'

export function Pie({ datos }: { datos: RespuestaDatos }) {
  return (
    <footer className="text-white">
      <div className="rayas bg-azul">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <img src={imagen(ESCUDO_PROPIO, 128)} alt="" width={56} height={56} loading="lazy" className="size-14 rounded-full bg-white object-contain p-0.5" />
            <div>
              <p className="font-display text-2xl leading-none font-extrabold uppercase">Colegio San Isidro</p>
              <p className="mt-1 text-sm text-white/75">Liga Universitaria de Deportes · Uruguay</p>
            </div>
          </div>
          <p className="font-display text-xl font-extrabold tracking-wide text-amarillo uppercase">La actitud no se negocia</p>
        </div>
      </div>
      {/* Franja azul de abajo del todo: enlaces a todas las secciones */}
      <div className="border-t-4 border-amarillo bg-[#061642]">
        <nav aria-label="Todas las secciones" className="mx-auto max-w-content px-4 pt-5 sm:px-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm font-semibold text-white/90 hover:text-amarillo hover:underline">
                  {s.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-4 text-xs text-white/60 sm:px-6 md:flex-row md:justify-between">
          <AvisoActualizacion datos={datos} className="text-white/60" />
          <p>
            Datos:{' '}
            <a href="https://lud-stats.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              LUD Stats
            </a>{' '}
            (estadísticas no oficiales de la Liga).
          </p>
        </div>
      </div>
    </footer>
  )
}
