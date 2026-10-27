import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { parseHTML } from 'linkedom';
import { PageTranslator } from '../src/i18n/page-translator';
import { installHsguruZhCn } from '../src/runtime';
import {
  createCardCache,
  installTestGlobals,
  setupCardStorage,
} from './helpers/card-localization';

function setupRuntime(t: TestContext, cache?: unknown) {
  const storage = setupCardStorage(t, cache);
  const { window: dom } = parseHTML(
    '<html lang="en"><body><main><a href="/card/1"><span class="card-name">Example Card</span></a></main></body></html>',
  );
  const { document } = dom;
  const menus = new Map<number, { caption: string; callback: () => void }>();
  let nextId = 0;
  const windowStub = {
    location: new URL('https://www.hsguru.com/'),
    navigator: {},
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
  };
  Object.defineProperty(document, 'readyState', { value: 'complete' });
  installTestGlobals(t, {
    document,
    window: windowStub,
    unsafeWindow: windowStub,
    Element: dom.Element,
    Text: dom.Text,
    Document: dom.Document,
    HTMLElement: dom.HTMLElement,
    HTMLImageElement: dom.HTMLImageElement,
    HTMLOptionElement: dom.HTMLOptionElement,
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
    // 此处聚焦菜单与异步加载；DOM 批次处理由独立测试覆盖。
    MutationObserver: class {
      observe() {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    GM_registerMenuCommand: (caption: string, callback: () => void) => {
      const id = ++nextId;
      menus.set(id, { caption, callback });
      return id;
    },
    GM_unregisterMenuCommand: (id: number) => menus.delete(id),
    GM_setClipboard: () => {},
  });
  t.mock.method(console, 'info', () => {});
  t.mock.method(console, 'warn', () => {});
  const applyResources = t.mock.method(
    PageTranslator.prototype,
    'replaceResources',
  );
  installHsguruZhCn();
  return {
    ...storage,
    document,
    applyResources,
    clickMenu(text: string) {
      const menu = [...menus.values()].find(({ caption }) =>
        caption.includes(text),
      );
      assert.ok(menu, `Missing menu: ${text}`);
      menu.callback();
    },
    notice: () =>
      document.querySelector('[data-hsguru-zh-card-update-notice]')
        ?.textContent,
    name: () => document.querySelector('.card-name')!.textContent,
  };
}

// 等待受控请求触发的 Promise 链和菜单处理完成，不依赖实际网络或计时器。
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

test('imports the runtime module without browser or userscript side effects', async () => {
  const runtime = await import('../src/runtime');

  assert.equal(typeof runtime.installHsguruZhCn, 'function');
});

test('a manual update during startup shares one download and applies its result once', async (t) => {
  const runtime = setupRuntime(t, { ...createCardCache(), updatedAt: 0 });
  runtime.clickMenu('更新卡牌翻译数据');
  runtime.clickMenu('更新卡牌翻译数据');
  assert.equal(runtime.requests.length, 2);
  assert.equal(runtime.notice(), '正在更新卡牌翻译数据…');
  runtime.completeNetwork();
  await settle();
  assert.equal(runtime.writes.length, 1);
  assert.equal(runtime.applyResources.mock.callCount(), 1);
  assert.equal(runtime.name(), '新译名');
  assert.equal(runtime.notice(), '卡牌翻译数据已更新（1 张）');
});

test('manual updates bypass startup cache and preserve the translation toggle', async (t) => {
  const runtime = setupRuntime(t, createCardCache());
  // 即使缓存加载的 continuation 尚未完成，手动更新也必须请求网络。
  runtime.clickMenu('更新卡牌翻译数据');
  assert.equal(runtime.requests.length, 2);
  await settle();
  assert.equal(runtime.name(), '缓存译名');
  runtime.clickMenu('切换为英文');
  assert.equal(runtime.name(), 'Example Card');
  runtime.completeNetwork();
  await settle();
  assert.equal(runtime.name(), 'Example Card');
  assert.equal(runtime.notice(), '卡牌翻译数据已更新（1 张）');
  runtime.clickMenu('切换为中文');
  assert.equal(runtime.name(), '新译名');
  assert.equal(runtime.applyResources.mock.callCount(), 2);
});

test('a failed shared startup update preserves cached text and allows a later menu retry', async (t) => {
  const runtime = setupRuntime(t, { ...createCardCache(), updatedAt: 0 });
  runtime.clickMenu('更新卡牌翻译数据');
  assert.equal(runtime.requests.length, 2);
  runtime.failNetwork();
  await settle();
  assert.equal(runtime.name(), '缓存译名');
  assert.equal(runtime.notice(), '更新失败，已继续使用原有缓存');
  assert.equal(runtime.applyResources.mock.callCount(), 1);

  runtime.clickMenu('更新卡牌翻译数据');
  assert.equal(runtime.requests.length, 4);
  runtime.completeNetwork(2);
  await settle();
  assert.equal(runtime.name(), '新译名');
  assert.equal(runtime.notice(), '卡牌翻译数据已更新（1 张）');
  assert.equal(runtime.applyResources.mock.callCount(), 2);
});
