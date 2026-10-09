import fs from 'node:fs';

export { VIDEO_EXTS, IMAGE_EXTS } from './catalog-lib.mjs';

/** Carga .env si existe. Las variables ya definidas en la terminal tienen prioridad. */
export function loadEnv() {
  if (fs.existsSync('.env')) process.loadEnvFile('.env');
}
