import assert from 'node:assert/strict';
import test from 'node:test';
import { translateDeckName } from '../src/i18n/deck-names';

test('combines an archetype and class into a conventional Chinese deck name', () => {
  assert.equal(translateDeckName('Face Hunter'), '打脸猎');
  assert.equal(translateDeckName('Two-Bit Rogue'), '二费贼');
  assert.equal(translateDeckName('Aggro Paladin'), '快攻骑');
  assert.equal(translateDeckName('Void Soul DH'), '虚空灵魂瞎');
  assert.equal(translateDeckName('Leyline Mage'), '魔网法');
  assert.equal(translateDeckName('Merithra Druid'), '麦琳瑟拉德');
  assert.equal(translateDeckName("Lo'Gosh Warrior"), '洛戈什战');
});

test('supports Death Knight rune prefixes', () => {
  assert.equal(translateDeckName('BUU Egg DK'), '血邪邪蛋DK');
  assert.equal(translateDeckName('BBUU Chef Druid'), '血血邪邪主厨德');
});

test('translates current HSGuru shorthand names', () => {
  assert.equal(translateDeckName('AYAYA Rogue'), '艾雅贼');
  assert.equal(translateDeckName('Zee Shaman'), '随从萨');
  assert.equal(translateDeckName('XL Rafaamlock'), 'XL拉法姆术');
  assert.equal(translateDeckName('6 7 Shredslock'), '六七费撕裂术');
  assert.equal(translateDeckName("Alara'shi DH"), '阿莱纳希瞎');
  assert.equal(translateDeckName('Alternate Reality Druid'), '平行现实德');
  assert.equal(translateDeckName('Animancer Warlock'), '大哥术');
});

test('translates deck names from the signed-in homepage', () => {
  assert.equal(translateDeckName('Attack Druid'), '攻击德');
  assert.equal(translateDeckName("BUU Thal'ena DK"), '血邪邪萨安娜DK');
  assert.equal(translateDeckName('BUU Bwonsamdi DK'), '血邪邪邦桑迪DK');
});

test('translates archetypes in signed-in filter dropdowns', () => {
  assert.equal(translateDeckName('Quest DK'), '任务DK');
  assert.equal(translateDeckName('Harold DK'), '兆示DK');
  assert.equal(translateDeckName('Egg DK'), '蛋DK');
  assert.equal(translateDeckName('Aggro DK'), '快攻DK');
  assert.equal(translateDeckName('Frost DK'), '冰霜DK');
  assert.equal(translateDeckName('Quest DH'), '任务瞎');
  assert.equal(translateDeckName('Void Soul DH'), '虚空灵魂瞎');
});

test('translates current environment page archetypes', () => {
  assert.equal(translateDeckName('Azshara Druid'), '艾萨拉德');
  assert.equal(translateDeckName('End of Turnadin'), '回合结束骑');
  assert.equal(translateDeckName('Barnes Druid'), '巴内斯德');
  assert.equal(translateDeckName('Moragg Warlock'), '摩拉格术');
  assert.equal(translateDeckName('Prepared Hunter'), '预备猎');
  assert.equal(translateDeckName('Void DH'), '虚空瞎');
});

test('translates archetypes from the current Standard meta page', () => {
  assert.equal(translateDeckName('Unholy DK'), '邪DK');
  assert.equal(translateDeckName('Garona Rogue'), '迦罗娜贼');
  assert.equal(translateDeckName('Harold Egglock'), '兆示蛋术');
  assert.equal(translateDeckName('Egglock'), '蛋术');
  assert.equal(translateDeckName('Godfrey Warlock'), '高弗雷术');
  assert.equal(translateDeckName('Toki Mage'), '托奇法');
});

test('translates deck roots sampled across Standard, Wild, and Brawl', () => {
  assert.equal(
    translateDeckName('STD Contraband Face Hunter'),
    '标准私藏打脸猎',
  );
  assert.equal(translateDeckName('XL HL Igneous Warrior'), 'XL宇宙火成战');
  assert.equal(translateDeckName('XL Seedlock'), 'XL任务术');
  assert.equal(translateDeckName('Clone Mech Paladin'), '复制机械骑');
  assert.equal(translateDeckName('Lynessa Libram Paladin'), '莱妮莎圣契骑');
  assert.equal(translateDeckName('CtA Paladin'), '战斗号角骑');
  assert.equal(translateDeckName('FUU Plague DK'), '冰邪邪瘟疫DK');
  assert.equal(translateDeckName('Evenlock'), '偶数术');
  assert.equal(translateDeckName('Discolock'), '弃牌术');
  assert.equal(translateDeckName('XL Exodia Mage'), 'XL艾克佐迪亚法');
  assert.equal(translateDeckName('XL HL Tick Tock Warlock'), 'XL宇宙新任务术');
});

test('covers the Wild 30-day, 50-game sample while preserving XL', () => {
  assert.equal(translateDeckName('XL Blood DK'), 'XL血DK');
  assert.equal(translateDeckName('XL HL Rainbow DK'), 'XL宇宙彩虹DK');
  assert.equal(translateDeckName('XL Linecracker Druid'), 'XL阵线破坏者德');
  assert.equal(translateDeckName('Deckless Warlock'), '轮盘术');
  assert.equal(translateDeckName('Imbue Mage'), '灌注法');
  assert.equal(translateDeckName('Boarlock'), '野猪术');
  assert.equal(translateDeckName('Cute Warrior'), '可爱战');
  assert.equal(translateDeckName('XL JtU Quest Mage'), 'XL安戈洛任务法');
  assert.equal(translateDeckName('XL SoU Quest Shaman'), 'XL奥丹姆任务萨');
  assert.equal(translateDeckName('XL HL Shudder Shaman'), 'XL宇宙沙德萨');
  assert.equal(translateDeckName('Heal Burn Priest'), '治疗直伤牧');
  assert.equal(translateDeckName("Ohn'ahra Big Shaman"), '欧恩哈拉大哥萨');
  assert.equal(translateDeckName("Sul'thraze Warrior"), '苏萨斯战');
  assert.equal(translateDeckName("Rock 'n' Roll Warrior"), '黑石摇滚战');
  assert.equal(translateDeckName("XL HL 'n' Roll Warrior"), 'XL宇宙黑石摇滚战');
  assert.equal(translateDeckName('Switcheroo Priest'), '体型互换牧');
  assert.equal(translateDeckName("XL Il'gynoth DH"), 'XL伊格诺斯瞎');
  assert.equal(translateDeckName('Kingslayer Pirate Rogue'), '弑君海盗贼');
  assert.equal(translateDeckName('Automaton Priest'), '自动机牧');
  assert.equal(translateDeckName('XL FUU HL Plague DK'), 'XL冰邪邪宇宙瘟疫DK');
});

test('translates the initially visible Wild archetype filter options', () => {
  assert.equal(translateDeckName('Alignment Druid'), '超凡德');
  assert.equal(translateDeckName('Amalgam Death Knight'), '融合怪DK');
  assert.equal(translateDeckName('Amalgam Demon Hunter'), '融合怪瞎');
});

test('translates a deck detail heading with its format suffix', () => {
  assert.equal(
    translateDeckName('XL Linecracker Druid Wild'),
    'XL阵线破坏者德 狂野模式',
  );
});

test('leaves an unrelated name unchanged', () => {
  assert.equal(
    translateDeckName('Completely Custom Name'),
    'Completely Custom Name',
  );
});
