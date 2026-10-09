// Tests de rutas (RN-15, RN-16, RN-19). Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, slug, viewHash } from '../src/router.ts';

const categories = ['Bíceps', 'Piernas y glúteos', 'Espalda'];

test('inicio: hash vacío, "#" o "#/"', () => {
  for (const h of ['', '#', '#/']) assert.deepEqual(parseRoute(h, categories), { view: { kind: 'home' }, exerciseId: null });
});

test('categoría por slug, sin importar tildes', () => {
  assert.deepEqual(parseRoute('#/c/piernas-y-gluteos', categories).view, { kind: 'category', category: 'Piernas y glúteos' });
  assert.deepEqual(parseRoute('#/c/B%C3%ADceps', categories).view, { kind: 'category', category: 'Bíceps' });
});

test('categoría inexistente lleva al inicio', () => {
  assert.deepEqual(parseRoute('#/c/zumba', categories).view, { kind: 'home' });
});

test('lista completa', () => {
  assert.deepEqual(parseRoute('#/todos', categories).view, { kind: 'all' });
});

test('RN-15: ejercicio, sin cambiar la vista de fondo', () => {
  assert.deepEqual(parseRoute('#/e/remo-pendlay', categories), { view: null, exerciseId: 'remo-pendlay' });
  assert.deepEqual(parseRoute('#/e/peso%20muerto', categories), { view: null, exerciseId: 'peso muerto' });
  assert.deepEqual(parseRoute('#/e/%E0%A4%A', categories).exerciseId, '%E0%A4%A'); // mal codificado: no rompe
});

test('ida y vuelta: viewHash genera rutas que parseRoute entiende', () => {
  for (const view of [{ kind: 'home' as const }, { kind: 'all' as const }, { kind: 'category' as const, category: 'Piernas y glúteos' }])
    assert.deepEqual(parseRoute(viewHash(view), categories).view, view);
});

test('slug igual al de los ids del catálogo', () => {
  assert.equal(slug('Piernas y glúteos'), 'piernas-y-gluteos');
});
