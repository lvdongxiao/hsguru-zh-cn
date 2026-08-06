export interface LocalizedCard {
  id: string;
  dbfId?: number;
  name?: string;
  text?: string;
  flavor?: string;
}

interface CardDictionaryCache {
  schemaVersion: 1 | 2 | 3 | 4 | 5 | 6;
  updatedAt: number;
  entries: Array<[string, string]>;
  renderIdsByDbfId?: Array<[string, string]>;
  namesByDbfId?: Array<[string, string]>;
  textsByDbfId?: Array<[string, string]>;
  flavorsByDbfId?: Array<[string, string]>;
  keywordEntries?: Array<[string, string]>;
}

export interface CardLocalization {
  dictionary: Record<string, string>;
  renderIdsByDbfId: Record<string, string>;
  namesByDbfId: Record<string, string>;
  textsByDbfId: Record<string, string>;
  flavorsByDbfId: Record<string, string>;
  keywordDictionary: Record<string, string>;
  source: 'cache' | 'network' | 'stale-cache';
}

const cacheKey = 'hsguru-zh-cn:card-dictionary';
const cacheLifetime = 7 * 24 * 60 * 60 * 1000;
const dataBaseUrl = 'https://api.hearthstonejson.com/v1/latest';

function requestJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      timeout: 30_000,
      onload(response) {
        if (response.status < 200 || response.status >= 300) {
          reject(new Error(`请求失败：HTTP ${response.status}`));
          return;
        }

        try {
          resolve(JSON.parse(response.responseText) as T);
        } catch (error) {
          reject(error);
        }
      },
      onerror: () => reject(new Error('卡牌数据网络请求失败')),
      ontimeout: () => reject(new Error('卡牌数据网络请求超时')),
    });
  });
}

export function buildCardDictionary(
  englishCards: ReadonlyArray<LocalizedCard>,
  chineseCards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  const chineseNames = new Map(
    chineseCards
      .filter((card): card is LocalizedCard & { name: string } =>
        Boolean(card.name),
      )
      .map((card) => [card.id, card.name]),
  );

  return Object.fromEntries(
    englishCards.flatMap((card) => {
      const chineseName = chineseNames.get(card.id);
      if (!card.name || !chineseName || card.name === chineseName) return [];
      return [[card.name, chineseName]];
    }),
  );
}

function extractBoldPhrases(text: string): string[] {
  return [...text.matchAll(/<b>(.*?)<\/b>/gis)].map((match) => match[1]);
}

function normalizeKeywordPhrase(source: string): string {
  return source
    .replaceAll('\u00a0', ' ')
    .replace(/[:：].*$/s, '')
    .replace(/\s*[（(]\s*\d+\s*[）)]\s*$/u, '')
    .replace(/\s*[+＋]\s*\d+.*$/u, '')
    .replace(/\s+[-–—]\s*$/u, '')
    .trim();
}

export function buildCardKeywordDictionary(
  englishCards: ReadonlyArray<LocalizedCard>,
  chineseCards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  const chineseCardsById = new Map(chineseCards.map((card) => [card.id, card]));
  const entries: Array<[string, string]> = [];

  for (const englishCard of englishCards) {
    const chineseCard = chineseCardsById.get(englishCard.id);
    if (!englishCard.text || !chineseCard?.text) continue;

    const englishPhrases = extractBoldPhrases(englishCard.text);
    const chinesePhrases = extractBoldPhrases(chineseCard.text);
    if (englishPhrases.length !== chinesePhrases.length) continue;

    for (let index = 0; index < englishPhrases.length; index += 1) {
      const english = normalizeKeywordPhrase(englishPhrases[index]);
      const chinese = normalizeKeywordPhrase(chinesePhrases[index]);
      if (english && chinese && english !== chinese) {
        entries.push([english, chinese]);
      }
    }
  }

  return Object.fromEntries(entries);
}

export function buildCardRenderIds(
  cards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  return Object.fromEntries(
    cards.flatMap((card) =>
      typeof card.dbfId === 'number'
        ? [[String(card.dbfId), card.id] as const]
        : [],
    ),
  );
}

export function buildCardNamesByDbfId(
  cards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  return Object.fromEntries(
    cards.flatMap((card) =>
      typeof card.dbfId === 'number' && card.name
        ? [[String(card.dbfId), card.name] as const]
        : [],
    ),
  );
}

export function buildCardTextsByDbfId(
  cards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  return Object.fromEntries(
    cards.flatMap((card) =>
      typeof card.dbfId === 'number' && card.text
        ? [[String(card.dbfId), card.text] as const]
        : [],
    ),
  );
}

export function buildCardFlavorsByDbfId(
  cards: ReadonlyArray<LocalizedCard>,
): Record<string, string> {
  return Object.fromEntries(
    cards.flatMap((card) =>
      typeof card.dbfId === 'number' && card.flavor
        ? [[String(card.dbfId), card.flavor] as const]
        : [],
    ),
  );
}

function isValidCache(value: unknown): value is CardDictionaryCache {
  if (!value || typeof value !== 'object') return false;
  const cache = value as Partial<CardDictionaryCache>;
  return (
    (cache.schemaVersion === 1 ||
      cache.schemaVersion === 2 ||
      cache.schemaVersion === 3 ||
      cache.schemaVersion === 4 ||
      cache.schemaVersion === 5 ||
      cache.schemaVersion === 6) &&
    typeof cache.updatedAt === 'number' &&
    Array.isArray(cache.entries)
  );
}

export async function loadCardLocalization(
  forceRefresh = false,
): Promise<CardLocalization> {
  const cached = GM_getValue<unknown>(cacheKey);
  const validCache = isValidCache(cached) ? cached : undefined;
  const cachedRenderIds = validCache?.renderIdsByDbfId;
  const cachedNames = validCache?.namesByDbfId;
  const cachedTexts = validCache?.textsByDbfId;
  const cachedFlavors = validCache?.flavorsByDbfId;
  const cachedKeywords = validCache?.keywordEntries;

  if (
    !forceRefresh &&
    validCache &&
    Array.isArray(cachedRenderIds) &&
    Array.isArray(cachedNames) &&
    Array.isArray(cachedTexts) &&
    Array.isArray(cachedFlavors) &&
    Array.isArray(cachedKeywords) &&
    Date.now() - validCache.updatedAt < cacheLifetime
  ) {
    return {
      dictionary: Object.fromEntries(validCache.entries),
      renderIdsByDbfId: Object.fromEntries(cachedRenderIds),
      namesByDbfId: Object.fromEntries(cachedNames),
      textsByDbfId: Object.fromEntries(cachedTexts),
      flavorsByDbfId: Object.fromEntries(cachedFlavors),
      keywordDictionary: Object.fromEntries(cachedKeywords),
      source: 'cache',
    };
  }

  try {
    const [englishCards, chineseCards] = await Promise.all([
      requestJson<LocalizedCard[]>(
        `${dataBaseUrl}/enUS/cards.collectible.json`,
      ),
      requestJson<LocalizedCard[]>(`${dataBaseUrl}/zhCN/cards.json`),
    ]);
    const dictionary = buildCardDictionary(englishCards, chineseCards);
    const keywordDictionary = buildCardKeywordDictionary(
      englishCards,
      chineseCards,
    );
    const renderIdsByDbfId = buildCardRenderIds(chineseCards);
    const namesByDbfId = buildCardNamesByDbfId(chineseCards);
    const textsByDbfId = buildCardTextsByDbfId(chineseCards);
    const flavorsByDbfId = buildCardFlavorsByDbfId(chineseCards);
    GM_setValue<CardDictionaryCache>(cacheKey, {
      schemaVersion: 6,
      updatedAt: Date.now(),
      entries: Object.entries(dictionary),
      renderIdsByDbfId: Object.entries(renderIdsByDbfId),
      namesByDbfId: Object.entries(namesByDbfId),
      textsByDbfId: Object.entries(textsByDbfId),
      flavorsByDbfId: Object.entries(flavorsByDbfId),
      keywordEntries: Object.entries(keywordDictionary),
    });
    return {
      dictionary,
      renderIdsByDbfId,
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
      keywordDictionary,
      source: 'network',
    };
  } catch (error) {
    if (validCache) {
      return {
        dictionary: Object.fromEntries(validCache.entries),
        renderIdsByDbfId: Object.fromEntries(cachedRenderIds ?? []),
        namesByDbfId: Object.fromEntries(cachedNames ?? []),
        textsByDbfId: Object.fromEntries(cachedTexts ?? []),
        flavorsByDbfId: Object.fromEntries(cachedFlavors ?? []),
        keywordDictionary: Object.fromEntries(cachedKeywords ?? []),
        source: 'stale-cache',
      };
    }
    throw error;
  }
}
