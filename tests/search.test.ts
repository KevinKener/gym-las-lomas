// Tests de la búsqueda (RN-11, RN-12). Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, matchRanges, normalize, search, suggest } from '../src/search.ts';

const exercises = [
  { name: 'Aperturas con mancuernas', category: 'Pecho' },
  { name: 'Estocadas con mancuernas', category: 'Piernas' },
  { name: 'Jalón al pecho', category: 'Espalda' },
  { name: 'Plancha abdominal', category: null },
  { name: 'Prensa 45°', category: 'Piernas' },
  { name: 'Press de banca plano', category: 'Pecho' },
  { name: 'Remo con barra', category: 'Espalda' },
  { name: 'Sentadilla búlgara', category: 'Piernas' },
  { name: 'Sentadilla con barra', category: 'Piernas' },
];
const index = buildIndex(exercises, (e) => e.name, (e) => e.category);
const names = (q: string) => search(index, q).map((e) => e.name);

test('normalize quita tildes, mayúsculas y signos', () => {
  assert.equal(normalize('  Jalón al PECHO! '), 'jalon al pecho');
  assert.equal(normalize('Prensa 45°'), 'prensa 45');
});

test('búsqueda vacía devuelve todo en el orden del catálogo', () => {
  assert.deepEqual(names(''), exercises.map((e) => e.name));
  assert.deepEqual(names('   '), exercises.map((e) => e.name));
});

test('RN-11: ignora tildes y mayúsculas', () => {
  assert.deepEqual(names('jalon'), ['Jalón al pecho']);
  assert.deepEqual(names('BULGARA'), ['Sentadilla búlgara']);
});

test('RN-11: palabras incompletas y en cualquier orden', () => {
  assert.deepEqual(names('sent bulg'), ['Sentadilla búlgara']);
  assert.deepEqual(names('bulg sent'), ['Sentadilla búlgara']);
});

test('RN-11: tolera errores de tipeo', () => {
  assert.deepEqual(names('sentadila'), ['Sentadilla búlgara', 'Sentadilla con barra']);
  assert.ok(names('mancuerna').includes('Aperturas con mancuernas'));
  assert.deepEqual(names('estocada'), ['Estocadas con mancuernas']);
});

test('RN-11: 1 error desde 4 letras, ninguno en palabras más cortas (evita ruido)', () => {
  assert.deepEqual(names('ramo'), ['Remo con barra']);
  assert.deepEqual(names('rmo'), []);
});

test('RN-11: ignora palabras de relleno', () => {
  assert.deepEqual(names('remo de barra'), ['Remo con barra']);
  assert.deepEqual(names('press banca'), ['Press de banca plano']);
});

test('RN-11: todas las palabras tienen que coincidir', () => {
  assert.deepEqual(names('sentadilla mancuernas'), []);
});

test('RN-11: busca por categoría', () => {
  assert.deepEqual(names('piernas'), [
    'Estocadas con mancuernas',
    'Prensa 45°',
    'Sentadilla búlgara',
    'Sentadilla con barra',
  ]);
});

test('RN-12: el nombre pesa más que la categoría', () => {
  // "pecho" es categoría de Aperturas y Press, pero es parte del nombre de "Jalón al pecho"
  assert.equal(names('pecho')[0], 'Jalón al pecho');
});

test('RN-12: lo que empieza con el texto va primero', () => {
  assert.equal(names('press')[0], 'Press de banca plano');
});

test('sin resultados devuelve lista vacía', () => {
  assert.deepEqual(names('xyz'), []);
});

// ---------- RN-13: sugerencias cuando no hay resultados ----------

test('RN-13: sugiere por alguna palabra cuando la búsqueda completa no encuentra nada', () => {
  assert.deepEqual(names('remo con mancuernas'), []);
  const s = suggest(index, 'remo con mancuernas').map((e) => e.name);
  assert.equal(s[0], 'Remo con barra'); // "remo" es más rara que "mancuernas": pesa más
  assert.equal(s.length, 3);
});

test('RN-13: sugiere aunque alguna palabra no exista en el catálogo', () => {
  assert.deepEqual(names('sentadila con kettlebell'), []);
  assert.deepEqual(suggest(index, 'sentadila con kettlebell').map((e) => e.name), ['Sentadilla búlgara', 'Sentadilla con barra']);
});

test('RN-13: no sugiere parecidos lejanos (mejor nada que algo equivocado)', () => {
  const idx = buildIndex([{ n: 'Alcanzar pies sentado' }, { n: 'Patadas de glúteo' }], (e) => e.n, () => null);
  assert.deepEqual(suggest(idx, 'sentadilla'), []);
  assert.deepEqual(suggest(idx, 'zancadas'), []);
});

test('RN-13: sin nada parecido no sugiere', () => {
  assert.deepEqual(suggest(index, 'xyz'), []);
  assert.deepEqual(suggest(index, ''), []);
});

// ---------- resaltado de coincidencias ----------

const marked = (text: string, q: string) =>
  matchRanges(text, q).map(([a, b]) => text.slice(a, b));

test('resalta el prefijo escrito, respetando tildes y mayúsculas del original', () => {
  assert.deepEqual(marked('Sentadilla búlgara', 'sent bulg'), ['Sent', 'búlg']);
  assert.deepEqual(marked('Jalón al pecho', 'JALON'), ['Jalón']);
});

test('resalta la palabra entera cuando hay error de tipeo', () => {
  assert.deepEqual(marked('Remo pendlay', 'remo pendlai'), ['Remo', 'pendlay']);
});

test('no resalta palabras de relleno ni nada si la búsqueda está vacía', () => {
  assert.deepEqual(marked('Remo con barra', 'remo con'), ['Remo']);
  assert.deepEqual(matchRanges('Remo con barra', ''), []);
});

test('une rangos superpuestos', () => {
  assert.deepEqual(matchRanges('Press plano', 'pre press'), [[0, 5]]);
});

test('RN-13: una coincidencia exacta pesa más que varias aproximadas', () => {
  const idx = buildIndex([{ n: 'Peso muerto (toma 2)' }, { n: 'Kass press' }], (e) => e.n, () => null);
  assert.equal(suggest(idx, 'press frances soga')[0].n, 'Kass press');
});
