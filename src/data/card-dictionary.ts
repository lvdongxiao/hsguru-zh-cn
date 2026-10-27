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
let pendingNetworkLoad: Promise<CardLocalization> | undefined;

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

function isStringEntries(value: unknown): value is Array<[string, string]> {
  if (!Array.isArray(value)) return false;
  // for...of 也检查稀疏数组中的空位，避免 Object.fromEntries 随后抛错。
  for (const entry of value) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== 'string' ||
      typeof entry[1] !== 'string'
    ) {
      return false;
    }
  }
  return true;
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
    Number.isFinite(cache.updatedAt) &&
    cache.updatedAt >= 0 &&
    isStringEntries(cache.entries) &&
    [
      cache.renderIdsByDbfId,
      cache.namesByDbfId,
      cache.textsByDbfId,
      cache.flavorsByDbfId,
      cache.keywordEntries,
    ].every((entries) => entries === undefined || isStringEntries(entries))
  );
}

function readCardCache(): CardDictionaryCache | undefined {
  try {
    const cached = GM_getValue<unknown>(cacheKey);
    return isValidCache(cached) ? cached : undefined;
  } catch {
    // 存储不可读时仍可下载数据，不让缓存阻断翻译。
    return undefined;
  }
}

function localizationFromCache(
  cache: CardDictionaryCache,
  source: 'cache' | 'stale-cache',
): CardLocalization {
  return {
    dictionary: Object.fromEntries(cache.entries),
    renderIdsByDbfId: Object.fromEntries(cache.renderIdsByDbfId ?? []),
    namesByDbfId: Object.fromEntries(cache.namesByDbfId ?? []),
    textsByDbfId: Object.fromEntries(cache.textsByDbfId ?? []),
    flavorsByDbfId: Object.fromEntries(cache.flavorsByDbfId ?? []),
    keywordDictionary: Object.fromEntries(cache.keywordEntries ?? []),
    source,
  };
}

export async function loadCardLocalization(
  forceRefresh = false,
): Promise<CardLocalization> {
  // 自动加载与手动更新共享真正进行中的网络任务，避免旧结果覆盖新资源。
  if (pendingNetworkLoad) return pendingNetworkLoad;
  const validCache = readCardCache();
  const cacheAge = validCache ? Date.now() - validCache.updatedAt : Infinity;

  if (
    !forceRefresh &&
    validCache &&
    validCache.renderIdsByDbfId !== undefined &&
    validCache.namesByDbfId !== undefined &&
    validCache.textsByDbfId !== undefined &&
    validCache.flavorsByDbfId !== undefined &&
    validCache.keywordEntries !== undefined &&
    cacheAge >= 0 &&
    cacheAge < cacheLifetime
  ) {
    return localizationFromCache(validCache, 'cache');
  }

  pendingNetworkLoad = fetchCardLocalization(validCache).finally(() => {
    pendingNetworkLoad = undefined;
  });
  return pendingNetworkLoad;
}

async function fetchCardLocalization(
  validCache: CardDictionaryCache | undefined,
): Promise<CardLocalization> {
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
    const nextCache: CardDictionaryCache = {
      schemaVersion: 6,
      updatedAt: Date.now(),
      entries: Object.entries(dictionary),
      renderIdsByDbfId: Object.entries(renderIdsByDbfId),
      namesByDbfId: Object.entries(namesByDbfId),
      textsByDbfId: Object.entries(textsByDbfId),
      flavorsByDbfId: Object.entries(flavorsByDbfId),
      keywordEntries: Object.entries(keywordDictionary),
    };
    try {
      GM_setValue(cacheKey, nextCache);
    } catch (error) {
      // 写入失败不应丢弃已经下载成功的数据。
      console.warn('[HSGuru 中文助手] 卡牌翻译数据缓存写入失败。', error);
    }
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
      return localizationFromCache(validCache, 'stale-cache');
    }
    throw error;
  }
}
