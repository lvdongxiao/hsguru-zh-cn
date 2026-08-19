// ==UserScript==
// @name         HSGuru 中文助手
// @namespace    https://github.com/lvdongxiao/hsguru-zh-cn
// @version      1.0.5
// @description  为 HSGuru 网站提供简体中文界面
// @author       lvdongxiao
// @homepageURL  https://github.com/lvdongxiao/hsguru-zh-cn
// @supportURL   https://github.com/lvdongxiao/hsguru-zh-cn/issues
// @match        https://www.hsguru.com/*
// @match        https://hsguru.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hsguru.com
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      api.hearthstonejson.com
// @run-at       document-start
// @downloadURL  https://github.com/lvdongxiao/hsguru-zh-cn/releases/latest/download/hsguru-zh-cn.user.js
// @updateURL    https://github.com/lvdongxiao/hsguru-zh-cn/releases/latest/download/hsguru-zh-cn.user.js
// @license      MIT
// ==/UserScript==

"use strict";
(() => {
  // src/card-images.ts
  var renderBaseUrl = "https://art.hearthstonejson.com/v1/render/latest/zhCN/512x";
  var originalSourceAttribute = "data-hsguru-zh-original-card-src";
  var localizedSourceAttribute = "data-hsguru-zh-localized-card-src";
  var originalBackgroundAttribute = "data-hsguru-zh-original-card-background-image";
  var localizedBackgroundAttribute = "data-hsguru-zh-localized-card-background-image";
  function getChineseCardRenderUrl(renderId) {
    return `${renderBaseUrl}/${encodeURIComponent(renderId)}.png`;
  }
  function getCardDbfIdFromHref(href) {
    return href.match(/(?:^|\/)card\/(\d+)(?:[/?#]|$)/)?.[1];
  }
  function findCardImages(root) {
    const images = [];
    if (root instanceof HTMLImageElement && root.closest('[card_id], a[href*="/card/"]')) {
      images.push(root);
    }
    if (root instanceof Element || root instanceof Document) {
      images.push(
        ...root.querySelectorAll(
          '[card_id] img, a[href*="/card/"] img'
        )
      );
    }
    return images;
  }
  function findHoverCardPreviews(root) {
    const previews = [];
    if (root instanceof HTMLElement && root.matches(".decklist-card-image")) {
      previews.push(root);
    }
    if (root instanceof Element || root instanceof Document) {
      previews.push(
        ...root.querySelectorAll(".decklist-card-image")
      );
    }
    return previews;
  }
  function localizeCardImages(root, renderIdsByDbfId) {
    for (const image of findCardImages(root)) {
      const cardId = image.closest("[card_id]")?.getAttribute("card_id");
      const cardHref = image.closest('a[href*="/card/"]')?.getAttribute("href");
      const dbfId = cardId ?? (cardHref ? getCardDbfIdFromHref(cardHref) : null);
      const renderId = dbfId ? renderIdsByDbfId[dbfId] : void 0;
      if (!renderId) continue;
      const localizedSource = getChineseCardRenderUrl(renderId);
      const currentSource = image.getAttribute("src") ?? "";
      const previousLocalizedSource = image.getAttribute(
        localizedSourceAttribute
      );
      if (currentSource !== localizedSource) {
        if (currentSource !== previousLocalizedSource) {
          image.setAttribute(originalSourceAttribute, currentSource);
        }
        image.setAttribute(localizedSourceAttribute, localizedSource);
        image.setAttribute("src", localizedSource);
      }
    }
    for (const preview of findHoverCardPreviews(root)) {
      const cardHref = preview.closest('a[href*="/card/"]')?.getAttribute("href");
      const dbfId = cardHref ? getCardDbfIdFromHref(cardHref) : void 0;
      const renderId = dbfId ? renderIdsByDbfId[dbfId] : void 0;
      if (!renderId) continue;
      const localizedBackground = `url("${getChineseCardRenderUrl(renderId)}")`;
      const currentBackground = preview.style.backgroundImage;
      const previousLocalizedBackground = preview.getAttribute(
        localizedBackgroundAttribute
      );
      if (currentBackground !== localizedBackground) {
        if (currentBackground !== previousLocalizedBackground) {
          preview.setAttribute(originalBackgroundAttribute, currentBackground);
        }
        preview.setAttribute(localizedBackgroundAttribute, localizedBackground);
        preview.style.backgroundImage = localizedBackground;
      }
    }
  }
  function restoreCardImages(root) {
    for (const image of findCardImages(root)) {
      const originalSource = image.getAttribute(originalSourceAttribute);
      if (originalSource === null) continue;
      image.setAttribute("src", originalSource);
      image.removeAttribute(originalSourceAttribute);
      image.removeAttribute(localizedSourceAttribute);
    }
    for (const preview of findHoverCardPreviews(root)) {
      const originalBackground = preview.getAttribute(
        originalBackgroundAttribute
      );
      if (originalBackground === null) continue;
      preview.style.backgroundImage = originalBackground;
      preview.removeAttribute(originalBackgroundAttribute);
      preview.removeAttribute(localizedBackgroundAttribute);
    }
  }

  // src/i18n/deck-names.ts
  var phraseTranslations = [
    ["End of Turnadin", "回合结束骑"],
    ["Splendiferous Whizbang", "威兹班"],
    ["Astral Communion", "星界"],
    ["Rock 'n' Roll", "黑石摇滚"],
    ["'n' Roll", "黑石摇滚"],
    ["Divine Spirit", "心火"],
    ["Heal Burn", "治疗直伤"],
    ["Holy Wrath", "元气"],
    ["No Minion", "法术"],
    ["Cliff Dive", "跳水"],
    ["Dark Gift", "黑暗之赐"],
    ["Void Soul", "虚空灵魂"],
    ["Two-Bit", "二费"],
    ["Tick Tock", "新任务"],
    ["Huddle Up", "抱团"],
    ["Alternate Reality", "平行现实"],
    ["Jade Lotus", "青玉莲"],
    ["Grimy Goons", "污手党"],
    ["No Hand", "空手"],
    ["Rat Trap", "捕鼠"],
    ["Sea Shanty", "海上船歌"],
    ["Small Spell", "小法术"],
    ["Spell Damage", "法强"],
    ["Star Grazer", "吞星兽"],
    ["6 7", "六七费"]
  ];
  var wordTranslations = {
    // 玩法与机制
    Face: "打脸",
    Attack: "攻击",
    Aggro: "快攻",
    Alignment: "超凡",
    Amalgam: "融合怪",
    Control: "控制",
    Midrange: "中速",
    Combo: "组合技",
    Quest: "任务",
    Questline: "任务",
    Exodia: "艾克佐迪亚",
    Highlander: "宇宙",
    Handbuff: "污手",
    Deathrattle: "亡语",
    Secret: "奥秘",
    Libram: "圣契",
    Miracle: "奇迹",
    Mill: "爆牌",
    Token: "超生",
    Burn: "打脸",
    Big: "大哥",
    Pain: "自伤",
    Pure: "光铸",
    Overload: "过载",
    Weapon: "武器",
    Spell: "法术",
    Location: "地标",
    Discover: "发现",
    Outcast: "流放",
    Starship: "星舰",
    Rainbow: "彩虹",
    Zoo: "动物园",
    Egg: "蛋",
    Thief: "脏",
    Fatigue: "疲劳",
    Armor: "叠甲",
    Menagerie: "混合流",
    Odd: "奇数",
    Even: "偶数",
    HL: "宇宙",
    STD: "标准",
    LC: "安戈洛",
    Blood: "血",
    Unholy: "邪",
    Plague: "瘟疫",
    Clone: "复制",
    Aura: "光环",
    Auctioneer: "加基森",
    Automaton: "自动机",
    Boarlock: "野猪术",
    Champions: "勇士",
    Cute: "可爱",
    Freeze: "冰霜",
    Heal: "治疗",
    Hostage: "人质",
    Infinity: "无限",
    JtU: "安戈洛",
    Kingslayer: "弑君",
    SoU: "奥丹姆",
    Taunt: "嘲讽",
    Treant: "树人",
    Warsong: "战歌",
    Void: "虚空",
    Prepared: "预备",
    Archmage: "大法师",
    Cycle: "过牌",
    Dino: "恐龙",
    Dude: "报告",
    Enrage: "激怒",
    Gladiator: "角斗",
    Masochist: "受虐",
    Patron: "奴隶",
    Peddler: "精魂",
    Rotten: "烂苹果",
    Sanctum: "圣地",
    Securitybot: "安保机器人",
    Stego: "剑龙",
    "Bot?": "机器人？",
    "J-Lock": "大王控制术",
    "Loh-cky": "洛奇",
    Painlock: "自残术",
    Tauntlock: "嘲讽术",
    Astral: "星界",
    AtT: "穿越时间流",
    Basher: "怒袭甲龙",
    Blaze: "毁灭之焰",
    Boar: "野猪",
    Burnlock: "直伤术",
    Buttons: "扣子",
    Chad: "大哥",
    Colifero: "可丽菲罗",
    Concierge: "礼宾",
    Curselock: "诅咒术",
    DMH: "亡者之牌",
    Drilling: "发掘",
    Dungar: "杜加尔",
    Evolve: "异变",
    Floppy: "软软多头蛇",
    Gaia: "盖亚",
    Garrote: "锁喉",
    Gauntlet: "源生护手",
    Giants: "巨人",
    Hooktusk: "钩牙",
    Hydration: "补水",
    Insanity: "疲劳",
    Jade: "青玉",
    Kabal: "暗金教",
    LPG: "口袋银河",
    "Mecha'Chad": "机械大哥",
    Mine: "水雷",
    Miner: "矿工",
    "Mug'Zee": "穆格·兹伊",
    Murmur: "摩摩尔",
    Nazmani: "纳兹曼尼",
    Ogre: "食人魔",
    Old: "旧版",
    Other: "其他",
    Overheal: "过疗",
    Quilboar: "野猪人",
    Relic: "圣物",
    Rez: "复活",
    Shark: "鲨鱼",
    Sif: "西芙",
    Sludge: "淤泥",
    Swiftscale: "迅鳞",
    Tentacle: "触须",
    Therazane: "塞拉赞恩",
    Toglock: "托瓦格尔术",
    Totem: "图腾",
    Well: "许愿井",
    // 种族、派系与法术派系
    Beast: "野兽",
    Mech: "机械",
    Dragon: "龙",
    Elemental: "元素",
    Demon: "恶魔",
    Draenei: "德莱尼",
    Pirate: "海盗",
    Murloc: "鱼人",
    Naga: "纳迦",
    Undead: "亡灵",
    Protoss: "星灵",
    Terran: "人族",
    Zerg: "异虫",
    Arcane: "奥术",
    Frost: "冰霜",
    Shadow: "暗影",
    Fel: "邪能",
    Holy: "神圣",
    // HSGuru 常用卡牌或流派简称
    AYAYA: "艾雅",
    Ace: "王牌",
    Chef: "主厨",
    Companion: "伙伴",
    Contraband: "私藏",
    CtA: "战斗号角",
    Deios: "戴欧斯",
    Discolock: "弃牌术",
    Egglock: "蛋术",
    Deckless: "轮盘",
    Evenlock: "偶数术",
    Harold: "兆示",
    Igneous: "火成",
    Lynessa: "莱妮莎",
    Leyline: "魔网",
    Linecracker: "阵线破坏者",
    Manastorm: "牢斯",
    Mug: "法术",
    Seedlock: "任务术",
    Soothsayer: "预言师",
    Imbue: "灌注",
    Tog: "托瓦格尔",
    Vanessa: "梵妮莎",
    Zee: "随从",
    "Alara'shi": "阿莱纳希",
    Animancer: "大哥",
    Shredslock: "撕裂术",
    Tripwire: "绊索",
    Rafaam: "拉法姆",
    Rafaamlock: "拉法姆术",
    "Thal'ena": "萨安娜",
    Bwonsamdi: "邦桑迪",
    Malygos: "玛里苟斯",
    Merithra: "麦琳瑟拉",
    Shudderwock: "沙德沃克",
    Odyn: "奥丁",
    Aviana: "艾维娜",
    Ysera: "伊瑟拉",
    Zarimi: "扎里米",
    Dorian: "多里安",
    Quasar: "类星体",
    Asteroid: "行星",
    Nebula: "星云",
    Alex: "红龙",
    Ashtoungue: "灰舌",
    Broxigar: "布洛克斯加",
    Gnoll: "豺狼人",
    Garona: "迦罗娜",
    Azshara: "艾萨拉",
    Barnes: "巴内斯",
    Godfrey: "高弗雷",
    "Il'gynoth": "伊格诺斯",
    Kingsbane: "弑君",
    Leoroxx: "莱欧洛克斯",
    "Lo'Gosh": "洛戈什",
    "Mecha'thun": "机械克苏恩",
    "Ohn'ahra": "欧恩哈拉",
    Rivendare: "瑞文戴尔",
    Shudder: "沙德",
    "Sul'thraze": "苏萨斯",
    Switcheroo: "体型互换",
    Toki: "托奇",
    Moragg: "摩拉格",
    Velarok: "威拉罗克",
    Ashamane: "阿莎曼",
    Briarspawn: "棘嗣幼龙",
    Bwomsamdi: "邦桑迪",
    Divergence: "裂解",
    Elise: "伊莉斯",
    Finja: "芬杰",
    Fyrakk: "火龙",
    Herenn: "赫雷恩",
    Krona: "克洛纳",
    Magmaw: "熔喉",
    Maiev: "玛维",
    Medivh: "麦迪文",
    Murozond: "姆诺兹多",
    Raza: "拉兹",
    Toru: "托鲁",
    Tyrande: "泰兰德",
    Vyranoth: "威拉诺兹",
    Wallow: "瓦洛",
    Wilted: "枯萎",
    Wo: "沃",
    Ysondre: "伊森德雷",
    Zuramat: "祖拉玛特"
  };
  var classSuffixes = [
    ["Demon Hunter", "瞎"],
    ["Death Knight", "DK"],
    ["Warlock", "术"],
    ["Druid", "德"],
    ["Priest", "牧"],
    ["Rogue", "贼"],
    ["Mage", "法"],
    ["Hunter", "猎"],
    ["Paladin", "骑"],
    ["Shaman", "萨"],
    ["Warrior", "战"],
    ["DH", "瞎"],
    ["DK", "DK"]
  ];
  var formatSuffixes = [
    ["Standard", "标准模式"],
    ["Wild", "狂野模式"],
    ["Brawl", "乱斗模式"]
  ];
  function translateRuneToken(token) {
    if (!/^[BFU]{1,4}$/.test(token)) return void 0;
    const runes = {
      B: "血",
      F: "冰",
      U: "邪"
    };
    return [...token].map((rune) => runes[rune]).join("");
  }
  function translateDeckName(source) {
    let remaining = source.trim().replace(/\s+/g, " ");
    if (!remaining) return source;
    let classSuffix = "";
    let formatSuffix = "";
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
      if (remaining === english || remaining.startsWith(`${english} `) || remaining.endsWith(` ${english}`) || remaining.includes(` ${english} `)) {
        remaining = remaining.replace(english, chinese);
        hasTranslation = true;
      }
    }
    const translatedCore = remaining.split(" ").map((word) => {
      const translated2 = wordTranslations[word] ?? translateRuneToken(word);
      if (translated2) hasTranslation = true;
      return translated2 ?? word;
    }).join("");
    if (!hasTranslation) return source;
    const translated = `${translatedCore}${classSuffix}${formatSuffix}`;
    return translated && translated !== source.trim() ? translated : source;
  }

  // src/i18n/translator.ts
  var ignoredElementNames = /* @__PURE__ */ new Set([
    "CODE",
    "NOSCRIPT",
    "PRE",
    "SCRIPT",
    "STYLE",
    "TEXTAREA"
  ]);
  var translatableAttributes = [
    "alt",
    "aria-label",
    "placeholder",
    "title"
  ];
  var deckNameDropdownNames = /* @__PURE__ */ new Set([
    "Archetype",
    "Archetypes",
    "Deck Archetype",
    "Opponent Archetype",
    "Opponent Archetypes",
    "套牌类型",
    "对手套牌类型"
  ]);
  function isDeckNameNode(node) {
    const element = node.parentElement;
    if (!element) return false;
    if (element.closest(".deck-title, .archetype-name")) return true;
    if (element.matches("main h1") && /^\/deck\/\d+/.test(window.location.pathname)) {
      return true;
    }
    if (/^\/matchups\/?$/.test(window.location.pathname)) {
      if (element.matches("table td.sticky-column")) return true;
      if (element.matches('table th button[phx-value-sort_by^="opponent_"]')) {
        return true;
      }
    }
    const dropdown = element.closest("div[x-data]");
    const dropdownTrigger = dropdown?.querySelector(":scope > a.button");
    const dropdownName = dropdownTrigger?.textContent?.trim();
    if (dropdownName && deckNameDropdownNames.has(dropdownName)) {
      return true;
    }
    const link = element.closest("a[href]");
    if (!link) return false;
    const href = link.getAttribute("href") ?? "";
    return /^(?:https:\/\/www\.hsguru\.com)?\/(?:deck\/\d+|archetype\/)/.test(
      href
    );
  }
  function getCardDetailField(element) {
    if (!/^\/card\/\d+/.test(window.location.pathname)) return void 0;
    if (element.matches("main h1")) return "name";
    const cell = element.closest("td");
    const row = cell?.parentElement;
    const cells = row?.querySelectorAll(":scope > td");
    if (!cell || !cells || cells[1] !== cell) return void 0;
    const label = cells[0]?.textContent?.trim();
    if (label === "Name" || label === "名称") return "name";
    if (label === "Text" || label === "卡牌文本") return "text";
    if (label === "Flavor Text" || label === "趣味描述") return "flavor";
    if (label === "Keywords" || label === "关键词") return "keywords";
    return void 0;
  }
  function translateDynamicText(content, dictionary2) {
    let match;
    if (match = content.match(/^(.+?)(\s*[↑↓])$/)) {
      const translatedHeader = dictionary2[match[1]] ?? translateDynamicText(match[1], dictionary2);
      if (translatedHeader) return `${translatedHeader}${match[2]}`;
    }
    if (match = content.match(/^(.+?) (\d+)\/(\d+)( - DeckBuilder)?$/)) {
      const name = match[1];
      const translatedName = dictionary2[name] ?? translateDeckName(name);
      if (translatedName !== name) {
        const titleSuffix = match[4] ? " - 套牌构筑器" : "";
        return `${translatedName} ${match[2]}/${match[3]}${titleSuffix}`;
      }
    }
    if (match = content.match(
      /^(.+?) (Deck|Archetype) Card Stats \((Standard|Wild|Brawl|Classic|Twist)\)$/
    )) {
      const deckName = translateDeckName(match[1]);
      const statsType = match[2] === "Deck" ? "套牌" : "套牌类型";
      const format = dictionary2[match[3]];
      if (format) return `${deckName}${statsType}卡牌数据（${format}）`;
    }
    if (match = content.match(/^(.+?) (Standard|Wild|Brawl|Classic|Twist) stats$/)) {
      const deckName = translateDeckName(match[1]);
      const format = dictionary2[match[2]];
      if (deckName !== match[1] && format) return `${deckName}（${format}）数据`;
    }
    if (match = content.match(/^(.+?) - (Standard|Wild)$/)) {
      const classAliases = {
        DK: "Death Knight",
        DH: "Demon Hunter"
      };
      const className = classAliases[match[1]] ?? match[1];
      const translatedClass = dictionary2[className];
      const translatedFormat = dictionary2[match[2]];
      if (translatedClass && translatedFormat) {
        return `${translatedClass} - ${translatedFormat}`;
      }
    }
    if (match = content.match(/^(\d+) out of (\d+)$/)) {
      return `已选 ${match[1]} 张，最多 ${match[2]} 张`;
    }
    if (match = content.match(/^Show ([\d,]+)$/)) {
      return `显示 ${match[1]} 条`;
    }
    if (match = content.match(/^Min ([\d,]+) Finishes?$/)) {
      return `至少完赛 ${match[1]} 次`;
    }
    if (match = content.match(/^Min ([\d,]+)$/)) {
      return `至少 ${match[1]} 局`;
    }
    if (match = content.match(/^Top ([\d,]+)(k?)$/i)) {
      const value = Number(match[1].replaceAll(",", "")) * (match[2] ? 1e3 : 1);
      return `前 ${value.toLocaleString("zh-CN")} 名`;
    }
    if (match = content.match(/^Total Players: ([\d,]+)$/)) {
      return `玩家总数：${match[1]}`;
    }
    if (match = content.match(/^(\d{4}) Standard$/)) {
      return `${match[1]} 标准模式`;
    }
    if (match = content.match(/^(\d{4}) Announcement$/)) {
      return `${match[1]} 年公告`;
    }
    if (match = content.match(
      /^(?:(China) )?(\d{4}) (Spring|Summer|Fall|Winter)$/
    )) {
      const seasonNames = {
        Spring: "春季",
        Summer: "夏季",
        Fall: "秋季",
        Winter: "冬季"
      };
      const country = match[1] ? "中国 " : "";
      return `${country}${match[2]} 年${seasonNames[match[3]]}`;
    }
    if (match = content.match(/^(\d{4}) Last Chance$/)) {
      return `${match[1]} 年最终资格赛`;
    }
    if (match = content.match(/^Past (\d+) Hours?$/)) {
      return `过去 ${match[1]} 小时`;
    }
    if (content === "Past Day") return "过去 1 天";
    if (match = content.match(/^Past (\d+) Days?$/i)) {
      return `过去 ${match[1]} 天`;
    }
    if (content === "Past Week") return "过去 1 周";
    if (match = content.match(/^Past (\d+) Weeks?$/i)) {
      return `过去 ${match[1]} 周`;
    }
    if (content === "Last hour") return "最近 1 小时";
    if (content === "Last day") return "最近 1 天";
    if (match = content.match(/^Last (\d+) hours?$/i)) {
      return `最近 ${match[1]} 小时`;
    }
    if (match = content.match(/^Last (\d+) days?$/i)) {
      return `最近 ${match[1]} 天`;
    }
    if (match = content.match(/^(\d+) (second|minute|hour|day|week)s? ago$/i)) {
      const units = {
        second: "秒",
        minute: "分钟",
        hour: "小时",
        day: "天",
        week: "周"
      };
      return `${match[1]} ${units[match[2].toLowerCase()]}前`;
    }
    if (match = content.match(/^VS (.+)$/)) {
      const opponent = dictionary2[match[1]];
      if (opponent) return `对阵${opponent}`;
    }
    if (match = content.match(/^([\d,]+) Games?$/)) {
      return `${match[1]} 局`;
    }
    if (match = content.match(/^Games: ([\d,]+)$/)) {
      return `对局数：${match[1]}`;
    }
    if (match = content.match(/^Peaked By: (.+)$/)) {
      return `最高排名玩家：${match[1]}`;
    }
    if (match = content.match(/^First Streamed: (.+)$/)) {
      return `首次直播：${match[1]}`;
    }
    if (match = content.match(/^# Streamed: ([\d,]+)$/)) {
      return `直播次数：${match[1]}`;
    }
    if (match = content.match(/^Connections \((\d+)\/(\d+)\)$/)) {
      return `连接（${match[1]}/${match[2]}）`;
    }
    if (match = content.match(/^Tier: (.+?) \| Ad Free: (.+)$/)) {
      return `等级：${match[1]} | 无广告：${match[2]}`;
    }
    return void 0;
  }
  function replacePreservingWhitespace(source, replacement) {
    const match = source.match(/^(\s*)(.*?)(\s*)$/s);
    return match ? `${match[1]}${replacement}${match[3]}` : replacement;
  }
  var chineseRegionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : void 0;
  function translateCountryOption(source, countryCode) {
    if (!chineseRegionNames || !/^[A-Z]{2}$/.test(countryCode)) return source;
    const translated = chineseRegionNames.of(countryCode);
    return translated && translated !== countryCode ? replacePreservingWhitespace(source, translated) : source;
  }
  function getCountryCodeFromElement(element) {
    if (element instanceof HTMLOptionElement && element.parentElement?.matches('select[name="country_code"]')) {
      return element.value;
    }
    const countryLabel = element.closest('label[for^="country["]');
    return countryLabel?.getAttribute("for")?.match(/^country\[([A-Z]{2})\]$/)?.[1];
  }
  function translateText(source, dictionary2) {
    const match = source.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) return source;
    const content = match[2];
    const translated = dictionary2[content] ?? translateDynamicText(content, dictionary2);
    return translated === void 0 ? source : replacePreservingWhitespace(source, translated);
  }
  function translateCardTextByHref(source, href, namesByDbfId) {
    if (source.trim() === "") return source;
    const dbfId = getCardDbfIdFromHref(href);
    const localizedName = dbfId ? namesByDbfId[dbfId] : void 0;
    if (!localizedName) return source;
    return replacePreservingWhitespace(source, localizedName);
  }
  function translateCardDetailTextByHref(source, href, field, namesByDbfId, textsByDbfId, flavorsByDbfId) {
    if (source.trim() === "") return source;
    const dbfId = getCardDbfIdFromHref(href);
    const localized = dbfId ? {
      name: namesByDbfId,
      text: textsByDbfId,
      flavor: flavorsByDbfId
    }[field][dbfId] : void 0;
    if (!localized) return source;
    return replacePreservingWhitespace(source, localized);
  }
  function translateCardKeywords(source, dictionary2) {
    const match = source.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match || match[2] === "") return source;
    const keywords = match[2].split(",").map((keyword) => keyword.trim());
    const translated = keywords.map((keyword) => dictionary2[keyword]);
    if (translated.some((keyword) => keyword === void 0)) return source;
    return `${match[1]}${translated.join("、")}${match[3]}`;
  }
  var PageTranslator = class {
    #dictionary;
    #cardNamesByDbfId;
    #cardTextsByDbfId;
    #cardFlavorsByDbfId;
    #cardKeywordDictionary;
    #translatedText = /* @__PURE__ */ new WeakMap();
    #translatedAttributes = /* @__PURE__ */ new WeakMap();
    constructor(dictionary2, cardNamesByDbfId2 = {}, cardTextsByDbfId2 = {}, cardFlavorsByDbfId2 = {}, cardKeywordDictionary2 = {}) {
      this.#dictionary = dictionary2;
      this.#cardNamesByDbfId = cardNamesByDbfId2;
      this.#cardTextsByDbfId = cardTextsByDbfId2;
      this.#cardFlavorsByDbfId = cardFlavorsByDbfId2;
      this.#cardKeywordDictionary = cardKeywordDictionary2;
    }
    translate(root) {
      if (root instanceof Text) {
        this.#translateTextNode(root);
        return;
      }
      if (!(root instanceof Element || root instanceof Document)) return;
      if (root instanceof Element) this.#translateElementAttributes(root);
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
      );
      let current;
      while (current = walker.nextNode()) {
        if (current instanceof Text) {
          this.#translateTextNode(current);
        } else if (current instanceof Element) {
          this.#translateElementAttributes(current);
        }
      }
    }
    restore(root) {
      if (root instanceof Text) {
        this.#restoreTextNode(root);
        return;
      }
      if (!(root instanceof Element || root instanceof Document)) return;
      if (root instanceof Element) this.#restoreElementAttributes(root);
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
      );
      let current;
      while (current = walker.nextNode()) {
        if (current instanceof Text) {
          this.#restoreTextNode(current);
        } else if (current instanceof Element) {
          this.#restoreElementAttributes(current);
        }
      }
    }
    #translateTextNode(node) {
      const parent = node.parentElement;
      if (!parent || ignoredElementNames.has(parent.tagName)) return;
      const previous = this.#translatedText.get(node);
      if (previous && node.data === previous.translated) return;
      const original = node.data;
      let translated = translateText(original, this.#dictionary);
      if (translated === original) {
        const countryCode = getCountryCodeFromElement(parent);
        if (countryCode) {
          translated = translateCountryOption(original, countryCode);
        }
      }
      if (translated === original && parent.matches(".card-name")) {
        const href = parent.closest('a[href*="/card/"]')?.getAttribute("href");
        if (href) {
          translated = translateCardTextByHref(
            original,
            href,
            this.#cardNamesByDbfId
          );
        }
      }
      if (translated === original) {
        const cardDetailField = getCardDetailField(parent);
        if (cardDetailField) {
          translated = cardDetailField === "keywords" ? translateCardKeywords(original, this.#cardKeywordDictionary) : translateCardDetailTextByHref(
            original,
            window.location.pathname,
            cardDetailField,
            this.#cardNamesByDbfId,
            this.#cardTextsByDbfId,
            this.#cardFlavorsByDbfId
          );
        }
      }
      if (translated === original && isDeckNameNode(node)) {
        translated = translateDeckName(original);
      }
      if (translated === original) return;
      this.#translatedText.set(node, { original, translated });
      node.data = translated;
    }
    #restoreTextNode(node) {
      const previous = this.#translatedText.get(node);
      if (previous !== void 0 && node.data === previous.translated) {
        node.data = previous.original;
      }
    }
    #translateElementAttributes(element) {
      if (ignoredElementNames.has(element.tagName) && element.tagName !== "TEXTAREA") {
        return;
      }
      for (const attribute of translatableAttributes) {
        const value = element.getAttribute(attribute);
        if (value === null) continue;
        const previous = this.#translatedAttributes.get(element)?.get(attribute);
        if (previous && value === previous.translated) continue;
        let translated = translateText(value, this.#dictionary);
        if (translated === value && attribute === "alt") {
          const href = element.closest('a[href*="/card/"]')?.getAttribute("href");
          if (href) {
            translated = translateCardTextByHref(
              value,
              href,
              this.#cardNamesByDbfId
            );
          }
        }
        if (translated === value) continue;
        let translations = this.#translatedAttributes.get(element);
        if (!translations) {
          translations = /* @__PURE__ */ new Map();
          this.#translatedAttributes.set(element, translations);
        }
        translations.set(attribute, { original: value, translated });
        element.setAttribute(attribute, translated);
      }
    }
    #restoreElementAttributes(element) {
      const translations = this.#translatedAttributes.get(element);
      if (!translations) return;
      for (const [attribute, translation] of translations) {
        if (element.getAttribute(attribute) === translation.translated) {
          element.setAttribute(attribute, translation.original);
        }
      }
    }
  };

  // src/chart-labels.ts
  var installedPrototypes = /* @__PURE__ */ new WeakSet();
  function translateChartText(source, dictionary2) {
    const interfaceText = translateText(source, dictionary2);
    if (interfaceText !== source) return interfaceText;
    const tooltip = source.match(/^(.+?)(:\s.*)$/s);
    if (tooltip) {
      const deckName = translateDeckName(tooltip[1]);
      if (deckName !== tooltip[1]) return `${deckName}${tooltip[2]}`;
    }
    return translateDeckName(source);
  }
  function isHsguruChart(context) {
    return Boolean(context.canvas?.closest?.('[phx-hook="ChartJs"]'));
  }
  function installChartLabelTranslation(prototype, dictionary2, isEnabled2) {
    if (!prototype || installedPrototypes.has(prototype)) return false;
    installedPrototypes.add(prototype);
    const originalFillText = prototype.fillText;
    const originalMeasureText = prototype.measureText;
    const originalStrokeText = prototype.strokeText;
    const localize = (context, text) => {
      const source = String(text);
      return isEnabled2() && isHsguruChart(context) ? translateChartText(source, dictionary2) : source;
    };
    prototype.fillText = function(text, x, y, maxWidth) {
      const translated = localize(this, text);
      if (maxWidth === void 0) originalFillText.call(this, translated, x, y);
      else originalFillText.call(this, translated, x, y, maxWidth);
    };
    prototype.measureText = function(text) {
      return originalMeasureText.call(this, localize(this, text));
    };
    prototype.strokeText = function(text, x, y, maxWidth) {
      const translated = localize(this, text);
      if (maxWidth === void 0) originalStrokeText.call(this, translated, x, y);
      else originalStrokeText.call(this, translated, x, y, maxWidth);
    };
    return true;
  }
  function redrawHsguruCharts(root, liveSocket) {
    const socket = liveSocket;
    if (!socket) return 0;
    let redrawn = 0;
    for (const element of root.querySelectorAll('[phx-hook="ChartJs"]')) {
      let view;
      try {
        view = socket.getViewByEl?.(element) ?? socket.main;
      } catch {
        view = socket.main;
      }
      const hook = view?.getHook?.(element) ?? Object.values(view?.viewHooks ?? {}).find((item) => item.el === element);
      const chart = hook?.chart;
      if (!chart?.update) continue;
      chart.stop?.();
      chart.update("none");
      chart.draw?.();
      redrawn += 1;
    }
    return redrawn;
  }
  function nudgeHsguruCharts(root, restoreLater) {
    let nudged = 0;
    for (const element of root.querySelectorAll('[phx-hook="ChartJs"]')) {
      const container = element;
      const width = container.getBoundingClientRect?.().width;
      if (!width || width <= 1 || !container.style) continue;
      const originalWidth = container.style.width;
      container.style.width = `${Math.floor(width) - 1}px`;
      restoreLater(() => {
        container.style.width = originalWidth;
      });
      nudged += 1;
    }
    return nudged;
  }

  // src/data/card-dictionary.ts
  var cacheKey = "hsguru-zh-cn:card-dictionary";
  var cacheLifetime = 7 * 24 * 60 * 60 * 1e3;
  var dataBaseUrl = "https://api.hearthstonejson.com/v1/latest";
  function requestJson(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: 3e4,
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`请求失败：HTTP ${response.status}`));
            return;
          }
          try {
            resolve(JSON.parse(response.responseText));
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => reject(new Error("卡牌数据网络请求失败")),
        ontimeout: () => reject(new Error("卡牌数据网络请求超时"))
      });
    });
  }
  function buildCardDictionary(englishCards, chineseCards) {
    const chineseNames = new Map(
      chineseCards.filter(
        (card) => Boolean(card.name)
      ).map((card) => [card.id, card.name])
    );
    return Object.fromEntries(
      englishCards.flatMap((card) => {
        const chineseName = chineseNames.get(card.id);
        if (!card.name || !chineseName || card.name === chineseName) return [];
        return [[card.name, chineseName]];
      })
    );
  }
  function extractBoldPhrases(text) {
    return [...text.matchAll(/<b>(.*?)<\/b>/gis)].map((match) => match[1]);
  }
  function normalizeKeywordPhrase(source) {
    return source.replaceAll(" ", " ").replace(/[:：].*$/s, "").replace(/\s*[（(]\s*\d+\s*[）)]\s*$/u, "").replace(/\s*[+＋]\s*\d+.*$/u, "").replace(/\s+[-–—]\s*$/u, "").trim();
  }
  function buildCardKeywordDictionary(englishCards, chineseCards) {
    const chineseCardsById = new Map(chineseCards.map((card) => [card.id, card]));
    const entries = [];
    for (const englishCard of englishCards) {
      const chineseCard = chineseCardsById.get(englishCard.id);
      if (!englishCard.text || !chineseCard?.text) continue;
      const englishPhrases = extractBoldPhrases(englishCard.text);
      const chinesePhrases = extractBoldPhrases(chineseCard.text);
      if (englishPhrases.length !== chinesePhrases.length) continue;
      for (let index = 0; index < englishPhrases.length; index += 1) {
        const english = normalizeKeywordPhrase(englishPhrases[index]);
        const chinese = normalizeKeywordPhrase(chinesePhrases[index]);
        if (english && chinese && english !== chinese) {
          entries.push([english, chinese]);
        }
      }
    }
    return Object.fromEntries(entries);
  }
  function buildCardRenderIds(cards) {
    return Object.fromEntries(
      cards.flatMap(
        (card) => typeof card.dbfId === "number" ? [[String(card.dbfId), card.id]] : []
      )
    );
  }
  function buildCardNamesByDbfId(cards) {
    return Object.fromEntries(
      cards.flatMap(
        (card) => typeof card.dbfId === "number" && card.name ? [[String(card.dbfId), card.name]] : []
      )
    );
  }
  function buildCardTextsByDbfId(cards) {
    return Object.fromEntries(
      cards.flatMap(
        (card) => typeof card.dbfId === "number" && card.text ? [[String(card.dbfId), card.text]] : []
      )
    );
  }
  function buildCardFlavorsByDbfId(cards) {
    return Object.fromEntries(
      cards.flatMap(
        (card) => typeof card.dbfId === "number" && card.flavor ? [[String(card.dbfId), card.flavor]] : []
      )
    );
  }
  function isValidCache(value) {
    if (!value || typeof value !== "object") return false;
    const cache = value;
    return (cache.schemaVersion === 1 || cache.schemaVersion === 2 || cache.schemaVersion === 3 || cache.schemaVersion === 4 || cache.schemaVersion === 5 || cache.schemaVersion === 6) && typeof cache.updatedAt === "number" && Array.isArray(cache.entries);
  }
  async function loadCardLocalization(forceRefresh = false) {
    const cached = GM_getValue(cacheKey);
    const validCache = isValidCache(cached) ? cached : void 0;
    const cachedRenderIds = validCache?.renderIdsByDbfId;
    const cachedNames = validCache?.namesByDbfId;
    const cachedTexts = validCache?.textsByDbfId;
    const cachedFlavors = validCache?.flavorsByDbfId;
    const cachedKeywords = validCache?.keywordEntries;
    if (!forceRefresh && validCache && Array.isArray(cachedRenderIds) && Array.isArray(cachedNames) && Array.isArray(cachedTexts) && Array.isArray(cachedFlavors) && Array.isArray(cachedKeywords) && Date.now() - validCache.updatedAt < cacheLifetime) {
      return {
        dictionary: Object.fromEntries(validCache.entries),
        renderIdsByDbfId: Object.fromEntries(cachedRenderIds),
        namesByDbfId: Object.fromEntries(cachedNames),
        textsByDbfId: Object.fromEntries(cachedTexts),
        flavorsByDbfId: Object.fromEntries(cachedFlavors),
        keywordDictionary: Object.fromEntries(cachedKeywords),
        source: "cache"
      };
    }
    try {
      const [englishCards, chineseCards] = await Promise.all([
        requestJson(
          `${dataBaseUrl}/enUS/cards.collectible.json`
        ),
        requestJson(`${dataBaseUrl}/zhCN/cards.json`)
      ]);
      const dictionary2 = buildCardDictionary(englishCards, chineseCards);
      const keywordDictionary = buildCardKeywordDictionary(
        englishCards,
        chineseCards
      );
      const renderIdsByDbfId = buildCardRenderIds(chineseCards);
      const namesByDbfId = buildCardNamesByDbfId(chineseCards);
      const textsByDbfId = buildCardTextsByDbfId(chineseCards);
      const flavorsByDbfId = buildCardFlavorsByDbfId(chineseCards);
      GM_setValue(cacheKey, {
        schemaVersion: 6,
        updatedAt: Date.now(),
        entries: Object.entries(dictionary2),
        renderIdsByDbfId: Object.entries(renderIdsByDbfId),
        namesByDbfId: Object.entries(namesByDbfId),
        textsByDbfId: Object.entries(textsByDbfId),
        flavorsByDbfId: Object.entries(flavorsByDbfId),
        keywordEntries: Object.entries(keywordDictionary)
      });
      return {
        dictionary: dictionary2,
        renderIdsByDbfId,
        namesByDbfId,
        textsByDbfId,
        flavorsByDbfId,
        keywordDictionary,
        source: "network"
      };
    } catch (error) {
      if (validCache) {
        return {
          dictionary: Object.fromEntries(validCache.entries),
          renderIdsByDbfId: Object.fromEntries(cachedRenderIds ?? []),
          namesByDbfId: Object.fromEntries(cachedNames ?? []),
          textsByDbfId: Object.fromEntries(cachedTexts ?? []),
          flavorsByDbfId: Object.fromEntries(cachedFlavors ?? []),
          keywordDictionary: Object.fromEntries(cachedKeywords ?? []),
          source: "stale-cache"
        };
      }
      throw error;
    }
  }

  // src/clipboard.ts
  var deckMarkerPattern = /^(?:# (?:Class|Format):|[A-Za-z0-9+/]{40,}={0,2})\r?$/m;
  function translateCopiedDeckText(source) {
    if (!deckMarkerPattern.test(source)) return source;
    return source.replace(
      /^(\uFEFF?[ \t]*###[ \t]+)(.*?)([ \t]*)(\r?)$/m,
      (_line, prefix, deckName, trailing, cr) => `${prefix}${translateDeckName(deckName)}${trailing}${cr}`
    );
  }
  function createHsguruDeckCopyText(deckName, deckCode, deckUrl) {
    return [
      `### ${translateDeckName(deckName)}`,
      deckCode,
      `### You can view this deck at ${deckUrl}`
    ].join("\n");
  }
  function extractDeckCode(heading) {
    const matches = heading.textContent?.match(/[A-Za-z0-9+/]{40,}={0,2}/g);
    return matches?.sort((a, b) => b.length - a.length)[0];
  }
  function findDeckHeading(trigger) {
    let ancestor = trigger.parentElement;
    while (ancestor && ancestor !== document.body) {
      const headings = [...ancestor.querySelectorAll("h2")].filter(
        (heading) => Boolean(extractDeckCode(heading))
      );
      if (headings.length === 1) return headings[0];
      if (headings.length > 1) break;
      ancestor = ancestor.parentElement;
    }
    const triggerRect = trigger.getBoundingClientRect();
    return [...document.querySelectorAll("main h2")].filter((heading) => Boolean(extractDeckCode(heading))).sort((a, b) => {
      const distanceA = Math.abs(
        a.getBoundingClientRect().top - triggerRect.top
      );
      const distanceB = Math.abs(
        b.getBoundingClientRect().top - triggerRect.top
      );
      return distanceA - distanceB;
    })[0];
  }
  function getDeckUrl(heading) {
    const currentUrl = new URL(window.location.href);
    const deckLink = heading.querySelector('a[href*="/deck/"]');
    const candidate = new URL(deckLink?.href ?? currentUrl.href, currentUrl.href);
    if (!/^\/deck\/\d+/.test(candidate.pathname)) return void 0;
    return `${candidate.origin}${candidate.pathname}`;
  }
  function showCopiedFeedback(button) {
    document.querySelector("[data-hsguru-zh-copy-feedback]")?.remove();
    const originalLabel = button.dataset.hsguruZhOriginalCopyLabel ?? button.getAttribute("aria-label") ?? "";
    const originalBalloonPosition = button.dataset.hsguruZhOriginalBalloonPosition ?? button.getAttribute("data-balloon-pos") ?? "";
    button.dataset.hsguruZhCopyButton = "";
    button.dataset.hsguruZhOriginalCopyLabel = originalLabel;
    button.dataset.hsguruZhOriginalBalloonPosition = originalBalloonPosition;
    button.setAttribute("aria-label", "已复制");
    button.removeAttribute("data-balloon-pos");
    const restoreLabel = () => {
      if (originalLabel) button.setAttribute("aria-label", originalLabel);
      else button.removeAttribute("aria-label");
      if (originalBalloonPosition) {
        button.setAttribute("data-balloon-pos", originalBalloonPosition);
      } else {
        button.removeAttribute("data-balloon-pos");
      }
      delete button.dataset.hsguruZhCopyButton;
      delete button.dataset.hsguruZhOriginalCopyLabel;
      delete button.dataset.hsguruZhOriginalBalloonPosition;
    };
    const restoreAfterPointerExit = () => {
      button.blur();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(restoreLabel);
      });
    };
    button.addEventListener("pointerleave", restoreAfterPointerExit, {
      once: true
    });
    const badge = document.createElement("span");
    badge.dataset.hsguruZhCopyFeedback = "";
    badge.setAttribute("role", "status");
    badge.setAttribute("aria-live", "polite");
    badge.textContent = "已复制";
    const rect = button.getBoundingClientRect();
    Object.assign(badge.style, {
      position: "fixed",
      zIndex: "2147483647",
      left: `${rect.left + rect.width / 2}px`,
      top: `${rect.top > 44 ? rect.top - 36 : rect.bottom + 8}px`,
      transform: "translateX(-50%)",
      padding: "6px 12px",
      border: "0",
      borderRadius: "2px",
      background: "rgb(16 16 16 / 95%)",
      color: "#ffffff",
      fontSize: "12px",
      lineHeight: "1.2",
      boxShadow: "none",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 180ms ease-out 180ms"
    });
    document.body.append(badge);
    window.requestAnimationFrame(() => {
      badge.style.opacity = "1";
    });
    window.setTimeout(() => {
      badge.style.opacity = "0";
      if (!button.matches(":hover")) restoreAfterPointerExit();
      window.setTimeout(() => badge.remove(), 140);
    }, 1200);
  }
  function installDeckCopyButtonTranslation(isEnabled2, setClipboard) {
    document.addEventListener(
      "click",
      (event) => {
        if (!isEnabled2() || !(event.target instanceof Element)) return;
        const clipboardTrigger = event.target.closest(
          "[data-clipboard-text]"
        );
        const clipboardText = clipboardTrigger?.getAttribute(
          "data-clipboard-text"
        );
        if (clipboardTrigger && clipboardText) {
          const translated = translateCopiedDeckText(clipboardText);
          if (translated !== clipboardText) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setClipboard(translated);
            showCopiedFeedback(clipboardTrigger);
            return;
          }
        }
        const button = event.target.closest("button");
        if (!button) return;
        const label = button.getAttribute("aria-label")?.trim();
        const text = button.textContent?.trim();
        if (!button.hasAttribute("data-hsguru-zh-copy-button") && label !== "Copy" && label !== "复制" && text !== "Copy" && text !== "复制") {
          return;
        }
        const heading = findDeckHeading(button);
        const deckName = heading?.querySelector(
          'a[href*="/deck/"], a[href*="/archetype/"]'
        )?.textContent?.trim();
        const deckCode = heading ? extractDeckCode(heading) : void 0;
        const deckUrl = heading ? getDeckUrl(heading) : void 0;
        if (!deckName || !deckCode || !deckUrl) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setClipboard(createHsguruDeckCopyText(deckName, deckCode, deckUrl));
        showCopiedFeedback(button);
      },
      { capture: true }
    );
  }
  function installDeckClipboardTranslation(clipboard, isEnabled2) {
    if (!clipboard || typeof clipboard.writeText !== "function") return false;
    const prototype = Object.getPrototypeOf(clipboard);
    const target = prototype && typeof prototype.writeText === "function" ? prototype : clipboard;
    const originalWriteText = target.writeText;
    const translatedWriteText = function(text) {
      return originalWriteText.call(
        this,
        isEnabled2() ? translateCopiedDeckText(text) : text
      );
    };
    try {
      Object.defineProperty(target, "writeText", {
        configurable: true,
        writable: true,
        value: translatedWriteText
      });
      return true;
    } catch {
      return false;
    }
  }

  // src/i18n/dictionary.ts
  var dictionary = {
    // 通用操作
    Home: "首页",
    Search: "搜索",
    Submit: "提交",
    New: "新建",
    Delete: "删除",
    View: "查看",
    Share: "分享",
    Use: "使用",
    Settings: "设置",
    Login: "登录",
    "Log in": "登录",
    Logout: "退出登录",
    "You need to log in to view this page": "你需要登录才能查看此页面",
    "Sign in (Battlenet)": "使用战网登录",
    Previous: "上一页",
    Next: "下一页",
    Loading: "加载中",
    "No data": "暂无数据",
    "New!": "新功能！",
    Copy: "复制",
    "Copy Deck": "复制套牌",
    "Copy Deck Code": "复制套牌代码",
    "Copy to clipboard": "复制到剪贴板",
    "Copied!": "已复制！",
    Edit: "编辑",
    Add: "添加",
    Clear: "清除",
    Remove: "移除",
    About: "关于",
    Yes: "是",
    No: "否",
    All: "全部",
    "Select All": "全选",
    Any: "任意",
    Latest: "最新",
    Default: "默认",
    None: "无",
    Blue: "蓝色",
    Green: "绿色",
    Red: "红色",
    "Privacy Policy": "隐私政策",
    "No ads & more": "无广告及更多权益",
    "Type or paste": "输入或粘贴",
    // 卡牌详情页
    Wiki: "维基",
    "Official Site": "官方网站",
    "Find Decks": "查找包含此卡的套牌",
    "Find Streamer Decks": "查找包含此卡的主播套牌",
    Name: "名称",
    Nicknames: "别名",
    Id: "卡牌 ID",
    "Mana Cost": "法力值消耗",
    Attack: "攻击力",
    Health: "生命值",
    Durability: "耐久度",
    Classes: "职业",
    "Minion Types": "随从类型",
    "Dust Cost": "奥术之尘消耗",
    "Dust Free": "无需奥术之尘",
    False: "否",
    True: "是",
    "Spell School": "法术派系",
    "Flavor Text": "趣味描述",
    Text: "卡牌文本",
    Keywords: "关键词",
    Factions: "阵营",
    Collectible: "可收藏",
    "Artist Name": "画师",
    "Crop Image": "裁剪图",
    Image: "卡图",
    "Image Link": "卡图链接",
    "Image Gold": "金色卡图",
    // 主导航及页面入口
    Leaderboards: "排行榜",
    "Player Stats": "玩家数据",
    "HSEsports Points": "炉石电竞积分",
    "Leaderboard Stats": "排行榜数据",
    "HSEsports Leaderboards Points": "炉石电竞排行榜积分",
    "Ladder Leaderboard": "天梯排行榜",
    "Points Season": "积分赛季",
    "Use Current Season": "使用当前赛季",
    "Filter Countries": "筛选国家或地区",
    Country: "国家或地区",
    Regions: "赛区",
    "Show Country Flags": "显示国家旗帜",
    "Show country flags": "显示国家旗帜",
    "Hide country flags": "隐藏国家旗帜",
    "Include Unknown": "包含未知赛区",
    "Don't Include Unknown": "不包含未知赛区",
    Player: "玩家",
    Best: "最佳排名",
    "Average Finish": "平均完赛名次",
    "Total Finishes": "完赛总次数",
    Position: "排名",
    Battletag: "战网昵称",
    history: "历史记录",
    "Updated at": "更新时间",
    "BGs LL/Monthly": "酒馆战棋排行榜/月度数据",
    January: "一月",
    February: "二月",
    March: "三月",
    April: "四月",
    May: "五月",
    June: "六月",
    July: "七月",
    August: "八月",
    September: "九月",
    October: "十月",
    November: "十一月",
    December: "十二月",
    Europe: "欧洲",
    Americas: "美洲",
    "Asia-Pacific": "亚太",
    China: "中国",
    Cards: "卡牌",
    "Hearthstone Cards": "炉石传说卡牌",
    Decks: "套牌",
    Meta: "环境",
    Matchups: "对局优劣",
    "Streamer Decks": "主播套牌",
    "Instructions for streamers": "主播使用说明",
    Esports: "电竞",
    Utilities: "实用工具",
    Deckviewer: "套牌查看器",
    Deckbuilder: "套牌构筑器",
    "Hearthstone DeckBuilder": "炉石传说套牌构筑器",
    "Paste deckcode or link": "粘贴套牌代码或链接",
    "Copy Link": "复制链接",
    "Show Rotation": "显示轮换",
    "Stop Comparing": "停止比较",
    "Class Sort": "按职业排序",
    "Compare to": "对比",
    "Compare Decks": "比较套牌",
    Rotation: "轮换",
    "Copy deck code": "复制套牌代码",
    "Deck code copied!": "套牌代码已复制！",
    Misc: "其他",
    "Legacy HSEsports": "往期炉石电竞",
    Replays: "对局回放",
    "3rd Party Tournaments": "第三方赛事",
    "Battlefy Multi Tournament Stats": "Battlefy 多赛事数据",
    "Streaming Now": "正在直播",
    Fantasy: "梦幻联赛",
    "Batch Lineup Importer": "批量阵容导入",
    "Chat Bot Hooks": "聊天机器人接口",
    "Discord Bot": "Discord 机器人",
    "HDT Plugin": "HDT 插件",
    // 登录后的用户菜单
    "Player Profile": "玩家资料",
    "Deck Sheets": "套牌表",
    "My Matchups": "我的对局",
    "My Games": "我的对局",
    "My Decks": "我的套牌",
    "My Replays": "我的对局回放",
    "My Groups": "我的群组",
    Collection: "我的收藏",
    "All Players": "所有玩家",
    // 登录后的玩家资料页
    Leaderboard: "排行榜",
    "Leaderboard Region": "排行榜赛区",
    Battlegrounds: "酒馆战棋",
    "Battlegrounds Duos": "酒馆战棋双打",
    Mercenaries: "佣兵战纪",
    "Legacy Arena": "传统竞技场",
    "Underground Arena": "地下竞技场",
    Competitions: "赛事",
    Competition: "赛事",
    Qualifiers: "资格赛",
    MTs: "大师巡回赛",
    Place: "名次",
    Score: "积分",
    // 登录后的套牌表与群组页
    Owner: "所有者",
    Group: "群组",
    Actions: "操作",
    "Create Group": "创建群组",
    // 登录后的个人数据页
    "Player: Deck Archetype": "玩家：套牌类型",
    "Deck Archetype": "套牌类型",
    "Opponent: Class": "对手：职业",
    "Percentage %": "百分比 %",
    "Preparing stats...": "正在准备数据…",
    "Powered By": "数据来源：",
    "Powered By Firestone": "数据由 Firestone 提供",
    "Share your public decks": "分享你的公开套牌",
    "Share your public replays": "分享你的公开对局回放",
    "All Formats": "全部模式",
    Restoration: "艾泽拉斯复兴",
    Timeways: "穿越时间流",
    "Day of Rebirth": "重生之日",
    "Emerald Dream": "漫游翡翠梦境",
    Starcraft: "星际争霸",
    "Great Dark Beyond": "深暗领域",
    "Year of the Wolf": "狼年",
    "Year of the Pegasus": "天马年",
    "Lost City": "安戈洛龟途",
    Embers: "世界之树的余烬",
    "Bronze-Platinum": "青铜至白金",
    Unknown: "未知",
    "Order By": "排序方式",
    "Opponent Archetype": "对手套牌类型",
    "Opponent Archetypes": "对手套牌类型",
    "As Class": "按玩家职业",
    "Vs Class": "按对手职业",
    "Exclude Bugged Deck Tracker Versions": "排除异常的套牌追踪器版本",
    "No decks available for these filters. Maybe try changing one of the highlighted ones?": "当前筛选条件下没有可用套牌，请尝试调整高亮的筛选项。",
    "Any Opponent": "任意对手",
    "In Mulligan": "起手出现",
    "Not In Mulligan": "起手未出现",
    Drawn: "已抽到",
    "Not Drawn": "未抽到",
    Kept: "已留下",
    "Not Kept": "未留下",
    "Class Stats": "职业数据",
    "Win-Loss": "胜负",
    Win: "胜利",
    Loss: "失败",
    Draw: "平局",
    "Loading replays...": "正在加载对局回放…",
    "Search opponent": "搜索对手",
    "No Collection": "暂无收藏数据",
    "You dont have a current collection": "你当前没有收藏数据",
    "Use Firestone": "使用 Firestone",
    "to sync your collections (you need to enable it in settings under third party)": "同步你的收藏（需要在设置的第三方选项中启用）",
    // 登录后的个人设置页
    "Profile & Settings": "个人资料与设置",
    "Country & Icon": "国家与图标",
    "Country Flag": "国家旗帜",
    "Select Country": "选择国家或地区",
    "Cross Out Country": "划掉国家旗帜",
    "Show Region Instead of Country": "显示赛区而非国家",
    "Player Icon": "玩家图标",
    "None/Custom": "无/自定义",
    "For custom icons see": "自定义图标请参阅",
    "For custom icons see patreon": "自定义图标请参阅 Patreon",
    "Decklist Colors": "套牌列表颜色",
    "Border Color": "边框颜色",
    "Card Class": "卡牌职业",
    "Deck Class": "套牌职业",
    Rarity: "稀有度",
    "Dark Grey": "深灰色",
    "Deck Format": "套牌模式",
    "Gradient Color": "渐变颜色",
    "Decklist Options": "套牌列表选项",
    "Preferred Deckcode When Copying": "复制时首选的套牌代码格式",
    "Short Deckcode": "短套牌代码",
    "Short Deckcode With Name": "带名称的短套牌代码",
    "Long Deckcode": "长套牌代码",
    "Long Deckcode using ###": "使用 ### 的长套牌代码",
    "Long Deckcode (Invalid - Markdown Code)": "长套牌代码（无效的 Markdown 代码）",
    "Show 1 for singleton cards": "单张卡牌显示数量 1",
    "Show 1 for singleton legendaries": "单张传说卡牌显示数量 1",
    "Show dust+action bar above cards": "在卡牌上方显示奥术之尘与操作栏",
    "Show dust+action bar below cards": "在卡牌下方显示奥术之尘与操作栏",
    "Use missing dust instead of total": "显示缺少的奥术之尘而非总量",
    "Fade missing cards in decks": "淡化套牌中缺少的卡牌",
    "Fade rotating cards in decks": "淡化套牌中即将退环境的卡牌",
    "Default Sheet": "默认套牌表",
    "Default Source": "默认来源",
    "Winrate/Impact Colors": "胜率/影响值颜色",
    "Positive Color": "正值颜色",
    "Negative Color": "负值颜色",
    "Use Custom Hues": "使用自定义色相",
    "Twitch Integration": "Twitch 集成",
    "Stream tracks automatically when connected.": "连接后自动追踪直播。",
    "Connect Twitch": "连接 Twitch",
    "Patreon Integration": "Patreon 集成",
    "Link your account to unlock perks.": "关联账号以解锁权益。",
    "Connect Patreon": "连接 Patreon",
    "Misc Settings": "其他设置",
    "Current Collection": "当前收藏",
    "Which replays do you want to be public? (Only affects new replays)": "哪些对局回放可以公开？（仅影响新回放）",
    Streamed: "已直播",
    "Battlefy Slug (Open your profile, paste the URL, and I'll grab it)": "Battlefy 标识（打开你的个人资料，粘贴网址即可自动提取）",
    // 模式、职业和排名
    Format: "模式",
    Standard: "标准模式",
    Wild: "狂野模式",
    Brawl: "乱斗模式",
    Classic: "经典模式",
    Twist: "幻变模式",
    "The Past": "历史模式",
    Class: "职业",
    "Player Class": "玩家职业",
    "Opponent Class": "对手职业",
    "Any Class": "任意职业",
    Neutral: "中立",
    "Death Knight": "死亡骑士",
    "Demon Hunter": "恶魔猎手",
    Druid: "德鲁伊",
    Hunter: "猎人",
    Mage: "法师",
    Paladin: "圣骑士",
    Priest: "牧师",
    Rogue: "潜行者",
    Shaman: "萨满祭司",
    Warlock: "术士",
    Warrior: "战士",
    Legend: "传说",
    "Diamond-Legend": "钻石至传说",
    "Diamond 4-1": "钻石 4 至 1",
    Rank: "排名",
    Tier: "梯队",
    // 套牌页筛选与数据列
    Archetype: "套牌类型",
    Archetypes: "套牌类型",
    Deck: "套牌",
    "Any Decks": "任意套牌",
    "Any decks": "任意套牌",
    "Includes Latest Set": "包含最新系列",
    "Include cards": "包含卡牌",
    "Exclude cards": "排除卡牌",
    "Winrate %": "胜率 %",
    Winrate: "胜率",
    "Total Games": "总对局数",
    "Cheapest Deck": "最低造价套牌",
    "Most Expensive Deck": "最高造价套牌",
    "Newest Deck": "最新套牌",
    "Oldest Deck": "最早套牌",
    Games: "对局数",
    Popularity: "热度",
    "Deck Name": "套牌名称",
    "Deck Type": "套牌类型",
    "Stats Explanation": "数据说明",
    "Aggregated Data": "聚合数据",
    "Fresh Data": "最新数据",
    "To contribute use": "贡献数据请使用",
    "or the": "或",
    Chart: "图表",
    "Post patch archetyping will be updated a couple days post patch": "补丁更新后，套牌分类将在数日内更新",
    "Card Stats": "卡牌数据",
    "Card Stats (Mulligan)": "卡牌数据（起手留牌）",
    "Deck Stats": "套牌数据",
    "Archetype Card Stats": "套牌类型卡牌数据",
    Card: "卡牌",
    "Min Mull Count": "最少起手样本数",
    "Min Drawn Count": "最少抽到样本数",
    "Counts Alongside Impact": "影响值旁显示样本数",
    "Show Counts": "显示样本数",
    "Don't Show Counts": "不显示样本数",
    "Weighted Colors": "加权配色",
    "Positive/Negative Colors": "正负值配色",
    Opponent: "对手",
    "Mulligan Impact": "起手影响",
    "Drawn Impact": "抽到影响",
    "Not Drawn Impact": "未抽到影响",
    "Kept Impact": "留牌影响",
    "Archetype Stats": "套牌类型数据",
    "Archetype Replays": "套牌类型对局回放",
    "Replays Stats": "对局回放数据",
    Stats: "数据",
    "Coin?": "先后手",
    "Opponent's Class": "对手职业",
    "Min Games": "最少对局数",
    "Min Matchup Games": "最少对局样本数",
    "Min Archetype Games": "最少套牌类型对局数",
    "Any Player": "任意先后手",
    "Going First": "先手",
    "On Coin": "后手",
    Total: "总计",
    "Player Name": "玩家名称",
    Streamer: "主播",
    Region: "地区",
    Date: "日期",
    Duration: "时长",
    Turns: "回合数",
    "Climbing Speed": "上分速度",
    "Seed Weights": "按热度填充权重",
    "Reset Weights": "重置权重",
    "Popularity:": "热度：",
    favorite: "收藏",
    Result: "结果",
    Won: "获胜",
    Lost: "失败",
    // 主播套牌页
    "Page Size": "每页数量",
    Peak: "最高排名",
    Worst: "最低排名",
    "Win - Loss": "胜 - 负",
    Links: "链接",
    "Last Played": "最近使用",
    "Violed Hold Cards": "紫罗兰监狱卡牌",
    "Includes VH Cards": "包含紫罗兰监狱卡牌",
    "Include Cards": "包含卡牌",
    "Exclude Cards": "排除卡牌",
    "Search Streamer": "搜索主播",
    "# You really like to select a lot of stuff, don't ya you beautiful being! 🤎 D0nkey": "# 看来你真的很喜欢选择很多东西，真是个可爱的人！🤎 D0nkey",
    // 卡牌筛选
    "Card Set": "卡牌系列",
    "Any Cost": "任意费用",
    "Any Attack": "任意攻击力",
    "Any Health": "任意生命值",
    "Any Type": "任意卡牌类型",
    "Any Minion Type": "任意随从类型",
    "Any Spell School": "任意法术派系",
    "Any Rarity": "任意稀有度",
    "Any Faction": "任意阵营",
    Minion: "随从",
    Spell: "法术",
    Weapon: "武器",
    Location: "地标",
    Hero: "英雄",
    Beast: "野兽",
    Demon: "恶魔",
    Draenei: "德莱尼",
    Dragon: "龙",
    Elemental: "元素",
    Mech: "机械",
    Murloc: "鱼人",
    Naga: "纳迦",
    Pirate: "海盗",
    Quilboar: "野猪人",
    Totem: "图腾",
    Undead: "亡灵",
    Arcane: "奥术",
    Fel: "邪能",
    Fire: "火焰",
    Frost: "冰霜",
    Holy: "神圣",
    Nature: "自然",
    Shadow: "暗影",
    Common: "普通",
    Rare: "稀有",
    Epic: "史诗",
    Legendary: "传说",
    Free: "免费",
    "Grimy Goons": "污手党",
    "Jade Lotus": "玉莲帮",
    Kabal: "暗金教",
    Protoss: "星灵",
    Terran: "人族",
    Zerg: "异虫",
    Mana: "法力值",
    "Mana in Class": "按职业和法力值",
    "Search name/text": "搜索名称或卡牌文本",
    "Additional Classes": "额外职业",
    "Show cards in deck": "显示套牌中的卡牌",
    "Hide cards in deck": "隐藏套牌中的卡牌",
    // 卡牌系列（按 HSGuru 当前筛选器完整覆盖）
    "Escape from Violet Hold": "逃离紫罗兰监狱",
    "Violet Hold": "紫罗兰监狱",
    CATACLYSM: "大灾变",
    "Core 2026": "核心系列 2026",
    "Event 2026": "活动 2026",
    "Across the Timeways": "穿越时间流",
    "The Lost City of Un'Goro": "安戈洛龟途",
    "Into the Emerald Dream": "漫游翡翠梦境",
    "Core 2025": "核心系列 2025",
    "Event 2025": "活动 2025",
    "GDB (Expansion only)": "深暗领域（仅扩展包）",
    "The Great Dark Beyond": "深暗领域",
    "Perils in Paradise": "胜地历险记",
    "Whizbang's Workshop": "威兹班的工坊",
    Core: "核心系列",
    Event: "活动",
    "Showdown in the Badlands": "决战荒芜之地",
    "Caverns of Time": "时光之穴",
    TITANS: "泰坦诸神",
    "Festival of Legends": "传奇音乐节",
    "March of the Lich King": "巫妖王的进军",
    "Path of Arthas": "阿尔萨斯之路",
    "Murder at Castle Nathria": "纳斯利亚堡的悬案",
    "Voyage to the Sunken City": "探寻沉没之城",
    "Fractured in Alterac Valley": "奥特兰克的决裂",
    "United in Stormwind": "暴风城下的集结",
    "Forged in the Barrens": "贫瘠之地的锤炼",
    Legacy: "怀旧",
    "Madness at the Darkmoon Faire": "疯狂的暗月马戏团",
    "Scholomance Academy": "通灵学园",
    "Demon Hunter Initiate": "恶魔猎手新兵",
    "Ashes of Outland": "外域的灰烬",
    "Galakrond’s Awakening": "迦拉克隆的觉醒",
    "Descent of Dragons": "巨龙降临",
    "Saviors of Uldum": "奥丹姆奇兵",
    "Rise of Shadows": "暗影崛起",
    "Rastakhan’s Rumble": "拉斯塔哈的大乱斗",
    "The Boomsday Project": "砰砰计划",
    "The Witchwood": "女巫森林",
    "Kobolds and Catacombs": "狗头人与地下城",
    "Knights of the Frozen Throne": "冰封王座的骑士",
    "Journey to Un’Goro": "勇闯安戈洛",
    "Mean Streets of Gadgetzan": "龙争虎斗加基森",
    "One Night in Karazhan": "卡拉赞之夜",
    "Whispers of the Old Gods": "上古之神的低语",
    "League of Explorers": "探险者协会",
    "The Grand Tournament": "冠军的试炼",
    "Blackrock Mountain": "黑石山的火焰",
    "Goblins vs Gnomes": "地精大战侏儒",
    "Curse of Naxxramas": "纳克萨玛斯的诅咒"
  };

  // src/index.ts
  var storageKey = "hsguru-zh-cn:enabled";
  var runtimeDictionary = { ...dictionary };
  var cardNamesByDbfId = {};
  var cardTextsByDbfId = {};
  var cardFlavorsByDbfId = {};
  var cardKeywordDictionary = {};
  var cardRenderIdsByDbfId = {};
  var translator = new PageTranslator(
    runtimeDictionary,
    cardNamesByDbfId,
    cardTextsByDbfId,
    cardFlavorsByDbfId,
    cardKeywordDictionary
  );
  var isEnabled = localStorage.getItem(storageKey) !== "false";
  installChartLabelTranslation(
    unsafeWindow.CanvasRenderingContext2D?.prototype,
    dictionary,
    () => isEnabled
  );
  var translationMenuId;
  var updateCardsMenuId;
  var isCardUpdateInProgress = false;
  var isClipboardTranslationInstalled = installDeckClipboardTranslation(
    unsafeWindow.navigator.clipboard,
    () => isEnabled
  );
  installDeckCopyButtonTranslation(
    () => isEnabled,
    (text) => GM_setClipboard(text)
  );
  function translatePage() {
    if (!isEnabled || !document.documentElement) return;
    document.documentElement.lang = "zh-CN";
    translator.translate(document.documentElement);
    localizeCardImages(document.documentElement, cardRenderIdsByDbfId);
  }
  function replaceRecord(target, source) {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, source);
  }
  function toggleTranslation() {
    isEnabled = !isEnabled;
    localStorage.setItem(storageKey, String(isEnabled));
    if (isEnabled) {
      translatePage();
    } else if (document.documentElement) {
      translator.restore(document.documentElement);
      restoreCardImages(document.documentElement);
      document.documentElement.lang = "en";
    }
    const liveSocket = unsafeWindow.liveSocket;
    unsafeWindow.requestAnimationFrame(() => {
      if (redrawHsguruCharts(document, liveSocket) > 0) return;
      nudgeHsguruCharts(document, (restore) => {
        unsafeWindow.setTimeout(restore, 50);
      });
    });
    registerMenus();
  }
  function registerMenus() {
    if (translationMenuId !== void 0) {
      GM_unregisterMenuCommand(translationMenuId);
    }
    if (updateCardsMenuId !== void 0) {
      GM_unregisterMenuCommand(updateCardsMenuId);
    }
    translationMenuId = GM_registerMenuCommand(
      isEnabled ? "切换为英文" : "切换为中文",
      toggleTranslation
    );
    updateCardsMenuId = GM_registerMenuCommand("更新卡牌翻译数据", () => {
      void updateCardTranslations(true);
    });
  }
  function showCardUpdateNotice(message, type) {
    document.querySelector("[data-hsguru-zh-card-update-notice]")?.remove();
    const notice = document.createElement("div");
    notice.dataset.hsguruZhCardUpdateNotice = "";
    notice.setAttribute("role", type === "error" ? "alert" : "status");
    notice.setAttribute("aria-live", "polite");
    notice.textContent = message;
    const backgrounds = {
      loading: "rgb(30 35 35 / 96%)",
      success: "rgb(35 75 57 / 96%)",
      error: "rgb(112 45 45 / 96%)"
    };
    Object.assign(notice.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "16px",
      right: "16px",
      maxWidth: "360px",
      padding: "10px 14px",
      border: "1px solid rgb(255 255 255 / 18%)",
      borderRadius: "4px",
      background: backgrounds[type],
      color: "#ffffff",
      fontSize: "14px",
      lineHeight: "1.4",
      boxShadow: "0 4px 16px rgb(0 0 0 / 30%)",
      pointerEvents: "none"
    });
    (document.body ?? document.documentElement).append(notice);
    if (type !== "loading") {
      window.setTimeout(() => notice.remove(), 3200);
    }
  }
  async function updateCardTranslations(forceRefresh = false) {
    if (forceRefresh && isCardUpdateInProgress) return;
    if (forceRefresh) {
      isCardUpdateInProgress = true;
      showCardUpdateNotice("正在更新卡牌翻译数据…", "loading");
    }
    try {
      const cardLocalization = await loadCardLocalization(forceRefresh);
      Object.assign(runtimeDictionary, cardLocalization.dictionary, dictionary);
      replaceRecord(cardNamesByDbfId, cardLocalization.namesByDbfId);
      replaceRecord(cardTextsByDbfId, cardLocalization.textsByDbfId);
      replaceRecord(cardFlavorsByDbfId, cardLocalization.flavorsByDbfId);
      replaceRecord(cardKeywordDictionary, cardLocalization.keywordDictionary);
      cardRenderIdsByDbfId = cardLocalization.renderIdsByDbfId;
      translatePage();
      if (forceRefresh) {
        if (cardLocalization.source === "network") {
          const cardCount = Object.keys(cardLocalization.namesByDbfId).length;
          showCardUpdateNotice(
            `卡牌翻译数据已更新（${cardCount.toLocaleString("zh-CN")} 张）`,
            "success"
          );
        } else {
          showCardUpdateNotice("更新失败，已继续使用原有缓存", "error");
        }
      }
      console.info(
        `[HSGuru 中文助手] 已加载 ${Object.keys(cardLocalization.dictionary).length} 条卡牌翻译。`
      );
    } catch (error) {
      if (forceRefresh) {
        showCardUpdateNotice("卡牌翻译数据更新失败，请稍后重试", "error");
      }
      console.warn("[HSGuru 中文助手] 卡牌翻译数据加载失败。", error);
    } finally {
      if (forceRefresh) isCardUpdateInProgress = false;
    }
  }
  function start() {
    if (!isClipboardTranslationInstalled) {
      isClipboardTranslationInstalled = installDeckClipboardTranslation(
        unsafeWindow.navigator.clipboard,
        () => isEnabled
      );
    }
    translatePage();
    const observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translator.translate(mutation.target);
        }
        if (mutation.type === "attributes") {
          translator.translate(mutation.target);
          localizeCardImages(mutation.target, cardRenderIdsByDbfId);
        }
        for (const node of mutation.addedNodes) {
          translator.translate(node);
          localizeCardImages(node, cardRenderIdsByDbfId);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["alt", "aria-label", "placeholder", "src", "title"]
    });
    registerMenus();
    void updateCardTranslations();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
