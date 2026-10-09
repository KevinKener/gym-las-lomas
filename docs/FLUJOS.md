# Flujos

## 1. Socio: ver cómo se hace un ejercicio

```mermaid
flowchart TD
    A[Socio frente al cartel de su rutina] --> B[Escanea el QR con la cámara]
    B --> C[Inicio: buscador + vistos recientemente + grupos musculares]
    C --> D{¿Cómo lo busca?}
    D -->|Escribe el nombre| E[Resultados de todo el catálogo mientras tipea]
    D -->|Toca un grupo muscular| F[Lista del grupo: puede buscar dentro]
    D -->|Lo vio hace poco| G[Toca la tarjeta en recientes]
    D -->|Quiere ver todo| T[Ver todos los ejercicios]
    E --> H{¿Hay resultados?}
    H -->|No| I["¿Quisiste decir…?" + probá con una palabra]
    I --> J
    H -->|Sí| J[Toca el ejercicio]
    F --> J
    T --> J
    G --> J
    J --> K[Video en loop · cámara lenta opcional]
    K --> L{¿Qué hace después?}
    L -->|Atrás| M[Vuelve a la lista, a la misma altura]
    L -->|Más del grupo| K
    L -->|Compartir| N[Manda el link por WhatsApp]
```

No se muestran los 190 ejercicios de entrada: el inicio ofrece buscar o elegir un grupo muscular, como las
apps de entrenamiento de referencia. La lista completa está a un toque ("Ver todos los ejercicios").

Reglas: RN-01, RN-03, RN-11 a RN-13, RN-18, RN-19.

**Objetivo de tiempo:** del escaneo al video en menos de 15 segundos con datos móviles.

## 2. Profe y administrador: agregar o cambiar ejercicios

```mermaid
flowchart TD
    A[Profe graba el ejercicio con el celular] --> B[Nombra el archivo igual que en el cartel]
    B --> C[Pasa el video al administrador]
    C --> D[Se guarda en la carpeta de ORIGINALES]
    D --> D2[Se agrega a su categoría en contenido/categorias.json]
    D2 --> E
    E[npm run optimize]
    E --> F[Carpeta de PUBLICACIÓN: mp4 720p + miniatura]
    F --> G[npm run catalog]
    G --> H{¿Hay advertencias?}
    H -->|Nombre duplicado, muy pesado, .mov| I[Corregir y repetir]
    I --> E
    H -->|No| J[npm run dev: revisar en la PC]
    J --> K[Publicar: ver flujo 3]
```

Reglas: RN-04 a RN-10, RN-21.

Skill de Claude Code: `/agregar-ejercicios`.

### Carpetas

```
D:\las lomas\          ← originales del profe (RAW_VIDEOS_DIR). NUNCA se modifican (RN-09)
  peso muerto rumano.MOV
D:\las lomas web\      ← lo que se publica (VIDEOS_DIR), lo genera npm run optimize
  peso muerto rumano.mp4
  peso muerto rumano.jpg
contenido/categorias.json  ← en qué categoría va cada ejercicio (RN-07)
```

## 3. Publicar una versión

```mermaid
flowchart TD
    A[Cambios listos] --> B[npm test]
    B --> C[npm run build]
    C --> D{¿Pasó todo sin advertencias?}
    D -->|No| E[Corregir]
    E --> B
    D -->|Sí| F[Deploy a Cloudflare Pages]
    F --> G[Abrir la URL real en un celular]
    G --> H[Buscar 2 o 3 ejercicios y reproducir uno]
    H --> I{¿Anda?}
    I -->|No| J[Volver a la versión anterior desde el panel de Pages]
    I -->|Sí| K[Listo. Anotar en CHANGELOG.md]
```

Reglas: RN-21, RN-22. Skill de Claude Code: `/publicar`.

## 4. Primera instalación en el gimnasio (una sola vez)

1. Definir la URL definitiva (dominio propio o `*.pages.dev`). **No se cambia después** (RN-14).
2. Publicar la primera versión con todos los videos.
3. `npm run qr -- <URL>` e imprimir `qr/cartel.html` en A4 (con "Gráficos de fondo" activado).
4. Probar el QR impreso con al menos un iPhone y un Android, a la distancia real de uso.
5. Pegar un cartel QR al lado de cada cartel de rutinas, a la altura de los ojos y con buena luz.
6. Contarles a los profes el flujo 2 y qué nombres usar.

Skill de Claude Code: `/generar-cartel`.
