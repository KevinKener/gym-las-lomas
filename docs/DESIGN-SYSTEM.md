# Design system

Cómo se ve y se comporta la web de Gym Las Lomas. Parte de la marca (`docs/MARCA.md`) y de las reglas de
experiencia (`RN-17` a `RN-20`), y las baja a tokens y componentes concretos. Los tokens están definidos en
`:root` al principio de `src/styles.css`.

**Regla de uso:** los componentes usan solo tokens. No se escriben colores, tamaños de letra, radios, tiempos
ni capas sueltos. Si hace falta un valor nuevo, primero se suma acá y en `:root`, con su motivo.

## Principios

1. **El celular, dentro del gym.** Una mano ocupada, mala señal, apuro entre series. Todo lo que se toca mide
   44 px o más, el texto que se escribe es de 16 px o más, y la web pesa menos de 50 KB comprimida (RN-18).
2. **La marca es blanco y negro.** No hay color de acento: la jerarquía se arma con grises, peso y tamaño.
   El "activo" es blanco con texto negro.
3. **Las fotos del gym son el color.** Las miniaturas reales de los profes son lo único con color en pantalla.
4. **Oswald para lo que se escanea, sistema para lo que se lee.** Nombres, títulos, botones y etiquetas en
   Oswald. Buscador y textos de ayuda en la fuente del celular.
5. **Movimiento corto y con sentido.** Solo responde a un toque o muestra que algo entra. Con "reducir
   movimiento" activado en el celular, se apaga.

## Tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#000` | Fondo de la página |
| `--surface` | `#121212` | Tarjetas, filas, buscador, botones secundarios |
| `--surface-2` | `#1c1c1c` | Superficie al tocar o al pasar el mouse |
| `--border` | `#2a2a2a` | Borde decorativo de tarjetas y filas |
| `--border-control` | `#6b6b6b` | Borde de controles (buscador, botones): contraste ≥ 3:1 sobre negro |
| `--text` | `#fff` | Texto principal |
| `--muted` | `#a3a3a3` | Texto secundario (7,6:1 sobre `--surface`) |
| `--accent` / `--on-accent` | `#fff` / `#000` | Estado activo y botón principal |
| `--text-on-photo` | `#d4d4d4` | Texto secundario sobre foto con degradé |
| `--highlight` | blanco 20 % | Parte del nombre que coincide con la búsqueda (RN-11b) |
| `--stage` | `#000` | Fondo del video |
| `--scrim-photo` | degradé negro | Para que el texto se lea sobre cualquier foto |
| `--overlay-bg` / `--overlay-track` | negro 35 % / blanco 25 % | Indicador de carga sobre el video, borde de la cámara lenta |
| `--overlay-strong` | negro 65 % | Fondo de controles sobre el video (cámara lenta) |

### Tipografía

Familias: `--font-display` (Oswald 500 y 600, incluida en la web, RN-02) y `--font-body` (la del sistema).

Escala de 7 tamaños más uno de titular. Cada componente usa el del rol que cumple; no se suman tamaños intermedios.

| Token | Tamaño | Uso | Familia |
|---|---|---|---|
| `--text-xs` | 12 px | Etiquetas en mayúscula: categoría en el reproductor, pie, subtítulo | Oswald |
| `--text-sm` | 13 px | Títulos de sección, cantidades, categoría en la lista | Oswald o sistema |
| `--text-md` | 15 px | Botones, textos de ayuda, nombres en tarjetas chicas | Oswald o sistema |
| `--text-body` | 16 px | Texto base, "Ver todos" y buscador (≥ 16 px: el iPhone no hace zoom) | sistema |
| `--text-lg` | 18 px | Nombre del ejercicio en la lista | Oswald 500 |
| `--text-xl` | 20 px | Nombre del grupo muscular, del ejercicio en el reproductor y títulos de estado | Oswald 600 |
| `--text-2xl` | 26 px | Título de la categoría abierta, grupo destacado | Oswald 600 |
| `--text-display` | 34 px | Titular del inicio ("¿Qué te toca entrenar hoy?"). Uno solo por pantalla | Oswald 600 |

Espaciado entre letras: `--track-title` (0,02 em, títulos grandes), `--track-button` (0,06 em),
`--track-caps` (0,08 em, mayúsculas chicas), `--track-label` (0,16 em, títulos de sección).

Los títulos en Oswald van en mayúscula, con `text-wrap: balance` para que corten la línea parejo.

### Forma

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 3 px | Resaltado de búsqueda, placeholders |
| `--radius-sm` | 10 px | Miniatura de fila, botón borrar, acción del aviso |
| `--radius-md` | 12 px | Botones de ícono |
| `--radius-lg` | 14 px | Tarjetas, filas, buscador, aviso: el radio de la marca |
| `--radius-pill` | 999 px | Botón principal y de herramienta |
| `--shadow-sticky` | — | Buscador cuando queda fijo arriba |
| `--shadow-float` | — | Aviso flotante |

### Espacio

`--gutter` (16 px, margen lateral), `--gap` (8 px, entre filas y botones), `--gap-grid` (10 px, grilla de
grupos y carruseles), `--max` (720 px, ancho máximo), `--safe-top` y `--safe-bottom` (zonas seguras del iPhone).

### Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--dur-press` | 0,12 s | Respuesta al toque (achique de tarjeta o fila) |
| `--dur-state` | 0,15 s | Cambios de estado: foco del buscador, sombra al quedar fijo |
| `--dur-enter` + `--ease-enter` | 0,22 s, ease-out | Entrada del reproductor y del aviso |
| `--dur-spin` | 0,8 s | Indicador de carga |
| `--dur-pulse` | 1,4 s | Skeleton de la carga inicial |
| `--dur-photo` | 0,35 s | La foto que se acerca al tocar una tarjeta, la flecha que avanza |
| `--dur-morph` | 0,32 s | Una tarjeta que se transforma en la pantalla siguiente |
| `--ease-out-soft` | curva suave | Frena suave al llegar: transformaciones y toques |
| `--top-fade-range` | 160 px | Cuánto scroll tarda el encabezado en desvanecerse |

Toda animación nueva lleva su bloque `@media (prefers-reduced-motion: reduce)` que la apaga.

**Animaciones de la web:**

| Qué | Cómo | Soporte |
|---|---|---|
| Encabezado que se compacta | Al bajar, el logo y el titular se desvanecen y se achican. Lo mueve el scroll, sin JavaScript (`animation-timeline: scroll()`) | Chrome, Safari 26+. Sin soporte queda fijo |
| Entrada al scrollear | Tarjetas desde la 4ª y "Ver todos" suben con un fundido al aparecer (`animation-timeline: view()`). Las filas no: en listas de hasta 403 costaría en celulares lentos | Chrome, Safari 26+. Sin soporte aparecen directo |
| Toque con vida | La foto se acerca dentro del marco y la flecha avanza | Todos |
| Inicio ↔ categoría | El nombre de la tarjeta se transforma en el título de la categoría y vuelve al tocar "atrás" (View Transitions). Si el navegador ya animó el "atrás" (por ejemplo, deslizando en iOS), no se suma otra | Chrome 111+, Safari 18+, Firefox 144+ |
| Miniatura → video | El video crece desde la miniatura tocada. Se hace a mano (`element.animate`) y no con View Transitions, para que `play()` siga en el mismo toque y iOS reproduzca con sonido | Todos |

**Regla de LCP:** nada de lo que se ve al entrar arranca transparente. Chrome no cuenta como cargado un elemento
con opacidad 0, así que un fundido de entrada en las primeras fotos empeora la métrica de velocidad. Por eso la
entrada al scrollear empieza en la 4ª tarjeta.

### Capas

`--z-raised` (1, texto sobre foto) · `--z-sticky` (2, encabezado del reproductor) · `--z-search` (5, buscador
fijo) · `--z-toast` (20, aviso con "Deshacer"). El reproductor es un `<dialog>` y va por encima de todo.

## Componentes

| Componente | Clase | Cómo es | Estados |
|---|---|---|---|
| Buscador | `.search` | 54 px de alto, `--surface`, borde `--border-control`, ícono a la izquierda y "borrar" de 44 px | Foco: borde blanco |
| Tarjeta de grupo | `.tile` | Foto + `--scrim-photo`, nombre `--text-xl`, cantidad y flecha blanca. Grilla bento: el primer grupo de `categorias.json` va destacado (2 columnas y más alto en el celular; 2 × 2 desde 600 px, con 3 columnas). Si la última queda sola, ocupa todo el ancho | Al tocar: escala 0,97, la foto se acerca y la flecha avanza |
| Encabezado | `.top` | Logo centrado. En el inicio, debajo, el titular `--text-display` y una línea de datos ("403 videos · 9 grupos musculares", `--text-md` gris, con su altura reservada). Todo centrado, como un cartel; lo de abajo (buscador, grilla) va a lo ancho. El titular se oculta al escribir en el buscador (con el teclado abierto, el lugar es para los resultados) y no aparece en links directos a una categoría | Se desvanece al bajar |
| Fila de ejercicio | `.row` | Miniatura de 56 px, nombre `--text-lg` con resaltado, categoría y flecha. Mínimo 76 px de alto | Al tocar: `--surface-2` y escala 0,99 |
| Tarjeta chica | `.card` | Miniatura de 124 px y nombre en 2 líneas como máximo. En carrusel horizontal (recientes y relacionados) | — |
| Botón principal | `.btn` | Píldora blanca con texto negro, 44 px. Uno por pantalla como máximo (por ejemplo "Reintentar") | — |
| Cámara lenta | `.speed` | Sobre el video, arriba a la derecha: "⏱ Lenta 0,5× 🔇" en una píldora oscura translúcida (`--overlay-strong` + blur), 44 px de alto. El ícono de sin sonido avisa que en lenta no hay audio (RN-19b). Un solo botón con `aria-pressed` | Prendida: blanca con texto negro |
| Botón de ícono | `.icon-btn` | 44 × 44 px, `--surface`, con `aria-label` siempre | — |
| Botón de texto | `.text-btn` | Mayúscula sin fondo y 44 px de alto (por ejemplo "Borrar") | — |
| Enlace grande | `.all-link` | Borde de control, 56 px, texto + cantidad + flecha | — |
| Aviso | `.toast` | Blanco con texto negro, abajo y con acción ("Deshacer", 5 s, RN-03) | Entra desde abajo |
| Estado | `.state` | Título `--text-xl`, texto de ayuda y, si se puede, botón principal. Siempre ofrece una salida (RN-13, RN-20) | — |
| Skeleton | `.skeleton` | La grilla de grupos en gris, con la misma altura que la real. Tiene 9 tarjetas fijas en `index.html`: si cambia la cantidad de categorías, hay que ajustarla | Pulso suave |
| Reproductor | `.player` | Pantalla completa: encabezado fijo, video en un marco 9:16 reservado (`.video-frame`, del tamaño exacto del video) con la cámara lenta encima, y relacionados | Entra desde abajo, o crece desde la miniatura tocada |

## Íconos

Trazo de 2 a 2,4 px, puntas redondeadas, `currentColor` y tamaño de 20 a 22 px dentro de una zona táctil de 44.
Siempre SVG en línea, nunca emojis. Si el ícono acompaña un texto, lleva `aria-hidden="true"`; si está solo,
el botón lleva `aria-label`.

## Lo que no se hace

- Sumar colores de acento, degradés de color o una segunda paleta. La marca es blanco y negro.
- Sumar fuentes. Solo Oswald y la del sistema.
- Usar emojis como íconos.
- Tocar el buscador con letra de menos de 16 px.
- Animar `width`, `height` o `top`: solo `transform` y `opacity`.
- Dejar saltos de layout: todo lo que carga tarde (fotos, video, catálogo) tiene su lugar reservado.
- Ocultar el foco (`:focus-visible` es un contorno blanco de 2 px).

## Checklist antes de dar algo por terminado

- [ ] Usa solo tokens: `grep` de `#`, `rgb(` y `px` sueltos en el componente nuevo.
- [ ] Probado a 360 px de ancho y desde 600 px, sin scroll horizontal.
- [ ] Zonas táctiles ≥ 44 px y separación ≥ 8 px entre ellas.
- [ ] Contraste ≥ 4,5:1 en el texto y ≥ 3:1 en bordes de controles e íconos con significado.
- [ ] Animaciones apagadas con "reducir movimiento".
- [ ] Nada se mueve al terminar de cargar.
- [ ] Textos en voseo (RN-17) y errores con salida (RN-20).
- [ ] Revisado con el agente `revisor-ux-movil`.

## Historial

- **2026-10-21.** Se pasó de 11 tamaños de letra a 7: botones de 14 a 15 px, buscador de 17 a 16 px,
  y nombres de grupo, del reproductor y títulos de estado (19, 20 y 21 px) a 20 px.
