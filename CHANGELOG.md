# Changelog

Cambios visibles para el gimnasio y sus socios. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Sin publicar]

403 ejercicios en 9 categorías.

### Cambiado
- Encabezado del inicio más ordenado: logo, titular y debajo "403 videos · 9 grupos musculares", todo centrado.

## [1.1.0] - 2026-10-21

403 ejercicios en 9 categorías.

### Agregado
- Categoría nueva **Elongación y automasaje**, con 36 ejercicios de elongación y masaje con rolo o pelotita.
- 76 ejercicios nuevos más: saltos (bound, hop, jump, pogo), skipping, técnica de carrera, equilibrio,
  estocadas y sentadillas con barra, cuadricera, planchas en cajón, vuelos frontales y más.
  Con la música del gym de fondo, como el resto.

### Cambiado
- "Peso muerto con mancuerna": se reemplazó el video por una toma nueva.
- Si un grupo muscular queda solo en la última fila, ocupa todo el ancho en vez de dejar un hueco.
- Los nombres largos de grupos y ejercicios cortan la línea de forma pareja.
- Mientras cargan los ejercicios se ve la grilla de grupos en gris, en vez de un círculo girando.
- Tocar dos veces rápido un botón ya no agranda la página.
- Con "reducir movimiento" activado en el celular, las tarjetas no se achican al tocarlas.
- Tamaños de letra más parejos en toda la web (de 11 tamaños distintos a 7).
- Inicio renovado: titular "¿Qué te toca entrenar hoy?", la cantidad de videos arriba y una grilla con
  "Piernas y glúteos" destacado. Cada grupo tiene una flecha para entrar.
- Animaciones suaves: al tocar un grupo, su nombre se transforma en el título de la pantalla; al tocar un ejercicio,
  el video crece desde su foto; las tarjetas y filas aparecen al bajar y el encabezado se desvanece al scrollear.
  Si el celular tiene "reducir movimiento" activado, no hay animaciones.
- Cámara lenta rediseñada: un botón compacto "Lenta 0,5×" sobre el video, arriba a la derecha, que se pone blanco
  cuando está activa. Reemplaza al botón de abajo, que dejaba un espacio vacío.

## [1.0.7] - 2026-10-13

291 ejercicios en 8 categorías.

### Cambiado
- Las fotos de los grupos musculares aparecen antes al entrar.
- El reproductor ya no "salta" cuando termina de cargar el video: el botón de cámara lenta queda quieto.
- Tocar un ejercicio abre el video un poco más rápido: los relacionados se arman después de mostrarlo.

## [1.0.6] - 2026-10-12

291 ejercicios en 8 categorías.

### Cambiado
- La búsqueda entiende la "/" de los carteles como "o": "Dominadas / Dorsalera" muestra los dos.
- "Nórdico negativo": se corrigió el nombre del archivo (sobraba un "(2)"). El socio ve lo mismo.

## [1.0.5] - 2026-10-12

291 ejercicios en 8 categorías.

### Agregado
- 104 ejercicios nuevos: sentadillas, estocadas, saltos, gemelos, planchas, bicho muerto, perro volador,
  press Pallof, halos, ejercicios de letras (T, Y, W) y más. Con la música del gym de fondo, como el resto.

### Cambiado
- La búsqueda encuentra los ejercicios con letras sueltas: "T Y" ya no se confunde con "T W".

## [1.0.4] - 2026-10-09

187 ejercicios en 8 categorías.

### Cambiado
- "Peso muerto con mancuernas": queda una sola versión (la segunda toma, del 07/05).
- "Movilidad de tobillo piso": queda una sola versión (la original).
- La segunda toma de "Movilidad de hombros bastón" pasa a ser un ejercicio propio: "Movilidad de hombros meñique pulgar".

## [1.0.3] - 2026-10-09

189 ejercicios en 8 categorías.

### Cambiado
- Cuando se reemplaza un video manteniendo el nombre, los celulares muestran el nuevo enseguida
  (antes podían seguir viendo el anterior hasta 7 días).

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
