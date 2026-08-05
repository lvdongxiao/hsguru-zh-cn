import { getCardDbfIdFromHref } from '../card-images';
import { translateDeckName } from './deck-names';

export type TranslationDictionary = Readonly<Record<string, string>>;

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
  if (dropdownName === 'Archetypes' || dropdownName === '套牌类型') return true;

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

function translateDynamicText(
  content: string,
  dictionary: TranslationDictionary,
): string | undefined {
  let match: RegExpMatchArray | null;

  if ((match = content.match(/^(.+?) (\d+)\/(\d+)( - DeckBuilder)?$/))) {
    const name = match[1];
    const translatedName = dictionary[name] ?? translateDeckName(name);
    if (translatedName !== name) {
      const titleSuffix = match[4] ? ' - 套牌构筑器' : '';
      return `${translatedName} ${match[2]}/${match[3]}${titleSuffix}`;
    }
  }
  if (
    (match = content.match(
      /^(.+?) (Deck|Archetype) Card Stats \((Standard|Wild|Brawl|Classic|Twist)\)$/,
    ))
  ) {
    const deckName = translateDeckName(match[1]);
    const statsType = match[2] === 'Deck' ? '套牌' : '套牌类型';
    const format = dictionary[match[3]];
    if (format) return `${deckName}${statsType}卡牌数据（${format}）`;
  }
  if ((match = content.match(/^(.+?) - (Standard|Wild)$/))) {
    const classAliases: Readonly<Record<string, string>> = {
      DK: 'Death Knight',
      DH: 'Demon Hunter',
    };
    const className = classAliases[match[1]] ?? match[1];
    const translatedClass = dictionary[className];
    const translatedFormat = dictionary[match[2]];
    if (translatedClass && translatedFormat) {
      return `${translatedClass} - ${translatedFormat}`;
    }
  }
  if ((match = content.match(/^(\d+) out of (\d+)$/))) {
    return `已选 ${match[1]} 张，最多 ${match[2]} 张`;
  }

  if ((match = content.match(/^Show ([\d,]+)$/))) {
    return `显示 ${match[1]} 条`;
  }
  if ((match = content.match(/^Min ([\d,]+)$/))) {
    return `至少 ${match[1]} 局`;
  }
  if ((match = content.match(/^Top ([\d,]+)(k?)$/i))) {
    const value = Number(match[1].replaceAll(',', '')) * (match[2] ? 1000 : 1);
    return `前 ${value.toLocaleString('zh-CN')} 名`;
  }
  if ((match = content.match(/^Past (\d+) Hours?$/))) {
    return `过去 ${match[1]} 小时`;
  }
  if (content === 'Past Day') return '过去 1 天';
  if ((match = content.match(/^Past (\d+) Days?$/i))) {
    return `过去 ${match[1]} 天`;
  }
  if (content === 'Past Week') return '过去 1 周';
  if ((match = content.match(/^Past (\d+) Weeks?$/i))) {
    return `过去 ${match[1]} 周`;
  }
  if (content === 'Last hour') return '最近 1 小时';
  if (content === 'Last day') return '最近 1 天';
  if ((match = content.match(/^Last (\d+) hours?$/i))) {
    return `最近 ${match[1]} 小时`;
  }
  if ((match = content.match(/^Last (\d+) days?$/i))) {
    return `最近 ${match[1]} 天`;
  }
  if ((match = content.match(/^(\d+) (second|minute|hour|day|week)s? ago$/i))) {
    const units: Readonly<Record<string, string>> = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      week: '周',
    };
    return `${match[1]} ${units[match[2].toLowerCase()]}前`;
  }
  if ((match = content.match(/^VS (.+)$/))) {
    const opponent = dictionary[match[1]];
    if (opponent) return `对阵${opponent}`;
  }
  if ((match = content.match(/^([\d,]+) Games?$/))) {
    return `${match[1]} 局`;
  }
  if ((match = content.match(/^Games: ([\d,]+)$/))) {
    return `对局数：${match[1]}`;
  }
  if ((match = content.match(/^Peaked By: (.+)$/))) {
    return `最高排名玩家：${match[1]}`;
  }
  if ((match = content.match(/^First Streamed: (.+)$/))) {
    return `首次直播：${match[1]}`;
  }
  if ((match = content.match(/^# Streamed: ([\d,]+)$/))) {
    return `直播次数：${match[1]}`;
  }

  return undefined;
}

export function translateText(
  source: string,
  dictionary: TranslationDictionary,
): string {
  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) return source;

  const [, leadingWhitespace, content, trailingWhitespace] = match;
  const translated =
    dictionary[content] ?? translateDynamicText(content, dictionary);
  return translated === undefined
    ? source
    : `${leadingWhitespace}${translated}${trailingWhitespace}`;
}

export function translateCardTextByHref(
  source: string,
  href: string,
  namesByDbfId: TranslationDictionary,
): string {
  if (source.trim() === '') return source;

  const dbfId = getCardDbfIdFromHref(href);
  const localizedName = dbfId ? namesByDbfId[dbfId] : undefined;
  if (!localizedName) return source;

  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  return match ? `${match[1]}${localizedName}${match[3]}` : localizedName;
}

export function translateCardDetailTextByHref(
  source: string,
  href: string,
  field: 'name' | 'text' | 'flavor',
  namesByDbfId: TranslationDictionary,
  textsByDbfId: TranslationDictionary,
  flavorsByDbfId: TranslationDictionary,
): string {
  if (source.trim() === '') return source;

  const dbfId = getCardDbfIdFromHref(href);
  const localized = dbfId
    ? {
        name: namesByDbfId,
        text: textsByDbfId,
        flavor: flavorsByDbfId,
      }[field][dbfId]
    : undefined;
  if (!localized) return source;

  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  return match ? `${match[1]}${localized}${match[3]}` : localized;
}

export function translateCardKeywords(
  source: string,
  dictionary: TranslationDictionary,
): string {
  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match || match[2] === '') return source;

  const keywords = match[2].split(',').map((keyword) => keyword.trim());
  const translated = keywords.map((keyword) => dictionary[keyword]);
  if (translated.some((keyword) => keyword === undefined)) return source;

  return `${match[1]}${translated.join('、')}${match[3]}`;
}

export class PageTranslator {
  readonly #dictionary: TranslationDictionary;
  readonly #cardNamesByDbfId: TranslationDictionary;
  readonly #cardTextsByDbfId: TranslationDictionary;
  readonly #cardFlavorsByDbfId: TranslationDictionary;
  readonly #cardKeywordDictionary: TranslationDictionary;
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

  constructor(
    dictionary: TranslationDictionary,
    cardNamesByDbfId: TranslationDictionary = {},
    cardTextsByDbfId: TranslationDictionary = {},
    cardFlavorsByDbfId: TranslationDictionary = {},
    cardKeywordDictionary: TranslationDictionary = {},
  ) {
    this.#dictionary = dictionary;
    this.#cardNamesByDbfId = cardNamesByDbfId;
    this.#cardTextsByDbfId = cardTextsByDbfId;
    this.#cardFlavorsByDbfId = cardFlavorsByDbfId;
    this.#cardKeywordDictionary = cardKeywordDictionary;
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
      if (current instanceof Text) {
        this.#translateTextNode(current);
      } else if (current instanceof Element) {
        this.#translateElementAttributes(current);
      }
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
      if (current instanceof Text) {
        this.#restoreTextNode(current);
      } else if (current instanceof Element) {
        this.#restoreElementAttributes(current);
      }
    }
  }

  #translateTextNode(node: Text): void {
    const parent = node.parentElement;
    if (!parent || ignoredElementNames.has(parent.tagName)) return;

    const previous = this.#translatedText.get(node);
    if (previous && node.data === previous.translated) return;

    const original = node.data;
    let translated = translateText(original, this.#dictionary);
    if (translated === original && parent.matches('.card-name')) {
      const href = parent.closest('a[href*="/card/"]')?.getAttribute('href');
      if (href) {
        translated = translateCardTextByHref(
          original,
          href,
          this.#cardNamesByDbfId,
        );
      }
    }
    if (translated === original) {
      const cardDetailField = getCardDetailField(parent);
      if (cardDetailField) {
        translated =
          cardDetailField === 'keywords'
            ? translateCardKeywords(original, this.#cardKeywordDictionary)
            : translateCardDetailTextByHref(
                original,
                window.location.pathname,
                cardDetailField,
                this.#cardNamesByDbfId,
                this.#cardTextsByDbfId,
                this.#cardFlavorsByDbfId,
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
    if (ignoredElementNames.has(element.tagName)) return;

    for (const attribute of translatableAttributes) {
      const value = element.getAttribute(attribute);
      if (value === null) continue;

      const previous = this.#translatedAttributes.get(element)?.get(attribute);
      if (previous && value === previous.translated) continue;

      let translated = translateText(value, this.#dictionary);
      if (translated === value && attribute === 'alt') {
        const href = element.closest('a[href*="/card/"]')?.getAttribute('href');
        if (href) {
          translated = translateCardTextByHref(
            value,
            href,
            this.#cardNamesByDbfId,
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
