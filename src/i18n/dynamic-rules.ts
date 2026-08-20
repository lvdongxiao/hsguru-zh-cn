import { translateDeckName } from './deck-names';
import type { TranslationDictionary } from './text';

/** 翻译包含数字、时间、赛季等变量的受控界面文案。 */
export function translateDynamicText(
  content: string,
  dictionary: TranslationDictionary,
): string | undefined {
  let match: RegExpMatchArray | null;

  if ((match = content.match(/^(.+?)(\s*[↑↓])$/))) {
    const translatedHeader =
      dictionary[match[1]] ?? translateDynamicText(match[1], dictionary);
    if (translatedHeader) return `${translatedHeader}${match[2]}`;
  }

  if ((match = content.match(/^(.+?) (\d+)\/(\d+)( - DeckBuilder)?$/))) {
    const name = match[1];
    const translatedName = dictionary[name] ?? translateDeckName(name);
    if (translatedName !== name) {
      const titleSuffix = match[4] ? ' - 套牌构筑器' : '';
      return `${translatedName} ${match[2]}/${match[3]}${titleSuffix}`;
    }
  }
  if (
    (match = content.match(
      /^(.+?) (Deck|Archetype) Card Stats \((Standard|Wild|Brawl|Classic|Twist)\)$/,
    ))
  ) {
    const deckName = translateDeckName(match[1]);
    const statsType = match[2] === 'Deck' ? '套牌' : '套牌类型';
    const format = dictionary[match[3]];
    if (format) return `${deckName}${statsType}卡牌数据（${format}）`;
  }
  if (
    (match = content.match(/^(.+?) (Standard|Wild|Brawl|Classic|Twist) stats$/))
  ) {
    const deckName = translateDeckName(match[1]);
    const format = dictionary[match[2]];
    if (deckName !== match[1] && format) return `${deckName}（${format}）数据`;
  }
  if ((match = content.match(/^(.+?) - (Standard|Wild)$/))) {
    const classAliases: Readonly<Record<string, string>> = {
      DK: 'Death Knight',
      DH: 'Demon Hunter',
    };
    const className = classAliases[match[1]] ?? match[1];
    const translatedClass = dictionary[className];
    const translatedFormat = dictionary[match[2]];
    if (translatedClass && translatedFormat) {
      return `${translatedClass} - ${translatedFormat}`;
    }
  }
  if ((match = content.match(/^(\d+) out of (\d+)$/))) {
    return `已选 ${match[1]} 张，最多 ${match[2]} 张`;
  }

  if ((match = content.match(/^Show ([\d,]+)$/))) {
    return `显示 ${match[1]} 条`;
  }
  if ((match = content.match(/^Min ([\d,]+) Finishes?$/))) {
    return `至少完赛 ${match[1]} 次`;
  }
  if ((match = content.match(/^Min ([\d,]+)$/))) {
    return `至少 ${match[1]} 局`;
  }
  if ((match = content.match(/^Top ([\d,]+)(k?)$/i))) {
    const value = Number(match[1].replaceAll(',', '')) * (match[2] ? 1000 : 1);
    return `前 ${value.toLocaleString('zh-CN')} 名`;
  }
  if ((match = content.match(/^Total Players: ([\d,]+)$/))) {
    return `玩家总数：${match[1]}`;
  }
  if ((match = content.match(/^(\d{4}) Standard$/))) {
    return `${match[1]} 标准模式`;
  }
  if ((match = content.match(/^(\d{4}) Announcement$/))) {
    return `${match[1]} 年公告`;
  }
  if (
    (match = content.match(
      /^(?:(China) )?(\d{4}) (Spring|Summer|Fall|Winter)$/,
    ))
  ) {
    const seasonNames: Readonly<Record<string, string>> = {
      Spring: '春季',
      Summer: '夏季',
      Fall: '秋季',
      Winter: '冬季',
    };
    const country = match[1] ? '中国 ' : '';
    return `${country}${match[2]} 年${seasonNames[match[3]]}`;
  }
  if ((match = content.match(/^(\d{4}) Last Chance$/))) {
    return `${match[1]} 年最终资格赛`;
  }
  if ((match = content.match(/^Past (\d+) Hours?$/))) {
    return `过去 ${match[1]} 小时`;
  }
  if (content === 'Past Day') return '过去 1 天';
  if ((match = content.match(/^Past (\d+) Days?$/i))) {
    return `过去 ${match[1]} 天`;
  }
  if (content === 'Past Week') return '过去 1 周';
  if ((match = content.match(/^Past (\d+) Weeks?$/i))) {
    return `过去 ${match[1]} 周`;
  }
  if (content === 'Last hour') return '最近 1 小时';
  if (content === 'Last day') return '最近 1 天';
  if ((match = content.match(/^Last (\d+) hours?$/i))) {
    return `最近 ${match[1]} 小时`;
  }
  if ((match = content.match(/^Last (\d+) days?$/i))) {
    return `最近 ${match[1]} 天`;
  }
  if ((match = content.match(/^(\d+) (second|minute|hour|day|week)s? ago$/i))) {
    const units: Readonly<Record<string, string>> = {
      second: '秒',
      minute: '分钟',
      hour: '小时',
      day: '天',
      week: '周',
    };
    return `${match[1]} ${units[match[2].toLowerCase()]}前`;
  }
  if ((match = content.match(/^VS (.+)$/))) {
    const opponent = dictionary[match[1]];
    if (opponent) return `对阵${opponent}`;
  }
  if ((match = content.match(/^([\d,]+) Games?$/))) {
    return `${match[1]} 局`;
  }
  if ((match = content.match(/^Games: ([\d,]+)$/))) {
    return `对局数：${match[1]}`;
  }
  if ((match = content.match(/^Peaked By: (.+)$/))) {
    return `最高排名玩家：${match[1]}`;
  }
  if ((match = content.match(/^First Streamed: (.+)$/))) {
    return `首次直播：${match[1]}`;
  }
  if ((match = content.match(/^# Streamed: ([\d,]+)$/))) {
    return `直播次数：${match[1]}`;
  }
  if ((match = content.match(/^Connections \((\d+)\/(\d+)\)$/))) {
    return `连接（${match[1]}/${match[2]}）`;
  }
  if ((match = content.match(/^Tier: (.+?) \| Ad Free: (.+)$/))) {
    return `等级：${match[1]} | 无广告：${match[2]}`;
  }

  return undefined;
}
