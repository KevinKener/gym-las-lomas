import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import './styles.css';
import { buildIndex, matchRanges, search, suggest, type SearchIndex } from './search';
import { parseRoute, slug, viewHash, type View } from './router';
import type { Catalog, Exercise } from './types';

const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const ui = {
  form: byId<HTMLFormElement>('search-form'),
  input: byId<HTMLInputElement>('q'),
  clear: byId<HTMLButtonElement>('clear'),
  home: byId('home'),
  browse: byId('browse'),
  tiles: byId<HTMLUListElement>('tiles'),
  allCount: byId('all-count'),
  viewHead: byId('view-head'),
  viewBack: byId<HTMLButtonElement>('view-back'),
  viewTitle: byId('view-title'),
  searchBar: document.querySelector<HTMLElement>('.search-bar')!,
  top: document.querySelector<HTMLElement>('.top')!,
  hero: byId('hero'),
  stat: byId('stat'),
  recents: byId('recents'),
  recentsRow: byId('recents-row'),
  recentsClear: byId<HTMLButtonElement>('recents-clear'),
  toast: byId('toast'),
  announcer: byId('announcer'),
  recentsTitle: byId('recents-title'),
  content: byId('content'),
  videoRetry: byId<HTMLButtonElement>('video-retry'),
  toastText: byId('toast-text'),
  toastAction: byId<HTMLButtonElement>('toast-action'),
  count: byId('count'),
  list: byId<HTMLUListElement>('list'),
  empty: byId('empty'),
  emptyQuery: byId('empty-q'),
  suggest: byId('suggest'),
  suggestList: byId<HTMLUListElement>('suggest-list'),
  videoLoading: byId('video-loading'),
  slowmo: byId<HTMLButtonElement>('slowmo'),
  loading: byId('loading'),
  error: byId('error'),
  retry: byId<HTMLButtonElement>('retry'),
  player: byId<HTMLDialogElement>('player'),
  playerClose: byId<HTMLButtonElement>('player-close'),
  playerShare: byId<HTMLButtonElement>('player-share'),
  playerTitle: byId('player-title'),
  playerCat: byId('player-cat'),
  video: byId<HTMLVideoElement>('video'),
  videoFrame: byId('video-frame'),
  videoError: byId('video-error'),
  related: byId('related'),
  relatedTitle: byId('related-title'),
  relatedRow: byId('related-row'),
};

const RECENTS_KEY = 'laslomas:recents';
const RECENTS_MAX = 8;

let catalog: Catalog;
let index: SearchIndex<Exercise>;
let exercisesById = new Map<string, Exercise>();
/** Vista de fondo (inicio, categoría o todos). El reproductor se abre encima. */
let view: View = { kind: 'home' };
/** Posición de scroll de cada vista, para volver al mismo lugar con "atrás". */
const scrollByView = new Map<string, number>();
const DEFAULT_PLACEHOLDER = 'Buscá el ejercicio del cartel…';
/** Cámara lenta: se mantiene entre videos mientras la web esté abierta. */
let slowMotion = false;
/** Si el video ya estaba silenciado antes de la cámara lenta, se respeta al salir de ella. */
let mutedBeforeSlow = false;

// ---------- utilidades ----------

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function mediaUrl(rel: string, rev: string | null): string {
  const base = catalog.videoBaseUrl.endsWith('/') ? catalog.videoBaseUrl : `${catalog.videoBaseUrl}/`;
  // ?v= cambia si se reemplaza el video: el celular baja el nuevo en vez de usar el guardado (D-13)
  return base + rel.split('/').map(encodeURIComponent).join('/') + (rev ? `?v=${rev}` : '');
}

function storage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // modo privado o almacenamiento lleno: no es crítico
  }
}

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>';

function thumb(ex: Exercise, className: string): string {
  return ex.poster
    ? `<img class="${className}" src="${mediaUrl(ex.poster, ex.rev)}" alt="" loading="lazy" decoding="async">`
    : `<span class="${className} ${className}--empty">${PLAY_ICON}</span>`;
}

// ---------- lista y búsqueda ----------

/** Marca con <mark> las partes del nombre que coinciden con la búsqueda. */
function highlight(text: string, query: string): string {
  let html = '';
  let last = 0;
  for (const [start, end] of matchRanges(text, query)) {
    html += escapeHtml(text.slice(last, start)) + `<mark>${escapeHtml(text.slice(start, end))}</mark>`;
    last = end;
  }
  return html + escapeHtml(text.slice(last));
}

function rowHtml(ex: Exercise, query: string, showCategory = true): string {
  return `
      <li>
        <a class="row" href="#/e/${encodeURIComponent(ex.id)}" data-id="${escapeHtml(ex.id)}">
          ${thumb(ex, 'row-thumb')}
          <span class="row-text">
            <span class="row-name">${highlight(ex.name, query)}</span>
            ${showCategory && ex.category ? `<span class="row-cat">${escapeHtml(ex.category)}</span>` : ''}
          </span>
          <svg class="row-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </li>`;
}

/**
 * Las fotos de la primera fila de grupos son lo más grande que se ve al entrar (el LCP):
 * se piden enseguida y con prioridad. El resto, recién cuando el socio scrollea.
 */
const TILES_ABOVE_FOLD = 3; // con el bento, el destacado y la primera fila
const tileLoading = (i: number) => (i < TILES_ABOVE_FOLD ? 'fetchpriority="high"' : 'loading="lazy"');

/** Grupos de ejercicios con foto de portada y cantidad (en vez de mostrar los 190 de entrada). */
function renderTiles() {
  ui.tiles.innerHTML = catalog.categories
    .map((category, i) => {
      const items = catalog.exercises.filter((e) => e.category === category);
      const cover = items.find((e) => e.poster);
      return `
      <li>
        <a class="tile" href="#/c/${slug(category)}">
          ${cover ? `<img class="tile-img" src="${mediaUrl(cover.poster!, cover.rev)}" alt="" ${tileLoading(i)} decoding="async">` : ''}
          <span class="tile-text">
            <span class="tile-name">${escapeHtml(category)}</span>
            <span class="tile-meta">
              <span class="tile-count">${plural(items.length)}</span>
              <svg class="tile-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </span>
        </a>
      </li>`;
    })
    .join('');
  ui.allCount.textContent = String(catalog.exercises.length);
  const videos = catalog.exercises.length;
  const groups = catalog.categories.length;
  ui.stat.textContent =
    `${videos} ${videos === 1 ? 'video' : 'videos'}` +
    (groups ? ` · ${groups} ${groups === 1 ? 'grupo de ejercicios' : 'grupos de ejercicios'}` : '');
  ui.browse.hidden = catalog.categories.length === 0;
}

const plural = (n: number) => `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}`;

function render() {
  const query = ui.input.value;
  const searching = query.trim() !== '';
  const category = view.kind === 'category' ? view.category : null;
  const showHome = view.kind === 'home' && !searching;

  ui.clear.hidden = !query;
  ui.input.placeholder = category ? `Buscá en ${category}…` : DEFAULT_PLACEHOLDER;

  // Encabezado de categoría / todos
  ui.viewHead.hidden = view.kind === 'home';
  // El titular solo en el inicio. Al escribir se oculta: con el teclado abierto, el lugar es para los resultados
  ui.hero.hidden = view.kind !== 'home' || searching;
  document.documentElement.classList.remove('no-hero');
  ui.viewTitle.textContent = category ?? 'Todos los ejercicios';

  // Inicio: recientes + grupos de ejercicios. Sin categorías no hay grupos.
  ui.home.hidden = !showHome;
  ui.recents.hidden = !showHome || !renderRecents();
  if (showHome) {
    ui.list.innerHTML = '';
    ui.empty.hidden = ui.suggest.hidden = true;
    ui.count.classList.add('sr-only');
    ui.count.textContent = '';
    return;
  }

  // Lista: búsqueda (global o dentro de la categoría) o la categoría completa
  let results = searching ? search(index, query) : catalog.exercises;
  if (category) results = results.filter((e) => e.category === category);
  ui.list.innerHTML = results.map((ex) => rowHtml(ex, query, !category)).join('');

  const noResults = results.length === 0;
  ui.empty.hidden = !noResults;
  // RN-13: sin resultados, se ofrecen los más parecidos de todo el catálogo
  const suggestions = noResults && searching ? suggest(index, query) : [];
  ui.suggest.hidden = suggestions.length === 0;
  ui.suggestList.innerHTML = suggestions.map((ex) => rowHtml(ex, query)).join('');
  ui.emptyQuery.textContent = query.trim() + (category ? `” en “${category}` : '');
  // Sin resultados el contador se oculta a la vista, pero sigue avisando al lector de pantalla
  ui.count.classList.toggle('sr-only', noResults);
  ui.count.textContent = noResults ? `Sin resultados.${suggestions.length ? ' Hay sugerencias.' : ''}` : plural(results.length);
}

/** Pinta "vistos recientemente". Devuelve false si no hay nada para mostrar. */
function renderRecents(): boolean {
  const recents = storage<string[]>(RECENTS_KEY, [])
    .map((id) => exercisesById.get(id))
    .filter((e): e is Exercise => Boolean(e));
  if (!recents.length) return false;
  ui.recentsRow.innerHTML = recents.map(cardHtml).join('');
  return true;
}

function cardHtml(ex: Exercise): string {
  return `
    <a class="card" href="#/e/${encodeURIComponent(ex.id)}" data-id="${escapeHtml(ex.id)}">
      ${thumb(ex, 'card-thumb')}
      <span class="card-name">${escapeHtml(ex.name)}</span>
    </a>`;
}

/** RN-03: el socio puede borrar su historial. Se ofrece "Deshacer" en vez de pedir confirmación. */
function clearRecents() {
  const previous = storage<string[]>(RECENTS_KEY, []);
  store(RECENTS_KEY, []);
  render();
  showToast('Historial borrado', 'Deshacer', () => {
    // Si vio algo entre borrar y deshacer, se conserva adelante
    const current = storage<string[]>(RECENTS_KEY, []);
    store(RECENTS_KEY, [...new Set([...current, ...previous])].slice(0, RECENTS_MAX));
    render();
  });
}

function announce(text: string) {
  ui.announcer.textContent = '';
  window.setTimeout(() => (ui.announcer.textContent = text), 50); // re-anuncia aunque el texto se repita
}

/** Devuelve el foco a un lugar estable sin abrir el teclado del celular. */
function restoreFocus() {
  (ui.recents.hidden ? ui.content : ui.recentsTitle).focus({ preventScroll: true });
}

let toastTimer: number | undefined;
let toastHandler: (() => void) | null = null;

const TOAST_MS = 8000;

function hideToast() {
  window.clearTimeout(toastTimer);
  const hadFocus = ui.toast.contains(document.activeElement);
  ui.toast.hidden = true;
  toastHandler = null;
  if (hadFocus) restoreFocus();
}

function showToast(text: string, action: string, onAction: () => void) {
  window.clearTimeout(toastTimer);
  ui.toastText.textContent = text;
  ui.toastAction.textContent = action;
  toastHandler = onAction;
  ui.toast.hidden = false;
  announce(text);
  ui.toastAction.focus({ preventScroll: true }); // el botón "Borrar" desaparece: el foco no se pierde
  toastTimer = window.setTimeout(hideToast, TOAST_MS);
}

function pushRecent(id: string) {
  const recents = storage<string[]>(RECENTS_KEY, []).filter((r) => r !== id);
  recents.unshift(id);
  store(RECENTS_KEY, recents.slice(0, RECENTS_MAX));
}

// ---------- reproductor ----------

function showExercise(ex: Exercise) {
  hideToast();
  ui.playerTitle.textContent = ex.name;
  ui.playerCat.textContent = ex.category ?? '';
  ui.playerCat.hidden = !ex.category;
  ui.videoError.hidden = true;
  ui.videoFrame.hidden = false;

  ui.video.poster = ex.poster ? mediaUrl(ex.poster, ex.rev) : '';
  ui.video.src = mediaUrl(ex.src, ex.rev);
  applyPlaybackRate();
  ui.video.play().catch(() => {
    // Si el navegador bloquea el autoplay, el usuario toca play.
  });

  ui.related.hidden = true;
  document.title = `${ex.name} · Gym Las Lomas`;
  const from = pendingMorph;
  pendingMorph = null;
  if (!ui.player.open) {
    ui.player.classList.toggle('is-morphing', Boolean(from) && !reduceMotion.matches);
    ui.player.showModal();
    ui.player.scrollTop = 0; // antes de medir dónde termina el video
    if (from && !reduceMotion.matches) morphStage(from);
  }
  ui.player.scrollTop = 0;
  pushRecent(ex.id);

  // Los relacionados quedan debajo del video: se arman después de mostrar el reproductor,
  // así el toque responde enseguida en celulares lentos. El video no se demora: iOS solo deja
  // reproducir con sonido si play() se llama dentro del mismo toque.
  const shown = ++playerSeq;
  afterPaint(() => {
    if (shown !== playerSeq) return; // ya se abrió otro ejercicio
    renderRelated(ex);
  });
}

let playerSeq = 0;

// ---------- transiciones ----------

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
/** Foto que el socio tocó para abrir un ejercicio: el video "crece" desde ahí. */
let pendingMorph: DOMRect | null = null;
const MORPH_MS = 320;
const EASE_OUT_SOFT = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * El video crece desde la miniatura tocada hasta su lugar (con la forma de la miniatura al principio).
 * Se hace a mano y no con View Transitions porque iOS solo reproduce con sonido si play() se llama
 * en el mismo toque, y startViewTransition aplica el cambio un instante después.
 */
function morphStage(from: DOMRect) {
  const stage = ui.videoFrame;
  const to = stage.getBoundingClientRect();
  if (!to.width || !to.height) return;
  const scale = from.width / to.width;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  // Al principio solo se ve un recorte con la proporción de la miniatura (cuadrada o casi)
  const insetY = Math.max(0, (to.height - from.height / scale) / 2);
  stage.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, clipPath: `inset(${insetY}px 0 round ${12 / scale}px)` },
      { transform: 'none', clipPath: 'inset(0 round 0)' },
    ],
    { duration: MORPH_MS, easing: EASE_OUT_SOFT },
  );
  // La cámara lenta aparece cuando el video ya llegó a su lugar: achicada se vería como un punto
  ui.slowmo.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: MORPH_MS });
}

const titleOfTile = (category: string) =>
  ui.tiles.querySelector<HTMLElement>(`a[href="#/c/${slug(category)}"] .tile-name`);

/** Elemento que hace de título de la vista: el de la categoría abierta o el nombre en su tarjeta del inicio. */
function viewTitleEl(v: View, category: string | null): HTMLElement | null {
  if (v.kind === 'category') return ui.viewTitle;
  return v.kind === 'home' && category ? titleOfTile(category) : null;
}

/**
 * Cambio entre inicio, categoría y todos con View Transitions: el nombre de la tarjeta tocada
 * se transforma en el título de la categoría (y vuelve al tocar "atrás"). Sin soporte, cambia directo.
 */
function morphView(from: View, to: View, apply: () => void, skip: boolean) {
  // Una navegación nueva corta la animación anterior (su cambio de pantalla se aplica igual)
  activeTransition?.skipTransition();
  if (skip || reduceMotion.matches || !document.startViewTransition) return apply();
  const category = from.kind === 'category' ? from.category : to.kind === 'category' ? to.category : null;
  const oldTitle = viewTitleEl(from, category);
  oldTitle?.style.setProperty('view-transition-name', 'view-title');
  let newTitle: HTMLElement | null = null;
  const transition = document.startViewTransition(() => {
    oldTitle?.style.removeProperty('view-transition-name');
    apply();
    newTitle = viewTitleEl(to, category);
    newTitle?.style.setProperty('view-transition-name', 'view-title');
  });
  activeTransition = transition;
  transition.ready.catch(() => {}); // si se corta, no es un error
  transition.finished
    .catch(() => {})
    .finally(() => {
      oldTitle?.style.removeProperty('view-transition-name');
      newTitle?.style.removeProperty('view-transition-name');
      if (activeTransition === transition) activeTransition = null;
    });
}

let activeTransition: ViewTransition | null = null;

/** Corre fn después del próximo cuadro pintado. */
function afterPaint(fn: () => void) {
  requestAnimationFrame(() => window.setTimeout(fn, 0));
}

function renderRelated(ex: Exercise) {
  const related = catalog.exercises.filter((e) => e.category && e.category === ex.category && e.id !== ex.id).slice(0, 10);
  ui.related.hidden = related.length === 0;
  ui.relatedTitle.textContent = `Más de ${ex.category ?? ''}`;
  ui.relatedRow.innerHTML = related.map(cardHtml).join('');
  ui.relatedRow.scrollLeft = 0;
}

function applyPlaybackRate() {
  const rate = slowMotion ? 0.5 : 1;
  ui.video.defaultPlaybackRate = rate; // se mantiene aunque el video se recargue
  ui.video.playbackRate = rate;
  ui.slowmo.setAttribute('aria-pressed', String(slowMotion));
}

let loadingTimer: number | undefined;
let stallTimer: number | undefined;
const STALL_MS = 15000;

/**
 * Indicador de carga con una pequeña demora, para que no parpadee si el video ya está listo.
 * Si la carga se traba más de 15 s (mala señal), se muestra el error con "Reintentar" (RN-20).
 */
function setVideoLoading(loading: boolean) {
  window.clearTimeout(loadingTimer);
  window.clearTimeout(stallTimer);
  if (loading && ui.video.getAttribute('src')) {
    loadingTimer = window.setTimeout(() => (ui.videoLoading.hidden = false), 250);
    stallTimer = window.setTimeout(showVideoError, STALL_MS);
  } else {
    ui.videoLoading.hidden = true;
  }
}

function showVideoError() {
  if (!ui.video.getAttribute('src')) return;
  setVideoLoading(false);
  ui.videoFrame.hidden = true;
  ui.videoError.hidden = false;
}

function retryVideo() {
  ui.videoError.hidden = true;
  ui.videoFrame.hidden = false;
  ui.video.load();
  applyPlaybackRate();
  ui.video.play().catch(() => {});
}

function stopVideo() {
  ui.video.pause();
  ui.video.removeAttribute('src');
  ui.video.removeAttribute('poster');
  ui.video.load(); // corta la descarga en curso
}

// ---------- navegación ----------

/** Navegación interna: apila en el historial y marca la entrada como propia (para "volver"). */
function navigate(hash: string, { replace = false } = {}) {
  if (replace) history.replaceState(history.state, '', hash);
  else history.pushState({ inApp: true }, '', hash);
  syncRoute();
}

/**
 * "Volver" de la interfaz (RN-19). Si la pantalla anterior es nuestra, usa el historial (igual que el
 * botón atrás del celular); si se entró por un link directo, va a la pantalla padre sin salir de la web.
 */
function goBack(parentHash: string) {
  if (history.state?.inApp) history.back();
  else navigate(parentHash, { replace: true });
}

function sameView(a: View, b: View) {
  return viewHash(a) === viewHash(b);
}

/**
 * hasUAVisualTransition: el navegador ya animó el "atrás" (por ejemplo, deslizando el dedo en iOS).
 * En ese caso no se suma otra animación encima.
 */
function syncRoute(e?: PopStateEvent) {
  const route = parseRoute(location.hash, catalog.categories);
  const ex = route.exerciseId ? exercisesById.get(route.exerciseId) : undefined;
  if (!ex) pendingMorph = null; // el toque no abrió un video: que no quede una posición vieja
  if (ex) {
    showExercise(ex);
    return;
  }
  if (ui.player.open) {
    stopVideo();
    ui.player.close();
    document.title = 'Gym Las Lomas · Ejercicios';
  }

  const next = route.view ?? { kind: 'home' };
  if (sameView(next, view)) {
    render();
    return;
  }
  // El estado cambia en el momento (aunque la animación dibuje un instante después): si llega otro
  // "atrás" durante la transición, se compara contra la vista nueva y la URL nunca queda desfasada (RN-19)
  const from = view;
  scrollByView.set(viewHash(from), window.scrollY);
  // Al cambiar de pantalla la búsqueda arranca de cero (salvo la que vino en el link, ?q=)
  if (next.kind !== 'home' || from.kind !== 'home') ui.input.value = '';
  view = next;
  morphView(from, next, () => {
    render();
    // Volver con "atrás" deja la lista donde estaba; entrar a una pantalla nueva arranca arriba
    // (si venía scrolleado, el logo queda oculto y el título de la categoría justo debajo del buscador)
    const saved = scrollByView.get(viewHash(view));
    const headerHeight = ui.top.offsetHeight; // la barra es sticky: su offsetTop cambia, el logo no
    window.scrollTo(0, saved ?? (view.kind === 'home' ? 0 : Math.min(window.scrollY, headerHeight)));
    // El foco va al título de la categoría o, al volver al inicio, a la tarjeta de la que se venía
    if (view.kind !== 'home') ui.viewTitle.focus({ preventScroll: true });
    else if (from.kind === 'category') titleOfTile(from.category)?.closest('a')?.focus({ preventScroll: true });
  }, Boolean((e as PopStateEvent & { hasUAVisualTransition?: boolean })?.hasUAVisualTransition));
}

function closePlayer() {
  goBack(viewHash(view));
}

// ---------- eventos ----------

function bindEvents() {
  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    ui.input.blur(); // cierra el teclado del celular
  });
  ui.input.addEventListener('input', render);
  ui.clear.addEventListener('click', () => {
    ui.input.value = '';
    render();
    ui.input.focus();
  });

  // Todos los links internos (#/...) pasan por navigate(). Los relacionados reemplazan en vez de apilar:
  // así "atrás" desde un video siempre vuelve a la lista, no al video anterior.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#/"]');
    if (!link) return;
    e.preventDefault();
    const photo = link.querySelector('img');
    pendingMorph = photo && link.getAttribute('href')!.startsWith('#/e/') ? photo.getBoundingClientRect() : null;
    navigate(link.getAttribute('href')!, { replace: ui.relatedRow.contains(link) });
  });

  ui.viewBack.addEventListener('click', () => goBack('#/'));

  ui.playerClose.addEventListener('click', closePlayer);
  ui.player.addEventListener('cancel', (e) => {
    e.preventDefault(); // Escape: lo manejamos nosotros para mantener el historial coherente
    closePlayer();
  });

  if ('share' in navigator) {
    ui.playerShare.hidden = false;
    ui.playerShare.addEventListener('click', () => {
      navigator.share({ title: `${ui.playerTitle.textContent} · Gym Las Lomas`, url: location.href }).catch(() => {});
    });
  }

  // RN-19b: en cámara lenta el audio (música de fondo) se distorsiona, así que se silencia
  ui.slowmo.addEventListener('click', () => {
    slowMotion = !slowMotion;
    if (slowMotion) {
      mutedBeforeSlow = ui.video.muted;
      ui.video.muted = true;
    } else {
      ui.video.muted = mutedBeforeSlow;
    }
    applyPlaybackRate();
  });

  for (const type of ['loadstart', 'waiting', 'seeking', 'stalled']) ui.video.addEventListener(type, () => setVideoLoading(true));
  for (const type of ['canplay', 'playing', 'seeked', 'pause', 'error', 'emptied'])
    ui.video.addEventListener(type, () => setVideoLoading(false));

  ui.video.addEventListener('error', showVideoError);
  ui.videoRetry.addEventListener('click', retryVideo);

  window.addEventListener('popstate', (e) => syncRoute(e));

  // Barra del buscador: fondo sólido siempre; una línea sutil cuando queda fija arriba
  new IntersectionObserver(([entry]) => ui.searchBar.classList.toggle('is-stuck', !entry.isIntersecting)).observe(ui.top);

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== ui.input && !ui.player.open) {
      e.preventDefault();
      ui.input.focus();
    }
  });

  ui.recentsClear.addEventListener('click', clearRecents);
  // El aviso no se va mientras el socio lo está tocando o tiene el foco
  for (const type of ['pointerenter', 'focusin']) ui.toast.addEventListener(type, () => window.clearTimeout(toastTimer));
  for (const type of ['pointerleave', 'focusout'])
    ui.toast.addEventListener(type, () => {
      if (ui.toast.hidden) return;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(hideToast, TOAST_MS);
    });
  ui.toastAction.addEventListener('click', () => {
    const handler = toastHandler;
    hideToast();
    handler?.();
    restoreFocus();
  });

  ui.retry.addEventListener('click', start);
}

// ---------- arranque ----------

async function start() {
  ui.error.hidden = true;
  ui.loading.hidden = false;
  try {
    const res = await fetch('/catalog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = (await res.json()) as Catalog;
  } catch (err) {
    console.error(err);
    ui.loading.hidden = true;
    ui.error.hidden = false;
    return;
  }
  ui.loading.hidden = true;

  exercisesById = new Map(catalog.exercises.map((e) => [e.id, e]));
  index = buildIndex(catalog.exercises, (e) => e.name, (e) => e.category);

  // RN-16: links tipo ?q=remo o ?cat=Espalda (útil para QR por zona o rutina en el futuro)
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat');
  if (cat && !location.hash) history.replaceState(null, '', `#/c/${slug(cat)}`);
  view = parseRoute(location.hash, catalog.categories).view ?? { kind: 'home' };
  ui.input.value = params.get('q') ?? '';

  renderTiles();
  render();
  syncRoute();
}

bindEvents();
start();
