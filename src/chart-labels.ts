import { translateDeckName } from './i18n/deck-names';
import { translateText, type TranslationDictionary } from './i18n/translator';

interface CanvasTextMethods {
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
}

interface ChartCanvasContext extends CanvasTextMethods {
  canvas?: {
    closest?(selector: string): Element | null;
  };
}

interface ChartJsInstance {
  draw?(): void;
  stop?(): void;
  update(mode?: string): void;
}

interface ChartJsHook {
  chart?: ChartJsInstance;
  el?: Element;
}

interface LiveViewWithHooks {
  getHook?(element: Element): ChartJsHook | undefined;
  viewHooks?: Record<string, ChartJsHook>;
}

interface LiveSocketWithHooks {
  getViewByEl?(element: Element): LiveViewWithHooks | undefined;
  main?: LiveViewWithHooks;
}

const installedPrototypes = new WeakSet<object>();

/** 翻译 Chart.js 绘制的坐标轴、数据标签和提示框文字。 */
export function translateChartText(
  source: string,
  dictionary: TranslationDictionary,
): string {
  const interfaceText = translateText(source, dictionary);
  if (interfaceText !== source) return interfaceText;

  const tooltip = source.match(/^(.+?)(:\s.*)$/s);
  if (tooltip) {
    const deckName = translateDeckName(tooltip[1]);
    if (deckName !== tooltip[1]) return `${deckName}${tooltip[2]}`;
  }

  return translateDeckName(source);
}

function isHsguruChart(context: ChartCanvasContext): boolean {
  return Boolean(context.canvas?.closest?.('[phx-hook="ChartJs"]'));
}

/**
 * Chart.js 将文字直接绘制到 Canvas，DOM 翻译器无法处理。
 * 包装文字绘制与测量方法，可在保持图表布局一致的同时翻译标签。
 */
export function installChartLabelTranslation(
  prototype: CanvasTextMethods | undefined,
  dictionary: TranslationDictionary,
  isEnabled: () => boolean,
): boolean {
  if (!prototype || installedPrototypes.has(prototype)) return false;
  installedPrototypes.add(prototype);

  const originalFillText = prototype.fillText;
  const originalMeasureText = prototype.measureText;
  const originalStrokeText = prototype.strokeText;

  const localize = (context: ChartCanvasContext, text: unknown): string => {
    const source = String(text);
    return isEnabled() && isHsguruChart(context)
      ? translateChartText(source, dictionary)
      : source;
  };

  prototype.fillText = function (
    this: ChartCanvasContext,
    text,
    x,
    y,
    maxWidth?,
  ): void {
    const translated = localize(this, text);
    if (maxWidth === undefined) originalFillText.call(this, translated, x, y);
    else originalFillText.call(this, translated, x, y, maxWidth);
  };
  prototype.measureText = function (
    this: ChartCanvasContext,
    text,
  ): TextMetrics {
    return originalMeasureText.call(this, localize(this, text));
  };
  prototype.strokeText = function (
    this: ChartCanvasContext,
    text,
    x,
    y,
    maxWidth?,
  ): void {
    const translated = localize(this, text);
    if (maxWidth === undefined) originalStrokeText.call(this, translated, x, y);
    else originalStrokeText.call(this, translated, x, y, maxWidth);
  };

  return true;
}

/** 通过 Phoenix LiveView 的 ChartJs Hook 立即重绘当前页面上的图表。 */
export function redrawHsguruCharts(
  root: ParentNode,
  liveSocket: unknown,
): number {
  const socket = liveSocket as LiveSocketWithHooks | undefined;
  if (!socket) return 0;

  let redrawn = 0;
  for (const element of root.querySelectorAll('[phx-hook="ChartJs"]')) {
    let view: LiveViewWithHooks | undefined;
    try {
      view = socket.getViewByEl?.(element) ?? socket.main;
    } catch {
      view = socket.main;
    }
    const hook =
      view?.getHook?.(element) ??
      Object.values(view?.viewHooks ?? {}).find((item) => item.el === element);
    const chart = hook?.chart;
    if (!chart?.update) continue;
    chart.stop?.();
    chart.update('none');
    chart.draw?.();
    redrawn += 1;
  }
  return redrawn;
}

/** 通过实际尺寸变化触发 Chart.js 的 ResizeObserver，作为实例查找失败时的兜底。 */
export function nudgeHsguruCharts(
  root: ParentNode,
  restoreLater: (callback: () => void) => void,
): number {
  let nudged = 0;
  for (const element of root.querySelectorAll('[phx-hook="ChartJs"]')) {
    const container = element as HTMLElement;
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
