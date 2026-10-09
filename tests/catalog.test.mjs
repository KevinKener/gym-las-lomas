// Tests de las reglas del catálogo (RN-05 a RN-07, RN-10). Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, prettify, slugify } from '../scripts/catalog-lib.mjs';

const MB = 1024 * 1024;
const file = (path, size = MB) => ({ path, size });

test('RN-05: prettify limpia numeración y guiones bajos', () => {
  assert.equal(prettify('03_press de banca'), 'Press de banca');
  assert.equal(prettify('3 - remo'), 'Remo');
  assert.equal(prettify('estocadas_con_mancuernas'), 'Estocadas con mancuernas');
  assert.equal(prettify('  jalón   al pecho '), 'Jalón al pecho');
  assert.equal(prettify('Remo - polea baja'), 'Remo - polea baja');
});

test('RN-05: respeta lo que escribió el profe salvo la primera letra', () => {
  assert.equal(prettify('press TRX'), 'Press TRX');
});

test('slugify arma ids sin tildes ni símbolos', () => {
  assert.equal(slugify('Sentadilla búlgara'), 'sentadilla-bulgara');
  assert.equal(slugify('Prensa 45°'), 'prensa-45');
});

test('RN-07: la categoría es la subcarpeta de primer nivel', () => {
  const { exercises, categories } = buildCatalog([
    file('Piernas/Sentadilla.mp4'),
    file('Piernas/Máquinas/Prensa.mp4'),
    file('Plancha.mp4'),
  ]);
  const cat = Object.fromEntries(exercises.map((e) => [e.name, e.category]));
  assert.deepEqual(cat, { Sentadilla: 'Piernas', Prensa: 'Piernas', Plancha: null });
  assert.deepEqual(categories, ['Piernas']);
});

test('RN-07: videos sin subcarpeta toman la categoría de categorias.json', () => {
  const map = { Pecho: ['press plano barra'], Espalda: ['Remo Pendlay'] };
  const { exercises, categories, warnings } = buildCatalog(
    [file('press plano barra.MOV'), file('03_remo pendlay.mp4'), file('Piernas/Sentadilla.mp4')],
    map,
  );
  const cat = Object.fromEntries(exercises.map((e) => [e.name, e.category]));
  assert.deepEqual(cat, { 'Press plano barra': 'Pecho', 'Remo pendlay': 'Espalda', Sentadilla: 'Piernas' });
  assert.deepEqual(categories, ['Pecho', 'Espalda', 'Piernas']); // orden de categorias.json, luego el resto
  assert.equal(warnings.filter((w) => w.includes('RN-07')).length, 0);
});

test('RN-07: la subcarpeta tiene prioridad sobre categorias.json', () => {
  const { exercises } = buildCatalog([file('Core/Plancha.mp4')], { Movilidad: ['Plancha'] });
  assert.equal(exercises[0].category, 'Core');
});

test('RN-07: avisa videos sin categoría, nombres huérfanos y categorías repetidas', () => {
  const map = { Pecho: ['Press', 'Aperturas viejas'], Hombros: ['press'] };
  const { warnings } = buildCatalog([file('Press.mp4'), file('Remo.mp4')], map);
  assert.ok(warnings.some((w) => w.startsWith('Remo.mp4: no tiene categoría')));
  assert.ok(warnings.some((w) => w.includes('"Aperturas viejas" (Pecho) no coincide')));
  assert.ok(warnings.some((w) => w.includes('está en "Pecho" y en "Hombros"')));
});

test('sin categorias.json no exige categoría', () => {
  const { warnings } = buildCatalog([file('Remo.mp4')]);
  assert.deepEqual(warnings, []);
});

test('ordena ejercicios y categorías alfabéticamente en español', () => {
  const { exercises, categories } = buildCatalog([
    file('Pecho/Remo.mp4'),
    file('Espalda/Ágil.mp4'),
    file('Brazos/Curl.mp4'),
  ]);
  assert.deepEqual(exercises.map((e) => e.name), ['Ágil', 'Curl', 'Remo']);
  assert.deepEqual(categories, ['Brazos', 'Espalda', 'Pecho']);
});

test('asocia la miniatura con el mismo nombre', () => {
  const { exercises } = buildCatalog([file('Pecho/Press.mp4'), file('Pecho/Press.JPG', 1000)]);
  assert.equal(exercises[0].poster, 'Pecho/Press.JPG');
});

test('ignora archivos que no son video ni imagen', () => {
  const { exercises } = buildCatalog([file('notas.txt'), file('Thumbs.db'), file('Remo.mp4')]);
  assert.equal(exercises.length, 1);
});

test('RN-06: avisa si hay nombres repetidos y mantiene ids únicos', () => {
  const { exercises, warnings } = buildCatalog([file('Pecho/Remo.mp4'), file('Espalda/remo.mp4')]);
  assert.equal(new Set(exercises.map((e) => e.id)).size, 2);
  assert.equal(warnings.filter((w) => w.includes('RN-06')).length, 1);
});

test('RN-06: avisa si un nombre parece copia o segunda toma', () => {
  const { warnings } = buildCatalog([
    file('Remo.mp4'),
    file('Remo (2).mp4'),
    file('Press - copia.mp4'),
    file('Plancha 3 apoyos.mp4'),
  ]);
  assert.equal(warnings.length, 2);
  assert.ok(warnings.some((w) => w.startsWith('Remo (2).mp4')));
  assert.ok(warnings.some((w) => w.startsWith('Press - copia.mp4')));
});

test('RN-06: un video en revisión se publica sin advertencia, con su nombre visible y su categoría', () => {
  const { exercises, warnings, pending } = buildCatalog(
    [file('remo.mp4'), file('remo (2).mp4'), file('nordico (2).mp4')],
    { Espalda: ['remo', 'remo (2)'], Piernas: ['nordico (2)'] },
    {
      _info: 'comentario',
      'remo (2)': { nombre: 'Remo (toma 2)', motivo: 'dos tomas' },
      'nordico (2)': { nombre: 'Nórdico', motivo: 'sobra el (2)' },
    },
  );
  assert.deepEqual(warnings, []);
  const byName = Object.fromEntries(exercises.map((e) => [e.name, e]));
  assert.equal(byName['Remo (toma 2)'].category, 'Espalda');
  assert.equal(byName['Remo (toma 2)'].src, 'remo (2).mp4');
  assert.equal(byName['Nórdico'].id, 'nordico');
  assert.deepEqual(pending.map((p) => p.file).sort(), ['nordico (2).mp4', 'remo (2).mp4']);
});

test('RN-06: avisa si un nombre visible de revisar.json choca con otro ejercicio', () => {
  const { warnings } = buildCatalog([file('remo.mp4'), file('remo (2).mp4')], {}, { 'remo (2)': { nombre: 'Remo', motivo: '' } });
  assert.ok(warnings.some((w) => w.includes('Nombre repetido')));
});

test('RN-06: avisa si revisar.json menciona un video que ya no existe', () => {
  const { warnings } = buildCatalog([file('remo.mp4')], {}, { 'press (2)': { motivo: 'x' } });
  assert.ok(warnings.some((w) => w.startsWith('revisar.json: "press (2)"')));
});

test('RN-10: avisa si el video no es mp4 o pesa demasiado', () => {
  const { warnings } = buildCatalog([file('A.mov'), file('B.mp4', 30 * MB), file('C.mp4', 5 * MB)]);
  assert.equal(warnings.length, 2);
  assert.ok(warnings[0].startsWith('A.mov'));
  assert.ok(warnings[1].startsWith('B.mp4'));
});

test('RN-07: las categorías siguen el orden de categorias.json; las que no figuran van al final', () => {
  const { categories } = buildCatalog(
    [file('Core/Plancha.mp4'), file('Brazos/Curl.mp4'), file('Remo.mp4'), file('Abdomen/Crunch.mp4')],
    { Piernas: [], Espalda: ['Remo'], Core: [] },
  );
  assert.deepEqual(categories, ['Espalda', 'Core', 'Abdomen', 'Brazos']);
});

test('D-13: rev cambia si se reemplaza el video o la miniatura con el mismo nombre', () => {
  const rev = (videoHash, posterHash) =>
    buildCatalog([
      { path: 'Remo.mp4', size: MB, hash: videoHash },
      ...(posterHash ? [{ path: 'Remo.jpg', size: 1, hash: posterHash }] : []),
    ]).exercises[0].rev;
  assert.match(rev('aaa', 'bbb'), /^[0-9a-f]{10}$/);
  assert.equal(rev('aaa', 'bbb'), rev('aaa', 'bbb'));
  assert.notEqual(rev('aaa', 'bbb'), rev('ccc', 'bbb'));
  assert.notEqual(rev('aaa', 'bbb'), rev('aaa', 'ddd'));
  assert.notEqual(rev('aaa', 'bbb'), rev('aaa'));
});

test('D-13: sin hash no hay rev (la URL queda sin ?v=)', () => {
  assert.equal(buildCatalog([file('Remo.mp4')]).exercises[0].rev, null);
});
