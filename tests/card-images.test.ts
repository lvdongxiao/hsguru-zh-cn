import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCardDbfIdFromHref,
  getChineseCardRenderUrl,
} from '../src/card-images';

test('builds a Chinese HearthstoneJSON card render URL', () => {
  assert.equal(
    getChineseCardRenderUrl('CORE_BT_351'),
    'https://art.hearthstonejson.com/v1/render/latest/zhCN/512x/CORE_BT_351.png',
  );
});

test('extracts the HSGuru dbf id used by a hover card preview', () => {
  assert.equal(getCardDbfIdFromHref('/card/130790'), '130790');
  assert.equal(
    getCardDbfIdFromHref('https://www.hsguru.com/card/69586?foo=bar'),
    '69586',
  );
  assert.equal(getCardDbfIdFromHref('/decks'), undefined);
});
