import type { TestContext } from 'node:test';

export function installTestGlobals(
  t: TestContext,
  globals: Record<string, unknown>,
): void {
  for (const [name, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
}

export function createCardCache() {
  return {
    schemaVersion: 6,
    updatedAt: Date.now(),
    entries: [['Example Card', '缓存译名']],
    renderIdsByDbfId: [['1', 'CARD_1']],
    namesByDbfId: [['1', '缓存译名']],
    textsByDbfId: [['1', '缓存文本']],
    flavorsByDbfId: [['1', '缓存趣味描述']],
    keywordEntries: [['Battlecry', '战吼']],
  };
}

/** 使用可手动完成的请求，准确控制并发加载的先后顺序。 */
export function setupCardStorage(t: TestContext, initialCache?: unknown) {
  let cache = initialCache;
  let readError: Error | undefined;
  let writeError: Error | undefined;
  const requests: GMXmlHttpRequestOptions[] = [];
  const writes: unknown[] = [];
  installTestGlobals(t, {
    GM_getValue: () => {
      if (readError) throw readError;
      return cache;
    },
    GM_setValue: (_key: string, value: unknown) => {
      if (writeError) throw writeError;
      cache = value;
      writes.push(value);
    },
    GM_xmlhttpRequest: (request: GMXmlHttpRequestOptions) => {
      requests.push(request);
    },
  });
  return {
    requests,
    writes,
    setCache(value: unknown) {
      cache = value;
    },
    failCacheReads() {
      readError = new Error('unreadable');
    },
    failCacheWrites() {
      writeError = new Error('unwritable');
    },
    completeNetwork(startIndex = 0, chineseName = '新译名') {
      for (const request of requests.slice(startIndex, startIndex + 2)) {
        const isChinese = request.url.includes('/zhCN/');
        request.onload({
          status: 200,
          responseText: JSON.stringify([
            {
              id: 'CARD_1',
              dbfId: 1,
              name: isChinese ? chineseName : 'Example Card',
              text: isChinese
                ? '<b>战吼：</b>造成伤害。'
                : '<b>Battlecry:</b> Deal damage.',
              flavor: isChinese ? '中文趣味描述' : 'Flavor text',
            },
          ]),
        });
      }
    },
    failNetwork(startIndex = 0) {
      for (const request of requests.slice(startIndex, startIndex + 2)) {
        request.onerror();
      }
    },
  };
}
