const phraseTranslations: ReadonlyArray<readonly [string, string]> = [
  ['Splendiferous Whizbang', '威兹班'],
  ['Astral Communion', '星界'],
  ["Rock 'n' Roll", '黑石摇滚'],
  ["'n' Roll", '黑石摇滚'],
  ['Divine Spirit', '心火'],
  ['Heal Burn', '治疗直伤'],
  ['Holy Wrath', '元气'],
  ['No Minion', '法术'],
  ['Cliff Dive', '跳水'],
  ['Dark Gift', '黑暗之赐'],
  ['Void Soul', '虚空灵魂'],
  ['Two-Bit', '二费'],
  ['Tick Tock', '新任务'],
  ['Huddle Up', '抱团'],
  ['Alternate Reality', '平行现实'],
  ['6 7', '六七费'],
];

const wordTranslations: Readonly<Record<string, string>> = {
  // 玩法与机制
  Face: '打脸',
  Aggro: '快攻',
  Alignment: '超凡',
  Amalgam: '融合怪',
  Control: '控制',
  Midrange: '中速',
  Combo: '组合技',
  Quest: '任务',
  Questline: '任务',
  Exodia: '艾克佐迪亚',
  Highlander: '宇宙',
  Handbuff: '污手',
  Deathrattle: '亡语',
  Secret: '奥秘',
  Libram: '圣契',
  Miracle: '奇迹',
  Mill: '爆牌',
  Token: '超生',
  Burn: '打脸',
  Big: '大哥',
  Pain: '自伤',
  Pure: '光铸',
  Overload: '过载',
  Weapon: '武器',
  Spell: '法术',
  Location: '地标',
  Discover: '发现',
  Outcast: '流放',
  Starship: '星舰',
  Rainbow: '彩虹',
  Zoo: '动物园',
  Egg: '蛋',
  Thief: '脏',
  Fatigue: '疲劳',
  Armor: '叠甲',
  Menagerie: '混合流',
  Odd: '奇数',
  Even: '偶数',
  HL: '宇宙',
  STD: '标准',
  LC: '安戈洛',
  Blood: '血',
  Plague: '瘟疫',
  Clone: '复制',
  Aura: '光环',
  Auctioneer: '加基森',
  Automaton: '自动机',
  Boarlock: '野猪术',
  Champions: '勇士',
  Cute: '可爱',
  Freeze: '冰霜',
  Heal: '治疗',
  Hostage: '人质',
  Infinity: '无限',
  JtU: '安戈洛',
  Kingslayer: '弑君',
  SoU: '奥丹姆',
  Taunt: '嘲讽',
  Treant: '树人',
  Warsong: '战歌',

  // 种族、派系与法术派系
  Beast: '野兽',
  Mech: '机械',
  Dragon: '龙',
  Elemental: '元素',
  Demon: '恶魔',
  Draenei: '德莱尼',
  Pirate: '海盗',
  Murloc: '鱼人',
  Naga: '纳迦',
  Undead: '亡灵',
  Protoss: '星灵',
  Terran: '人族',
  Zerg: '异虫',
  Arcane: '奥术',
  Frost: '冰霜',
  Shadow: '暗影',
  Fel: '邪能',
  Holy: '神圣',

  // HSGuru 常用卡牌或流派简称
  AYAYA: '艾雅',
  Ace: '王牌',
  Chef: '主厨',
  Companion: '伙伴',
  Contraband: '私藏',
  CtA: '战斗号角',
  Deios: '戴欧斯',
  Discolock: '弃牌术',
  Deckless: '轮盘',
  Evenlock: '偶数术',
  Harold: '兆示',
  Igneous: '火成',
  Lynessa: '莱妮莎',
  Leyline: '魔网',
  Linecracker: '阵线破坏者',
  Manastorm: '牢斯',
  Mug: '法术',
  Seedlock: '任务术',
  Soothsayer: '预言师',
  Imbue: '灌注',
  Tog: '托瓦格尔',
  Vanessa: '梵妮莎',
  Zee: '随从',
  "Alara'shi": '阿莱纳希',
  Animancer: '大哥',
  Shredslock: '撕裂术',
  Tripwire: '绊索',
  Rafaam: '拉法姆',
  Rafaamlock: '拉法姆术',
  Malygos: '玛里苟斯',
  Merithra: '麦琳瑟拉',
  Shudderwock: '沙德沃克',
  Odyn: '奥丁',
  Aviana: '艾维娜',
  Ysera: '伊瑟拉',
  Zarimi: '扎里米',
  Dorian: '多里安',
  Quasar: '类星体',
  Asteroid: '行星',
  Nebula: '星云',
  Alex: '红龙',
  Ashtoungue: '灰舌',
  Broxigar: '布洛克斯加',
  Gnoll: '豺狼人',
  "Il'gynoth": '伊格诺斯',
  Kingsbane: '弑君',
  Leoroxx: '莱欧洛克斯',
  "Lo'Gosh": '洛戈什',
  "Mecha'thun": '机械克苏恩',
  "Ohn'ahra": '欧恩哈拉',
  Rivendare: '瑞文戴尔',
  Shudder: '沙德',
  "Sul'thraze": '苏萨斯',
  Switcheroo: '体型互换',
  Velarok: '威拉罗克',
};

const classSuffixes: ReadonlyArray<readonly [string, string]> = [
  ['Demon Hunter', '瞎'],
  ['Death Knight', 'DK'],
  ['Warlock', '术'],
  ['Druid', '德'],
  ['Priest', '牧'],
  ['Rogue', '贼'],
  ['Mage', '法'],
  ['Hunter', '猎'],
  ['Paladin', '骑'],
  ['Shaman', '萨'],
  ['Warrior', '战'],
  ['DH', '瞎'],
  ['DK', 'DK'],
];

const formatSuffixes: ReadonlyArray<readonly [string, string]> = [
  ['Standard', '标准模式'],
  ['Wild', '狂野模式'],
  ['Brawl', '乱斗模式'],
];

function translateRuneToken(token: string): string | undefined {
  if (!/^[BFU]{1,4}$/.test(token)) return undefined;
  const runes: Readonly<Record<string, string>> = {
    B: '血',
    F: '冰',
    U: '邪',
  };
  return [...token].map((rune) => runes[rune]).join('');
}

/** 将 HSGuru 的组合式英文卡组名转换为常用中文简称。 */
export function translateDeckName(source: string): string {
  let remaining = source.trim().replace(/\s+/g, ' ');
  if (!remaining) return source;

  let classSuffix = '';
  let formatSuffix = '';
  let hasTranslation = false;
  for (const [english, chinese] of formatSuffixes) {
    if (remaining.endsWith(` ${english}`)) {
      remaining = remaining.slice(0, -english.length).trim();
      formatSuffix = ` ${chinese}`;
      break;
    }
  }

  for (const [english, chinese] of classSuffixes) {
    if (remaining === english || remaining.endsWith(` ${english}`)) {
      remaining = remaining.slice(0, -english.length).trim();
      classSuffix = chinese;
      hasTranslation = true;
      break;
    }
  }

  for (const [english, chinese] of phraseTranslations) {
    if (
      remaining === english ||
      remaining.startsWith(`${english} `) ||
      remaining.endsWith(` ${english}`) ||
      remaining.includes(` ${english} `)
    ) {
      remaining = remaining.replace(english, chinese);
      hasTranslation = true;
    }
  }

  const translatedCore = remaining
    .split(' ')
    .map((word) => {
      const translated = wordTranslations[word] ?? translateRuneToken(word);
      if (translated) hasTranslation = true;
      return translated ?? word;
    })
    .join('');

  if (!hasTranslation) return source;
  const translated = `${translatedCore}${classSuffix}${formatSuffix}`;
  return translated && translated !== source.trim() ? translated : source;
}
