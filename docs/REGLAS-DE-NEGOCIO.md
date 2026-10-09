# Reglas de negocio

Reglas que el producto **tiene que cumplir**. Cada una tiene un código (`RN-XX`) para poder citarla
en commits, issues y revisiones. Si un cambio rompe una regla, primero se actualiza este documento
(con el acuerdo del gimnasio) y después el código.

## Actores

| Actor | Quién es | Qué hace |
|---|---|---|
| **Socio** | Persona que entrena en el gym | Escanea el QR, busca el ejercicio del cartel, mira el video |
| **Profe** | Instructor del gym | Graba los videos y define el nombre de cada ejercicio |
| **Administrador** | Responsable técnico del sistema | Carga los videos, publica la web, imprime los carteles |
| **Dueño / gerencia** | Las Lomas Gym | Aprueba el contenido y los cambios que afectan a los socios |

---

## Acceso y privacidad

**RN-01 · Acceso libre.** Cualquier persona con el QR o el link puede ver todo el contenido.
No hay login, registro, contraseña ni pantalla intermedia. Del escaneo al buscador: un solo paso.

**RN-02 · Sin datos personales.** El sistema no pide, guarda ni envía datos del socio. No hay cookies de
seguimiento ni analíticas que identifiquen a la persona. Si en el futuro se agregan estadísticas,
tienen que ser agregadas y anónimas (por ejemplo, Cloudflare Web Analytics).

**RN-03 · Lo local queda en el celular.** "Vistos recientemente" se guarda solo en el navegador del socio
(máximo 8 ejercicios). Si el navegador no permite guardar datos (modo privado), la app funciona igual.
El socio puede borrar su historial con un toque. No se pide confirmación: se ofrece "Deshacer" durante 5 segundos.

## Contenido

**RN-04 · La carpeta de videos es la fuente de verdad.** No hay base de datos ni panel de administración.
Lo que está en la carpeta es lo que se publica; lo que se borra de la carpeta desaparece de la web en la próxima publicación.

**RN-05 · El nombre del archivo es el nombre del ejercicio.** Tiene que coincidir con el texto del cartel
de rutinas, porque es lo que el socio va a escribir. Lo define el profe.
- Se ignora la numeración inicial (`03_`, `3 - `) y los `_` se muestran como espacios.
- La primera letra se muestra en mayúscula; el resto se respeta tal cual.

**RN-06 · Nombres únicos.** No puede haber dos ejercicios con el mismo nombre, aunque estén en categorías
distintas. Si pasa, el catálogo lo avisa y hay que renombrar uno (por ejemplo "Remo con barra" y "Remo con mancuerna").
También avisa de nombres que parecen copias o segundas tomas ("(2)", "copia").

Si una copia todavía no se puede resolver (por ejemplo, porque falta que el profe elija la mejor toma), se carga en
`contenido/revisar.json` con el motivo y, de forma opcional, el nombre que va a ver el socio. Así se publica sin frenar
el build, y cada vez que se genera el catálogo aparece en la lista de pendientes para que no se olvide.
Cuando se resuelve, se saca de esa lista.

**RN-07 · Cada ejercicio tiene una categoría.** Un ejercicio pertenece a una sola categoría, que se define de dos formas:
1. Si el video está en una subcarpeta, la categoría es esa subcarpeta (si hay más niveles, cuenta solo el primero). Siempre tiene prioridad.
2. Si el video está suelto, la categoría sale de `contenido/categorias.json`, que agrupa los nombres por categoría.
   Lo puede revisar y editar el profe sin tocar los videos. Las tildes y mayúsculas no importan.

Si existe `categorias.json`, el catálogo avisa: videos sin categoría, nombres de la lista que no coinciden con ningún video
(por ejemplo porque se renombró el archivo) y ejercicios cargados en dos categorías.
Los filtros por categoría aparecen solo si existe al menos una.

El orden en que se muestran las categorías es el de `categorias.json` (las que no figuran ahí van al final, en orden alfabético).
Orden actual: Piernas y glúteos, Espalda, Pecho, Hombros, Bíceps, Tríceps, Core y Movilidad.

**RN-08 · Solo contenido propio y aprobado.** Solo se publican videos grabados por los profes del gym
y aprobados por la gerencia. No se publican videos de terceros (YouTube, Instagram, etc.).

**RN-09 · Los originales no se tocan.** Ningún proceso modifica ni borra los videos originales del profe.
La compresión siempre escribe en una carpeta distinta.

## Formato de video publicable

**RN-10 · Formato estándar.** Para publicar, cada video tiene que ser:

| Requisito | Valor | Motivo |
|---|---|---|
| Contenedor / códec | `.mp4` H.264 + AAC | Se reproduce en todos los celulares (`.mov` falla en muchos Android) |
| Resolución | Lado corto ≤ 720 px | Alcanza para ver la técnica y carga rápido con datos móviles |
| Peso | ≤ 25 MB (ideal < 10 MB) | Límite por archivo de Cloudflare Pages; ahorra datos del socio |
| `faststart` | Sí | El video empieza a reproducirse antes de terminar de bajar |
| Miniatura | `.jpg` con el mismo nombre (opcional) | Ayuda a reconocer el ejercicio en la lista |

`npm run optimize` produce exactamente este formato. El catálogo avisa si algún video no lo cumple.

## Búsqueda

**RN-11 · Búsqueda tolerante.** El socio escribe rápido, con el celular en una mano y leyendo un cartel. La búsqueda:
- ignora tildes, mayúsculas y signos (`jalon` encuentra "Jalón al pecho");
- acepta palabras incompletas y en cualquier orden (`bulg sent` encuentra "Sentadilla búlgara");
- tolera errores de tipeo: 1 error en palabras de 4 a 6 letras y 2 errores desde 7 (`sentadila`);
- ignora palabras de relleno (`de`, `con`, `la`, `el`, `al`, `y`…);
- exige que **todas** las palabras escritas coincidan con el nombre o la categoría;
- busca también por categoría (`piernas` lista todo lo de Piernas), con menos prioridad que el nombre.

**RN-11b · Resaltado.** En la lista se resalta la parte del nombre que coincide con lo escrito, para distinguir
rápido entre nombres parecidos ("Peso muerto con mancuerna" y "…con mancuernas").

**RN-12 · Orden de resultados.** Primero los que empiezan con lo escrito, después los que lo contienen
y por último las coincidencias aproximadas. A igual relevancia, orden alfabético.

**RN-13 · Sin resultados, siempre una salida.** Si no se encuentra nada, se muestra "¿Quisiste decir…?" con hasta 3
ejercicios donde coincide alguna de las palabras. Pesan más las palabras raras: en "press francés soga" importan
"francés" y "soga", no "press", que aparece en decenas de ejercicios. La tolerancia a errores es la misma de RN-11:
es mejor no sugerir nada que sugerir algo equivocado ("sentadilla" no tiene que sugerir "sentado").
Siempre se invita a probar con una sola palabra o a consultar al profe. Nunca una pantalla vacía.

## Links y QR

**RN-14 · URL estable.** El QR apunta a una única URL definitiva. **Cambiarla obliga a reimprimir todos los carteles**,
así que se define antes de imprimir y no se cambia.

**RN-15 · Link por ejercicio.** Cada ejercicio tiene su link (`/#/e/<id>`), donde el `id` se arma a partir del nombre.
Si se renombra un archivo, el link anterior deja de funcionar. Es una limitación aceptada en la v1.

**RN-16 · Links de búsqueda.** `/?q=<texto>` abre la web con la búsqueda hecha y `/?cat=<Categoría>` con el filtro aplicado.
Esto habilita QR específicos por rutina o por zona del gym sin cambiar código.

## Experiencia y calidad

**RN-17 · Idioma.** Toda la interfaz está en español rioplatense, con voseo y tono cercano
("Buscá", "Probá", "Escaneá"). Nada de "usted" ni textos técnicos frente al socio.

**RN-18 · Pensado para el celular dentro del gym.**
- Botones y zonas táctiles de 44 px como mínimo.
- Texto de los campos ≥ 16 px (si es más chico, el iPhone hace zoom solo).
- Funciona con mala señal: la web (sin videos) pesa menos de 50 KB comprimida.
- Funciona en navegadores de los últimos 3 años (Chrome Android, Safari iOS 15.4+).

**RN-19 · El botón "atrás" se comporta como se espera.** Si el socio abre un video desde la lista,
"atrás" (el del celular o el de la app) vuelve a la lista con la búsqueda intacta.
Si entró por un link directo, "atrás" lo lleva a la lista del gym y no lo saca de la web.

**RN-19b · Cámara lenta y carga.** El reproductor tiene un botón de cámara lenta (0,5×) para ver bien la técnica,
que se mantiene al pasar de un video a otro. En cámara lenta el video se silencia (la música de fondo se escucha
distorsionada); al salir, el sonido vuelve a como estaba. Si el socio quiere, puede activarlo desde los controles del video. Mientras el video carga o se traba, se muestra un indicador sobre la miniatura.

**RN-20 · Errores entendibles.** Si falla la carga del catálogo o de un video, se muestra un mensaje
en lenguaje simple y, cuando se puede, la opción de reintentar.

## Publicación

**RN-21 · Publicar = regenerar.** Cada publicación regenera el catálogo desde la carpeta. No se edita
`catalog.json` a mano.

**RN-22 · Nada se publica sin verificar.** Antes de publicar: el catálogo no tiene advertencias sin resolver,
el build pasa y se revisó la web en un celular.
