import { getCardDbfIdFromHref } from './data/card-id';

const renderBaseUrl =
  'https://art.hearthstonejson.com/v1/render/latest/zhCN/512x';

const originalSourceAttribute = 'data-hsguru-zh-original-card-src';
const localizedSourceAttribute = 'data-hsguru-zh-localized-card-src';
const originalBackgroundAttribute =
  'data-hsguru-zh-original-card-background-image';
const localizedBackgroundAttribute =
  'data-hsguru-zh-localized-card-background-image';

export function getChineseCardRenderUrl(renderId: string): string {
  return `${renderBaseUrl}/${encodeURIComponent(renderId)}.png`;
}

function findCardImages(root: Node): HTMLImageElement[] {
  const images: HTMLImageElement[] = [];
  if (
    root instanceof HTMLImageElement &&
    root.closest('[card_id], a[href*="/card/"]')
  ) {
    images.push(root);
  }
  if (root instanceof Element || root instanceof Document) {
    images.push(
      ...root.querySelectorAll<HTMLImageElement>(
        '[card_id] img, a[href*="/card/"] img',
      ),
    );
  }
  return images;
}

function findHoverCardPreviews(root: Node): HTMLElement[] {
  const previews: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.matches('.decklist-card-image')) {
    previews.push(root);
  }
  if (root instanceof Element || root instanceof Document) {
    previews.push(
      ...root.querySelectorAll<HTMLElement>('.decklist-card-image'),
    );
  }
  return previews;
}

export function localizeCardImages(
  root: Node,
  renderIdsByDbfId: Readonly<Record<string, string>>,
): void {
  for (const image of findCardImages(root)) {
    const cardId = image.closest('[card_id]')?.getAttribute('card_id');
    const cardHref = image.closest('a[href*="/card/"]')?.getAttribute('href');
    const dbfId = cardId ?? (cardHref ? getCardDbfIdFromHref(cardHref) : null);
    const renderId = dbfId ? renderIdsByDbfId[dbfId] : undefined;
    if (!renderId) continue;

    const localizedSource = getChineseCardRenderUrl(renderId);
    const currentSource = image.getAttribute('src') ?? '';
    const previousLocalizedSource = image.getAttribute(
      localizedSourceAttribute,
    );
    if (currentSource !== localizedSource) {
      if (currentSource !== previousLocalizedSource) {
        image.setAttribute(originalSourceAttribute, currentSource);
      }
      image.setAttribute(localizedSourceAttribute, localizedSource);
      image.setAttribute('src', localizedSource);
    }
  }

  for (const preview of findHoverCardPreviews(root)) {
    const cardHref = preview.closest('a[href*="/card/"]')?.getAttribute('href');
    const dbfId = cardHref ? getCardDbfIdFromHref(cardHref) : undefined;
    const renderId = dbfId ? renderIdsByDbfId[dbfId] : undefined;
    if (!renderId) continue;

    const localizedBackground = `url("${getChineseCardRenderUrl(renderId)}")`;
    const currentBackground = preview.style.backgroundImage;
    const previousLocalizedBackground = preview.getAttribute(
      localizedBackgroundAttribute,
    );
    if (currentBackground !== localizedBackground) {
      if (currentBackground !== previousLocalizedBackground) {
        preview.setAttribute(originalBackgroundAttribute, currentBackground);
      }
      preview.setAttribute(localizedBackgroundAttribute, localizedBackground);
      preview.style.backgroundImage = localizedBackground;
    }
  }
}

export function restoreCardImages(root: Node): void {
  for (const image of findCardImages(root)) {
    const originalSource = image.getAttribute(originalSourceAttribute);
    if (originalSource === null) continue;
    image.setAttribute('src', originalSource);
    image.removeAttribute(originalSourceAttribute);
    image.removeAttribute(localizedSourceAttribute);
  }

  for (const preview of findHoverCardPreviews(root)) {
    const originalBackground = preview.getAttribute(
      originalBackgroundAttribute,
    );
    if (originalBackground === null) continue;
    preview.style.backgroundImage = originalBackground;
    preview.removeAttribute(originalBackgroundAttribute);
    preview.removeAttribute(localizedBackgroundAttribute);
  }
}
