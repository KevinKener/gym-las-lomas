---
name: publicar
description: Publica una nueva versión de Las Lomas Gym en Cloudflare Pages, con todos los controles previos y la verificación posterior. Solo se ejecuta cuando el usuario lo pide.
disable-model-invocation: true
argument-hint: "[nota de la versión]"
allowed-tools: Read Grep Glob Bash(npm run check) Bash(npm run build) Bash(git status) Bash(git diff *) Bash(git log *)
---

# Publicar

Flujo 3 de `docs/FLUJOS.md`. Nota de la versión: `$ARGUMENTS`

**Esto lo ven los socios del gimnasio en sus celulares.** No te saltees pasos. Si algo falla, frená y explicá.

## 1. Controles previos

1. `git status`: si hay cambios sin commitear, avisá y preguntá si se publica igual.
2. `npm run check`: typecheck + tests. Si falla, no se publica.
3. `npm run build`: incluye el catálogo en modo estricto. Si hay advertencias de contenido, no se publica (RN-22).
4. Revisá la salida del build:
   - JS + CSS en gzip por debajo de 50 KB (RN-18).
   - Con `COPY_VIDEOS=1`: que `dist/videos/` tenga la cantidad de videos esperada y que ninguno pase los 25 MB.
   - Con R2 (`VIDEO_BASE_URL` absoluta): que los videos ya estén subidos al bucket. Probá uno con
     `curl -sI "<VIDEO_BASE_URL><ruta>"` y verificá que responda 200.
5. Si hubo cambios de UI o de comportamiento desde la última publicación, confirmá que pasaron por
   `revisor-ux-movil` y `revisor-reglas`. Si no, ejecutalos ahora.

## 2. Confirmación

Mostrale al usuario un resumen: cantidad de ejercicios, cambios desde la última versión (`CHANGELOG.md`, `git log`)
y la URL de destino. **Pedí confirmación explícita antes de hacer el deploy.**

## 3. Deploy

```bash
npx wrangler pages deploy dist --project-name <proyecto>
```

El nombre del proyecto sale de lo que haya indicado el usuario o de una publicación anterior; si no lo sabés, preguntalo.
Si wrangler no está autenticado, indicale al usuario: `! npx wrangler login`.

## 4. Verificación posterior

1. `curl -s <URL>/catalog.json` y comprobá que `exercises.length` coincida con lo que se publicó.
2. Pedile al usuario que, **desde un celular**, escanee el QR o abra la URL, busque 2 o 3 ejercicios y reproduzca uno.
3. Si algo anda mal: desde el panel de Cloudflare Pages → Deployments se puede volver a la versión anterior al instante.

## 5. Registro

Agregá la entrada en `CHANGELOG.md` con la fecha, la nota de la versión y la cantidad de ejercicios.
