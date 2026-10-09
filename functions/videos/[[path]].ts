// Función de Cloudflare Pages para /videos/*: agrega soporte de pedidos parciales (206), que Pages
// no da para archivos estáticos y que Safari en iPhone necesita para reproducir video (D-10).
// Plan gratuito: 100.000 pedidos/día; con el uso del gimnasio alcanza de sobra.

import { parseRange } from '../../src/range';

interface Context {
  request: Request;
  env: { ASSETS: { fetch(request: Request): Promise<Response> } };
}

const CACHE = 'public, max-age=604800'; // 7 días, igual que public/_headers

export async function onRequestGet({ request, env }: Context): Promise<Response> {
  // Se pide el archivo entero al almacenamiento de Pages y se recorta acá (los videos pesan menos de 5 MB)
  const asset = await env.ASSETS.fetch(new Request(request.url));
  if (!asset.ok) return asset;

  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', CACHE);

  const range = request.headers.get('Range');
  if (!range) return new Response(asset.body, { status: asset.status, headers });

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const r = parseRange(range, size);
  headers.delete('Content-Encoding');
  if (!r) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${r.start}-${r.end}/${size}`);
  headers.set('Content-Length', String(r.end - r.start + 1));
  return new Response(body.slice(r.start, r.end + 1), { status: 206, headers });
}
