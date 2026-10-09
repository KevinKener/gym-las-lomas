# Gym Las Lomas · Biblioteca de ejercicios

**🌐 En producción: https://gymlaslomas.pages.dev**

Web app para que los socios escaneen un QR en la pared y vean el video de cualquier ejercicio de su rutina.
Sin login, sin instalar nada: abre en el navegador del celular.

**Cómo se usa en el gym:** el socio lee el nombre del ejercicio en el cartel de su rutina, escanea el QR,
escribe el nombre (por ejemplo "sentadilla búlgara") y mira el video del profe.

## Qué incluye

- **Buscador tolerante**: ignora tildes y mayúsculas, acepta palabras incompletas (`sent bulg`),
  en cualquier orden, y errores de tipeo (`sentadila`, `jalon`).
- **Categorías** automáticas a partir de las subcarpetas (Piernas, Pecho, Espalda…).
- **Reproductor** a pantalla completa, en loop, con "Más de esta categoría" debajo.
- **Vistos recientemente**, guardado en el celular de cada socio.
- **Links directos** a cada ejercicio (`/#/e/sentadilla-bulgara`) y búsquedas (`/?q=remo`, `/?cat=Piernas`),
  para compartir por WhatsApp o, más adelante, poner un QR por rutina.
- Se puede **agregar a la pantalla de inicio** como app.
- **Cartel QR** listo para imprimir en A4.
- Ultra liviana: unos 13 KB en total (sin contar los videos). Carga al instante incluso con mala señal.

## Documentación

| Documento | Contenido |
|---|---|
| [Reglas de negocio](docs/REGLAS-DE-NEGOCIO.md) | Lo que el producto tiene que cumplir (`RN-01`…`RN-22`) |
| [Flujos](docs/FLUJOS.md) | Socio, carga de videos, publicación e instalación en el gym |
| [Arquitectura](docs/ARQUITECTURA.md) | Piezas, contrato de datos y decisiones técnicas |
| [Marca](docs/MARCA.md) | Logo, colores y tipografía del gimnasio |
| [Roadmap](docs/ROADMAP.md) | Próximas versiones |
| [Changelog](CHANGELOG.md) | Historial de cambios |

## Requisitos

- Node.js 20.12 o superior (`node -v`)
- ffmpeg viene incluido como dependencia (`ffmpeg-static`), no hace falta instalarlo aparte

## Puesta en marcha

```bash
npm install
cp .env.example .env    # y editá VIDEOS_DIR con la ruta de tu carpeta de videos
npm run dev             # abre http://localhost:5173
npm run check           # typecheck + tests
```

Desde WSL, una carpeta de Windows como `C:\Users\PC\Desktop\Videos Gym` se escribe
`/mnt/c/Users/PC/Desktop/Videos Gym`.

## Cómo organizar la carpeta de videos

```
Videos Gym/
├── Piernas/
│   ├── Sentadilla búlgara.mp4
│   ├── Sentadilla búlgara.jpg     ← miniatura (opcional, mismo nombre)
│   └── Prensa 45.mp4
├── Pecho/
│   └── Press de banca plano.mp4
└── Plancha abdominal.mp4          ← sin carpeta = sin categoría
```

- **El nombre del archivo es el nombre que ve el socio.** Conviene que coincida con lo que dice el cartel.
- Se aceptan `.mp4` (recomendado), `.webm`, `.m4v` y `.mov`.
- Se ignoran numeraciones al principio (`03_press banca.mp4` → "Press banca") y los `_` se toman como espacios.
- Para agregar o cambiar un ejercicio: modificás la carpeta y volvés a publicar. No hay que tocar código.

## Comprimir los videos (muy recomendado)

Un video grabado con el celular pesa 50-200 MB. Para que cargue rápido con datos móviles conviene
llevarlo a 720p:

```bash
npm run optimize -- "/mnt/c/.../Videos originales" "/mnt/c/.../Videos Gym"
```

Nunca toca los originales. Genera en la carpeta destino un `.mp4` liviano (suele quedar 5-15 veces más chico)
y una miniatura `.jpg` de cada ejercicio, respetando las subcarpetas. Si lo volvés a correr, solo procesa los videos nuevos.

## Publicar

La web está en **Cloudflare Pages**, proyecto `gymlaslomas` → https://gymlaslomas.pages.dev

```bash
npm run build                      # catálogo estricto + typecheck + build, copia los videos a dist/
set -a && . ./.env && set +a       # carga CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID
npx wrangler pages deploy dist --project-name gymlaslomas --branch main
```

O, desde Claude Code: `/publicar`.

- Solo se suben los archivos que cambiaron, así que agregar videos tarda segundos o minutos.
- La función `functions/videos/[[path]].ts` hace que los videos se puedan pedir por partes, sin lo cual no se reproducen en iPhone (D-10).
- Credenciales: si `npx wrangler login` no funciona (pasa en WSL), usá un token con el permiso `Cloudflare Pages · Edit` en `.env` (ver `.env.example`).
- Para volver a una versión anterior: panel de Cloudflare → Workers & Pages → gymlaslomas → Deployments → *Rollback*.

### Dominio propio (opcional)

Desde el panel de Cloudflare Pages → *Custom domains* se puede sumar algo como `ejercicios.gymlaslomas.com.ar`.
`gymlaslomas.pages.dev` sigue funcionando igual, así que los QR ya impresos no se rompen.

## El QR y el cartel

```bash
npm run qr -- https://laslomasgym.pages.dev
```

Genera en `qr/`:

- `cartel.html`: cartel A4 con la marca, el QR e instrucciones. Abrilo en el navegador e imprimí
  (activá "Gráficos de fondo" en las opciones de impresión).
- `qr.png` (1600 px) y `qr.svg` para usar en otros diseños.

El QR tiene corrección de errores alta, así que se sigue leyendo aunque se ensucie o se raye un poco.

## Probar desde el celular antes de publicar

`npm run dev` también sirve en la red local (Vite muestra la URL "Network").
En WSL2 la red local no llega directo a Linux: lo más fácil es activar
`networkingMode=mirrored` en `%UserProfile%\.wslconfig` y reiniciar WSL, o probar con `npm run build && npm run preview`
después de publicar una versión de prueba.

## Estructura del proyecto

```
index.html                estructura de la página
src/main.ts               lista, buscador, reproductor, historial y recientes
src/search.ts             búsqueda tolerante (lógica pura, con tests)
src/styles.css            estilos (mobile first)
scripts/catalog-lib.mjs   reglas del catálogo (lógica pura, con tests)
scripts/catalog.mjs       lee la carpeta de videos y genera public/catalog.json
scripts/optimize.mjs      comprime videos y genera miniaturas (ffmpeg)
scripts/qr.mjs            genera el QR y el cartel imprimible
tests/                    tests con node:test (npm test)
docs/                     reglas de negocio, flujos, arquitectura, roadmap
vite.config.ts            sirve la carpeta de videos en desarrollo y la copia al build
public/_headers           reglas de caché para Cloudflare Pages
.claude/                  configuración de Claude Code (ver abajo)
```

## Trabajar con Claude Code

El proyecto viene configurado para [Claude Code](https://claude.com/claude-code). `CLAUDE.md` tiene las reglas
que Claude sigue siempre, y en `.claude/` están:

| | Nombre | Para qué |
|---|---|---|
| Skill | `/agregar-ejercicios [carpeta]` | Suma videos nuevos: revisa nombres, comprime, regenera y valida el catálogo |
| Skill | `/publicar [nota]` | Controles, deploy y verificación. Solo corre si lo pedís |
| Skill | `/generar-cartel [url]` | QR y cartel A4 con el checklist de impresión |
| Skill | `/nueva-funcionalidad <idea>` | Diseña e implementa una feature respetando reglas y roadmap |
| Agente | `revisor-reglas` | Revisa cambios contra las reglas de negocio |
| Agente | `revisor-ux-movil` | Revisa UI y textos para el celular dentro del gym |
| Agente | `curador-videos` | Audita nombres, duplicados, formatos y pesos de los videos |
| Hook | `check.mjs` | Corre typecheck y tests cada vez que Claude edita código |
| Permisos | `settings.json` | Comandos seguros sin preguntar; deploy, push e instalar paquetes piden confirmación; borrar en `/mnt` está bloqueado |

Para preferencias personales que no se comparten con el equipo, usá `.claude/settings.local.json` (está en `.gitignore`).

## Ideas para próximas versiones

- QR por rutina: un cartel por rutina que abra directo sus ejercicios (`/?cat=Rutina A`).
- Panel para que el profe suba videos desde el celular, sin pasar por la PC.
- Estadísticas de qué ejercicios se miran más (Cloudflare Web Analytics es gratis y no usa cookies).
- Descripción, músculos trabajados y tips del profe en cada ejercicio.
- Modo offline (guardar en el celular los videos que el socio ya vio).
