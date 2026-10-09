// Recorre la carpeta de videos y genera public/catalog.json.
//
//   VIDEOS_DIR/
//     Piernas/
//       Sentadilla búlgara.mp4
//       Sentadilla búlgara.jpg   <- miniatura opcional (mismo nombre)
//     Press de banca.mp4         <- sin subcarpeta: categoría según contenido/categorias.json
//
// Las reglas viven en catalog-lib.mjs. Ver docs/REGLAS-DE-NEGOCIO.md.
//
//   npm run catalog              -> genera y muestra advertencias
//   npm run catalog -- --strict  -> además falla si hay advertencias (lo usa el build)

import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { loadEnv } from './env.mjs';
import { buildCatalog } from './catalog-lib.mjs';

loadEnv();

const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR || 'videos');
const VIDEO_BASE_URL = process.env.VIDEO_BASE_URL || '/videos/';
const CATEGORIES_FILE = path.resolve(process.env.CATEGORIES_FILE || 'contenido/categorias.json');
const REVIEW_FILE = path.resolve(process.env.REVIEW_FILE || 'contenido/revisar.json');
const OUT_FILE = path.resolve('public/catalog.json');
const strict = process.argv.includes('--strict');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

/** Hash del contenido: cambia si se reemplaza un video aunque conserve el nombre (D-13). */
function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha1');
    createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
}

/** Lee un JSON opcional de contenido/. Si no existe devuelve {}; si está mal escrito, corta. */
async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    console.error(`\n✖ ${path.relative('.', file)} tiene un error de formato: ${err.message}\n`);
    process.exit(1);
  }
}

async function main() {
  try {
    const stat = await fs.stat(VIDEOS_DIR);
    if (!stat.isDirectory()) throw new Error();
  } catch {
    console.error(`\n✖ No encuentro la carpeta de videos: ${VIDEOS_DIR}`);
    console.error('  Configurá VIDEOS_DIR en el archivo .env (mirá .env.example).\n');
    process.exit(1);
  }

  const files = await Promise.all(
    (await walk(VIDEOS_DIR)).map(async (full) => ({
      path: path.relative(VIDEOS_DIR, full).split(path.sep).join('/'),
      size: (await fs.stat(full)).size,
      hash: await hashFile(full),
    })),
  );

  const categoryMap = await readJson(CATEGORIES_FILE);
  const reviewMap = await readJson(REVIEW_FILE);
  const { categories, exercises, warnings, pending } = buildCatalog(files, categoryMap, reviewMap);

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString(), videoBaseUrl: VIDEO_BASE_URL, categories, exercises }, null, 2),
  );

  const totalMb = exercises.reduce((sum, e) => sum + e.size, 0) / 1024 / 1024;
  console.log(`✔ Catálogo: ${exercises.length} ejercicios, ${categories.length} categorías, ${totalMb.toFixed(0)} MB de video`);
  console.log(`  Origen: ${VIDEOS_DIR}`);
  if (exercises.length === 0) console.warn('  ⚠ No se encontró ningún video (.mp4, .webm, .m4v, .mov).');
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
  if (pending.length) {
    console.log(`\n  📝 ${pending.length} publicados pero pendientes de revisión (${path.relative('.', REVIEW_FILE)}):`);
    for (const p of pending) console.log(`     · ${p.file}${p.motivo ? ` — ${p.motivo}` : ''}`);
  }

  if (strict && warnings.length) {
    console.error(`\n✖ ${warnings.length} advertencia(s) sin resolver. No se publica con advertencias (RN-22).`);
    console.error('  Para probar igual: npm run catalog && npx vite build\n');
    process.exit(1);
  }
}

main();
