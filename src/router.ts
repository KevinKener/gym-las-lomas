// Rutas de la web (RN-15, RN-16, RN-19). Todo por hash para funcionar en cualquier hosting estático.
//
//   #/            inicio: buscador, recientes y grupos musculares
//   #/c/<slug>    lista de una categoría
//   #/todos       lista completa
//   #/e/<id>      reproductor (se abre encima de la vista anterior)

export type View = { kind: 'home' } | { kind: 'category'; category: string } | { kind: 'all' };

export interface Route {
  view: View | null; // null cuando la ruta es un ejercicio: la vista de fondo no cambia
  exerciseId: string | null;
}

export function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function decode(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

/** Interpreta el hash. Una categoría que no existe lleva al inicio. */
export function parseRoute(hash: string, categories: string[]): Route {
  const path = hash.replace(/^#\/?/, '');
  const [kind, ...rest] = path.split('/');
  const param = decode(rest.join('/'));

  if (kind === 'e' && param) return { view: null, exerciseId: param };
  if (kind === 'todos') return { view: { kind: 'all' }, exerciseId: null };
  if (kind === 'c') {
    const category = categories.find((c) => slug(c) === slug(param));
    if (category) return { view: { kind: 'category', category }, exerciseId: null };
  }
  return { view: { kind: 'home' }, exerciseId: null };
}

export function viewHash(view: View): string {
  if (view.kind === 'category') return `#/c/${slug(view.category)}`;
  if (view.kind === 'all') return '#/todos';
  return '#/';
}
