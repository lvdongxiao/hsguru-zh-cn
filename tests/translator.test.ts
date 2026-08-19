import assert from 'node:assert/strict';
import test from 'node:test';
import { dictionary as siteDictionary } from '../src/i18n/dictionary';
import {
  translateCardDetailTextByHref,
  translateCardKeywords,
  translateCardTextByHref,
  translateCountryOption,
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

test('translates the select-all dropdown option', () => {
  assert.equal(translateText('Select All', siteDictionary), '全选');
});

test('translates player-scope dropdown options', () => {
  assert.equal(translateText('All Players', siteDictionary), '所有玩家');
  assert.equal(translateText('My Games', siteDictionary), '我的对局');
});

test('translates the signed-out player stats page', () => {
  assert.equal(
    translateText('You need to log in to view this page', siteDictionary),
    '你需要登录才能查看此页面',
  );
  assert.equal(translateText('Log in', siteDictionary), '登录');
});

test('translates every desktop navigation dropdown item', () => {
  const expected: Readonly<Record<string, string>> = {
    'Player Profile': '玩家资料',
    'Deck Sheets': '套牌表',
    'My Matchups': '我的对局',
    'My Decks': '我的套牌',
    'My Replays': '我的对局回放',
    'My Groups': '我的群组',
    Collection: '我的收藏',
    Settings: '设置',
    Logout: '退出登录',
    'Player Stats': '玩家数据',
    'HSEsports Points': '炉石电竞积分',
    Europe: '欧洲',
    Americas: '美洲',
    'Asia-Pacific': '亚太',
    China: '中国',
    Standard: '标准模式',
    Wild: '狂野模式',
    Brawl: '乱斗模式',
    Deckviewer: '套牌查看器',
    Deckbuilder: '套牌构筑器',
    Cards: '卡牌',
    'Legacy HSEsports': '往期炉石电竞',
    Replays: '对局回放',
    '3rd Party Tournaments': '第三方赛事',
    'Battlefy Multi Tournament Stats': 'Battlefy 多赛事数据',
    'Streaming Now': '正在直播',
    Fantasy: '梦幻联赛',
    'Batch Lineup Importer': '批量阵容导入',
    'Chat Bot Hooks': '聊天机器人接口',
    'Discord Bot': 'Discord 机器人',
    'HDT Plugin': 'HDT 插件',
    About: '关于',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates signed-in user pages', () => {
  const expected: Readonly<Record<string, string>> = {
    Leaderboard: '排行榜',
    'Leaderboard Region': '排行榜赛区',
    Battlegrounds: '酒馆战棋',
    'Battlegrounds Duos': '酒馆战棋双打',
    Mercenaries: '佣兵战纪',
    'Legacy Arena': '传统竞技场',
    'Underground Arena': '地下竞技场',
    Competitions: '赛事',
    Competition: '赛事',
    Qualifiers: '资格赛',
    MTs: '大师巡回赛',
    Place: '名次',
    Score: '积分',
    Submit: '提交',
    New: '新建',
    Delete: '删除',
    Owner: '所有者',
    Group: '群组',
    Actions: '操作',
    'Player: Deck Archetype': '玩家：套牌类型',
    'Deck Archetype': '套牌类型',
    'Opponent: Class': '对手：职业',
    'Percentage %': '百分比 %',
    'Preparing stats...': '正在准备数据…',
    Share: '分享',
    Use: '使用',
    'Powered By': '数据来源：',
    'Share your public decks': '分享你的公开套牌',
    'Share your public replays': '分享你的公开对局回放',
    'All Formats': '全部模式',
    Restoration: '艾泽拉斯复兴',
    Timeways: '穿越时间流',
    'Day of Rebirth': '重生之日',
    'Emerald Dream': '漫游翡翠梦境',
    Starcraft: '星际争霸',
    'Great Dark Beyond': '深暗领域',
    'Year of the Wolf': '狼年',
    'Year of the Pegasus': '天马年',
    'Lost City': '安戈洛龟途',
    Embers: '世界之树的余烬',
    'Bronze-Platinum': '青铜至白金',
    Unknown: '未知',
    'Order By': '排序方式',
    'Opponent Archetype': '对手套牌类型',
    'Opponent Archetypes': '对手套牌类型',
    'As Class': '按玩家职业',
    'Vs Class': '按对手职业',
    'Exclude Bugged Deck Tracker Versions': '排除异常的套牌追踪器版本',
    'No decks available for these filters. Maybe try changing one of the highlighted ones?':
      '当前筛选条件下没有可用套牌，请尝试调整高亮的筛选项。',
    'Any Opponent': '任意对手',
    'In Mulligan': '起手出现',
    'Not In Mulligan': '起手未出现',
    Drawn: '已抽到',
    'Not Drawn': '未抽到',
    Kept: '已留下',
    'Not Kept': '未留下',
    'Class Stats': '职业数据',
    'Win-Loss': '胜负',
    Win: '胜利',
    Loss: '失败',
    Draw: '平局',
    'Loading replays...': '正在加载对局回放…',
    'Search opponent': '搜索对手',
    'Create Group': '创建群组',
    View: '查看',
    'No Collection': '暂无收藏数据',
    'You dont have a current collection': '你当前没有收藏数据',
    'Use Firestone': '使用 Firestone',
    'to sync your collections (you need to enable it in settings under third party)':
      '同步你的收藏（需要在设置的第三方选项中启用）',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }
});

test('translates leaderboard pages and filters', () => {
  const expected: Readonly<Record<string, string>> = {
    'Leaderboard Stats': '排行榜数据',
    'HSEsports Leaderboards Points': '炉石电竞排行榜积分',
    'Ladder Leaderboard': '天梯排行榜',
    'Points Season': '积分赛季',
    'Use Current Season': '使用当前赛季',
    'Filter Countries': '筛选国家或地区',
    Country: '国家或地区',
    Regions: '赛区',
    'Show Country Flags': '显示国家旗帜',
    'Show country flags': '显示国家旗帜',
    'Hide country flags': '隐藏国家旗帜',
    'Include Unknown': '包含未知赛区',
    "Don't Include Unknown": '不包含未知赛区',
    Player: '玩家',
    Best: '最佳排名',
    'Average Finish': '平均完赛名次',
    'Total Finishes': '完赛总次数',
    Position: '排名',
    Battletag: '战网昵称',
    history: '历史记录',
    'Updated at': '更新时间',
    'BGs LL/Monthly': '酒馆战棋排行榜/月度数据',
    January: '一月',
    August: '八月',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(
    translateText('Min 5 Finishes', siteDictionary),
    '至少完赛 5 次',
  );
  assert.equal(translateText('Top 200↑', siteDictionary), '前 200 名↑');
  assert.equal(
    translateText('Total Players: 7,377', siteDictionary),
    '玩家总数：7,377',
  );
  assert.equal(translateText('2026 Standard', siteDictionary), '2026 标准模式');
  assert.equal(
    translateText('2026 Announcement', siteDictionary),
    '2026 年公告',
  );
  assert.equal(translateText('2025 Spring', siteDictionary), '2025 年春季');
  assert.equal(
    translateText('China 2026 Summer', siteDictionary),
    '中国 2026 年夏季',
  );
  assert.equal(
    translateText('2025 Last Chance', siteDictionary),
    '2025 年最终资格赛',
  );
});

test('translates profile settings and ISO country options', () => {
  const expected: Readonly<Record<string, string>> = {
    'Profile & Settings': '个人资料与设置',
    'Country & Icon': '国家与图标',
    'Country Flag': '国家旗帜',
    'Select Country': '选择国家或地区',
    'Cross Out Country': '划掉国家旗帜',
    'Show Region Instead of Country': '显示赛区而非国家',
    'Player Icon': '玩家图标',
    'None/Custom': '无/自定义',
    'For custom icons see patreon': '自定义图标请参阅 Patreon',
    'For custom icons see': '自定义图标请参阅',
    'Decklist Colors': '套牌列表颜色',
    'Border Color': '边框颜色',
    'Card Class': '卡牌职业',
    'Deck Class': '套牌职业',
    Rarity: '稀有度',
    'Dark Grey': '深灰色',
    'Deck Format': '套牌模式',
    'Gradient Color': '渐变颜色',
    'Decklist Options': '套牌列表选项',
    'Preferred Deckcode When Copying': '复制时首选的套牌代码格式',
    'Short Deckcode': '短套牌代码',
    'Short Deckcode With Name': '带名称的短套牌代码',
    'Long Deckcode': '长套牌代码',
    'Long Deckcode using ###': '使用 ### 的长套牌代码',
    'Long Deckcode (Invalid - Markdown Code)':
      '长套牌代码（无效的 Markdown 代码）',
    'Show 1 for singleton cards': '单张卡牌显示数量 1',
    'Show 1 for singleton legendaries': '单张传说卡牌显示数量 1',
    'Show dust+action bar above cards': '在卡牌上方显示奥术之尘与操作栏',
    'Show dust+action bar below cards': '在卡牌下方显示奥术之尘与操作栏',
    'Use missing dust instead of total': '显示缺少的奥术之尘而非总量',
    'Fade missing cards in decks': '淡化套牌中缺少的卡牌',
    'Fade rotating cards in decks': '淡化套牌中即将退环境的卡牌',
    'Default Sheet': '默认套牌表',
    'Default Source': '默认来源',
    'Winrate/Impact Colors': '胜率/影响值颜色',
    'Positive Color': '正值颜色',
    'Negative Color': '负值颜色',
    'Use Custom Hues': '使用自定义色相',
    'Twitch Integration': 'Twitch 集成',
    'Stream tracks automatically when connected.': '连接后自动追踪直播。',
    'Connect Twitch': '连接 Twitch',
    'Patreon Integration': 'Patreon 集成',
    'Link your account to unlock perks.': '关联账号以解锁权益。',
    'Connect Patreon': '连接 Patreon',
    'Misc Settings': '其他设置',
    'Current Collection': '当前收藏',
    'Which replays do you want to be public? (Only affects new replays)':
      '哪些对局回放可以公开？（仅影响新回放）',
    Streamed: '已直播',
    "Battlefy Slug (Open your profile, paste the URL, and I'll grab it)":
      'Battlefy 标识（打开你的个人资料，粘贴网址即可自动提取）',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(
    translateCountryOption('United States of America', 'US'),
    '美国',
  );
  assert.equal(translateCountryOption('  Japan\n', 'JP'), '  日本\n');
  assert.equal(
    translateCountryOption('Unknown country', 'invalid'),
    'Unknown country',
  );
  assert.equal(
    translateText('Connections (0/2)', siteDictionary),
    '连接（0/2）',
  );
  assert.equal(
    translateText('Tier: Gold | Ad Free: Yes', siteDictionary),
    '等级：Gold | 无广告：Yes',
  );
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
    'Aggregated Data': '聚合数据',
    'Fresh Data': '最新数据',
    'To contribute use': '贡献数据请使用',
    'or the': '或',
    Chart: '图表',
    "Opponent's Class": '对手职业',
    'Min Games': '最少对局数',
    'Coin?': '先后手',
    Archetype: '套牌类型',
    Winrate: '胜率',
    Popularity: '热度',
    Turns: '回合数',
    Duration: '时长',
    'Climbing Speed': '上分速度',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(translateText('Chart ↓', siteDictionary), '图表 ↓');
  assert.equal(translateText('Chart ↑', siteDictionary), '图表 ↑');
  assert.equal(translateText('Winrate↓', siteDictionary), '胜率↓');
  assert.equal(translateText('Winrate↑', siteDictionary), '胜率↑');
  assert.equal(translateText('Popularity↓', siteDictionary), '热度↓');
  assert.equal(translateText('Turns↑', siteDictionary), '回合数↑');
  assert.equal(translateText('Duration↓', siteDictionary), '时长↓');
  assert.equal(translateText('Climbing Speed ↑', siteDictionary), '上分速度 ↑');
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

test('translates archetype detail page headings and tabs', () => {
  assert.equal(
    translateText('Zee Shaman Standard stats', siteDictionary),
    '随从萨（标准模式）数据',
  );
  assert.equal(translateText('Replays Stats', siteDictionary), '对局回放数据');
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
    'Mulligan Impact': '起手影响',
    'Drawn Impact': '抽到影响',
    'Not Drawn Impact': '未抽到影响',
    'Kept Impact': '留牌影响',
    'New!': '新功能！',
  };

  for (const [english, chinese] of Object.entries(expected)) {
    assert.equal(translateText(english, siteDictionary), chinese);
  }

  assert.equal(translateText('Mulligan Impact↓', siteDictionary), '起手影响↓');
  assert.equal(translateText('Mulligan Impact↑', siteDictionary), '起手影响↑');
  assert.equal(translateText('Drawn Impact↓', siteDictionary), '抽到影响↓');
  assert.equal(
    translateText('Not Drawn Impact↑', siteDictionary),
    '未抽到影响↑',
  );
  assert.equal(translateText('Kept Impact ↓', siteDictionary), '留牌影响 ↓');

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
