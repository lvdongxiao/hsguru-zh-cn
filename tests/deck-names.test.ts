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

test('translates the current Standard deck archetype dropdown', () => {
  const expected: Readonly<Record<string, string>> = {
    'Archmage DH': '大法师瞎',
    'Ashamane Rogue': '阿莎曼贼',
    'Bot? DK': '机器人？DK',
    'Briarspawn Warrior': '棘嗣幼龙战',
    'Bwomsamdi DK': '邦桑迪DK',
    'CaprioDi Warrior': 'CaprioDi战',
    'Cycle Rogue': '过牌贼',
    'Dino Egglock': '恐龙蛋术',
    'Divergence Warlock': '裂解术',
    'Dude Paladin': '报告骑',
    'Elise DH': '伊莉斯瞎',
    'Enrage Warrior': '激怒战',
    'Finja Paladin': '芬杰骑',
    'Fyrakk Rogue': '火龙贼',
    'Gladiator Warrior': '角斗战',
    'Herenn DK': '赫雷恩DK',
    'Jade Lotus Warrior': '青玉莲战',
    'J-Lock': '大王控制术',
    'Krona Druid': '克洛纳德',
    'Loh-cky Druid': '洛奇德',
    'Magmaw Hunter': '熔喉猎',
    'Maiev Paladin': '玛维骑',
    'Masochist Shaman': '受虐萨',
    'Medivh Priest': '麦迪文牧',
    'Murozond DH': '姆诺兹多瞎',
    Painlock: '自残术',
    'Patron Warrior': '奴隶战',
    'Peddler Paladin': '精魂骑',
    'Rat Trap Hunter': '捕鼠猎',
    'Raza DH': '拉兹瞎',
    'Rotten Druid': '烂苹果德',
    'Sanctum Priest': '圣地牧',
    'Securitybot Shaman': '安保机器人萨',
    'Spell Damage Shaman': '法强萨',
    'Stego Herenn DK': '剑龙赫雷恩DK',
    Tauntlock: '嘲讽术',
    'Toru DH': '托鲁瞎',
    'Tyrande Priest': '泰兰德牧',
    'Vyranoth Mage': '威拉诺兹法',
    'Wallow Shredslock': '瓦洛撕裂术',
    'Wallow Warlock': '瓦洛术',
    'Wilted Priest': '枯萎牧',
    'Wo Shaman': '沃萨',
    'Ysondre Warrior': '伊森德雷战',
    'Zuramat Druid': '祖拉玛特德',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateDeckName(english), chinese);
  }
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

test('translates the current Wild deck archetype dropdown', () => {
  const expected: Readonly<Record<string, string>> = {
    'Astral Druid': '星界德',
    'AtT Quest Hunter': '穿越时间流任务猎',
    'Basher Warrior': '怒袭甲龙战',
    'Blaze Warrior': '毁灭之焰战',
    'Boar OTK Druid': '野猪OTK德',
    Burnlock: '直伤术',
    'Buttons DK': '扣子DK',
    'Chad Seedlock': '大哥任务术',
    'Colifero Demon Hunter': '可丽菲罗瞎',
    'Concierge Paladin': '礼宾骑',
    Curselock: '诅咒术',
    'DMH Warrior': '亡者之牌战',
    'Drilling Rogue': '发掘贼',
    'Dungar Druid': '杜加尔德',
    'Evolve Shaman': '异变萨',
    'Floppy Hunter': '软软多头蛇猎',
    'Gaia Paladin': '盖亚骑',
    'Garrote Rogue': '锁喉贼',
    'Gauntlet Warrior': '源生护手战',
    'Giants Priest': '巨人牧',
    'Grimy Goons Paladin': '污手党骑',
    'Hooktusk Rogue': '钩牙贼',
    'Hydration Warrior': '补水战',
    'Insanity Warlock': '疲劳术',
    'Jade Druid': '青玉德',
    'Kabal Warlock': '暗金教术',
    'LPG Mage': '口袋银河法',
    "Mecha'Chad Warrior": '机械大哥战',
    'Mine Rogue': '水雷贼',
    'Clone Miner Paladin': '复制矿工骑',
    "Mug'Zee Shaman": '穆格·兹伊萨',
    'Murmur Shaman': '摩摩尔萨',
    'Nazmani Priest': '纳兹曼尼牧',
    'STD No Hand Hunter': '标准空手猎',
    'Ogre Rogue': '食人魔贼',
    'Old Aggro Druid': '旧版快攻德',
    'Other Mage': '其他法',
    'Overheal Priest': '过疗牧',
    'Quilboar Demon Hunter': '野猪人瞎',
    'Fel Relic DH': '邪能圣物瞎',
    'Rez Priest': '复活牧',
    'Sea Shanty Paladin': '海上船歌骑',
    'Shark Rogue': '鲨鱼贼',
    'Sif Mage': '西芙法',
    'Sludge Warlock': '淤泥术',
    'Small Spell Mage': '小法术法',
    'Star Grazer Druid': '吞星兽德',
    'Swiftscale Rogue': '迅鳞贼',
    'Tentacle Mage': '触须法',
    'Therazane Druid': '塞拉赞恩德',
    Toglock: '托瓦格尔术',
    'Totem Shaman': '图腾萨',
    'Well Rogue': '许愿井贼',
    'XL Sea Shanty Paladin': 'XL海上船歌骑',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateDeckName(english), chinese);
  }
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
