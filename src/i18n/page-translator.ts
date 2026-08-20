import {
  translateCardDetailTextByHref,
  translateCardKeywords,
  translateCardTextByHref,
} from './card-text';
import { translateDeckName } from './deck-names';
import {
  translateCountryOption,
  translateText,
  type TranslationDictionary,
} from './text';

const ignoredElementNames = new Set([
  'CODE',
  'NOSCRIPT',
  'PRE',
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
]);

const translatableAttributes = [
  'alt',
  'aria-label',
  'placeholder',
  'title',
] as const;

const deckNameDropdownNames = new Set([
  'Archetype',
  'Archetypes',
  'Deck Archetype',
  'Opponent Archetype',
  'Opponent Archetypes',
  '套牌类型',
  '对手套牌类型',
]);

export interface TranslationResources {
  dictionary: TranslationDictionary;
  cardNamesByDbfId: TranslationDictionary;
  cardTextsByDbfId: TranslationDictionary;
  cardFlavorsByDbfId: TranslationDictionary;
  cardKeywordDictionary: TranslationDictionary;
}

function isDeckNameNode(node: Text): boolean {
  const element = node.parentElement;
  if (!element) return false;
  if (element.closest('.deck-title, .archetype-name')) return true;
  if (
    element.matches('main h1') &&
    /^\/deck\/\d+/.test(window.location.pathname)
  ) {
    return true;
  }
  if (/^\/matchups\/?$/.test(window.location.pathname)) {
    if (element.matches('table td.sticky-column')) return true;
    if (element.matches('table th button[phx-value-sort_by^="opponent_"]')) {
      return true;
    }
  }

  const dropdown = element.closest('div[x-data]');
  const dropdownTrigger = dropdown?.querySelector(':scope > a.button');
  const dropdownName = dropdownTrigger?.textContent?.trim();
  if (dropdownName && deckNameDropdownNames.has(dropdownName)) return true;

  const link = element.closest('a[href]');
  if (!link) return false;
  const href = link.getAttribute('href') ?? '';
  return /^(?:https:\/\/www\.hsguru\.com)?\/(?:deck\/\d+|archetype\/)/.test(
    href,
  );
}

function getCardDetailField(
  element: Element,
): 'name' | 'text' | 'flavor' | 'keywords' | undefined {
  if (!/^\/card\/\d+/.test(window.location.pathname)) return undefined;
  if (element.matches('main h1')) return 'name';

  const cell = element.closest('td');
  const row = cell?.parentElement;
  const cells = row?.querySelectorAll(':scope > td');
  if (!cell || !cells || cells[1] !== cell) return undefined;

  const label = cells[0]?.textContent?.trim();
  if (label === 'Name' || label === '名称') return 'name';
  if (label === 'Text' || label === '卡牌文本') return 'text';
  if (label === 'Flavor Text' || label === '趣味描述') return 'flavor';
  if (label === 'Keywords' || label === '关键词') return 'keywords';
  return undefined;
}

function getCountryCodeFromElement(element: Element): string | undefined {
  if (
    element instanceof HTMLOptionElement &&
    element.parentElement?.matches('select[name="country_code"]')
  ) {
    return element.value;
  }

  const countryLabel = element.closest('label[for^="country["]');
  return countryLabel
    ?.getAttribute('for')
    ?.match(/^country\[([A-Z]{2})\]$/)?.[1];
}

export class PageTranslator {
  #resources: TranslationResources;
  readonly #translatedText = new WeakMap<
    Text,
    { original: string; translated: string }
  >();
  readonly #translatedAttributes = new WeakMap<
    Element,
    Map<
      (typeof translatableAttributes)[number],
      { original: string; translated: string }
    >
  >();

  constructor(resources: TranslationResources) {
    this.#resources = resources;
  }

  replaceResources(resources: TranslationResources): void {
    this.#resources = resources;
  }

  translate(root: Node): void {
    if (root instanceof Text) {
      this.#translateTextNode(root);
      return;
    }

    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element) this.#translateElementAttributes(root);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );

    let current: Node | null;
    while ((current = walker.nextNode())) {
      if (current instanceof Text) this.#translateTextNode(current);
      else if (current instanceof Element)
        this.#translateElementAttributes(current);
    }
  }

  restore(root: Node): void {
    if (root instanceof Text) {
      this.#restoreTextNode(root);
      return;
    }

    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element) this.#restoreElementAttributes(root);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );

    let current: Node | null;
    while ((current = walker.nextNode())) {
      if (current instanceof Text) this.#restoreTextNode(current);
      else if (current instanceof Element)
        this.#restoreElementAttributes(current);
    }
  }

  #translateTextNode(node: Text): void {
    const parent = node.parentElement;
    if (!parent || ignoredElementNames.has(parent.tagName)) return;

    const previous = this.#translatedText.get(node);
    if (previous && node.data === previous.translated) return;

    const original = node.data;
    const resources = this.#resources;
    let translated = translateText(original, resources.dictionary);
    if (translated === original) {
      const countryCode = getCountryCodeFromElement(parent);
      if (countryCode)
        translated = translateCountryOption(original, countryCode);
    }
    if (translated === original && parent.matches('.card-name')) {
      const href = parent.closest('a[href*="/card/"]')?.getAttribute('href');
      if (href) {
        translated = translateCardTextByHref(
          original,
          href,
          resources.cardNamesByDbfId,
        );
      }
    }
    if (translated === original) {
      const cardDetailField = getCardDetailField(parent);
      if (cardDetailField) {
        translated =
          cardDetailField === 'keywords'
            ? translateCardKeywords(original, resources.cardKeywordDictionary)
            : translateCardDetailTextByHref(
                original,
                window.location.pathname,
                cardDetailField,
                resources.cardNamesByDbfId,
                resources.cardTextsByDbfId,
                resources.cardFlavorsByDbfId,
              );
      }
    }
    if (translated === original && isDeckNameNode(node)) {
      translated = translateDeckName(original);
    }
    if (translated === original) return;

    this.#translatedText.set(node, { original, translated });
    node.data = translated;
  }

  #restoreTextNode(node: Text): void {
    const previous = this.#translatedText.get(node);
    if (previous !== undefined && node.data === previous.translated) {
      node.data = previous.original;
    }
  }

  #translateElementAttributes(element: Element): void {
    // textarea 的正文不应改写，但 placeholder 等界面属性仍需翻译。
    if (
      ignoredElementNames.has(element.tagName) &&
      element.tagName !== 'TEXTAREA'
    ) {
      return;
    }

    for (const attribute of translatableAttributes) {
      const value = element.getAttribute(attribute);
      if (value === null) continue;

      const previous = this.#translatedAttributes.get(element)?.get(attribute);
      if (previous && value === previous.translated) continue;

      let translated = translateText(value, this.#resources.dictionary);
      if (translated === value && attribute === 'alt') {
        const href = element.closest('a[href*="/card/"]')?.getAttribute('href');
        if (href) {
          translated = translateCardTextByHref(
            value,
            href,
            this.#resources.cardNamesByDbfId,
          );
        }
      }
      if (translated === value) continue;

      let translations = this.#translatedAttributes.get(element);
      if (!translations) {
        translations = new Map();
        this.#translatedAttributes.set(element, translations);
      }
      translations.set(attribute, { original: value, translated });
      element.setAttribute(attribute, translated);
    }
  }

  #restoreElementAttributes(element: Element): void {
    const translations = this.#translatedAttributes.get(element);
    if (!translations) return;

    for (const [attribute, translation] of translations) {
      if (element.getAttribute(attribute) === translation.translated) {
        element.setAttribute(attribute, translation.original);
      }
    }
  }
}
