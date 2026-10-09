// Pedidos parciales de video ("Range: bytes=..."). Safari en iPhone no reproduce un video si el servidor
// no los responde con 206 (D-10). Lo usan el servidor de desarrollo (vite.config.ts) y la función de
// Cloudflare Pages (functions/videos/[[path]].ts).

export interface ByteRange {
  start: number;
  end: number; // inclusivo
}

/**
 * Interpreta el header Range para un archivo de `size` bytes.
 * Devuelve null si el rango no se puede servir (respuesta 416). Con varios rangos usa solo el primero.
 */
export function parseRange(header: string, size: number): ByteRange | null {
  const match = /^bytes=\s*(\d*)\s*-\s*(\d*)/.exec(header.trim());
  if (!match || size <= 0) return null;
  const [, from, to] = match;
  if (!from && !to) return null;

  if (!from) {
    // "bytes=-500": los últimos 500 bytes
    const suffix = Number(to);
    if (suffix === 0) return null;
    return { start: Math.max(size - suffix, 0), end: size - 1 };
  }

  const start = Number(from);
  const end = to ? Math.min(Number(to), size - 1) : size - 1;
  if (start >= size || start > end) return null;
  return { start, end };
}
