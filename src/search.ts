// Búsqueda tolerante pensada para alguien que tipea rápido en el celular,
// leyendo el nombre desde un cartel: ignora tildes y mayúsculas, acepta
// palabras incompletas ("sent bulg"), en cualquier orden, y errores de tipeo
// ("sentadila", "mancuerna" vs "mancuernas").

const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'con', 'en', 'a', 'al', 'y', 'para', 'por']);

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

interface Entry<T> {
  item: T;
  full: string;
  tokens: string[];
  categoryTokens: string[];
}

export interface SearchIndex<T> {
  entries: Entry<T>[];
}

export function buildIndex<T>(items: T[], name: (item: T) => string, category: (item: T) => string | null): SearchIndex<T> {
  return {
    entries: items.map((item) => {
      const full = normalize(name(item));
      return {
        item,
        full,
        tokens: full.split(' ').filter(Boolean),
        categoryTokens: normalize(category(item) ?? '').split(' ').filter(Boolean),
      };
    }),
  };
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

/** Errores de tipeo tolerados según el largo de la palabra (RN-11). */
const allowedDistance = (len: number): number => (len >= 7 ? 2 : len >= 4 ? 1 : 0);

function tokenScore(query: string, tokens: string[]): number {
  let best = 0;
  for (const token of tokens) {
    if (token === query) return 3;
    if (token.startsWith(query)) best = Math.max(best, 2.2);
    else if (query.length >= 3 && token.includes(query)) best = Math.max(best, 1.2);
    else {
      const maxDistance = allowedDistance(query.length);
      if (!maxDistance) continue;
      const distance = Math.min(levenshtein(query, token), levenshtein(query, token.slice(0, query.length)));
      if (distance <= maxDistance) best = Math.max(best, 1 - distance * 0.2);
    }
  }
  return best;
}

/** Palabras de la búsqueda sin las de relleno (si son todas de relleno, se usan igual). */
function queryTerms(q: string): string[] {
  const all = q.split(' ');
  const terms = all.filter((t) => !STOPWORDS.has(t));
  return terms.length ? terms : all;
}

/** Devuelve los ítems que coinciden, ordenados por relevancia. Query vacía = todos. */
export function search<T>(index: SearchIndex<T>, query: string): T[] {
  const q = normalize(query);
  if (!q) return index.entries.map((e) => e.item);

  const scored: { item: T; score: number }[] = [];
  for (const entry of index.entries) {
    let score = 0;
    let matchesAll = true;
    for (const term of queryTerms(q)) {
      const s = tokenScore(term, entry.tokens) || tokenScore(term, entry.categoryTokens) * 0.5;
      if (!s) {
        matchesAll = false;
        break;
      }
      score += s;
    }
    if (!matchesAll) continue;
    if (entry.full.startsWith(q)) score += 3;
    else if (entry.full.includes(q)) score += 1.5;
    scored.push({ item: entry.item, score });
  }

  // sort es estable: a igual puntaje se mantiene el orden alfabético del catálogo.
  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}

/**
 * RN-13: cuando la búsqueda no encuentra nada, propone los ejercicios más parecidos.
 * Alcanza con que coincida alguna de las palabras (con la misma tolerancia a errores de RN-11).
 * No se afloja la tolerancia: con más margen, "sentadilla" sugería "sentado" y "zancadas", "patadas".
 * Mejor no sugerir nada que sugerir algo equivocado.
 *
 * Las palabras raras pesan más que las comunes (IDF): en "press francés soga", "francés" y "soga"
 * dicen mucho más que "press", que aparece en decenas de ejercicios.
 */
export function suggest<T>(index: SearchIndex<T>, query: string, limit = 3): T[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = queryTerms(q);
  const total = index.entries.length;

  const perEntry = index.entries.map((entry) => terms.map((term) => tokenScore(term, entry.tokens)));
  const weights = terms.map((_, t) => {
    const df = perEntry.filter((scores) => scores[t] > 0).length;
    return df ? Math.log(1 + total / df) : 0;
  });

  return index.entries
    .map((entry, i) => ({ item: entry.item, score: perEntry[i].reduce((sum, s, t) => sum + s * weights[t], 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score) // estable: a igual puntaje, orden alfabético
    .slice(0, limit)
    .map((r) => r.item);
}

/** Normaliza letra por letra, manteniendo la posición de cada una en el texto original. */
function normalizeChars(text: string): string {
  return [...text].map((c) => normalize(c).charAt(0) || ' ').join('');
}

/**
 * Rangos [inicio, fin) del texto original que coinciden con la búsqueda, para resaltarlos.
 * Prefijo de palabra: se resalta lo escrito. Contenido o con errores de tipeo: la palabra entera.
 */
export function matchRanges(text: string, query: string): [number, number][] {
  const q = normalize(query);
  if (!q || [...text].length !== text.length) return []; // emojis u otros símbolos dobles: sin resaltado
  const chars = normalizeChars(text);
  const words = [...chars.matchAll(/[a-z0-9]+/g)].map((m) => ({ word: m[0], start: m.index! }));

  const ranges: [number, number][] = [];
  for (const term of queryTerms(q)) {
    for (const { word, start } of words) {
      if (word.startsWith(term)) ranges.push([start, start + term.length]);
      else if (term.length >= 3 && word.includes(term)) {
        const at = start + word.indexOf(term);
        ranges.push([at, at + term.length]);
      } else if (tokenScore(term, [word])) ranges.push([start, start + word.length]);
    }
  }

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}
