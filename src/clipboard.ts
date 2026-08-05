import { translateDeckName } from './i18n/deck-names';

interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

type ClipboardSetter = (text: string) => void;

const deckMarkerPattern =
  /^(?:# (?:Class|Format):|[A-Za-z0-9+/]{40,}={0,2})\r?$/m;

/** 只翻译炉石套牌文本中以 ### 开头的套牌名。 */
export function translateCopiedDeckText(source: string): string {
  if (!deckMarkerPattern.test(source)) return source;

  return source.replace(
    /^(\uFEFF?[ \t]*###[ \t]+)(.*?)([ \t]*)(\r?)$/m,
    (_line, prefix: string, deckName: string, trailing: string, cr: string) =>
      `${prefix}${translateDeckName(deckName)}${trailing}${cr}`,
  );
}

export function createHsguruDeckCopyText(
  deckName: string,
  deckCode: string,
  deckUrl: string,
): string {
  return [
    `### ${translateDeckName(deckName)}`,
    deckCode,
    `### You can view this deck at ${deckUrl}`,
  ].join('\n');
}

function extractDeckCode(heading: Element): string | undefined {
  const matches = heading.textContent?.match(/[A-Za-z0-9+/]{40,}={0,2}/g);
  return matches?.sort((a, b) => b.length - a.length)[0];
}

function findDeckHeading(button: HTMLButtonElement): Element | undefined {
  let ancestor = button.parentElement;
  while (ancestor && ancestor !== document.body) {
    const headings = [...ancestor.querySelectorAll('h2')].filter((heading) =>
      Boolean(extractDeckCode(heading)),
    );
    if (headings.length === 1) return headings[0];
    if (headings.length > 1) break;
    ancestor = ancestor.parentElement;
  }

  const buttonRect = button.getBoundingClientRect();
  return [...document.querySelectorAll('main h2')]
    .filter((heading) => Boolean(extractDeckCode(heading)))
    .sort((a, b) => {
      const distanceA = Math.abs(
        a.getBoundingClientRect().top - buttonRect.top,
      );
      const distanceB = Math.abs(
        b.getBoundingClientRect().top - buttonRect.top,
      );
      return distanceA - distanceB;
    })[0];
}

function getDeckUrl(heading: Element): string | undefined {
  const currentUrl = new URL(window.location.href);
  const deckLink =
    heading.querySelector<HTMLAnchorElement>('a[href*="/deck/"]');
  const candidate = new URL(deckLink?.href ?? currentUrl.href, currentUrl.href);
  if (!/^\/deck\/\d+/.test(candidate.pathname)) return undefined;
  return `${candidate.origin}${candidate.pathname}`;
}

function showCopiedFeedback(button: HTMLButtonElement): void {
  document.querySelector('[data-hsguru-zh-copy-feedback]')?.remove();

  const originalLabel =
    button.dataset.hsguruZhOriginalCopyLabel ??
    button.getAttribute('aria-label') ??
    '';
  const originalBalloonPosition =
    button.dataset.hsguruZhOriginalBalloonPosition ??
    button.getAttribute('data-balloon-pos') ??
    '';
  button.dataset.hsguruZhCopyButton = '';
  button.dataset.hsguruZhOriginalCopyLabel = originalLabel;
  button.dataset.hsguruZhOriginalBalloonPosition = originalBalloonPosition;
  // HSGuru 会用 aria-label 生成悬停提示。复制后暂时隐藏气泡，
  // 等鼠标离开再恢复，避免“复制”气泡一直停留。
  button.setAttribute('aria-label', '已复制');
  button.removeAttribute('data-balloon-pos');

  const restoreLabel = () => {
    if (originalLabel) button.setAttribute('aria-label', originalLabel);
    else button.removeAttribute('aria-label');
    if (originalBalloonPosition) {
      button.setAttribute('data-balloon-pos', originalBalloonPosition);
    } else {
      button.removeAttribute('data-balloon-pos');
    }
    delete button.dataset.hsguruZhCopyButton;
    delete button.dataset.hsguruZhOriginalCopyLabel;
    delete button.dataset.hsguruZhOriginalBalloonPosition;
  };
  const restoreAfterPointerExit = () => {
    // HSGuru 的气泡同时响应 hover 和 focus。先清除点击留下的焦点，
    // 再等待浏览器完成鼠标离开状态，避免恢复属性时闪现“复制”。
    button.blur();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(restoreLabel);
    });
  };
  button.addEventListener('pointerleave', restoreAfterPointerExit, {
    once: true,
  });

  const badge = document.createElement('span');
  badge.dataset.hsguruZhCopyFeedback = '';
  badge.setAttribute('role', 'status');
  badge.setAttribute('aria-live', 'polite');
  badge.textContent = '已复制';

  const rect = button.getBoundingClientRect();
  Object.assign(badge.style, {
    position: 'fixed',
    zIndex: '2147483647',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top > 44 ? rect.top - 36 : rect.bottom + 8}px`,
    transform: 'translateX(-50%)',
    padding: '6px 12px',
    border: '0',
    borderRadius: '2px',
    background: 'rgb(16 16 16 / 95%)',
    color: '#ffffff',
    fontSize: '12px',
    lineHeight: '1.2',
    boxShadow: 'none',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 180ms ease-out 180ms',
  });
  document.body.append(badge);
  window.requestAnimationFrame(() => {
    badge.style.opacity = '1';
  });

  window.setTimeout(() => {
    badge.style.opacity = '0';
    if (!button.matches(':hover')) restoreAfterPointerExit();
    window.setTimeout(() => badge.remove(), 140);
  }, 1200);
}

/** 直接接管 HSGuru 的套牌复制按钮，避免站点的英文写入覆盖翻译结果。 */
export function installDeckCopyButtonTranslation(
  isEnabled: () => boolean,
  setClipboard: ClipboardSetter,
): void {
  document.addEventListener(
    'click',
    (event) => {
      if (!isEnabled() || !(event.target instanceof Element)) return;

      const button = event.target.closest<HTMLButtonElement>('button');
      if (!button) return;
      const label = button.getAttribute('aria-label')?.trim();
      const text = button.textContent?.trim();
      if (
        !button.hasAttribute('data-hsguru-zh-copy-button') &&
        label !== 'Copy' &&
        label !== '复制' &&
        text !== 'Copy' &&
        text !== '复制'
      ) {
        return;
      }

      const heading = findDeckHeading(button);
      const deckName = heading
        ?.querySelector<HTMLAnchorElement>(
          'a[href*="/deck/"], a[href*="/archetype/"]',
        )
        ?.textContent?.trim();
      const deckCode = heading ? extractDeckCode(heading) : undefined;
      const deckUrl = heading ? getDeckUrl(heading) : undefined;
      if (!deckName || !deckCode || !deckUrl) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      setClipboard(createHsguruDeckCopyText(deckName, deckCode, deckUrl));
      showCopiedFeedback(button);
    },
    { capture: true },
  );
}

/** 包装网页剪贴板写入，让 HSGuru 原有的复制按钮继续工作。 */
export function installDeckClipboardTranslation(
  clipboard: ClipboardWriter | undefined,
  isEnabled: () => boolean,
): boolean {
  if (!clipboard || typeof clipboard.writeText !== 'function') return false;

  const prototype = Object.getPrototypeOf(clipboard) as
    ClipboardWriter | undefined;
  // 浏览器的 Clipboard 实例通常不允许添加自有方法；
  // 站点也可能每次重新读取 navigator.clipboard。因此优先包装原型方法。
  const target =
    prototype && typeof prototype.writeText === 'function'
      ? prototype
      : clipboard;
  const originalWriteText = target.writeText;
  const translatedWriteText = function (
    this: ClipboardWriter,
    text: string,
  ): Promise<void> {
    return originalWriteText.call(
      this,
      isEnabled() ? translateCopiedDeckText(text) : text,
    );
  };

  try {
    Object.defineProperty(target, 'writeText', {
      configurable: true,
      writable: true,
      value: translatedWriteText,
    });
    return true;
  } catch {
    return false;
  }
}
