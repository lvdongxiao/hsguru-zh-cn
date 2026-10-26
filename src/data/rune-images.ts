import type { DeckRune } from '../i18n/deck-names';

// 根据游戏符文的外形和主纹样重绘的矢量图，非暴雪原版矢量素材。
// 参考：https://hearthstone.blizzard.com/en-us/news/23852696
// 小尺寸下简化纹理；所有图形都由路径、几何图形和渐变构成。
export const runeSvgSources: Readonly<Record<DeckRune, string>> = {
  B: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 135">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#fff4b2"/><stop offset=".3" stop-color="#d8ad49"/>
      <stop offset=".53" stop-color="#8b5126"/><stop offset=".78" stop-color="#f5d783"/>
      <stop offset="1" stop-color="#68401e"/>
    </linearGradient>
    <linearGradient id="ruby" x1=".15" y1="0" x2=".8" y2="1">
      <stop stop-color="#fa6951"/><stop offset=".48" stop-color="#c92537"/>
      <stop offset="1" stop-color="#631839"/>
    </linearGradient>
  </defs>
  <path d="M67.5 2 133 67.5 67.5 133 2 67.5Z" fill="#241d24" stroke="#111b21" stroke-width="3"/>
  <path d="M67.5 8 127 67.5 67.5 127 8 67.5Z" fill="url(#gold)"/>
  <path d="M67.5 17 118 67.5 67.5 118 17 67.5Z" fill="#49312c" stroke="#fff2ad" stroke-width="1.5"/>
  <path d="M67.5 23 112 67.5 67.5 112 23 67.5Z" fill="url(#ruby)" stroke="#ffad68" stroke-width="2"/>
  <path d="M67.5 23 23 67.5 48 64Z" fill="#ff9a70" opacity=".45"/>
  <path d="m67.5 23 44.5 44.5-29-8Z" fill="#ed4a45" opacity=".6"/>
  <path d="m23 67.5 44.5 44.5-17-27Z" fill="#67213b" opacity=".6"/>
  <path d="M67.5 37C64 51 49 64 49 77c0 24 37 24 37 0 0-13-15-26-18.5-40Z" fill="#351934" stroke="#ec5862" stroke-width="2.5"/>
  <path d="M65 51c-3 9-10 17-10 26 0 10 5 15 12 16" fill="none" stroke="#7c2c51" stroke-width="3" stroke-linecap="round"/>
  <path d="M16 67.5 67.5 16 119 67.5" fill="none" stroke="#fff2b8" stroke-width="2" stroke-linejoin="round"/>
</svg>`,
  F: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 135">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2=".8" y2="1">
      <stop stop-color="#fff2a8"/><stop offset=".32" stop-color="#b98130"/>
      <stop offset=".56" stop-color="#fff0a1"/><stop offset="1" stop-color="#745028"/>
    </linearGradient>
    <radialGradient id="ice" cx=".4" cy=".3" r=".8">
      <stop stop-color="#49e3ff"/><stop offset=".48" stop-color="#1e99d9"/>
      <stop offset="1" stop-color="#15528c"/>
    </radialGradient>
  </defs>
  <circle cx="67.5" cy="67.5" r="59" fill="#17262b"/>
  <circle cx="67.5" cy="67.5" r="55" fill="url(#gold)" stroke="#5e412b" stroke-width="2"/>
  <circle cx="67.5" cy="67.5" r="47" fill="#352b35" stroke="#ffeaa3" stroke-width="1.5"/>
  <circle cx="67.5" cy="67.5" r="43" fill="url(#ice)" stroke="#7cf1f6" stroke-width="3"/>
  <circle cx="67.5" cy="67.5" r="37" fill="none" stroke="#98f3ff" stroke-width="1.3" opacity=".65"/>
  <g fill="#202b58" stroke="#4dcbed" stroke-width="1.5" stroke-linejoin="round">
    <path d="M67.5 35C53 43 51 52 61 61l6.5 6.5L74 61c10-9 8-18-6.5-26Z"/>
    <path d="M100 67.5C92 53 83 51 74 61l-6.5 6.5L74 74c9 10 18 8 26-6.5Z"/>
    <path d="M67.5 100C82 92 84 83 74 74l-6.5-6.5L61 74c-10 9-8 18 6.5 26Z"/>
    <path d="M35 67.5C43 82 52 84 61 74l6.5-6.5L61 61c-9-10-18-8-26 6.5Z"/>
  </g>
  <path d="M29 39a48 48 0 0 1 61-17" fill="none" stroke="#fff3b5" stroke-width="3" stroke-linecap="round"/>
  <path d="M104 97a48 48 0 0 1-34 18" fill="none" stroke="#bd852d" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  U: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 135">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#fff6bb"/><stop offset=".3" stop-color="#d5ac4d"/>
      <stop offset=".6" stop-color="#805329"/><stop offset=".82" stop-color="#ebd287"/>
      <stop offset="1" stop-color="#63452a"/>
    </linearGradient>
    <radialGradient id="venom" cx=".35" cy=".2" r="1">
      <stop stop-color="#83ce35"/><stop offset=".55" stop-color="#3c8e3a"/>
      <stop offset="1" stop-color="#1b4e39"/>
    </radialGradient>
  </defs>
  <path d="m21 20 94-1 1 96-95 1Z" fill="#212a23" stroke="#132029" stroke-width="3"/>
  <path d="M25 24h86v87H25Z" fill="url(#gold)"/>
  <path d="m25 24 11 11h64l11-11Z" fill="#fff0a5"/>
  <path d="m25 24 11 11v65l-11 11Z" fill="#d8b65b"/>
  <path d="m111 24-11 11v65l11 11Z" fill="#69462a"/>
  <path d="M35 34h66v67H35Z" fill="url(#venom)" stroke="#bdf263" stroke-width="2.5"/>
  <path d="M40 39h56v57H40Z" fill="none" stroke="#2a5c35" stroke-width="2"/>
  <path d="M68 44c-16-1-25 8-25 21 0 8 3 13 9 17v14h9V85h6v11h7V85h6v11h6V81c6-4 8-10 8-18 0-12-10-20-26-19Z" fill="#243b44" stroke="#9fdd43" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="m50 61 14 5-5 8-8-4Zm35 0-14 5 5 8 8-4ZM67.5 72l-5 8h10Z" fill="#91d443"/>
  <path d="M51 51c8-6 21-7 31-1" fill="none" stroke="#3c6260" stroke-width="2" stroke-linecap="round"/>
  <path d="M30 27h78M28 29v77" fill="none" stroke="#fff7ca" stroke-width="1.5" opacity=".75"/>
</svg>`,
};

const svgDataUrl = (source: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

export const runeImages: Readonly<Record<DeckRune, string>> = {
  B: svgDataUrl(runeSvgSources.B),
  F: svgDataUrl(runeSvgSources.F),
  U: svgDataUrl(runeSvgSources.U),
};
