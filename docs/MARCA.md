# Marca

Identidad visual de **Gym Las Lomas**, tomada de su perfil de Instagram ([@gymlaslomas](https://www.instagram.com/gymlaslomas/)).

**El nombre de la marca es GYM LAS LOMAS** (así figura en el vidrio del gimnasio). La foto de perfil de Instagram
dice "Gimnasio Las Lomas", pero no es el nombre que se usa: en la web, el cartel y los textos va siempre "Gym Las Lomas".

## Logo

Barra con discos y el texto **GYM / LAS LOMAS** en el centro, separado por la barra.

- Archivo: `src/assets/logo.svg`. Es vectorial, con el texto convertido a trazos, así que no depende de la fuente instalada.
- Usa `currentColor`: toma el color del texto que lo rodea (blanco sobre negro en la web y en el cartel).
- Se recreó a partir de la foto de perfil de Instagram (150 px), midiendo las proporciones. Si el gimnasio tiene el archivo
  original (AI, SVG, PDF o PNG grande), conviene reemplazarlo por ese.
- Favicon: `public/icon.svg`, solo la barra con discos, sobre fondo negro.

## Colores

Blanco y negro, sin color de acento. La jerarquía se arma con grises.

| Uso | Color |
|---|---|
| Fondo | `#000000` |
| Superficie (tarjetas, buscador) | `#121212` |
| Superficie al tocar | `#1c1c1c` |
| Bordes | `#2a2a2a` |
| Texto | `#ffffff` |
| Texto secundario | `#a3a3a3` |
| Acento (chip activo, botones) | `#ffffff` con texto `#000000` |

Están definidos como variables al principio de `src/styles.css`.

## Tipografía

- **Oswald** (condensada, la más parecida a la del logo), en 500 y 600. Se usa en títulos, nombres de ejercicios,
  categorías, botones y etiquetas. Las etiquetas van en mayúsculas y con espaciado entre letras.
- **Fuente del sistema** para el buscador y los textos de apoyo, por legibilidad.
- Oswald viene incluida en la web (`@fontsource/oswald`) y no se carga desde Google: es más rápido y no comparte
  la IP de los socios con terceros (RN-02). Pesa unos 25 KB.

## Tono

El de su Instagram: cercano y motivador. Lema: *"Estamos para que cumplas tus objetivos"* (aparece en el pie de la web).
Voseo siempre (RN-17).
