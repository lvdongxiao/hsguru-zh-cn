import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getChineseCardRenderUrl,
  localizeCardImages,
  restoreCardImages,
} from '../src/card-images';

test('builds a Chinese HearthstoneJSON card render URL', () => {
  assert.equal(
    getChineseCardRenderUrl('CORE_BT_351'),
    'https://art.hearthstonejson.com/v1/render/latest/zhCN/512x/CORE_BT_351.png',
  );
});

test('localizes sibling hover previews and restores their original backgrounds', (t) => {
  class FakeElement {
    attributes = new Map<string, string>();
    style = { backgroundImage: '' };
    parentElement: FakeElement | null = null;
    children: FakeElement[] = [];
    constructor(readonly kind: 'compact' | 'legacy' | 'link' | 'container') {}
    matches(selector: string): boolean {
      return (
        (this.kind === 'compact' &&
          selector.includes('[id^="compact-card-preview-"]')) ||
        (this.kind === 'legacy' && selector.includes('.decklist-card-image'))
      );
    }
    getAttribute(name: string): string | null {
      return this.attributes.get(name) ?? null;
    }
    setAttribute(name: string, value: string): void {
      this.attributes.set(name, value);
    }
    removeAttribute(name: string): void {
      this.attributes.delete(name);
    }
    querySelector(selector: string): FakeElement | null {
      assert.equal(selector, ':scope > a[href*="/card/"]');
      return this.children.find((child) => child.kind === 'link') ?? null;
    }
    querySelectorAll(selector: string): FakeElement[] {
      if (selector.includes(' img')) return [];
      return this.children.flatMap((child) => [
        ...(child.matches(selector) ? [child] : []),
        ...child.querySelectorAll(selector),
      ]);
    }
    closest(): FakeElement | null {
      return this.parentElement?.kind === 'link' ? this.parentElement : null;
    }
    append(child: FakeElement): void {
      child.parentElement = this;
      this.children.push(child);
    }
  }
  for (const [key, value] of Object.entries({
    Element: FakeElement,
    HTMLElement: FakeElement,
    HTMLImageElement: class {},
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    });
  }
  const root = new FakeElement('container');
  const link = new FakeElement('link');
  link.setAttribute('href', '/card/127099');
  root.append(link);
  const compact = new FakeElement('compact');
  compact.style.backgroundImage = 'url("english-card.png")';
  root.append(compact);
  const legacy = new FakeElement('legacy');
  legacy.style.backgroundImage = 'url("legacy-card.png")';
  link.append(legacy);
  const resources = { '127099': 'CAP_107' };
  const asNode = (element: FakeElement) => element as unknown as Node;
  const expected = `url("${getChineseCardRenderUrl('CAP_107')}")`;

  localizeCardImages(asNode(root), resources);
  assert.equal(compact.style.backgroundImage, expected);
  assert.equal(legacy.style.backgroundImage, expected);
  localizeCardImages(asNode(compact), resources);
  restoreCardImages(asNode(root));
  assert.equal(compact.style.backgroundImage, 'url("english-card.png")');
  assert.equal(legacy.style.backgroundImage, 'url("legacy-card.png")');
  assert.equal(compact.attributes.size, 0);

  // A newly inserted preview is also processed when it is the mutation root.
  const added = new FakeElement('compact');
  added.style.backgroundImage = 'url("new-card.png")';
  root.append(added);
  localizeCardImages(asNode(added), resources);
  assert.equal(added.style.backgroundImage, expected);
  restoreCardImages(asNode(added));
  assert.equal(added.style.backgroundImage, 'url("new-card.png")');

  localizeCardImages(asNode(added), {});
  assert.equal(added.style.backgroundImage, 'url("new-card.png")');
  const unrelated = new FakeElement('compact');
  unrelated.style.backgroundImage = 'url("unrelated.png")';
  localizeCardImages(asNode(unrelated), resources);
  assert.equal(unrelated.style.backgroundImage, 'url("unrelated.png")');
});
