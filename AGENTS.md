# AGENTS.md

Sitio de fútbol de **Colegio San Isidro** (Liga Universitaria de Deportes, Uruguay). Una sola página
(`src/routes/index.tsx`), en español de Uruguay (voseo: "mirá", "escribinos"), mobile-first, liviana.

## Arquitectura

```
data.json                        # Respaldo editable a mano; mismo formato que /api/datos
scripts/actualizar-data-json.ts  # Regenera data.json desde la fuente (node, TS sin build)
netlify/lib/lud.ts               # Descarga y normaliza la API de LUD Stats (onrender), incl. fichas
netlify/lib/almacen.ts           # Copia en Netlify Blobs (store "lud-datos"), aviso, purga de caché
netlify/functions/datos.mts      # GET /api/datos — sirve la copia (nunca espera a la fuente)
netlify/functions/lud-refresco.mts   # Background: descarga y guarda (la fuente es un free tier lento)
netlify/functions/lud-programado.mts # Cron martes y miércoles 15:00 UTC (12:00 UY) → dispara lud-refresco
src/lib/servidor.ts              # createServerFn: lee la copia guardada para el loader de la portada
src/lib/datos.ts                 # Tipos compartidos (Datos, Categoria, Partido, DetallePartido, Jugador…)
src/lib/formato.ts               # Fechas (America/Montevideo, UTC−3 fijo), Image CDN, Google Maps
src/components/club/*            # Secciones de la página
public/contacto-form.html        # Registro estático de Netlify Forms (form "contacto")
public/img/escudo.png, portada.jpg
```

## Decisiones no obvias

- La fuente es la API **no oficial** `https://lud-backend-ld7d.onrender.com/api`, equipo `id 39`.
  Temporada y fases se detectan solas por categoría (`CATEGORIAS` en `lud.ts`).
- La página se renderiza en el servidor con `loader: () => leerDatos()` (Blobs → `data.json`). La CDN la
  cachea con la etiqueta `lud-datos`; `refrescar()` la purga al guardar datos nuevos. No volver a importar
  `data.json` en código de cliente (pesa ~0,5 MB).
- Actualización solo por cron (martes y miércoles). `/api/datos` dispara un refresco únicamente si no hay
  ninguna copia en Blobs (primer despliegue).
- `desactualizado` = la última consulta falló, hay `avisos` de errores parciales o la copia tiene más de
  7,5 días (`HORAS_AVISO`). La fecha «Datos actualizados el…» se muestra siempre.
- Tablas: pestaña «Primera rueda» + la otra fase de la temporada con su nombre real de la fuente
  (2026: Sub 20 «Copa Plata», Mayores «Segunda Rueda Título»). No hardcodear nombres de copas.
- Institucional (dato del club, no de la fuente): Mayores juega la **Divisional F**. Las competiciones y
  tablas siguen mostrando la divisional que publica la fuente para 2026 (G). No mezclar.
- Fichas: `detalle.alineaciones.{local,visitante}` (titulares/suplentes con dorsal) + `detalle.eventos`.
  En los cambios, el que **entra** va en verde (`text-entra`, AA sobre blanco); el que sale, color normal.
  Minuto `null` o `0` → «Sin información» (la fuente usa 0 en rojas sin minuto). La fuente no publica amarillas.
- Sin información no equivale a cero. Nunca generar dorsales a partir del índice de jugadores.
- Toda tarjeta de resultado/fixture es el `DialogTrigger` de `FichaPartido`; no agregar botones «Ver ficha».
- Instagram aparece **solo** en Contacto. Menú y pie usan `SECCIONES` de `Encabezado.tsx`.
- Escudos remotos pasan por Netlify Image CDN (`remote_images` en `netlify.toml`).
- El formulario de contacto postea a `/contacto-form.html` (no a `/`, que es SSR).

## Convenciones

- Nombres de código y textos en español. Tailwind con variables de tema en `src/styles.css`
  (`azul`, `azul-vivo`, `azul-claro`, `amarillo`, `amarillo-suave`, `victoria`, `derrota`, `entra`).
- Identidad: azul de la camiseta, amarillo del escudo, rayas diagonales (`.rayas`, `.rayas-amarillas`).
- Títulos con `font-display` (Barlow Condensed) en mayúsculas; cuerpo en Barlow.
- No agregar dependencias pesadas.
- No ejecutar builds, servidores ni validaciones locales en este entorno: la plataforma valida el despliegue.
