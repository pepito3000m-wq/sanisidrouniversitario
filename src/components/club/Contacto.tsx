import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { INSTAGRAM_URL, INSTAGRAM_USUARIO, IconoInstagram } from './Instagram'
import { Seccion } from './Seccion'

type Estado = 'inicial' | 'enviando' | 'enviado' | 'error'

function FormularioContacto() {
  const [estado, setEstado] = useState<Estado>('inicial')

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (estado === 'enviando') return
    const cuerpo = new URLSearchParams()
    new FormData(event.currentTarget).forEach((v, k) => cuerpo.append(k, String(v)))
    const form = event.currentTarget
    setEstado('enviando')
    try {
      const res = await fetch('/contacto-form.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) throw new Error('Error al enviar')
      if (/\bdata-netlify\s*=/i.test(await res.text())) throw new Error('Formularios no disponibles')
      form.reset()
      setEstado('enviado')
    } catch {
      setEstado('error')
    }
  }

  return (
    <form
      name="contacto"
      method="POST"
      action="/contacto-form.html"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={enviar}
      onChange={() => {
        if (estado !== 'enviando') setEstado('inicial')
      }}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border sm:p-8"
    >
      <input type="hidden" name="form-name" value="contacto" />
      <p hidden>
        <label>
          No completar <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <h3 className="font-display text-3xl font-extrabold text-azul uppercase">Escribinos</h3>
      <p className="mt-1 text-muted-foreground">¿Querés sumarte, sponsorear o coordinar un amistoso? Dejanos tu mensaje.</p>
      <fieldset disabled={estado === 'enviando'} className="mt-6 space-y-4">
        <legend className="sr-only">Datos de contacto</legend>
        <div className="space-y-1.5">
          <Label htmlFor="c-nombre">Nombre</Label>
          <Input id="c-nombre" name="nombre" autoComplete="name" required maxLength={100} className="h-11 bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" autoComplete="email" required maxLength={254} className="h-11 bg-white" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-mensaje">Mensaje</Label>
          <Textarea id="c-mensaje" name="mensaje" required maxLength={2000} rows={4} className="bg-white" />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-azul font-display text-lg font-bold tracking-[0.12em] text-white uppercase hover:bg-azul-vivo focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60"
        >
          <Send className="size-4" aria-hidden="true" />
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </fieldset>
      {estado === 'enviado' && (
        <p role="status" className="mt-4 rounded-lg bg-victoria/10 p-3 text-sm font-semibold text-victoria">
          ¡Gracias! Recibimos tu mensaje y te respondemos a la brevedad.
        </p>
      )}
      {estado === 'error' && (
        <p role="alert" className="mt-4 rounded-lg bg-derrota/10 p-3 text-sm font-semibold text-derrota">
          No pudimos enviar el mensaje. Tus datos siguen acá; probá de nuevo en un rato o escribinos por Instagram.
        </p>
      )}
    </form>
  )
}

export function Contacto() {
  return (
    <Seccion id="contacto" antetitulo="Seguinos y escribinos" titulo="Contacto">
      <div className="grid gap-5 lg:grid-cols-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-azul p-6 text-white sm:p-8"
        >
          <div aria-hidden="true" className="absolute -right-16 -bottom-16 size-64 rounded-full border-[28px] border-amarillo/20" />
          <IconoInstagram className="size-10 text-amarillo" />
          <div className="relative mt-10">
            <p className="text-xs font-bold tracking-[0.2em] text-amarillo uppercase">Instagram</p>
            <p className="mt-1 font-display text-3xl font-extrabold break-all sm:text-4xl">@{INSTAGRAM_USUARIO}</p>
            <p className="mt-3 max-w-sm text-white/80">
              Fotos de los partidos, convocatorias y todas las novedades del equipo.
            </p>
            <span className="mt-6 inline-flex h-12 items-center rounded-lg bg-amarillo px-6 font-display text-lg font-bold tracking-[0.12em] text-azul uppercase transition-colors group-hover:bg-white motion-reduce:transition-none">
              Seguinos
            </span>
          </div>
        </a>
        <FormularioContacto />
      </div>
    </Seccion>
  )
}
