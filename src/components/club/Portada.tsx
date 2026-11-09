import type { Categoria } from '@/lib/datos'

/** Foto del plantel (6000×4000) servida y achicada por Netlify Image CDN. */
const foto = (w: number) => `/.netlify/images?url=/img/portada.jpg&w=${w}&fm=webp&q=72`

export function Portada({ categorias }: { categorias: Categoria[] }) {
  return (
    <section id="inicio" aria-labelledby="titulo-portada" className="portada-csi relative isolate flex items-end overflow-hidden bg-azul text-white">
      <img
        src={foto(1600)}
        srcSet={`${foto(640)} 640w, ${foto(960)} 960w, ${foto(1600)} 1600w, ${foto(2400)} 2400w`}
        sizes="100vw"
        alt="El plantel de Colegio San Isidro abrazado en ronda sobre la cancha antes del partido"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_62%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-azul via-azul/35 to-azul/20" />
      <div aria-hidden="true" className="rayas absolute inset-y-0 right-0 -z-10 hidden w-1/3 opacity-60 lg:block" />
      <div className="mx-auto w-full max-w-content px-5 pb-20 sm:px-8 lg:pb-24">
        <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[.24em] uppercase">
          <span aria-hidden="true" className="h-1 w-12 -skew-x-12 bg-amarillo" /> Colegio San Isidro · Desde 2023
        </p>
        <h1 id="titulo-portada" className="max-w-4xl font-display text-[clamp(3.6rem,12vw,9.5rem)] leading-[.84] font-extrabold tracking-tight uppercase">
          LA ACTITUD
          <br />
          NO SE <span className="text-amarillo">NEGOCIA</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-white/35 pt-5">
          <p className="max-w-xs text-base text-white/85">
            {categorias.map((c) => c.nombre).join(' y ')} · Liga Universitaria de Deportes, Uruguay.
          </p>
          <a href="#fixture" className="border-b-2 border-amarillo pb-1.5 font-display text-xl font-bold tracking-wider uppercase hover:text-amarillo">
            Mirá el fixture ↘
          </a>
        </div>
      </div>
    </section>
  )
}
