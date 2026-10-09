---
name: nueva-funcionalidad
description: Guía para diseñar e implementar una funcionalidad nueva en Las Lomas Gym respetando las reglas de negocio, la arquitectura y el roadmap. Usalo cuando el usuario pide agregar algo nuevo a la web (rutinas, sinónimos, estadísticas, panel para profes, etc.).
argument-hint: "<qué funcionalidad>"
---

# Nueva funcionalidad: $ARGUMENTS

## 1. Entender antes de programar

1. Leé `docs/ROADMAP.md`: ¿ya está planificada? ¿en qué versión?
2. Leé `docs/REGLAS-DE-NEGOCIO.md` y listá qué reglas toca.
   - **Si choca con una regla** (por ejemplo, necesita login de socios, datos personales o un backend),
     frená y explicale al usuario el conflicto, con alternativas que no lo rompan. No sigas sin una decisión.
3. Leé `docs/ARQUITECTURA.md`, sobre todo las decisiones D-XX. Si la funcionalidad obliga a revertir una
   (por ejemplo, sumar un framework o un backend), proponé la nueva decisión explicando por qué.
4. Pensá en el socio dentro del gym: ¿le ahorra tiempo o le agrega pasos?

## 2. Proponer

Antes de escribir código, presentale al usuario en pocas líneas:
- qué ve y hace el socio (o el profe/administrador);
- qué archivos se tocan;
- qué reglas se agregan o cambian;
- el impacto en el peso de la web.

Para algo chico y claro alcanza con explicarlo y seguir. Para algo grande, esperá el visto bueno.

## 3. Implementar

- La lógica pura va en un módulo separado del DOM (como `src/search.ts`), con tests en `tests/`.
- Escribí primero el test que representa la regla de negocio y después el código.
- Los textos visibles van en voseo (RN-17). Mobile first (RN-18).
- Si los datos salen de la carpeta de videos, se agregan en `scripts/catalog-lib.mjs` y se actualiza el
  contrato en `src/types.ts` y en `docs/ARQUITECTURA.md`.
- El hook corre typecheck y tests en cada edición: no dejes errores pendientes.

## 4. Revisar

1. `npm run check` y `npm run build`.
2. Delegá en paralelo a `revisor-reglas` y, si hay UI, a `revisor-ux-movil`. Corregí lo bloqueante.

## 5. Documentar

- `docs/REGLAS-DE-NEGOCIO.md`: reglas nuevas con el siguiente número libre (nunca se reutiliza un número).
- `docs/FLUJOS.md` si cambia un flujo, `docs/ARQUITECTURA.md` si hay una decisión nueva (D-XX).
- `docs/ROADMAP.md`: marcarla como hecha.
- `CHANGELOG.md`: entrada en "Sin publicar".
- `README.md` si cambia cómo se usa.
