import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCardDictionary,
  buildCardFlavorsByDbfId,
  buildCardKeywordDictionary,
  buildCardNamesByDbfId,
  buildCardRenderIds,
  buildCardTextsByDbfId,
} from '../src/data/card-dictionary';

test('pairs localized card names by stable card id', () => {
  const result = buildCardDictionary(
    [
      { id: 'CARD_1', name: 'First Card' },
      { id: 'CARD_2', name: 'Second Card' },
      { id: 'MISSING', name: 'Missing Card' },
    ],
    [
      { id: 'CARD_2', name: '第二张卡' },
      { id: 'CARD_1', name: '第一张卡' },
    ],
  );

  assert.deepEqual(result, {
    'First Card': '第一张卡',
    'Second Card': '第二张卡',
  });
});

test('ignores cards without a usable localized name', () => {
  assert.deepEqual(
    buildCardDictionary(
      [{ id: 'SAME', name: 'Same' }, { id: 'EMPTY' }],
      [{ id: 'SAME', name: 'Same' }],
    ),
    {},
  );
});

test('builds current and historical keyword translations from card JSON', () => {
  assert.deepEqual(
    buildCardKeywordDictionary(
      [
        {
          id: 'CARD_1',
          text: '<b>Battlecry:</b> Do something. <b>Fabled</b>.',
        },
        {
          id: 'CARD_2',
          text: '<b>Spell Damage +2</b> <b>Choose One -</b> Pick one.',
        },
        {
          id: 'CARD_3',
          text: '<b>Manathirst (6):</b> Do something.',
        },
      ],
      [
        {
          id: 'CARD_1',
          text: '<b>战吼：</b>做点什么。<b>奇闻</b>。',
        },
        {
          id: 'CARD_2',
          text: '<b>法术伤害 +2</b> <b>抉择 -</b>选择一项。',
        },
        {
          id: 'CARD_3',
          text: '<b>法力渴求（6）：</b>做点什么。',
        },
      ],
    ),
    {
      Battlecry: '战吼',
      'Choose One': '抉择',
      Fabled: '奇闻',
      Manathirst: '法力渴求',
      'Spell Damage': '法术伤害',
    },
  );
});

test('indexes localized card renders by HSGuru dbf id', () => {
  assert.deepEqual(
    buildCardRenderIds([
      { id: 'CORE_BT_351', dbfId: 69586, name: '战斗邪犬' },
      { id: 'NO_DBF_ID', name: '无编号卡牌' },
    ]),
    { '69586': 'CORE_BT_351' },
  );
});

test('indexes collectible and attached localized card names by dbf id', () => {
  assert.deepEqual(
    buildCardNamesByDbfId([
      { id: 'TIME_609', dbfId: 119707, name: '游侠将军希尔瓦娜斯' },
      { id: 'TIME_609t1', dbfId: 119705, name: '游侠队长奥蕾莉亚' },
      { id: 'TIME_609t2', dbfId: 119706, name: '游侠新兵温蕾萨' },
      { id: 'NO_DBF_ID', name: '无编号卡牌' },
    ]),
    {
      '119705': '游侠队长奥蕾莉亚',
      '119706': '游侠新兵温蕾萨',
      '119707': '游侠将军希尔瓦娜斯',
    },
  );
});

test('indexes localized card text by dbf id', () => {
  assert.deepEqual(
    buildCardTextsByDbfId([
      {
        id: 'CARD_WITH_TEXT',
        dbfId: 100001,
        text: '来自 JSON 的中文卡牌文本',
      },
      { id: 'NO_TEXT', dbfId: 1 },
    ]),
    {
      '100001': '来自 JSON 的中文卡牌文本',
    },
  );
});

test('indexes localized flavor text by dbf id', () => {
  assert.deepEqual(
    buildCardFlavorsByDbfId([
      {
        id: 'CARD_WITH_FLAVOR',
        dbfId: 100002,
        flavor: '来自 JSON 的中文趣味描述',
      },
      { id: 'NO_FLAVOR', dbfId: 2 },
    ]),
    {
      '100002': '来自 JSON 的中文趣味描述',
    },
  );
});
