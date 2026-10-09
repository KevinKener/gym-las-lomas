# Changelog

Cambios visibles para el gimnasio y sus socios. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.2] - 2026-10-09

189 ejercicios en 8 categorías.

### Cambiado
- "Peso muerto asimétrico con mancuernas": queda una sola versión (la segunda toma, del 07/05).

## [1.0.1] - 2026-10-09

### Agregado
- Cloudflare Web Analytics (anónimo, sin cookies).
- Repositorio documentado para GitHub: README con capturas, CI (typecheck + tests), licencia privada.

## [1.0.0] - 2026-10-09

Primera publicación en https://gymlaslomas.pages.dev · 190 ejercicios en 8 categorías.

### Agregado
- Soporte de pedidos parciales de video en Cloudflare Pages (necesario para reproducir en iPhone).
- Página 404 con la marca.

## Desarrollo previo a 1.0.0

### Agregado
- Nuevo inicio: buscador, vistos recientemente y grupos musculares con foto. Ya no se muestran los 190 ejercicios de entrada;
  la lista completa está en "Ver todos los ejercicios".
- Vista por grupo muscular con su propio buscador, y botón atrás que vuelve a la misma altura de la lista.
- Orden de los grupos configurable en `contenido/categorias.json`.

### Cambiado
- La barra del buscador ahora es sólida (la lista ya no se ve por detrás) y no tiene la fila de categorías fija.
- Botón de cámara lenta (0,5×) en el reproductor. Silencia el video mientras está activa, para que no se escuche la música distorsionada.
- Resaltado de lo que coincide con la búsqueda en la lista de resultados.
- "¿Quisiste decir…?" con sugerencias cuando la búsqueda no encuentra nada.
- Indicador de carga sobre el video. Si el video se traba más de 15 s, se muestra un error con "Reintentar".
- Accesibilidad: avisos para lectores de pantalla (sin resultados, historial borrado, cargando video), bordes de controles
  con contraste 3:1, zonas táctiles de 44 px, foco visible y sin abrir el teclado después de "Deshacer".
- Identidad visual del Gym Las Lomas: logo vectorial, blanco y negro, tipografía Oswald. Aplicada a la web, el favicon y el cartel QR.
- Biblioteca de ejercicios con buscador tolerante a tildes, palabras incompletas y errores de tipeo.
- Filtros por categoría a partir de las subcarpetas de videos.
- Reproductor a pantalla completa, en loop, con ejercicios relacionados y botón para compartir.
- "Vistos recientemente", guardado solo en el celular del socio, con botón para borrarlo y opción de deshacer.
- Links directos a ejercicios (`/#/e/<id>`) y a búsquedas (`/?q=`, `/?cat=`).
- Compresión de videos a 720p con miniaturas (`npm run optimize`), con conversión de color HDR→SDR para videos de iPhone. ffmpeg incluido en el proyecto.
- Generador de QR y cartel A4 para imprimir (`npm run qr`).
- Validaciones del catálogo: nombres repetidos, formatos y pesos fuera de norma.
- 190 ejercicios del profe organizados en 8 categorías (`contenido/categorias.json`).
- Aviso de videos que parecen copias o segundas tomas ("(2)", "copia"), y lista de pendientes de revisión (`contenido/revisar.json`) para publicarlos igual con un nombre prolijo.
- Corrección de 4 nombres de archivo con errores de tipeo.
- Documentación de reglas de negocio, flujos y arquitectura.
