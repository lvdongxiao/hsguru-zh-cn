import assert from 'node:assert/strict';
import test from 'node:test';
import { translateCardLabelByHref } from '../src/i18n/card-text';
import { dictionary } from '../src/i18n/dictionary';
import { translateDurationValue } from '../src/i18n/dynamic-rules';
import { translateText } from '../src/i18n/text';

test('translates table view controls, tooltips and separate statistic labels', () => {
  const expected = {
    'Card Top': '卡牌顶部',
    'Cropped Card': '裁剪卡图',
    'Card Top View (Cut off below rarity gem)':
      '卡牌顶部视图（截取至稀有度宝石下方）',
    'Cropped Card View (Card art with stat overlays)':
      '裁剪卡图视图（叠加卡牌数值）',
    'Sort by Winrate': '按胜率排序',
    'Sort by Total Games': '按总对局数排序',
    'Sort by Average Turns': '按平均回合数排序',
    'Sort by Average Duration': '按平均时长排序',
    'Deck code': '套牌代码',
    'Crafting Dust': '合成所需奥术之尘',
    games: '对局数',
    turns: '回合数',
    duration: '时长',
  };
  for (const [source, translated] of Object.entries(expected)) {
    assert.equal(
      translateText(`\n ${source} `, dictionary),
      `\n ${translated} `,
    );
  }
  for (const source of [
    'games played elsewhere',
    'turnstone',
    'duration_ms',
    'Card Topper',
  ]) {
    assert.equal(translateText(source, dictionary), source);
  }
});

test('translates only complete minute values in a duration context', () => {
  assert.equal(translateDurationValue(' 6.5m\n'), ' 6.5 分钟\n');
  assert.equal(translateDurationValue('10m'), '10 分钟');
  for (const source of ['6.5ms', '6.5m ago', 'v6.5m', '-1m']) {
    assert.equal(translateDurationValue(source), source);
  }
  assert.equal(translateText('6.5m', dictionary), '6.5m');
});

test('translates card labels by dbf id while preserving count, type and mana', () => {
  const names = { '127099': '火炮长' };
  const translate = (source: string, href = '/card/127099') =>
    translateCardLabelByHref(source, href, names, dictionary);
  assert.equal(translate('2x Cannonmaster (1 mana)'), '2x 火炮长（1 费）');
  assert.equal(translate('  Cannonmaster (Minion)\n'), '  火炮长（随从）\n');
  assert.equal(translate('2x Cannonmaster (Minion)'), '2x 火炮长（随从）');
  for (const type of ['Spell', 'Weapon', 'Location', 'Hero']) {
    assert.equal(
      translate(`1x Card (${type})`),
      `1x 火炮长（${dictionary[type]}）`,
    );
  }
  assert.equal(translate('1x Card (0 mana)'), '1x 火炮长（0 费）');
  assert.equal(translate('1x Card (10 mana)'), '1x 火炮长（10 费）');
  for (const source of [
    'Card (1 mana) extra',
    'Card (1 mana',
    'Card (Unknown)',
    'Card',
    'Card (mana)',
  ]) {
    assert.equal(translate(source), source);
  }
  assert.equal(
    translate('2x Cannonmaster (1 mana)', '/card/999'),
    '2x Cannonmaster (1 mana)',
  );
  assert.equal(
    translate('2x Cannonmaster (1 mana)', '/deck/127099'),
    '2x Cannonmaster (1 mana)',
  );
});
