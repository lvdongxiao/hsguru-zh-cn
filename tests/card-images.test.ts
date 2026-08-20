import assert from 'node:assert/strict';
import test from 'node:test';
import { getChineseCardRenderUrl } from '../src/card-images';

test('builds a Chinese HearthstoneJSON card render URL', () => {
  assert.equal(
    getChineseCardRenderUrl('CORE_BT_351'),
    'https://art.hearthstonejson.com/v1/render/latest/zhCN/512x/CORE_BT_351.png',
  );
});
