# Colegio San Isidro Universitario · Fútbol LUD

Sitio web del equipo de fútbol de **Colegio San Isidro** (fundado en 2023) en la Liga Universitaria de
Deportes de Uruguay: **Sub 20 – Divisional C** y **Mayores – Divisional F**.

Una sola página pensada primero para celular, en español de Uruguay:

| Sección | Qué muestra |
| --- | --- |
| Inicio | Foto del plantel a pantalla completa y la frase «LA ACTITUD NO SE NEGOCIA» |
| Próximo partido | Cinta a lo ancho con fecha, hora, cancha, rivales y escudos (primer partido pendiente por fecha) |
| Resultados | Carrusel horizontal con flechas y puntitos; cada tarjeta abre la ficha |
| Fixture | Tarjetas por fase; toda la tarjeta abre la ficha del partido |
| Ficha del partido | Marcador, fecha, cancha, fase, titulares, goles, cambios (entra en verde) y tarjetas de ambos equipos |
| Tablas | Pestañas Primera rueda / segunda fase con el nombre real de la Liga |
| Plantel y estadísticas | Goles, minutos y partidos por jugador; foto o avatar con dorsal e iniciales |
| Directores técnicos | Mayores: Fabrizio Borsani · Sub-20: Martín Guigou |
| El club | Nombre, fundación, categorías y divisionales |
| Contacto | Instagram [@san_isidro_universitario](https://www.instagram.com/san_isidro_universitario/) y formulario (Netlify Forms) |

Un selector permite pasar de Sub 20 a Mayores en todas las secciones de datos.

## Tecnología

TanStack Start (React 19, render en el servidor) + Tailwind CSS 4, Netlify Functions (incluida una
función programada y una en segundo plano), Netlify Blobs, Netlify Image CDN y Netlify Forms.

## Cómo funciona la actualización automática

La fuente es [LUD Stats](https://lud-stats.vercel.app/) (sitio **no oficial**). Esa página se arma con
JavaScript y saca los datos de una API pública: `https://lud-backend-ld7d.onrender.com/api`
(Colegio San Isidro es el equipo `id 39`). La web **nunca** consulta esa API desde el navegador.

| Endpoint | Para qué |
| --- | --- |
| `/teams/39/matches/` | Todos los partidos (fixture, resultados, próximo partido) |
| `/standings/by-phase/{faseId}/` | Tablas de cada fase de la temporada |
| `/matches/{id}/` y `/matches/{id}/events/` | Fichas: cancha, titulares y dorsales, goles, cambios y tarjetas |
| `/teams/39/season-players/` | Plantel con partidos, minutos y goles |
| `/weekend-fixture/` | Hora y cancha de los partidos del fin de semana |

1. **`netlify/functions/lud-programado.mts`** (función programada) corre los **martes y miércoles a las
   12:00 de Uruguay**. Uruguay está en UTC−3 todo el año y el cron de Netlify funciona en UTC, por eso el
   cron es `0 15 * * 2,3` (15:00 UTC). Para cambiar la hora, sumá 3 a la hora uruguaya.
2. Esa función dispara **`lud-refresco`** (en segundo plano, hasta 15 min, porque la API es un servidor
   gratuito que tarda en despertar). Descarga todo, lo normaliza (`netlify/lib/lud.ts`) y guarda la copia
   en **Netlify Blobs** (`netlify/lib/almacen.ts`). Después invalida la caché de la CDN.
3. La página se arma en el servidor leyendo **la copia guardada** (no espera a LUD Stats), así carga
   rápido aunque la fuente esté caída. `GET /api/datos` devuelve el mismo contenido en JSON.
4. Si LUD Stats falla o cambia de formato, se conserva la última copia buena y se marca un aviso discreto.
   Siempre se muestra al pie de los datos «Datos actualizados el [fecha]».
5. Si nunca se pudo guardar nada en Blobs, se usa **`data.json`** (raíz del proyecto). La página nunca queda vacía.

Donde la fuente no publica un dato (cancha, minuto, tarjetas amarillas, planilla) se muestra
**«Sin información»**. No se inventan ni deducen datos. Nota: LUD Stats publica las rojas con minuto 0
cuando no lo informa; eso se muestra como «Sin información».

## Cómo editar `data.json` (respaldo manual)

`data.json` tiene exactamente el formato que devuelve `/api/datos` (tipos en `src/lib/datos.ts`).
La web usa la copia **más nueva** entre la guardada en Blobs y `data.json`, comparando el campo `"actualizado"`.

- Para corregir o cargar algo a mano: editá el archivo, poné en `"actualizado"` la fecha y hora reales
  de tu revisión (formato ISO, ej. `"2026-11-10T15:00:00.000Z"`) y, si querés, `"fuente": "manual"`. Publicá.
- Partidos: `categorias[].partidos[]` (`estado`: `"jugado"` o `"programado"`; `fecha` en hora de Uruguay, `"2026-11-14T15:30:00"`).
- Fichas: `partidos[].detalle.eventos[]` con `tipo` (`goal`, `substitution`, `yellow_card`, `red_card`),
  `minuto`, `equipo` (id del equipo), `jugador`, `entra`, `sale`; y `detalle.alineaciones.local|visitante[]`.
- Tablas: `categorias[].tablas[]` (`{ fase, filas }`). Plantel: `categorias[].plantel[]` (podés agregar `foto` con una URL o `/img/...`).
- Usá JSON válido (sin comentarios ni comas finales) y números como números. Los valores desconocidos van en `null`.
- La próxima actualización automática que funcione reemplaza la copia de Blobs con datos nuevos de la fuente.

Para regenerar `data.json` desde la fuente: `node scripts/actualizar-data-json.ts` (Node 22.18 o más nuevo).

## Personalizar

- Escudo: `public/img/escudo.png` · Foto de portada: `public/img/portada.jpg` (se recorta sola, sin deformarse).
- Frase de portada: `src/components/club/Portada.tsx` · Técnicos y datos del club: `src/components/club/Institucion.tsx`.
- Instagram: `src/components/club/Instagram.tsx` (se usa solo en Contacto). Colores: `src/styles.css`.

## Correr localmente

```bash
pnpm install
netlify dev --port 8889   # sitio + funciones + Blobs + Image CDN emulados
```

## Desplegar en Netlify

El repositorio está conectado a Netlify: cada cambio en la rama `main` se publica solo. `netlify.toml`
define la compilación (`pnpm install --frozen-lockfile --prod=false && pnpm run build`) y la salida
`dist/client`; el adaptador de TanStack Start despliega la página y las funciones. No hacen falta claves
para LUD Stats. La función programada solo corre en el sitio publicado (no en vistas previas). Para forzar
una actualización sin esperar al martes, en el panel de Netlify andá a *Functions → lud-programado → Run now*.
