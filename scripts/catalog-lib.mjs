// Reglas puras del catálogo (sin acceso a disco), para poder testearlas.
// Ver docs/REGLAS-DE-NEGOCIO.md: RN-05 a RN-07 y RN-10.

export const VIDEO_EXTS = ['.mp4', '.m4v', '.webm', '.mov'];
export const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Límite por archivo de Cloudflare Pages (RN-10). */
export const MAX_VIDEO_MB = 25;

/** RN-05: "03_press-de banca  " -> "Press-de banca" */
export function prettify(base) {
  const name = base
    .replace(/^\d+\s*[-._)]\s*/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name.charAt(0).toLocaleUpperCase('es') + name.slice(1);
}

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const extOf = (p) => {
  const dot = p.lastIndexOf('.');
  return dot > p.lastIndexOf('/') ? p.slice(dot).toLowerCase() : '';
};
const stripExt = (p) => p.slice(0, p.length - extOf(p).length);

/**
 * RN-07: { "Pecho": ["press plano barra", ...] } -> Map(slug del nombre -> categoría).
 * Se compara por slug para que no importen tildes, mayúsculas ni numeración.
 */
function indexCategories(categoryMap, warnings) {
  const bySlug = new Map();
  for (const [category, names] of Object.entries(categoryMap)) {
    for (const name of names) {
      const key = slugify(prettify(name));
      if (bySlug.has(key) && bySlug.get(key).category !== category) {
        warnings.push(`categorias.json: "${name}" está en "${bySlug.get(key).category}" y en "${category}". Dejalo en una sola.`);
        continue;
      }
      bySlug.set(key, { category, name, used: false });
    }
  }
  return bySlug;
}

/**
 * RN-06: { "nombre del archivo": { nombre?, motivo } } -> Map(slug -> entrada).
 * Las claves que empiezan con "_" son comentarios.
 */
function indexReview(reviewMap) {
  const bySlug = new Map();
  for (const [file, data] of Object.entries(reviewMap)) {
    if (file.startsWith('_')) continue;
    bySlug.set(slugify(prettify(file)), { file, nombre: data.nombre ?? null, motivo: data.motivo ?? '', used: false });
  }
  return bySlug;
}

/**
 * Arma el catálogo a partir de la lista de archivos de la carpeta.
 * @param {{ path: string, size: number }[]} files rutas relativas con "/"
 * @param {Record<string, string[]>} [categoryMap] categorías para videos sin subcarpeta (contenido/categorias.json)
 * @param {Record<string, { nombre?: string, motivo: string }>} [reviewMap] videos pendientes de revisión (contenido/revisar.json)
 * @returns {{ categories: string[], exercises: object[], warnings: string[], pending: { name: string, file: string, motivo: string }[] }}
 */
export function buildCatalog(files, categoryMap = {}, reviewMap = {}) {
  const images = new Map();
  for (const f of files) {
    if (IMAGE_EXTS.includes(extOf(f.path))) images.set(stripExt(f.path).toLowerCase(), f.path);
  }

  const usedIds = new Set();
  const byName = new Map();
  const exercises = [];
  const warnings = [];
  const mapped = indexCategories(categoryMap, warnings);
  const review = indexReview(reviewMap);
  const pending = [];

  for (const f of files) {
    const ext = extOf(f.path);
    if (!VIDEO_EXTS.includes(ext)) continue;

    const parts = f.path.split('/');
    const fileName = prettify(stripExt(parts.at(-1)));
    const fileKey = slugify(fileName);
    // Un video en revisión puede mostrarse con otro nombre, pero se lo sigue identificando por su archivo.
    const reviewEntry = review.get(fileKey);
    const name = reviewEntry?.nombre ? prettify(reviewEntry.nombre) : fileName;
    const key = slugify(name);
    if (reviewEntry) {
      reviewEntry.used = true;
      pending.push({ name, file: f.path, motivo: reviewEntry.motivo });
    }
    const entry = mapped.get(fileKey);
    if (entry) entry.used = true;
    // RN-07: la subcarpeta manda; si no hay, se usa categorias.json
    const category = parts.length > 1 ? prettify(parts[0]) : (entry?.category ?? null);
    if (!category && mapped.size)
      warnings.push(`${f.path}: no tiene categoría. Agregalo en contenido/categorias.json (RN-07).`);

    if (byName.has(key)) {
      warnings.push(`Nombre repetido (RN-06): "${f.path}" y "${byName.get(key)}". Renombrá uno de los dos.`);
    } else {
      byName.set(key, f.path);
    }

    let id = key || 'ejercicio';
    for (let n = 2; usedIds.has(id); n++) id = `${key || 'ejercicio'}-${n}`;
    usedIds.add(id);

    if (!reviewEntry && /\(\d+\)$|\bcopia\b/i.test(fileName))
      warnings.push(`${f.path}: parece una copia o segunda toma (RN-06). Quedate con una o poneles nombres distintos.`);
    if (ext !== '.mp4') warnings.push(`${f.path}: formato ${ext}. Usá .mp4 (RN-10, npm run optimize).`);
    if (f.size > MAX_VIDEO_MB * 1024 * 1024)
      warnings.push(`${f.path}: pesa ${(f.size / 1024 / 1024).toFixed(0)} MB, el máximo es ${MAX_VIDEO_MB} MB (RN-10, npm run optimize).`);

    exercises.push({
      id,
      name,
      category,
      src: f.path,
      poster: images.get(stripExt(f.path).toLowerCase()) ?? null,
      size: f.size,
    });
  }

  for (const { name, category, used } of mapped.values()) {
    if (!used) warnings.push(`categorias.json: "${name}" (${category}) no coincide con ningún video. ¿Se renombró o se borró?`);
  }

  for (const { file, used } of review.values()) {
    if (!used) warnings.push(`revisar.json: "${file}" no coincide con ningún video. Si ya se resolvió, sacalo de la lista.`);
  }

  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
  exercises.sort((a, b) => collator.compare(a.name, b.name));
  // Orden de las categorías: el de categorias.json (lo define el gimnasio); las demás, alfabéticas al final
  const preferred = Object.keys(categoryMap);
  const rank = (c) => (preferred.includes(c) ? preferred.indexOf(c) : preferred.length);
  const categories = [...new Set(exercises.map((e) => e.category).filter(Boolean))].sort(
    (a, b) => rank(a) - rank(b) || collator.compare(a, b),
  );

  return { categories, exercises, warnings, pending };
}
