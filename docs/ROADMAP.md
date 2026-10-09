# Roadmap

## v1.0: Biblioteca de ejercicios ✅ (en curso)

- [x] Buscador tolerante por nombre y categoría
- [x] Reproductor a pantalla completa, ejercicios relacionados, compartir
- [x] Vistos recientemente
- [x] Compresión de videos y miniaturas
- [x] Generador de QR y cartel A4
- [x] Cargar los videos reales del gym (190 ejercicios, 8 categorías)
- [ ] Definir URL definitiva y publicar
- [ ] Imprimir y pegar carteles
- [ ] Prueba con 5 socios reales y ajustar nombres según lo que escriben

## v1.1: Ajustes después de la prueba

- ~~Resaltado de coincidencias, "¿Quisiste decir…?", cámara lenta, indicador de carga~~ (hecho)
- Sinónimos de búsqueda (por ejemplo "pecho plano" → "Press de banca plano"), cargados desde un archivo simple
- Estadísticas anónimas de uso (Cloudflare Web Analytics, sin cookies) para saber qué ejercicios se buscan y no existen
- Iconos PNG para "agregar a inicio" en iPhone

## v2: Rutinas

Contexto del gimnasio (2026-10-09): hay 4 tipos de rutina (**fuerza, hipertrofia, funcional y principiante**).
Cada cartel mezcla ejercicios de distintos grupos musculares y **las rutinas cambian cada 1 o 2 meses**.
Por eso el profe tiene que poder actualizarlas solo y en minutos, sin reimprimir QR: el QR de cada tipo de rutina
queda fijo y lo que cambia es la lista de ejercicios detrás.

- QR por tipo de rutina: abre los ejercicios del cartel vigente, en orden
- Carga simple de rutinas por parte del profe (la lista de ejercicios del cartel)
- Ideal: generar el cartel impreso desde el sistema, así cartel y web nunca quedan desfasados
- Descripción, músculos trabajados y tips del profe en cada ejercicio (archivo `.md` o `.txt` al lado del video)

## v3: Autonomía del gym

- Panel para que el profe suba un video desde el celular, sin pasar por la PC (requiere backend y login **solo para profes**; los socios siguen sin login, RN-01)
- Modo offline para videos ya vistos

Cualquier funcionalidad nueva tiene que respetar las [reglas de negocio](REGLAS-DE-NEGOCIO.md).
Si alguna choca con una regla (por ejemplo, pedir datos del socio), se discute primero con el gimnasio.
