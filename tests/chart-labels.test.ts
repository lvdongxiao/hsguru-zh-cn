import assert from 'node:assert/strict';
import test from 'node:test';
import {
  installChartLabelTranslation,
  nudgeHsguruCharts,
  redrawHsguruCharts,
  translateChartText,
} from '../src/chart-labels';
import { dictionary } from '../src/i18n/dictionary';

test('translates meta chart axes, classes, and deck labels', () => {
  assert.equal(translateChartText('Winrate', dictionary), '胜率');
  assert.equal(translateChartText('Popularity', dictionary), '热度');
  assert.equal(translateChartText('Death Knight', dictionary), '死亡骑士');
  assert.equal(translateChartText('Unholy DK', dictionary), '邪DK');
  assert.equal(translateChartText('Garona Rogue', dictionary), '迦罗娜贼');
});

test('translates a deck name inside a chart tooltip', () => {
  assert.equal(
    translateChartText('Harold Egglock: (50.3, 0.1)', dictionary),
    '兆示蛋术: (50.3, 0.1)',
  );
});

test('leaves unrelated chart text unchanged', () => {
  assert.equal(translateChartText('54.0', dictionary), '54.0');
  assert.equal(translateChartText('(54.0, 0.6)', dictionary), '(54.0, 0.6)');
});

test('wraps canvas text methods only for enabled HSGuru charts', () => {
  const rendered: string[] = [];
  let enabled = true;
  const prototype = {
    fillText(text: string): void {
      rendered.push(`fill:${text}`);
    },
    measureText(text: string): TextMetrics {
      rendered.push(`measure:${text}`);
      return {} as TextMetrics;
    },
    strokeText(text: string): void {
      rendered.push(`stroke:${text}`);
    },
  };

  assert.equal(
    installChartLabelTranslation(prototype, dictionary, () => enabled),
    true,
  );

  const chartContext = Object.assign(Object.create(prototype), {
    canvas: { closest: () => ({}) as Element },
  }) as typeof prototype;
  const otherContext = Object.assign(Object.create(prototype), {
    canvas: { closest: () => null },
  }) as typeof prototype;

  chartContext.fillText('Garona Rogue');
  chartContext.measureText('Winrate');
  chartContext.fillText(54 as unknown as string);
  otherContext.strokeText('Toki Mage');
  enabled = false;
  chartContext.fillText('Unholy DK');

  assert.deepEqual(rendered, [
    'fill:迦罗娜贼',
    'measure:胜率',
    'fill:54',
    'stroke:Toki Mage',
    'fill:Unholy DK',
  ]);
});

test('redraws existing Chart.js instances through their LiveView hooks', () => {
  const elements = [{ id: 'first' }, { id: 'second' }] as Element[];
  const updates: string[] = [];
  const root = {
    querySelectorAll: () => elements,
  } as unknown as ParentNode;
  const liveSocket = {
    main: {
      viewHooks: Object.fromEntries(
        elements.map((element) => [
          element.id,
          {
            el: element,
            chart: {
              update: (mode?: string) => updates.push(`${element.id}:${mode}`),
            },
          },
        ]),
      ),
    },
  };

  assert.equal(redrawHsguruCharts(root, liveSocket), 2);
  assert.deepEqual(updates, ['first:none', 'second:none']);
});

test('nudges chart containers when a LiveView chart instance is unavailable', () => {
  const style = { width: '' };
  const element = {
    style,
    getBoundingClientRect: () => ({ width: 840 }),
  };
  const root = {
    querySelectorAll: () => [element],
  } as unknown as ParentNode;
  const pending: Array<() => void> = [];

  assert.equal(
    nudgeHsguruCharts(root, (callback) => pending.push(callback)),
    1,
  );
  assert.equal(style.width, '839px');
  pending[0]();
  assert.equal(style.width, '');
});
