import { Seccion } from './Seccion'

const TECNICOS = [
  { categoria: 'Mayores', nombre: 'Fabrizio Borsani' },
  { categoria: 'Sub-20', nombre: 'Martín Guigou' },
]

const DATOS_CLUB = [
  ['Nombre', 'Colegio San Isidro'],
  ['Fundación', '2023'],
  ['Sub 20', 'Liga Universitaria de Deportes · Divisional C'],
  ['Mayores', 'Liga Universitaria de Deportes · Divisional F'],
] as const

/** Directores técnicos y datos del club (información proporcionada por el club). */
export function Institucion() {
  return (
    <>
      <Seccion id="tecnicos" antetitulo="Los que marcan el rumbo" titulo="Directores técnicos" className="bg-azul-claro">
        <div className="grid gap-4 md:grid-cols-2">
          {TECNICOS.map((t) => (
            <article key={t.nombre} className="rayas relative overflow-hidden rounded-2xl bg-azul p-6 text-white sm:p-8">
              <p className="mb-3 inline-block -skew-x-6 bg-amarillo px-2 py-0.5 text-xs font-bold tracking-widest text-azul uppercase">
                <span className="inline-block skew-x-6">{t.categoria}</span>
              </p>
              <h3 className="font-display text-4xl leading-none font-extrabold uppercase sm:text-5xl">{t.nombre}</h3>
              <p className="mt-2 text-sm text-white/75">Director técnico</p>
            </article>
          ))}
        </div>
      </Seccion>
      <Seccion id="club" antetitulo="Nuestra historia recién empieza" titulo="El club" className="bg-white">
        <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-display text-5xl leading-[.9] font-extrabold text-azul uppercase sm:text-6xl">
              Colegio
              <br />
              San Isidro<span className="text-amarillo">.</span>
            </p>
            <p className="mt-6 max-w-md text-lg">
              Desde 2023 defendemos la misma camiseta en la Liga Universitaria de Deportes de Uruguay: Sub 20 en la
              Divisional C y Mayores en la Divisional F.
            </p>
          </div>
          <dl className="divide-y divide-border border-y-2 border-azul">
            {DATOS_CLUB.map(([titulo, valor]) => (
              <div key={titulo} className="grid grid-cols-[96px_1fr] gap-4 py-4">
                <dt className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{titulo}</dt>
                <dd className="font-semibold text-azul">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Seccion>
    </>
  )
}
