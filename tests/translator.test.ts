import assert from 'node:assert/strict';
import test from 'node:test';
import { dictionary as siteDictionary } from '../src/i18n/dictionary';
import {
  translateCardDetailTextByHref,
  translateCardKeywords,
  translateCardTextByHref,
  translateText,
} from '../src/i18n/translator';

const dictionary = {
  Home: '首页',
  Loading: '加载中',
  'Death Knight': '死亡骑士',
};

test('translates an exact dictionary entry', () => {
  assert.equal(translateText('Home', dictionary), '首页');
});

test('translates the homepage input placeholder', () => {
  assert.equal(translateText('Type or paste', siteDictionary), '输入或粘贴');
});

test('preserves surrounding whitespace', () => {
  assert.equal(translateText('  Loading\n', dictionary), '  加载中\n');
});

test('leaves unknown and partial text unchanged', () => {
  assert.equal(translateText('Homepage', dictionary), 'Homepage');
  assert.equal(translateText('Open Home', dictionary), 'Open Home');
});

test('translates attached card names from their dbf ids', () => {
  const namesByDbfId = {
    '119705': '游侠队长奥蕾莉亚',
    '119706': '游侠新兵温蕾萨',
  };

  assert.equal(
    translateCardTextByHref(
      '  Ranger Captain Alleria\n',
      '/card/119705',
      namesByDbfId,
    ),
    '  游侠队长奥蕾莉亚\n',
  );
  assert.equal(
    translateCardTextByHref(
      'Ranger Initiate Vereesa',
      'https://www.hsguru.com/card/119706?foo=bar',
      namesByDbfId,
    ),
    '游侠新兵温蕾萨',
  );
  assert.equal(
    translateCardTextByHref('  \n', '/card/119705', namesByDbfId),
    '  \n',
  );
});

test('translates card detail names and text from their dbf ids', () => {
  const namesByDbfId = { '110446': '奇利亚斯豪华版3000型' };
  const textsByDbfId = {
    '110446': '来自 JSON 的中文卡牌文本',
  };
  const flavorsByDbfId = {
    '119707': '来自 JSON 的中文趣味描述',
  };

  assert.equal(
    translateCardDetailTextByHref(
      'Zilliax Deluxe 3000',
      '/card/110446',
      'name',
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
    ),
    '奇利亚斯豪华版3000型',
  );
  assert.equal(
    translateCardDetailTextByHref(
      'English card text',
      '/card/110446',
      'text',
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
    ),
    '来自 JSON 的中文卡牌文本',
  );
  assert.equal(
    translateCardDetailTextByHref(
      'English flavor text',
      '/card/119707',
      'flavor',
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
    ),
    '来自 JSON 的中文趣味描述',
  );
  assert.equal(
    translateCardDetailTextByHref(
      'English card text without JSON data',
      '/card/999999',
      'text',
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
    ),
    'English card text without JSON data',
  );
  assert.equal(
    translateCardDetailTextByHref(
      'English flavor text without JSON data',
      '/card/999999',
      'flavor',
      namesByDbfId,
      textsByDbfId,
      flavorsByDbfId,
    ),
    'English flavor text without JSON data',
  );
});

test('translates comma-separated card keywords', () => {
  const keywordDictionary = {
    Battlecry: '战吼',
    Fabled: '奇闻',
  };
  assert.equal(
    translateCardKeywords('Battlecry, Fabled', keywordDictionary),
    '战吼、奇闻',
  );
  assert.equal(
    translateCardKeywords('Battlecry, Unknown', keywordDictionary),
    'Battlecry, Unknown',
  );
});

test('translates dynamic filter labels', () => {
  assert.equal(translateText('Show 50', dictionary), '显示 50 条');
  assert.equal(translateText('Min 200', dictionary), '至少 200 局');
  assert.equal(translateText('Top 1k', dictionary), '前 1,000 名');
  assert.equal(translateText('Past 6 Hours', dictionary), '过去 6 小时');
  assert.equal(translateText('Past 2 Weeks', dictionary), '过去 2 周');
  assert.equal(translateText('Past 30 days', dictionary), '过去 30 天');
  assert.equal(translateText('VS Death Knight', dictionary), '对阵死亡骑士');
});

test('translates dynamic stream metadata', () => {
  assert.equal(translateText('# Streamed: 4', dictionary), '直播次数：4');
  assert.equal(
    translateText('First Streamed: foo', dictionary),
    '首次直播：foo',
  );
});

test('translates meta page update timestamps', () => {
  assert.equal(translateText('5 minutes ago', dictionary), '5 分钟前');
  assert.equal(translateText('1 hour ago', dictionary), '1 小时前');
  assert.equal(translateText('7 hours ago', dictionary), '7 小时前');
});

test('translates the Standard, Wild, and Brawl meta page controls', () => {
  const expected: Readonly<Record<string, string>> = {
    Meta: '环境',
    'Stats Explanation': '数据说明',
    'To contribute use': '贡献数据请使用',
    'or the': '或',
    'Chart ↓': '图表 ↓',
    'Chart ↑': '图表 ↑',
    "Opponent's Class": '对手职业',
    'Min Games': '最少对局数',
    'Coin?': '先后手',
    Archetype: '套牌类型',
    'Winrate↓': '胜率↓',
    Popularity: '热度',
    Turns: '回合数',
    Duration: '时长',
    'Climbing Speed': '上分速度',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates matchup matrix controls and explanations', () => {
  const expected: Readonly<Record<string, string>> = {
    Matchups: '对局优劣',
    'Post patch archetyping will be updated a couple days post patch':
      '补丁更新后，套牌分类将在数日内更新',
    'Min Matchup Games': '最少对局样本数',
    'Min Archetype Games': '最少套牌类型对局数',
    'Seed Weights': '按热度填充权重',
    'Reset Weights': '重置权重',
    'Popularity:': '热度：',
    favorite: '收藏',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates streamer deck filters and table headings', () => {
  const expected: Readonly<Record<string, string>> = {
    'Streamer Decks': '主播套牌',
    'Instructions for streamers': '主播使用说明',
    'Page Size': '每页数量',
    Peak: '最高排名',
    Classic: '经典模式',
    Twist: '幻变模式',
    'Violed Hold Cards': '紫罗兰监狱卡牌',
    'Includes VH Cards': '包含紫罗兰监狱卡牌',
    'Any decks': '任意套牌',
    'Last Played': '最近使用',
    'Include Cards': '包含卡牌',
    'Exclude Cards': '排除卡牌',
    'Search Streamer': '搜索主播',
    Deck: '套牌',
    Streamer: '主播',
    Latest: '最新',
    Worst: '最低排名',
    'Win - Loss': '胜 - 负',
    Links: '链接',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(translateText('Last hour', siteDictionary), '最近 1 小时');
  assert.equal(translateText('Last day', siteDictionary), '最近 1 天');
  assert.equal(translateText('Last 30 days', siteDictionary), '最近 30 天');
});

test('translates deck builder headings, controls, and card counts', () => {
  const expected: Readonly<Record<string, string>> = {
    'Hearthstone DeckBuilder': '炉石传说套牌构筑器',
    'Additional Classes': '额外职业',
    'Show cards in deck': '显示套牌中的卡牌',
    'Hide cards in deck': '隐藏套牌中的卡牌',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(
    translateText('Demon Hunter 0/30', siteDictionary),
    '恶魔猎手 0/30',
  );
  assert.equal(
    translateText('Demon Hunter 1/30 - DeckBuilder', siteDictionary),
    '恶魔猎手 1/30 - 套牌构筑器',
  );
  assert.equal(
    translateText('1 out of 2', siteDictionary),
    '已选 1 张，最多 2 张',
  );
});

test('translates the deck builder start page', () => {
  assert.equal(
    translateText('Paste deckcode or link', siteDictionary),
    '粘贴套牌代码或链接',
  );
  assert.equal(
    translateText('DK - Wild', siteDictionary),
    '死亡骑士 - 狂野模式',
  );
  assert.equal(
    translateText('DH - Standard', siteDictionary),
    '恶魔猎手 - 标准模式',
  );
  assert.equal(
    translateText('Druid - Standard', siteDictionary),
    '德鲁伊 - 标准模式',
  );
  assert.equal(
    translateText('Warrior - Wild', siteDictionary),
    '战士 - 狂野模式',
  );
});

test('translates deck viewer controls', () => {
  const expected: Readonly<Record<string, string>> = {
    Add: '添加',
    'Copy Deck': '复制套牌',
    'Copy Deck Code': '复制套牌代码',
    'Copy to clipboard': '复制到剪贴板',
    'Copied!': '已复制！',
    'Copy Link': '复制链接',
    'Show Rotation': '显示轮换',
    'Stop Comparing': '停止比较',
    'Class Sort': '按职业排序',
    Clear: '清除',
    Remove: '移除',
    'Compare to': '对比',
    'Compare Decks': '比较套牌',
    Rotation: '轮换',
    'Copy deck code': '复制套牌代码',
    'Deck code copied!': '套牌代码已复制！',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates deck detail page controls and statistics', () => {
  const expected: Readonly<Record<string, string>> = {
    Edit: '编辑',
    'Stats Explanation': '数据说明',
    'Card Stats (Mulligan)': '卡牌数据（起手留牌）',
    'Archetype Stats': '套牌类型数据',
    'Archetype Replays': '套牌类型对局回放',
    'Coin?': '先后手',
    'Any Player': '任意先后手',
    'Going First': '先手',
    'On Coin': '后手',
    Total: '总计',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates card detail page links, fields, and values', () => {
  const expected: Readonly<Record<string, string>> = {
    Wiki: '维基',
    'Official Site': '官方网站',
    'Find Decks': '查找包含此卡的套牌',
    'Find Streamer Decks': '查找包含此卡的主播套牌',
    Name: '名称',
    Nicknames: '别名',
    'Mana Cost': '法力值消耗',
    'Minion Types': '随从类型',
    'Dust Cost': '奥术之尘消耗',
    'Flavor Text': '趣味描述',
    Collectible: '可收藏',
    'Artist Name': '画师',
    'Image Link': '卡图链接',
    False: '否',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates deck card stats headings, filters, and columns', () => {
  const expected: Readonly<Record<string, string>> = {
    'Deck Stats': '套牌数据',
    'Archetype Card Stats': '套牌类型卡牌数据',
    'Min Mull Count': '最少起手样本数',
    'Min Drawn Count': '最少抽到样本数',
    'Counts Alongside Impact': '影响值旁显示样本数',
    'Show Counts': '显示样本数',
    "Don't Show Counts": '不显示样本数',
    'Weighted Colors': '加权配色',
    'Positive/Negative Colors': '正负值配色',
    Opponent: '对手',
    Card: '卡牌',
    'Mulligan Impact↓': '起手影响↓',
    'Drawn Impact': '抽到影响',
    'Not Drawn Impact': '未抽到影响',
    'Kept Impact': '留牌影响',
    'New!': '新功能！',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(
    translateText('Two-Bit Rogue Deck Card Stats (Standard)', siteDictionary),
    '二费贼套牌卡牌数据（标准模式）',
  );
  assert.equal(
    translateText('Two-Bit Rogue Archetype Card Stats (Wild)', siteDictionary),
    '二费贼套牌类型卡牌数据（狂野模式）',
  );
  assert.equal(translateText('Games: 394', siteDictionary), '对局数：394');
});
