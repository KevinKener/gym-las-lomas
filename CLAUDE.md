# Las Lomas Gym · Biblioteca de ejercicios

Web estática para que los socios de Gym Las Lomas escaneen un QR y vean el video de cada ejercicio
de su rutina. Sin login, sin backend. Es una propuesta real para un cliente: calidad de producción.

## Contexto que hay que leer

- Reglas de negocio (obligatorias, se citan como `RN-XX`): @docs/REGLAS-DE-NEGOCIO.md
- Arquitectura, contrato de `catalog.json` y decisiones técnicas (`D-XX`): `docs/ARQUITECTURA.md`
- Flujos de socio, profe/administrador y publicación: `docs/FLUJOS.md`
- Identidad visual (logo, colores, tipografía): `docs/MARCA.md`. No inventar colores ni fuentes fuera de esa guía
- Qué viene después: `docs/ROADMAP.md`

## Comandos

```bash
npm run dev          # genera catálogo + servidor en :5173 (sirve VIDEOS_DIR en /videos/)
npm run check        # typecheck + tests. Correr antes de dar algo por terminado
npm test             # tests (node:test, sin dependencias extra)
npm run catalog      # regenera public/catalog.json desde VIDEOS_DIR
npm run build        # catálogo estricto (falla con advertencias) + typecheck + build a dist/
npm run optimize -- <originales> <destino>   # comprime videos (requiere ffmpeg)
npm run qr -- <url>  # genera qr/ con el cartel A4
```

La configuración local está en `.env` (ver `.env.example`). En WSL las carpetas de Windows están en `/mnt/c/...`.

## Reglas para trabajar en este repo

### Lo que no se negocia
- **Nunca modificar, mover ni borrar videos** de la carpeta de originales ni de `VIDEOS_DIR` (RN-09).
  Para cambiar un video se le pide al usuario. `optimize` siempre escribe en otra carpeta.
- **Nada de login, cuentas, cookies de seguimiento ni datos personales** del socio (RN-01, RN-02).
  Si una funcionalidad lo necesita, se frena y se consulta.
- **No publicar ni hacer deploy sin pedido explícito.** Publicar afecta a los socios reales del gimnasio.
- **No editar `public/catalog.json` a mano**: es generado (RN-21).
- Si un cambio contradice una regla de negocio, primero se propone cambiar `docs/REGLAS-DE-NEGOCIO.md`
  y el usuario lo aprueba. Nunca se rompe una regla en silencio.

### Código
- TypeScript estricto, sin frameworks ni librerías de UI (D-02). Antes de sumar una dependencia de runtime,
  justificarla: la web tiene que pesar menos de 50 KB gzip (RN-18).
- `src/search.ts` y `scripts/catalog-lib.mjs` son lógica pura: todo cambio ahí va con su test en `tests/`.
- La lógica de negocio nueva se escribe pura y testeable, separada del DOM y del disco.
- Seguir el estilo existente: funciones chicas, nombres en inglés en el código, comentarios en español
  y solo cuando explican el porqué (citando la `RN-XX` si aplica).
- Si cambia el contrato de `catalog.json`, actualizar a la vez `src/types.ts`, `scripts/catalog-lib.mjs` y `docs/ARQUITECTURA.md`.

### Textos e interfaz
- Todo texto visible para el socio va en **español rioplatense con voseo**: "Buscá", "Probá", "Escaneá" (RN-17).
- Mobile first: zonas táctiles ≥ 44 px, inputs ≥ 16 px, probar a 360 px de ancho (RN-18).
- Los errores se explican en lenguaje simple y ofrecen una salida (RN-13, RN-20).

### Definición de terminado
1. `npm run check` pasa.
2. Si tocó UI: revisado con el agente `revisor-ux-movil`.
3. Si tocó comportamiento: revisado con el agente `revisor-reglas`.
4. Si cambió algo visible para el gimnasio: entrada en `CHANGELOG.md`.
5. Si cambió una regla, un flujo o la arquitectura: docs actualizados.

## Herramientas de Claude Code del proyecto

| Tipo | Nombre | Para qué |
|---|---|---|
| Skill | `/agregar-ejercicios` | Flujo completo para sumar videos nuevos (optimizar, catalogar, validar) |
| Skill | `/publicar` | Checklist de publicación. Solo se ejecuta si el usuario lo pide |
| Skill | `/generar-cartel` | QR + cartel A4 para imprimir |
| Skill | `/nueva-funcionalidad` | Cómo encarar una feature nueva respetando reglas y roadmap |
| Agente | `revisor-reglas` | Revisa un cambio contra las reglas de negocio |
| Agente | `revisor-ux-movil` | Revisa UI y textos pensando en el celular dentro del gym |
| Agente | `curador-videos` | Audita la carpeta de videos: nombres, duplicados, formatos, pesos |

Hook: después de cada edición de `.ts`/`.mjs` corre el typecheck y los tests automáticamente (`.claude/hooks/check.mjs`).
