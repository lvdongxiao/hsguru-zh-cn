/** 从 HSGuru 卡牌链接中提取 dbf id。 */
export function getCardDbfIdFromHref(href: string): string | undefined {
  return href.match(/(?:^|\/)card\/(\d+)(?:[/?#]|$)/)?.[1];
}
