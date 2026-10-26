import { runeImages } from '../data/rune-images';
import type { DeckRune } from './deck-names';

export const runeIconSelector = '[data-hsguru-zh-runes]';

export function describeDeckRunes(runes: readonly DeckRune[]): string {
  const names: Readonly<Record<DeckRune, string>> = {
    B: '鲜血',
    F: '冰霜',
    U: '邪恶',
  };
  return (['B', 'F', 'U'] as const)
    .flatMap((rune) => {
      const count = runes.filter((item) => item === rune).length;
      return count ? [`${names[rune]} ×${count}`] : [];
    })
    .join('、');
}

/** 使用参照游戏重绘的矢量符文；不添加文本，避免污染站点的复制标题。 */
export function createDeckRuneIcons(runes: readonly DeckRune[]): HTMLElement {
  const group = document.createElement('span');
  group.setAttribute('data-hsguru-zh-runes', '');
  group.setAttribute('role', 'img');
  const description = describeDeckRunes(runes);
  group.setAttribute('aria-label', description);
  group.setAttribute('title', description);
  Object.assign(group.style, {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    gap: '0',
    marginInlineEnd: '3px',
    lineHeight: '0',
    whiteSpace: 'nowrap',
  });

  for (const rune of runes) {
    const image = document.createElement('img');
    image.src = runeImages[rune];
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.width = 18;
    image.height = 18;
    Object.assign(image.style, {
      width: '18px',
      height: '18px',
      maxWidth: 'none',
      display: 'block',
      flexShrink: '0',
      objectFit: 'contain',
    });
    group.append(image);
  }
  return group;
}
