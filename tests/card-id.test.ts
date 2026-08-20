import assert from 'node:assert/strict';
import test from 'node:test';
import { getCardDbfIdFromHref } from '../src/data/card-id';

test('extracts the HSGuru dbf id from relative and absolute card links', () => {
  assert.equal(getCardDbfIdFromHref('/card/130790'), '130790');
  assert.equal(
    getCardDbfIdFromHref('https://www.hsguru.com/card/69586?foo=bar'),
    '69586',
  );
  assert.equal(getCardDbfIdFromHref('/decks'), undefined);
});
