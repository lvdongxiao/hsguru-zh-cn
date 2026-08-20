import { translateDynamicText } from './dynamic-rules';

export type TranslationDictionary = Readonly<Record<string, string>>;

export function replacePreservingWhitespace(
  source: string,
  replacement: string,
): string {
  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  return match ? `${match[1]}${replacement}${match[3]}` : replacement;
}

const chineseRegionNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['zh-CN'], { type: 'region' })
    : undefined;

export function translateCountryOption(
  source: string,
  countryCode: string,
): string {
  if (!chineseRegionNames || !/^[A-Z]{2}$/.test(countryCode)) return source;

  const translated = chineseRegionNames.of(countryCode);
  return translated && translated !== countryCode
    ? replacePreservingWhitespace(source, translated)
    : source;
}

export function translateText(
  source: string,
  dictionary: TranslationDictionary,
): string {
  const match = source.match(/^(\s*)(.*?)(\s*)$/s);
  if (!match) return source;

  const content = match[2];
  const translated =
    dictionary[content] ?? translateDynamicText(content, dictionary);
  return translated === undefined
    ? source
    : replacePreservingWhitespace(source, translated);
}
