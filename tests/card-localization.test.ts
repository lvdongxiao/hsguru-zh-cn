import assert from 'node:assert/strict';
import test from 'node:test';
import { loadCardLocalization } from '../src/data/card-dictionary';
import { createCardCache, setupCardStorage } from './helpers/card-localization';

test('uses a complete fresh cache and still fetches on manual refresh', async (t) => {
  const storage = setupCardStorage(t, createCardCache());
  const cached = await loadCardLocalization();
  assert.equal(cached.source, 'cache');
  assert.equal(cached.dictionary['Example Card'], '缓存译名');
  assert.deepEqual(cached.namesByDbfId, { '1': '缓存译名' });
  assert.equal(storage.requests.length, 0);

  const refresh = loadCardLocalization(true);
  assert.equal(storage.requests.length, 2);
  // 自动加载也应复用已经进行中的手动更新，不能再返回旧缓存。
  const automatic = loadCardLocalization();
  assert.equal(storage.requests.length, 2);
  storage.completeNetwork();
  const updated = await refresh;
  assert.strictEqual(await automatic, updated);
  assert.equal(updated.source, 'network');
  assert.equal(updated.dictionary['Example Card'], '新译名');
  assert.equal(storage.writes.length, 1);
});

test('shares startup network loading with manual refresh and releases the task after success', async (t) => {
  const storage = setupCardStorage(t, { ...createCardCache(), updatedAt: 0 });
  const startup = loadCardLocalization();
  const manual = loadCardLocalization(true);
  assert.equal(storage.requests.length, 2);
  storage.completeNetwork();
  const result = await startup;
  assert.strictEqual(await manual, result);
  assert.equal(result.source, 'network');
  assert.equal(storage.writes.length, 1);

  const next = loadCardLocalization(true);
  assert.equal(storage.requests.length, 4);
  storage.completeNetwork(2, '再次更新');
  assert.equal((await next).namesByDbfId['1'], '再次更新');
  assert.equal(storage.writes.length, 2);
});

test('falls back to validated stale cache for all waiters and permits retry', async (t) => {
  const storage = setupCardStorage(t, { ...createCardCache(), updatedAt: 0 });
  const startup = loadCardLocalization();
  const manual = loadCardLocalization(true);
  assert.equal(storage.requests.length, 2);
  storage.failNetwork();
  const result = await startup;
  assert.strictEqual(await manual, result);
  assert.equal(result.source, 'stale-cache');
  assert.equal(result.namesByDbfId['1'], '缓存译名');
  assert.equal(storage.writes.length, 0);

  const retry = loadCardLocalization(true);
  assert.equal(storage.requests.length, 4);
  storage.completeNetwork(2);
  assert.equal((await retry).source, 'network');
});

test('releases a rejected shared task so a later update can succeed', async (t) => {
  const storage = setupCardStorage(t);
  const startup = loadCardLocalization();
  const manual = loadCardLocalization(true);
  const rejected = Promise.all([
    assert.rejects(startup, /网络请求失败/),
    assert.rejects(manual, /网络请求失败/),
  ]);
  assert.equal(storage.requests.length, 2);
  storage.failNetwork();
  await rejected;
  const retry = loadCardLocalization(true);
  assert.equal(storage.requests.length, 4);
  storage.completeNetwork(2);
  assert.equal((await retry).source, 'network');
});

test('ignores malformed cache entries and replaces them from the network', async (t) => {
  const storage = setupCardStorage(t);
  const invalidEntries: unknown[] = [
    null,
    {},
    [null],
    ['not a pair'],
    [['key']],
    [['key', 1]],
    [[1, 'value']],
    [['key', 'value', 'extra']],
    Array(1),
  ];
  const fields = [
    'entries',
    'renderIdsByDbfId',
    'namesByDbfId',
    'textsByDbfId',
    'flavorsByDbfId',
    'keywordEntries',
  ];
  const invalidCaches = [
    undefined,
    null,
    {},
    { ...createCardCache(), schemaVersion: 99 },
    ...[NaN, Infinity, -1, 'today'].map((updatedAt) => ({
      ...createCardCache(),
      updatedAt,
    })),
    ...fields.flatMap((field) =>
      invalidEntries.map((entries) => ({
        ...createCardCache(),
        [field]: entries,
      })),
    ),
  ];
  for (const cache of invalidCaches) {
    storage.setCache(cache);
    const startIndex = storage.requests.length;
    const loading = loadCardLocalization();
    assert.equal(storage.requests.length, startIndex + 2);
    storage.completeNetwork(startIndex);
    const result = await loading;
    assert.equal(result.source, 'network');
    assert.equal(result.namesByDbfId['1'], '新译名');
  }
});

test('does not use a malformed cache as a network failure fallback', async (t) => {
  const storage = setupCardStorage(t, {
    ...createCardCache(),
    namesByDbfId: [null],
  });
  const loading = loadCardLocalization();
  const rejected = assert.rejects(loading, /网络请求失败/);
  storage.failNetwork();
  await rejected;
  assert.equal(storage.writes.length, 0);
});

test('refreshes incomplete legacy cache and retains its usable data on failure', async (t) => {
  const storage = setupCardStorage(t, {
    schemaVersion: 1,
    updatedAt: Date.now(),
    entries: [['Example Card', '旧缓存译名']],
  });
  const loading = loadCardLocalization();
  assert.equal(storage.requests.length, 2);
  storage.failNetwork();
  assert.deepEqual(await loading, {
    dictionary: { 'Example Card': '旧缓存译名' },
    renderIdsByDbfId: {},
    namesByDbfId: {},
    textsByDbfId: {},
    flavorsByDbfId: {},
    keywordDictionary: {},
    source: 'stale-cache',
  });
});

test('does not treat future-dated cache as fresh', async (t) => {
  const storage = setupCardStorage(t, {
    ...createCardCache(),
    updatedAt: Date.now() + 86_400_000,
  });
  const loading = loadCardLocalization();
  assert.equal(storage.requests.length, 2);
  storage.completeNetwork();
  assert.equal((await loading).source, 'network');
});

test('continues network loading if storage cannot be read', async (t) => {
  const storage = setupCardStorage(t);
  storage.failCacheReads();
  const loading = loadCardLocalization();
  assert.equal(storage.requests.length, 2);
  storage.completeNetwork();
  assert.equal((await loading).source, 'network');
});

test('keeps successful network data if writing the cache fails', async (t) => {
  const storage = setupCardStorage(t, { ...createCardCache(), updatedAt: 0 });
  storage.failCacheWrites();
  const warning = t.mock.method(console, 'warn', () => {});
  const loading = loadCardLocalization();
  storage.completeNetwork();
  const result = await loading;
  assert.equal(result.source, 'network');
  assert.equal(result.namesByDbfId['1'], '新译名');
  assert.equal(warning.mock.callCount(), 1);
});
