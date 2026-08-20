import assert from 'node:assert/strict';
import test from 'node:test';

test('imports the runtime module without browser or userscript side effects', async () => {
  const runtime = await import('../src/runtime');

  assert.equal(typeof runtime.installHsguruZhCn, 'function');
});
