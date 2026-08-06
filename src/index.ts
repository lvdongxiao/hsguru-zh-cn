import { localizeCardImages, restoreCardImages } from './card-images';
import { loadCardLocalization } from './data/card-dictionary';
import {
  installDeckClipboardTranslation,
  installDeckCopyButtonTranslation,
} from './clipboard';
import { dictionary } from './i18n/dictionary';
import { PageTranslator } from './i18n/translator';

const storageKey = 'hsguru-zh-cn:enabled';
const runtimeDictionary: Record<string, string> = { ...dictionary };
const cardNamesByDbfId: Record<string, string> = {};
const cardTextsByDbfId: Record<string, string> = {};
const cardFlavorsByDbfId: Record<string, string> = {};
const cardKeywordDictionary: Record<string, string> = {};
let cardRenderIdsByDbfId: Record<string, string> = {};
const translator = new PageTranslator(
  runtimeDictionary,
  cardNamesByDbfId,
  cardTextsByDbfId,
  cardFlavorsByDbfId,
  cardKeywordDictionary,
);
let isEnabled = localStorage.getItem(storageKey) !== 'false';
let translationMenuId: number | undefined;
let updateCardsMenuId: number | undefined;
let isCardUpdateInProgress = false;
let isClipboardTranslationInstalled = installDeckClipboardTranslation(
  unsafeWindow.navigator.clipboard,
  () => isEnabled,
);
installDeckCopyButtonTranslation(
  () => isEnabled,
  (text) => GM_setClipboard(text),
);

function translatePage(): void {
  if (!isEnabled || !document.documentElement) return;
  document.documentElement.lang = 'zh-CN';
  translator.translate(document.documentElement);
  localizeCardImages(document.documentElement, cardRenderIdsByDbfId);
}

function replaceRecord(
  target: Record<string, string>,
  source: Readonly<Record<string, string>>,
): void {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

function toggleTranslation(): void {
  isEnabled = !isEnabled;
  localStorage.setItem(storageKey, String(isEnabled));

  if (isEnabled) {
    translatePage();
  } else if (document.documentElement) {
    translator.restore(document.documentElement);
    restoreCardImages(document.documentElement);
    document.documentElement.lang = 'en';
  }

  registerMenus();
}

function registerMenus(): void {
  if (translationMenuId !== undefined) {
    GM_unregisterMenuCommand(translationMenuId);
  }
  if (updateCardsMenuId !== undefined) {
    GM_unregisterMenuCommand(updateCardsMenuId);
  }

  translationMenuId = GM_registerMenuCommand(
    isEnabled ? '切换为英文' : '切换为中文',
    toggleTranslation,
  );
  updateCardsMenuId = GM_registerMenuCommand('更新卡牌翻译数据', () => {
    void updateCardTranslations(true);
  });
}

function showCardUpdateNotice(
  message: string,
  type: 'loading' | 'success' | 'error',
): void {
  document.querySelector('[data-hsguru-zh-card-update-notice]')?.remove();

  const notice = document.createElement('div');
  notice.dataset.hsguruZhCardUpdateNotice = '';
  notice.setAttribute('role', type === 'error' ? 'alert' : 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.textContent = message;

  const backgrounds = {
    loading: 'rgb(30 35 35 / 96%)',
    success: 'rgb(35 75 57 / 96%)',
    error: 'rgb(112 45 45 / 96%)',
  } as const;
  Object.assign(notice.style, {
    position: 'fixed',
    zIndex: '2147483647',
    top: '16px',
    right: '16px',
    maxWidth: '360px',
    padding: '10px 14px',
    border: '1px solid rgb(255 255 255 / 18%)',
    borderRadius: '4px',
    background: backgrounds[type],
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 4px 16px rgb(0 0 0 / 30%)',
    pointerEvents: 'none',
  });
  (document.body ?? document.documentElement).append(notice);

  if (type !== 'loading') {
    window.setTimeout(() => notice.remove(), 3200);
  }
}

async function updateCardTranslations(forceRefresh = false): Promise<void> {
  if (forceRefresh && isCardUpdateInProgress) return;
  if (forceRefresh) {
    isCardUpdateInProgress = true;
    showCardUpdateNotice('正在更新卡牌翻译数据…', 'loading');
  }

  try {
    const cardLocalization = await loadCardLocalization(forceRefresh);
    // 卡牌名称可能与界面文案同名（例如 Brawl）。界面词典最后合并，
    // 确保模式和筛选选项不会被同名卡牌译名覆盖。
    Object.assign(runtimeDictionary, cardLocalization.dictionary, dictionary);
    replaceRecord(cardNamesByDbfId, cardLocalization.namesByDbfId);
    replaceRecord(cardTextsByDbfId, cardLocalization.textsByDbfId);
    replaceRecord(cardFlavorsByDbfId, cardLocalization.flavorsByDbfId);
    replaceRecord(cardKeywordDictionary, cardLocalization.keywordDictionary);
    cardRenderIdsByDbfId = cardLocalization.renderIdsByDbfId;
    translatePage();
    if (forceRefresh) {
      if (cardLocalization.source === 'network') {
        const cardCount = Object.keys(cardLocalization.namesByDbfId).length;
        showCardUpdateNotice(
          `卡牌翻译数据已更新（${cardCount.toLocaleString('zh-CN')} 张）`,
          'success',
        );
      } else {
        showCardUpdateNotice('更新失败，已继续使用原有缓存', 'error');
      }
    }
    console.info(
      `[HSGuru 中文助手] 已加载 ${Object.keys(cardLocalization.dictionary).length} 条卡牌翻译。`,
    );
  } catch (error) {
    if (forceRefresh) {
      showCardUpdateNotice('卡牌翻译数据更新失败，请稍后重试', 'error');
    }
    console.warn('[HSGuru 中文助手] 卡牌翻译数据加载失败。', error);
  } finally {
    if (forceRefresh) isCardUpdateInProgress = false;
  }
}

function start(): void {
  if (!isClipboardTranslationInstalled) {
    isClipboardTranslationInstalled = installDeckClipboardTranslation(
      unsafeWindow.navigator.clipboard,
      () => isEnabled,
    );
  }
  translatePage();

  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;

    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        translator.translate(mutation.target);
      }
      if (mutation.type === 'attributes') {
        translator.translate(mutation.target);
        localizeCardImages(mutation.target, cardRenderIdsByDbfId);
      }
      for (const node of mutation.addedNodes) {
        translator.translate(node);
        localizeCardImages(node, cardRenderIdsByDbfId);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['alt', 'aria-label', 'placeholder', 'src', 'title'],
  });

  registerMenus();
  void updateCardTranslations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
