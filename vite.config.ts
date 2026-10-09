import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * En desarrollo sirve la carpeta de videos en /videos/ directamente desde el disco
 * (con soporte de Range, que Safari en iPhone necesita para reproducir).
 * En el build, si COPY_VIDEOS=1, la copia dentro de dist/videos.
 */
function videosFolder(dir: string, copyOnBuild: boolean): Plugin {
  const root = path.resolve(dir);
  const mount = '/videos/';

  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith(mount)) return next();
    let rel: string;
    try {
      rel = decodeURIComponent(req.url.slice(mount.length).split('?')[0]);
    } catch {
      return next();
    }
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep)) {
      res.statusCode = 403;
      return res.end();
    }

    fs.stat(file, (err, stat) => {
      if (err || !stat.isFile()) return next();
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream');

      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
      if (!match) {
        res.setHeader('Content-Length', stat.size);
        fs.createReadStream(file).pipe(res);
        return;
      }
      let start = match[1] ? Number(match[1]) : stat.size - Number(match[2]);
      let end = match[1] && match[2] ? Number(match[2]) : stat.size - 1;
      end = Math.min(end, stat.size - 1);
      start = Math.max(start, 0);
      if (start > end) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${stat.size}`);
        return res.end();
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(file, { start, end }).pipe(res);
    });
  };

  return {
    name: 'las-lomas:videos-folder',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
    closeBundle() {
      if (!copyOnBuild || !fs.existsSync(root)) return;
      const target = path.resolve('dist/videos');
      fs.cpSync(root, target, {
        recursive: true,
        filter: (src) => fs.statSync(src).isDirectory() || path.extname(src).toLowerCase() in MIME,
      });
      console.log(`\n✔ Videos copiados a ${target}`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [videosFolder(env.VIDEOS_DIR || 'videos', env.COPY_VIDEOS === '1')],
    // allowedHosts: permite probar desde el celular con un túnel temporal de Cloudflare (*.trycloudflare.com)
    server: { host: true, allowedHosts: ['.trycloudflare.com'] },
    preview: { host: true, allowedHosts: ['.trycloudflare.com'] },
  };
});
