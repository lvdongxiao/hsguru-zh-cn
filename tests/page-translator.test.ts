import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { DOMParser, parseHTML } from 'linkedom';
import { installDeckCopyButtonTranslation } from '../src/clipboard';
import { runeImages } from '../src/data/rune-images';
import { dictionary } from '../src/i18n/dictionary';
import { PageTranslator } from '../src/i18n/page-translator';
import { createTranslationResources } from '../src/i18n/resources';
import { describeDeckRunes, runeIconSelector } from '../src/i18n/rune-icons';

function setupDOM(t: TestContext, markup: string, path = '/decks') {
  const dom = parseHTML(`<html><body>${markup}</body></html>`);
  const { document } = dom;
  const globals = {
    document,
    window: {
      location: new URL(path, 'https://www.hsguru.com'),
      requestAnimationFrame: () => 0,
      setTimeout: () => 0,
    },
    Element: dom.window.Element,
    Text: dom.window.Text,
    Document: dom.window.Document,
    HTMLElement: dom.window.HTMLElement,
    HTMLOptionElement: dom.window.HTMLOptionElement,
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
  };
  for (const [name, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const translator = new PageTranslator(createTranslationResources(dictionary));
  return { document, translator, Event: dom.window.Event };
}

test('translates and restores homepage badges, tooltips and dynamically added streamers', (t) => {
  const { document, translator } = setupDOM(
    t,
    `<main><div title="Peaked by Maxiebon1234"><svg></svg><span>Peak: Maxiebon1234</span></div>
    <span class="legend-rank">13</span>
    <div title="First streamed by pacifist_hs"><span>1st: pacifist_hs</span></div>
    <a href="/streamer-decks?deck_id=42689082" title="Streamed by 6 streamers"><span>Streamed: 6</span></a></main>`,
    '/',
  );
  const root = document.querySelector('main')!;
  const originalMarkup = root.innerHTML;
  translator.translate(root);
  assert.equal(
    root.querySelector('div span')!.textContent,
    '最佳战绩：Maxiebon1234',
  );
  assert.equal(
    root.querySelector('div')!.getAttribute('title'),
    '最佳战绩由 Maxiebon1234 达成',
  );
  assert.equal(
    root.querySelectorAll('div')[1].textContent,
    '首播：pacifist_hs',
  );
  assert.equal(
    root.querySelectorAll('div')[1].getAttribute('title'),
    '最早使用此套牌直播的主播：pacifist_hs',
  );
  assert.equal(root.querySelector('.legend-rank')!.textContent, '13');
  assert.equal(root.querySelector('a')!.textContent, '主播：6');
  assert.equal(
    root.querySelector('a')!.getAttribute('title'),
    '已有 6 位主播使用此套牌直播',
  );
  assert.equal(
    root.querySelector('a')!.getAttribute('href'),
    '/streamer-decks?deck_id=42689082',
  );
  const translatedMarkup = root.innerHTML;
  translator.translate(root);
  assert.equal(root.innerHTML, translatedMarkup);

  const added = document.createElement('div');
  added.setAttribute('title', 'First streamed by 뀨효미');
  added.textContent = '1st: 뀨효미';
  root.append(added);
  translator.translate(added);
  assert.equal(added.textContent, '首播：뀨효미');
  assert.equal(added.getAttribute('title'), '最早使用此套牌直播的主播：뀨효미');
  translator.restore(root);
  assert.equal(added.textContent, '1st: 뀨효미');
  assert.equal(added.getAttribute('title'), 'First streamed by 뀨효미');
  added.remove();
  assert.equal(root.innerHTML, originalMarkup);
});

test('embeds three self-contained vector rune images and describes their counts', () => {
  for (const source of Object.values(runeImages)) {
    assert.ok(source.startsWith('data:image/svg+xml;charset=utf-8,'));
    const svg = decodeURIComponent(source.slice(source.indexOf(',') + 1));
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    assert.equal(doc.documentElement.localName, 'svg');
    assert.equal(doc.documentElement.getAttribute('viewBox'), '0 0 135 135');
    assert.ok(doc.querySelectorAll('path').length > 0);
    assert.equal(doc.querySelector('image, script, foreignObject'), null);
    assert.equal(doc.querySelector('[href], [src]'), null);
    assert.equal(svg.includes('data:image/png'), false);
    for (const match of svg.matchAll(/url\(#([^)]+)\)/g)) {
      assert.ok(doc.getElementById(match[1]));
    }
  }
  assert.equal(describeDeckRunes(['B', 'U', 'U']), '鲜血 ×1、邪恶 ×2');
  assert.equal(describeDeckRunes(['B', 'F', 'U']), '鲜血 ×1、冰霜 ×1、邪恶 ×1');
  assert.equal(describeDeckRunes(['B', 'B', 'U', 'U']), '鲜血 ×2、邪恶 ×2');
});

test('decorates deck titles without replacing their text node or altering site attributes', (t) => {
  const { document, translator } = setupDOM(
    t,
    '<main><h2><a href="/deck/123" phx-value-name="BUU Egg DK"> \nBUU Egg DK\t </a></h2></main>',
  );
  const link = document.querySelector('a')!;
  const node = link.firstChild!;
  const originalMarkup = link.outerHTML;
  translator.translate(document);
  assert.equal(node.parentNode, link);
  assert.equal(link.lastChild, node);
  assert.equal(node.textContent, ' \n蛋DK\t ');
  assert.equal(link.getAttribute('phx-value-name'), 'BUU Egg DK');
  const icons = link.querySelector(runeIconSelector)!;
  assert.equal(icons.getAttribute('aria-label'), '鲜血 ×1、邪恶 ×2');
  assert.equal(icons.getAttribute('title'), '鲜血 ×1、邪恶 ×2');
  assert.equal(icons.getAttribute('role'), 'img');
  assert.equal(icons.textContent, '');
  assert.deepEqual(
    [...icons.querySelectorAll('img')].map((img) => img.getAttribute('src')),
    [runeImages.B, runeImages.U, runeImages.U],
  );
  assert.ok(
    [...icons.querySelectorAll('img')].every(
      (img) =>
        img.getAttribute('alt') === '' &&
        img.getAttribute('width') === '18' &&
        img.style.width === 'max(18px, 1em)' &&
        img.style.height === 'max(18px, 1em)',
    ),
  );

  translator.translate(document);
  translator.translate(node);
  translator.translate(icons);
  translator.translate(icons.firstChild!);
  assert.equal(link.querySelectorAll(runeIconSelector).length, 1);
  assert.equal(link.querySelectorAll('img').length, 3);
  translator.restore(document);
  assert.equal(link.outerHTML, originalMarkup);
  translator.translate(document);
  assert.equal(link.querySelectorAll('img').length, 3);
  translator.restore(node);
  assert.equal(link.outerHTML, originalMarkup);
});

test('decorates detail headings, table cells, archetype links and filter options', (t) => {
  const { document, translator } = setupDOM(
    t,
    `<main>
    <h1>BBF Control DK Standard</h1>
    <div class="deck-title">BFU Rainbow DK</div>
    <div class="archetype-name">FFF Frost DK</div>
    <a href="/archetype/123">XL BUU Egg DK</a>
    <div x-data="{}"><a class="button">Archetypes</a><div><a phx-value-value="BUU Egg DK">BUU Egg DK</a></div></div>
    <div x-data="{}"><a class="button">Opponent Archetype</a><div><a phx-value-value="BBF Control DK">BBF Control DK</a></div></div>
    <div class="deck-title"><select><option>BUU Egg DK</option></select></div>
    <p>BUU Egg DK</p><a href="/player/123">BUU Egg DK</a>
  </main>`,
    '/deck/123',
  );
  translator.translate(document);
  assert.equal(document.querySelectorAll(runeIconSelector).length, 6);
  assert.equal(document.querySelector('h1')!.textContent, '控制DK 标准模式');
  assert.equal(document.querySelector('option')!.textContent, '血邪邪蛋DK');
  assert.equal(document.querySelector('option img'), null);
  assert.equal(document.querySelector('p')!.textContent, 'BUU Egg DK');
  assert.equal(
    document.querySelector('a[href="/player/123"]')!.textContent,
    'BUU Egg DK',
  );
  const option = document.querySelector('[phx-value-value="BUU Egg DK"]')!;
  assert.equal(option.textContent, '蛋DK');
  assert.equal(option.getAttribute('phx-value-value'), 'BUU Egg DK');
  translator.restore(document);
  assert.equal(document.querySelectorAll(runeIconSelector).length, 0);
  assert.equal(option.textContent, 'BUU Egg DK');
});

test('decorates matchup row and column headers', (t) => {
  const { document, translator } = setupDOM(
    t,
    '<main><table><thead><tr><th><button phx-value-sort_by="opponent_123">BBF Control DK</button></th></tr></thead><tbody><tr><td class="sticky-column">BUU Egg DK</td></tr></tbody></table></main>',
    '/matchups',
  );
  translator.translate(document);
  assert.equal(document.querySelectorAll(runeIconSelector).length, 2);
  assert.equal(document.querySelector('td')!.textContent, '蛋DK');
});

test('handles new, changed, removed and site-replaced rune titles', (t) => {
  const { document, translator } = setupDOM(
    t,
    '<main><a href="/deck/123">BUU Egg DK</a></main>',
  );
  const root = document.querySelector('main')!;
  const link = root.querySelector('a')!;
  const node = link.firstChild as unknown as Text;
  translator.translate(root);
  node.data = 'FFF Frost DK';
  translator.translate(node);
  assert.equal(
    link.querySelector(runeIconSelector)!.getAttribute('title'),
    '冰霜 ×3',
  );
  assert.equal(link.textContent, '冰霜DK');
  link.querySelector(runeIconSelector)!.remove();
  translator.translate(link);
  assert.equal(link.querySelectorAll('img').length, 3);
  translator.restore(root);
  assert.equal(link.textContent, 'FFF Frost DK');
  translator.translate(root);
  node.data = 'Blood DK';
  translator.translate(node);
  assert.equal(link.querySelector(runeIconSelector), null);
  assert.equal(link.textContent, '血DK');
  translator.restore(link);
  assert.equal(link.textContent, 'Blood DK');

  link.textContent = 'BBUU Chef Druid';
  translator.translate(link);
  assert.equal(link.querySelectorAll('img').length, 4);
  translator.restore(link);
  assert.equal(link.textContent, 'BBUU Chef Druid');

  const added = document.createElement('a');
  added.setAttribute('href', '/deck/456');
  added.textContent = 'BUU Egg DK';
  root.append(added);
  translator.translate(added);
  assert.equal(added.querySelectorAll('img').length, 3);
  added.lastChild!.remove();
  translator.translate(added);
  assert.equal(added.childNodes.length, 0);
});

test('the real copy button copies a rune-free decorated title and honors the toggle', (t) => {
  const code =
    'AAECAaIHBpegBM2eBoaoB4eoB4ioB4jZBwz3nwTQngbZogb3gQfBlweaswf5wwfVxQeh2AeN2ge/9wfl9wcAAA==';
  const { document, translator, Event } = setupDOM(
    t,
    `<main><div><button aria-label="Copy">Copy</button><h2>### <a href="/deck/123">BUU Egg DK</a><span>${code}</span></h2></div></main>`,
  );
  const button = document.querySelector('button')!;
  button.getBoundingClientRect = () =>
    ({ top: 100, left: 10, width: 20, height: 20, bottom: 120 }) as DOMRect;
  const writes: string[] = [];
  let enabled = true;
  installDeckCopyButtonTranslation(
    () => enabled,
    (text) => writes.push(text),
  );
  translator.translate(document);
  button.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
  assert.deepEqual(writes, [
    `### 蛋DK\n${code}\n### You can view this deck at https://www.hsguru.com/deck/123`,
  ]);
  enabled = false;
  translator.restore(document);
  button.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
  assert.equal(writes.length, 1);
  assert.equal(document.querySelector('a')!.textContent, 'BUU Egg DK');
});
