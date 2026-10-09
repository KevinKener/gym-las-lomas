// Genera el QR del gimnasio y un cartel listo para imprimir.
//
//   npm run qr                      -> usa SITE_URL del .env
//   npm run qr -- https://mi-url.com
//
// Salida: qr/qr.png (alta resolución), qr/qr.svg y qr/cartel.html (A4, abrir e imprimir).

import fs from 'node:fs/promises';
import QRCode from 'qrcode';
import { loadEnv } from './env.mjs';

loadEnv();

const url = process.argv[2] || process.env.SITE_URL;
if (!url) {
  console.error('✖ Indicá la URL: npm run qr -- https://tu-sitio.com  (o SITE_URL en .env)');
  process.exit(1);
}

const options = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#000000', light: '#ffffff' } };
const logo = (await fs.readFile(new URL('../src/assets/logo.svg', import.meta.url), 'utf8')).trim();

await fs.mkdir('qr', { recursive: true });
await QRCode.toFile('qr/qr.png', url, { ...options, width: 1600 });
const svg = await QRCode.toString(url, { ...options, type: 'svg' });
await fs.writeFile('qr/qr.svg', svg);

const prettyUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

await fs.writeFile(
  'qr/cartel.html',
  `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Cartel QR · Gym Las Lomas</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&display=swap');
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: Oswald, "Arial Narrow", system-ui, sans-serif; background: #d4d4d4; }
  .sheet { width: 210mm; height: 297mm; margin: 0 auto; background: #000; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 22mm 18mm 18mm; text-align: center; }
  .brand svg { width: 120mm; height: auto; color: #fff; display: block; }
  h1 { font-size: 16mm; line-height: 1.05; font-weight: 600; text-transform: uppercase; letter-spacing: .01em; }
  h1 em { font-style: normal; display: inline-block; border-bottom: 1.6mm solid #fff; }
  .lead { font-size: 6.5mm; color: #d4d4d4; margin-top: 6mm; font-weight: 500; }
  .qr { background: #fff; border-radius: 6mm; padding: 6mm; width: 120mm; height: 120mm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .steps { display: flex; gap: 6mm; font-size: 5mm; color: #d4d4d4; text-transform: uppercase; letter-spacing: .06em; }
  .steps b { display: inline-grid; place-items: center; width: 8mm; height: 8mm; border-radius: 50%;
    background: #fff; color: #000; margin-right: 2mm; font-size: 4.5mm; }
  .url { font-size: 5mm; color: #a3a3a3; letter-spacing: .04em; }
  @media print { body { background: none; } .sheet { margin: 0; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brand">${logo}</div>
    <div>
      <h1>¿Cómo se hace<br><em>este ejercicio?</em></h1>
      <p class="lead">Escaneá el código y mirá el video del profe.</p>
    </div>
    <div class="qr">${svg}</div>
    <div class="steps">
      <div><b>1</b>Abrí la cámara</div>
      <div><b>2</b>Escaneá el QR</div>
      <div><b>3</b>Buscá el ejercicio</div>
    </div>
    <div class="url">${prettyUrl}</div>
  </div>
</body>
</html>
`,
);

console.log(`✔ QR generado para ${url}`);
console.log('  qr/qr.png · qr/qr.svg · qr/cartel.html (abrilo en el navegador e imprimí en A4)');
