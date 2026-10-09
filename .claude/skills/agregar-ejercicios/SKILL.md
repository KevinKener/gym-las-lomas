---
name: agregar-ejercicios
description: Suma videos nuevos de ejercicios a Las Lomas Gym. Los comprime, regenera el catálogo, valida nombres y formato, y deja todo listo para publicar. Usalo cuando el usuario dice que tiene videos nuevos, que el profe grabó ejercicios o que quiere actualizar el contenido.
argument-hint: "[carpeta de originales]"
allowed-tools: Read Grep Glob Bash(npm run catalog) Bash(npm run catalog *) Bash(npm test) Bash(ffprobe *)
---

# Agregar ejercicios

Seguí el flujo 2 de `docs/FLUJOS.md`. Carpeta de originales indicada: `$ARGUMENTS`
(si está vacía, usá `RAW_VIDEOS_DIR` del `.env`; si tampoco está, preguntala).

**Regla de oro (RN-09): nunca modificar, renombrar, mover ni borrar videos.** Si hay que renombrar algo,
se le muestra al usuario el cambio propuesto y lo hace él (o lo aprueba explícitamente).

## Pasos

1. **Ubicar las carpetas.** Leé `.env`: `RAW_VIDEOS_DIR` (originales) y `VIDEOS_DIR` (publicación).
   Confirmá que existen y que no son la misma carpeta. Listá los videos nuevos de los originales,
   es decir, los que todavía no tienen su `.mp4` en `VIDEOS_DIR`.

2. **Revisar los nombres antes de procesar.** Para cada video nuevo, revisá que:
   - el nombre coincida con lo que diría el cartel de rutina (RN-05);
   - no repita uno existente ni sea casi igual a otro (RN-06);
   - tenga categoría (RN-07): si está suelto en la carpeta, proponé en qué categoría de
     `contenido/categorias.json` va y agregalo ahí cuando el usuario lo confirme;
   - no sea un nombre genérico ("IMG_1234", "video nuevo").

   Si hay problemas, mostralos con el renombre propuesto y esperá la confirmación del usuario antes de seguir.

3. **Comprimir.** Verificá que haya ffmpeg (`ffmpeg -version`). Si no está, indicá `! sudo apt install ffmpeg`.
   Corré `npm run optimize -- "<originales>" "<VIDEOS_DIR>"` (pide permiso, es esperable).
   Solo procesa los videos nuevos o modificados.

4. **Regenerar y validar el catálogo.** Corré `npm run catalog`. Toda advertencia (`⚠`) se resuelve
   o se le explica al usuario. El build de publicación falla con advertencias (RN-22).

5. **Auditar.** Delegá al agente `curador-videos` una revisión de la carpeta completa.

6. **Verificar en el navegador.** Indicale al usuario que corra `npm run dev`, busque 2 o 3 de los ejercicios
   nuevos tal como están escritos en el cartel y reproduzca uno.

## Al terminar, informá

- Ejercicios agregados (nombre y categoría) y el peso antes/después de la compresión.
- Advertencias resueltas y pendientes.
- Próximo paso: `/publicar` cuando el usuario lo decida.
