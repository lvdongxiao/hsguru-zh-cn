import {
  translateCardDetailTextByHref,
  translateCardKeywords,
  translateCardLabelByHref,
  translateCardTextByHref,
} from './card-text';
import { splitDeckRunePrefix, translateDeckName } from './deck-names';
import { translateDurationValue } from './dynamic-rules';
import { createDeckRuneIcons, runeIconSelector } from './rune-icons';
import {
  replacePreservingWhitespace,
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
  readonly #runeIcons = new WeakMap<Text, HTMLElement>();
  readonly #runeOwners = new WeakMap<Element, Text>();
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
    this.#pruneRuneIcons(root);
    if (root instanceof Element && root.closest(runeIconSelector)) return;
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
    // 先移除装饰，保留原 Text 节点供下方遍历恢复。
    for (const icons of root.querySelectorAll(runeIconSelector)) icons.remove();
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
    if (
      !parent ||
      ignoredElementNames.has(parent.tagName) ||
      parent.closest(runeIconSelector)
    )
      return;

    const previous = this.#translatedText.get(node);
    const icons = this.#runeIcons.get(node);
    if (
      previous &&
      node.data === previous.translated &&
      (!icons || (icons.parentNode === parent && icons.nextSibling === node))
    )
      return;

    const original =
      previous && node.data === previous.translated
        ? previous.original
        : node.data;
    this.#removeRuneIcons(node);
    const resources = this.#resources;
    let translated = translateText(original, resources.dictionary);
    if (
      translated === original &&
      parent.closest('#deck_stats_container table') &&
      ['duration', '时长'].includes(
        parent.nextElementSibling?.textContent?.trim() ?? '',
      )
    ) {
      translated = translateDurationValue(original);
    }
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
    if (isDeckNameNode(node)) {
      const prefix = splitDeckRunePrefix(original);
      // 原生 select 只能使用纯文本；HSGuru 的自定义菜单可正常展示图标。
      if (prefix && !parent.closest('select, option')) {
        translated = replacePreservingWhitespace(
          original,
          translateDeckName(prefix.name),
        );
        const runeIcons = createDeckRuneIcons(prefix.runes);
        parent.insertBefore(runeIcons, node);
        this.#runeIcons.set(node, runeIcons);
        this.#runeOwners.set(runeIcons, node);
      } else if (translated === original) {
        translated = translateDeckName(original);
      }
    }
    if (translated === original) return;

    this.#translatedText.set(node, { original, translated });
    node.data = translated;
  }

  #restoreTextNode(node: Text): void {
    this.#removeRuneIcons(node);
    const previous = this.#translatedText.get(node);
    if (previous !== undefined && node.data === previous.translated) {
      node.data = previous.original;
    }
    this.#translatedText.delete(node);
  }

  #removeRuneIcons(node: Text): void {
    const icons = this.#runeIcons.get(node);
    icons?.remove();
    if (icons) this.#runeOwners.delete(icons);
    this.#runeIcons.delete(node);
  }

  #pruneRuneIcons(root: Element | Document): void {
    const groups = [...root.querySelectorAll(runeIconSelector)];
    if (root instanceof Element && root.matches(runeIconSelector)) {
      groups.push(root);
    }
    for (const icons of groups) {
      const owner = this.#runeOwners.get(icons);
      if (
        owner &&
        (owner.parentNode !== icons.parentNode || icons.nextSibling !== owner)
      ) {
        icons.remove();
      }
    }
  }

  #translateElementAttributes(element: Element): void {
    if (element.closest(runeIconSelector)) return;
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
      if (
        translated === value &&
        (attribute === 'title' || attribute === 'aria-label')
      ) {
        const href = element.closest('a[href*="/card/"]')?.getAttribute('href');
        if (href) {
          translated = translateCardLabelByHref(
            value,
            href,
            this.#resources.cardNamesByDbfId,
            this.#resources.dictionary,
          );
        }
      }
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
