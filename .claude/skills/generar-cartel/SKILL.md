---
name: generar-cartel
description: Genera el código QR y el cartel A4 para imprimir y pegar en Gym Las Lomas. Usalo cuando el usuario quiere el QR, el cartel o va a imprimir material para el gym.
argument-hint: "[url definitiva]"
allowed-tools: Read Bash(npm run qr *) Bash(curl -sI *)
---

# Generar cartel QR

URL indicada: `$ARGUMENTS` (si está vacía, usá `SITE_URL` del `.env`).

## Antes de generar (RN-14)

El QR lleva la URL grabada. **Si la URL cambia después de imprimir, hay que reimprimir todos los carteles.**

1. Confirmá con el usuario que esa es la URL **definitiva**, no una de prueba.
   Si es `*.pages.dev`, recordale que puede usar un dominio propio y que conviene decidirlo ahora.
2. Verificá que la URL ya responda: `curl -sI <url>` tiene que devolver 200.
   Si no responde, avisá: se puede generar igual, pero no conviene imprimir hasta que funcione.
3. Usá `https://` siempre.

## Generar

```bash
npm run qr -- <url>
```

Genera en `qr/`: `cartel.html` (A4), `qr.png` (1600 px) y `qr.svg`.

## Indicaciones para el usuario

- Abrir `qr/cartel.html` en Chrome → Imprimir → Más opciones → activar **"Gráficos de fondo"** → A4, sin márgenes.
- Desde Windows, el archivo está en la carpeta del proyecto: `\\wsl$\...\proyecto-GYM-Las-Lomas\qr\cartel.html`.
- Antes de imprimir en cantidad: imprimir uno y escanearlo con un iPhone y un Android a la distancia real de uso (1 a 1,5 m).
- Pegarlo al lado de cada cartel de rutinas, a la altura de los ojos y sin reflejos de luz.
- Para la imprenta, `qr.svg` escala a cualquier tamaño sin perder calidad.
