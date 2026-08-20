import { getCardDbfIdFromHref } from '../data/card-id';
import {
  replacePreservingWhitespace,
  type TranslationDictionary,
} from './text';

export function translateCardTextByHref(
  source: string,
  href: string,
  namesByDbfId: TranslationDictionary,
): string {
  if (source.trim() === '') return source;

  const dbfId = getCardDbfIdFromHref(href);
  const localizedName = dbfId ? namesByDbfId[dbfId] : undefined;
  if (!localizedName) return source;

  return replacePreservingWhitespace(source, localizedName);
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

  return replacePreservingWhitespace(source, localized);
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
