const phraseTranslations: ReadonlyArray<readonly [string, string]> = [
  ['End of Turnadin', '回合结束骑'],
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
  ['Jade Lotus', '青玉莲'],
  ['Grimy Goons', '污手党'],
  ['No Hand', '空手'],
  ['Rat Trap', '捕鼠'],
  ['Sea Shanty', '海上船歌'],
  ['Small Spell', '小法术'],
  ['Spell Damage', '法强'],
  ['Star Grazer', '吞星兽'],
  ['6 7', '六七费'],
];

const wordTranslations: Readonly<Record<string, string>> = {
  // 玩法与机制
  Face: '打脸',
  Attack: '攻击',
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
  Unholy: '邪',
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
  Void: '虚空',
  Prepared: '预备',
  Archmage: '大法师',
  Cycle: '过牌',
  Dino: '恐龙',
  Dude: '报告',
  Enrage: '激怒',
  Gladiator: '角斗',
  Masochist: '受虐',
  Patron: '奴隶',
  Peddler: '精魂',
  Rotten: '烂苹果',
  Sanctum: '圣地',
  Securitybot: '安保机器人',
  Stego: '剑龙',
  'Bot?': '机器人？',
  'J-Lock': '大王控制术',
  'Loh-cky': '洛奇',
  Painlock: '自残术',
  Tauntlock: '嘲讽术',
  Astral: '星界',
  AtT: '穿越时间流',
  Basher: '怒袭甲龙',
  Blaze: '毁灭之焰',
  Boar: '野猪',
  Burnlock: '直伤术',
  Buttons: '扣子',
  Chad: '大哥',
  Colifero: '可丽菲罗',
  Concierge: '礼宾',
  Curselock: '诅咒术',
  DMH: '亡者之牌',
  Drilling: '发掘',
  Dungar: '杜加尔',
  Evolve: '异变',
  Floppy: '软软多头蛇',
  Gaia: '盖亚',
  Garrote: '锁喉',
  Gauntlet: '源生护手',
  Giants: '巨人',
  Hooktusk: '钩牙',
  Hydration: '补水',
  Insanity: '疲劳',
  Jade: '青玉',
  Kabal: '暗金教',
  LPG: '口袋银河',
  "Mecha'Chad": '机械大哥',
  Mine: '水雷',
  Miner: '矿工',
  "Mug'Zee": '穆格·兹伊',
  Murmur: '摩摩尔',
  Nazmani: '纳兹曼尼',
  Ogre: '食人魔',
  Old: '旧版',
  Other: '其他',
  Overheal: '过疗',
  Quilboar: '野猪人',
  Relic: '圣物',
  Rez: '复活',
  Shark: '鲨鱼',
  Sif: '西芙',
  Sludge: '淤泥',
  Swiftscale: '迅鳞',
  Tentacle: '触须',
  Therazane: '塞拉赞恩',
  Toglock: '托瓦格尔术',
  Totem: '图腾',
  Well: '许愿井',

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
  Egglock: '蛋术',
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
  "Thal'ena": '萨安娜',
  Bwonsamdi: '邦桑迪',
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
  Garona: '迦罗娜',
  Azshara: '艾萨拉',
  Barnes: '巴内斯',
  Godfrey: '高弗雷',
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
  Toki: '托奇',
  Moragg: '摩拉格',
  Velarok: '威拉罗克',
  Ashamane: '阿莎曼',
  Briarspawn: '棘嗣幼龙',
  Bwomsamdi: '邦桑迪',
  Divergence: '裂解',
  Elise: '伊莉斯',
  Finja: '芬杰',
  Fyrakk: '火龙',
  Herenn: '赫雷恩',
  Krona: '克洛纳',
  Magmaw: '熔喉',
  Maiev: '玛维',
  Medivh: '麦迪文',
  Murozond: '姆诺兹多',
  Raza: '拉兹',
  Toru: '托鲁',
  Tyrande: '泰兰德',
  Vyranoth: '威拉诺兹',
  Wallow: '瓦洛',
  Wilted: '枯萎',
  Wo: '沃',
  Ysondre: '伊森德雷',
  Zuramat: '祖拉玛特',
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
