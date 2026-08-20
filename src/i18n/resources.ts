import type { TranslationResources } from './page-translator';
import type { TranslationDictionary } from './text';

export interface CardTranslationResources {
  dictionary: TranslationDictionary;
  namesByDbfId: TranslationDictionary;
  textsByDbfId: TranslationDictionary;
  flavorsByDbfId: TranslationDictionary;
  keywordDictionary: TranslationDictionary;
}

const emptyDictionary: TranslationDictionary = {};

/** 创建不可变引用的翻译资源快照，并确保界面词典优先于同名卡牌。 */
export function createTranslationResources(
  interfaceDictionary: TranslationDictionary,
  cards?: CardTranslationResources,
): TranslationResources {
  return {
    dictionary: { ...cards?.dictionary, ...interfaceDictionary },
    cardNamesByDbfId: cards?.namesByDbfId ?? emptyDictionary,
    cardTextsByDbfId: cards?.textsByDbfId ?? emptyDictionary,
    cardFlavorsByDbfId: cards?.flavorsByDbfId ?? emptyDictionary,
    cardKeywordDictionary: cards?.keywordDictionary ?? emptyDictionary,
  };
}
