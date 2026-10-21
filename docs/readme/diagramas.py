"""Arma las imágenes del README (docs/readme/*.svg) con la marca de Gym Las Lomas: blanco y negro, Oswald.

Uso: python3 docs/readme/diagramas.py
Para cambiar un texto, se edita acá y se vuelve a correr. Los SVG generados no se editan a mano.
La tipografía Oswald va embebida (sale de node_modules), así se ve igual que la web aunque GitHub no la tenga.
"""
import base64
import pathlib
import re
from xml.sax.saxutils import escape as esc

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "docs" / "readme"
CICLO = 10  # segundos por vuelta de la animación

OSWALD = base64.b64encode(
    (RAIZ / "node_modules/@fontsource/oswald/files/oswald-latin-600-normal.woff2").read_bytes()
).decode()
FUENTE = f"@font-face {{ font-family: 'Oswald LL'; font-weight: 600; src: url(data:font/woff2;base64,{OSWALD}) format('woff2'); }}"
DISPLAY = "'Oswald LL', 'Oswald', 'Arial Narrow', Arial, sans-serif"
TEXTO = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

# Logo vectorial de la web (src/assets/logo.svg): se reutiliza tal cual en el banner
LOGO = (RAIZ / "src/assets/logo.svg").read_text()
LOGO_VIEWBOX = re.search(r'viewBox="([^"]+)"', LOGO).group(1)
LOGO_PATH = re.search(r' d="([^"]+)"', LOGO).group(1)

ESTILO = f"""
  <style>
    {FUENTE}
    .fondo {{ fill: #0a0a0a; }}
    .card {{ fill: #141414; stroke: #2a2a2a; stroke-width: 1.5; }}
    .titulo {{ font: 600 23px {DISPLAY}; fill: #fff; text-transform: uppercase; letter-spacing: .4px; }}
    .encabezado {{ font: 600 30px {DISPLAY}; fill: #fff; text-transform: uppercase; letter-spacing: .5px; }}
    .texto {{ font: 400 16px {TEXTO}; fill: #a3a3a3; }}
    .chip {{ font: 600 12.5px {TEXTO}; }}
    .num {{ font: 600 18px {DISPLAY}; fill: #000; }}
    .base {{ fill: none; stroke: #2a2a2a; stroke-width: 6; stroke-linecap: round; }}
    .trazo {{ fill: none; stroke: #fff; stroke-width: 6; stroke-linecap: round;
             stroke-dasharray: 1; stroke-dashoffset: 1; animation: dibujar {CICLO}s ease-in-out infinite; }}
    .rama {{ fill: none; stroke: #fff; stroke-opacity: .45; stroke-width: 2.5; stroke-dasharray: 7 7;
            animation: fluir 1s linear infinite; }}
    .nodo {{ fill: #3a3a3a; animation: nodo {CICLO}s ease-in-out infinite; }}
    .marco {{ fill: none; stroke: #fff; stroke-width: 2; opacity: 0; animation: marco {CICLO}s ease-in-out infinite; }}
    .halo {{ fill: #fff; opacity: 0; transform-box: fill-box; transform-origin: center;
            animation: halo {CICLO}s ease-out infinite; }}
    @keyframes dibujar {{ 0% {{ stroke-dashoffset: 1; }} 62% {{ stroke-dashoffset: 0; }} 88% {{ stroke-dashoffset: 0; opacity: 1; }} 97% {{ opacity: 0; }} 100% {{ stroke-dashoffset: 1; opacity: 0; }} }}
    @keyframes fluir {{ to {{ stroke-dashoffset: -14; }} }}
    @keyframes nodo {{ 0%, 4% {{ fill: #3a3a3a; }} 8%, 86% {{ fill: #fff; }} 96%, 100% {{ fill: #3a3a3a; }} }}
    @keyframes marco {{ 0%, 4% {{ opacity: 0; }} 8%, 86% {{ opacity: .9; }} 96%, 100% {{ opacity: 0; }} }}
    @keyframes halo {{ 0%, 4% {{ opacity: 0; transform: scale(1); }} 6% {{ opacity: .3; }} 16%, 100% {{ opacity: 0; transform: scale(2.1); }} }}
    @media (prefers-reduced-motion: reduce) {{
      .trazo {{ animation: none; stroke-dashoffset: 0; }} .nodo {{ animation: none; fill: #fff; }}
      .marco {{ animation: none; opacity: .9; }} .halo, .rama, .viajero {{ animation: none; display: none; }}
    }}
  </style>"""

# Actores: texto del chip, fondo, color del texto
ACTORES = {
    "socio": ("🙋 Socio", "#ffffff", "#000000"),
    "web": ("📱 La web", "#2a2a2a", "#ffffff"),
    "video": ("🎬 Video", "#2a2a2a", "#ffffff"),
    "profe": ("🏋️ Profe", "#ffffff", "#000000"),
    "admin": ("🛠️ Administrador", "#2a2a2a", "#ffffff"),
    "catalogo": ("✅ Catálogo", "#2a2a2a", "#ffffff"),
    "gym": ("📍 En el gym", "#2a2a2a", "#ffffff"),
}


def chip(x, y, actor):
    texto, fondo, color = ACTORES[actor]
    ancho = len(texto) * 7.6 + 24
    return (f'<rect x="{x}" y="{y}" width="{ancho:.0f}" height="24" rx="12" fill="{fondo}"/>'
            f'<text x="{x + 12}" y="{y + 16.5}" class="chip" fill="{color}">{esc(texto)}</text>')


def tarjeta(x, y, w, h, retraso, actor, titulo, lineas, numero=None, cx=None):
    """Tarjeta de un paso; `retraso` (s) es cuando la línea que avanza llega a ella."""
    d = f'style="animation-delay:{retraso:.2f}s"'
    partes = [f'<rect class="card" x="{x}" y="{y}" width="{w}" height="{h}" rx="18"/>',
              f'<rect class="marco" {d} x="{x}" y="{y}" width="{w}" height="{h}" rx="18"/>',
              chip(x + 20, y + 16, actor),
              f'<text x="{x + 20}" y="{y + 70}" class="titulo">{esc(titulo)}</text>']
    for i, linea in enumerate(lineas):
        partes.append(f'<text x="{x + 20}" y="{y + 96 + i * 21}" class="texto">{esc(linea)}</text>')
    if numero is not None:
        partes += [f'<circle class="halo" {d} cx="{cx}" cy="{y + h / 2}" r="22"/>',
                   f'<circle class="nodo" {d} cx="{cx}" cy="{y + h / 2}" r="22" stroke="#0a0a0a" stroke-width="5"/>',
                   f'<text x="{cx}" y="{y + h / 2 + 6.5}" text-anchor="middle" class="num">{numero}</text>']
    return "\n".join(partes)


def svg(ancho, alto, cuerpo, etiqueta, estilo=ESTILO):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" width="{ancho}" height="{alto}" '
            f'role="img" aria-label="{esc(etiqueta)}">{estilo}\n<rect class="fondo" width="{ancho}" height="{alto}" rx="28"/>\n{cuerpo}\n</svg>\n')


def viajero(camino, fin=0.62):
    """Un punto que recorre la línea principal una vez por vuelta (SMIL: se anima dentro de <img>)."""
    return (f'<circle class="viajero" r="9" fill="#000" stroke="#fff" stroke-width="4">'
            f'<animateMotion dur="{CICLO}s" repeatCount="indefinite" path="{camino}" '
            f'keyPoints="0;1;1" keyTimes="0;{fin};1" calcMode="linear"/>'
            f'<animate attributeName="opacity" dur="{CICLO}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;{fin};{fin + 0.04};1"/></circle>')


def recorrido(encabezado, pasos, finales, etiqueta):
    """Pasos numerados unidos por una línea que se dibuja, y dos salidas al final."""
    x0, y0, w, h, sep, cx = 96, 100, 476, 150, 30, 50
    cuerpo = [f'<text x="40" y="62" class="encabezado">{esc(encabezado)}</text>']
    paso_y = [y0 + i * (h + sep) for i in range(len(pasos))]
    centro = [y + h / 2 for y in paso_y]
    camino = f"M {cx} {centro[0]} L {cx} {centro[-1]}"
    cuerpo += [f'<path class="base" d="{camino}"/>', f'<path class="trazo" pathLength="1" d="{camino}"/>']
    for i, (actor, titulo, lineas) in enumerate(pasos):
        retraso = (i / (len(pasos) - 1)) * 0.62 * CICLO
        cuerpo.append(tarjeta(x0, paso_y[i], w, h, retraso, actor, titulo, lineas, i + 1, cx))
    yb = paso_y[-1] + h + 70
    fin = 0.62 * CICLO
    (actor_a, titulo_a, lineas_a), (actor_b, titulo_b, lineas_b) = finales
    cuerpo += [
        f'<path class="rama" d="M {cx} {centro[-1] + 24} C {cx} {yb - 20}, 160 {yb - 30}, 190 {yb}"/>',
        f'<path class="rama" d="M {cx} {centro[-1] + 24} C {cx} {yb - 40}, 420 {yb - 50}, 440 {yb}"/>',
        tarjeta(40, yb, 260, 130, fin + 0.3, actor_a, titulo_a, lineas_a),
        tarjeta(316, yb, 256, 130, fin + 0.6, actor_b, titulo_b, lineas_b),
        viajero(camino),
    ]
    return svg(612, yb + 170, "\n".join(cuerpo), etiqueta)


# ---------------------------------------------------------------- 1. El socio, del cartel al video
def socio():
    return recorrido(
        "Del cartel al video",
        [
            ("socio", "Mira el cartel", ["Cada ejercicio de su rutina", "tiene su nombre escrito."]),
            ("socio", "Escanea el QR", ["La web abre al instante:", "sin app, sin cuenta, sin login."]),
            ("web", "Busca o elige un grupo", ["Tolera tildes, errores de tipeo", "y palabras en cualquier orden."]),
            ("video", "Mira cómo se hace", ["Grabado por los profes, en loop", "y con cámara lenta si hace falta."]),
        ],
        [
            ("web", "Atrás", ["Vuelve a la lista,", "a la misma altura."]),
            ("socio", "Compartir", ["Manda el link del", "ejercicio por WhatsApp."]),
        ],
        "Del cartel al video: el socio mira el cartel, escanea el QR, busca el ejercicio o elige un grupo de ejercicios y mira "
        "el video, con cámara lenta si hace falta. Después puede volver a la lista o compartir el link.",
    )


# ---------------------------------------------------------------- 2. Cómo llega un video a la web
def contenido():
    return recorrido(
        "Cómo llega un video a la web",
        [
            ("profe", "Graba el ejercicio", ["Nombra el archivo igual que", "en el cartel de la rutina."]),
            ("admin", "Lo convierte", ["MP4 liviano con la música del gym.", "Los originales nunca se tocan."]),
            ("catalogo", "Revisa todo", ["Nombres repetidos, categoría,", "formato y peso de cada video."]),
            ("admin", "Publica", ["Prueba en el celular", "y sube la versión nueva."]),
        ],
        [
            ("catalogo", "Si hay avisos", ["Se corrige el nombre", "o el video y se repite."]),
            ("gym", "Listo", ["El mismo QR de siempre", "ya muestra lo nuevo."]),
        ],
        "Cómo llega un video a la web: el profe graba el ejercicio y nombra el archivo como en el cartel, el administrador "
        "lo convierte con la música del gym, el catálogo revisa nombres, categoría, formato y peso, y el administrador "
        "publica. Si hay avisos se corrige y se repite; si no, el mismo QR ya muestra lo nuevo.",
    )


# ---------------------------------------------------------------- 3. Banner
def banner():
    estilo = f"""
  <style>
    {FUENTE}
    .t-titulo {{ font: 600 58px {DISPLAY}; fill: #fff; text-transform: uppercase; letter-spacing: 1px; }}
    .t-sub {{ font: 400 22px {TEXTO}; fill: #a3a3a3; }}
    .t-chip {{ font: 600 15px {TEXTO}; fill: #fff; }}
    .t-pantalla {{ font: 600 15px {DISPLAY}; fill: #fff; text-transform: uppercase; letter-spacing: .5px; }}
    .t-lenta {{ font: 600 12px {DISPLAY}; fill: #000; text-transform: uppercase; letter-spacing: .5px; }}
    .escaneo {{ animation: escanear 3.2s ease-in-out infinite; }}
    .play {{ transform-origin: 1003px 214px; animation: latir 2.4s ease-in-out infinite; }}
    .barra {{ animation: avanzar 6s linear infinite; }}
    @keyframes escanear {{ 0%, 100% {{ transform: translateY(0); opacity: .9; }} 50% {{ transform: translateY(118px); opacity: .9; }} }}
    @keyframes latir {{ 0%, 100% {{ transform: scale(1); }} 50% {{ transform: scale(1.08); }} }}
    @keyframes avanzar {{ from {{ transform: scaleX(0); }} to {{ transform: scaleX(1); }} }}
    @media (prefers-reduced-motion: reduce) {{ .escaneo, .play, .barra {{ animation: none; }} }}
  </style>"""
    # QR decorativo (no es un QR real): patrón fijo
    qr = []
    patron = "1110111 1000101 1011101 1011001 1011101 1000101 1110111".split()
    for f, fila in enumerate(patron):
        for c, celda in enumerate(fila):
            if celda == "1":
                qr.append(f'<rect x="{770 + c * 17}" y="{150 + f * 17}" width="15" height="15" rx="2" fill="#fff"/>')
    cuerpo = f"""
<defs>
  <radialGradient id="luz" cx=".78" cy=".4" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <clipPath id="pantalla"><rect x="925" y="72" width="156" height="282" rx="18"/></clipPath>
</defs>
<rect width="1200" height="380" rx="28" fill="url(#luz)"/>
<svg x="64" y="58" width="280" height="110" viewBox="{LOGO_VIEWBOX}"><path fill="#fff" d="{LOGO_PATH}"/></svg>
<text x="64" y="252" class="t-titulo">Biblioteca de ejercicios</text>
<text x="66" y="296" class="t-sub">Escaneá el QR del cartel, buscá el ejercicio y mirá cómo se hace.</text>
<rect x="64" y="318" width="132" height="32" rx="16" fill="#2a2a2a"/><text x="82" y="339" class="t-chip">403 videos</text>
<rect x="206" y="318" width="244" height="32" rx="16" fill="#2a2a2a"/><text x="224" y="339" class="t-chip">9 grupos de ejercicios</text>
<rect x="460" y="318" width="160" height="32" rx="16" fill="#2a2a2a"/><text x="478" y="339" class="t-chip">Sin login ni app</text>
<g transform="translate(40 0)">
<g>{''.join(qr)}</g>
<rect class="escaneo" x="758" y="146" width="142" height="4" rx="2" fill="#fff" opacity=".9"/>
<path d="M 900 214 h 14" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 6"/>
<rect x="917" y="60" width="172" height="306" rx="26" fill="#000" stroke="#fff" stroke-width="3"/>
<g clip-path="url(#pantalla)">
  <rect x="925" y="72" width="156" height="282" fill="#1c1c1c"/>
  <rect x="925" y="72" width="156" height="282" fill="url(#luz)"/>
  <rect x="995" y="84" width="78" height="20" rx="10" fill="#fff"/><text x="1003" y="98.5" class="t-lenta">Lenta 0,5×</text>
  <g class="play"><circle cx="1003" cy="214" r="30" fill="#fff"/><path d="M 994 200 L 1018 214 L 994 228 Z" fill="#000"/></g>
  <text x="939" y="318" class="t-pantalla">Remo con barra</text>
  <rect x="939" y="332" width="128" height="4" rx="2" fill="#3a3a3a"/>
  <rect class="barra" x="939" y="332" width="128" height="4" rx="2" fill="#fff" style="transform-origin: 939px 334px"/>
</g>
</g>"""
    return svg(1200, 380, cuerpo, "Gym Las Lomas · Biblioteca de ejercicios: escaneá el QR del cartel, buscá el ejercicio y mirá cómo se hace", estilo)


if __name__ == "__main__":
    for nombre, generar in (("banner", banner), ("socio", socio), ("contenido", contenido)):
        (DESTINO / f"{nombre}.svg").write_text(generar())
        print(f"docs/readme/{nombre}.svg")
