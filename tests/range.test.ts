// Tests de pedidos parciales de video (D-10: Safari en iPhone los necesita). Correr con: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRange } from '../src/range.ts';

const SIZE = 1000;

test('rango cerrado', () => {
  assert.deepEqual(parseRange('bytes=0-99', SIZE), { start: 0, end: 99 });
});

test('el primer pedido de Safari: bytes=0-1', () => {
  assert.deepEqual(parseRange('bytes=0-1', SIZE), { start: 0, end: 1 });
});

test('rango abierto hasta el final', () => {
  assert.deepEqual(parseRange('bytes=900-', SIZE), { start: 900, end: 999 });
});

test('sufijo: los últimos N bytes', () => {
  assert.deepEqual(parseRange('bytes=-100', SIZE), { start: 900, end: 999 });
  assert.deepEqual(parseRange('bytes=-5000', SIZE), { start: 0, end: 999 });
});

test('un fin mayor al tamaño se recorta', () => {
  assert.deepEqual(parseRange('bytes=500-99999', SIZE), { start: 500, end: 999 });
});

test('varios rangos: se usa el primero', () => {
  assert.deepEqual(parseRange('bytes=0-9, 20-29', SIZE), { start: 0, end: 9 });
});

test('rangos imposibles devuelven null (416)', () => {
  for (const h of ['bytes=1000-', 'bytes=50-10', 'bytes=-0', 'bytes=-', 'items=0-1', 'basura', ''])
    assert.equal(parseRange(h, SIZE), null, h);
  assert.equal(parseRange('bytes=0-1', 0), null);
});
