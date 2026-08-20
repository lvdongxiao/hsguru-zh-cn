import assert from 'node:assert/strict';
import test from 'node:test';
import { createTranslationResources } from '../src/i18n/resources';

test('creates a complete empty translation resource snapshot', () => {
  const resources = createTranslationResources({ Home: '首页' });

  assert.deepEqual(resources.dictionary, { Home: '首页' });
  assert.deepEqual(resources.cardNamesByDbfId, {});
  assert.deepEqual(resources.cardTextsByDbfId, {});
  assert.deepEqual(resources.cardFlavorsByDbfId, {});
  assert.deepEqual(resources.cardKeywordDictionary, {});
});

test('merges card resources while keeping interface translations authoritative', () => {
  const resources = createTranslationResources(
    { Brawl: '乱斗模式' },
    {
      dictionary: { Brawl: '争斗', Zilliax: '奇利亚斯' },
      namesByDbfId: { '110446': '奇利亚斯豪华版3000型' },
      textsByDbfId: { '110446': '卡牌文本' },
      flavorsByDbfId: { '110446': '趣味描述' },
      keywordDictionary: { Battlecry: '战吼' },
    },
  );

  assert.equal(resources.dictionary.Brawl, '乱斗模式');
  assert.equal(resources.dictionary.Zilliax, '奇利亚斯');
  assert.equal(resources.cardNamesByDbfId['110446'], '奇利亚斯豪华版3000型');
});

test('replacing a resource snapshot does not retain removed card entries', () => {
  const previous = createTranslationResources(
    {},
    {
      dictionary: { RemovedCard: '旧译名' },
      namesByDbfId: {},
      textsByDbfId: {},
      flavorsByDbfId: {},
      keywordDictionary: {},
    },
  );
  const next = createTranslationResources(
    {},
    {
      dictionary: { CurrentCard: '新译名' },
      namesByDbfId: {},
      textsByDbfId: {},
      flavorsByDbfId: {},
      keywordDictionary: {},
    },
  );

  assert.equal(previous.dictionary.RemovedCard, '旧译名');
  assert.equal(next.dictionary.RemovedCard, undefined);
  assert.equal(next.dictionary.CurrentCard, '新译名');
});
