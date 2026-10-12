// Comprime los videos originales para que carguen rápido en el celular
// y genera una miniatura .jpg de cada uno. Nunca modifica los originales.
//
//   npm run optimize                    -> usa RAW_VIDEOS_DIR y VIDEOS_DIR del .env
//   npm run optimize -- <origen> <destino>
//   npm run optimize -- <origen> <destino> --music <audio>
//
// Con --music se descarta el sonido original (por ejemplo, gente hablando) y se pone de fondo
// un tramo de ese audio. Cada video usa un tramo distinto, elegido a partir de su nombre.
//
// Usa el ffmpeg del sistema si existe; si no, el que trae el proyecto (ffmpeg-static).
// Los videos HDR del iPhone (HLG / PQ) se convierten a SDR para que se vean bien en cualquier celular.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import { loadEnv, VIDEO_EXTS } from './env.mjs';

loadEnv();

const args = process.argv.slice(2);
const musicAt = args.indexOf('--music');
const MUSIC = musicAt >= 0 ? path.resolve(args.splice(musicAt, 2)[1] ?? '') : null;
const [srcArg, outArg] = args;
const SRC = path.resolve(srcArg || process.env.RAW_VIDEOS_DIR || '');
const OUT = path.resolve(outArg || process.env.VIDEOS_DIR || 'media');

const FFMPEG = spawnSync('ffmpeg', ['-version']).error ? ffmpegStatic : 'ffmpeg';
if (!FFMPEG || spawnSync(FFMPEG, ['-version']).error) {
  console.error('✖ No se encontró ffmpeg. Corré npm install (trae ffmpeg-static) o instalalo en el sistema.');
  process.exit(1);
}
if (!(srcArg || process.env.RAW_VIDEOS_DIR) || !fs.existsSync(SRC)) {
  console.error('✖ Indicá la carpeta de originales: npm run optimize -- <origen> <destino>');
  process.exit(1);
}
if (MUSIC && !fs.existsSync(MUSIC)) {
  console.error(`✖ No se encontró el audio de fondo: ${MUSIC}`);
  process.exit(1);
}
if (SRC === OUT) {
  console.error('✖ El origen y el destino no pueden ser la misma carpeta.');
  process.exit(1);
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (VIDEO_EXTS.includes(path.extname(entry.name).toLowerCase())) yield full;
  }
}

// Lado corto a 720px como máximo (sirve igual para videos verticales y horizontales).
const SCALE = "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'";

// HDR (HLG o PQ, típico del iPhone) -> SDR bt709. Sin esto los colores quedan lavados.
const TONEMAP =
  'zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';

function probe(file) {
  return spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' }).stderr;
}

function isHdr(file) {
  return /Video:.*(arib-std-b67|smpte2084)/.test(probe(file));
}

function duration(file) {
  const [, h, m, sec] = probe(file).match(/Duration: (\d+):(\d+):([\d.]+)/) ?? [];
  return h ? Number(h) * 3600 + Number(m) * 60 + Number(sec) : 0;
}

// Mismo nombre, mismo tramo: si se vuelve a convertir un video, la música no cambia.
function musicOffset(name, videoSeconds, musicSeconds) {
  const room = Math.floor(Math.max(0, musicSeconds - videoSeconds));
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.codePointAt(0)) >>> 0;
  return room ? hash % room : 0;
}

const MUSIC_SECONDS = MUSIC ? duration(MUSIC) : 0;

// Los iPhone graban además un audio espacial (apac) que ffmpeg no decodifica: se toma solo el primero.
function audioArgs(file, rel) {
  if (!MUSIC) return { inputs: [], map: ['-map', '0:v:0', '-map', '0:a:0?'], filter: [] };
  const seconds = duration(file);
  const fadeOut = Math.max(0, seconds - 0.6).toFixed(2);
  return {
    inputs: ['-ss', String(musicOffset(rel, seconds, MUSIC_SECONDS)), '-t', seconds.toFixed(2), '-i', MUSIC],
    map: ['-map', '0:v:0', '-map', '1:a:0'],
    filter: ['-af', `afade=t=in:d=0.3,afade=t=out:st=${fadeOut}:d=0.6`],
  };
}

const files = [...walk(SRC)];
let done = 0;
let skipped = 0;
let failed = 0;

for (const [i, file] of files.entries()) {
  const rel = path.relative(SRC, file);
  const base = rel.slice(0, -path.extname(rel).length);
  const video = path.join(OUT, `${base}.mp4`);
  const thumb = path.join(OUT, `${base}.jpg`);
  const label = `[${i + 1}/${files.length}] ${rel}`;

  if (fs.existsSync(video) && fs.statSync(video).mtimeMs >= fs.statSync(file).mtimeMs) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(video), { recursive: true });
  console.log(label);

  // Se escribe a un .part y se renombra al final: si se corta, no queda un video a medias.
  const partial = `${video}.part`;
  const filters = isHdr(file) ? `${TONEMAP},${SCALE}` : SCALE;
  const audio = audioArgs(file, rel);
  // Máximo 30 fps: el celular del profe graba a 60 y no suma nada para ver la técnica.
  const encode = spawnSync(
    FFMPEG,
    ['-y', '-loglevel', 'error', '-i', file, ...audio.inputs, ...audio.map,
      '-vf', filters, '-fpsmax', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      ...audio.filter, '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-ar', '44100',
      '-movflags', '+faststart', '-f', 'mp4', partial],
    { stdio: 'inherit' },
  );
  if (encode.status !== 0) {
    console.error(`  ✖ Falló la conversión de ${rel}`);
    fs.rmSync(partial, { force: true });
    failed++;
    continue;
  }
  fs.renameSync(partial, video);

  spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', '1', '-i', video,
    '-frames:v', '1', '-vf', 'scale=360:-2', '-q:v', '5', thumb], { stdio: 'inherit' });

  const before = fs.statSync(file).size / 1024 / 1024;
  const after = fs.statSync(video).size / 1024 / 1024;
  console.log(`  ✔ ${before.toFixed(1)} MB → ${after.toFixed(1)} MB`);
  done++;
}

console.log(`\nListo: ${done} convertidos, ${skipped} ya estaban al día, ${failed} con error.`);
console.log(`Salida: ${OUT}`);
