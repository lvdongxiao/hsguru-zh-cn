import assert from 'node:assert/strict';
import test from 'node:test';
import { findOutermostNodes } from '../src/mutation-roots';

class TestNode {
  readonly children: TestNode[] = [];
  parent: TestNode | null = null;

  constructor(readonly name: string) {}

  append(...children: TestNode[]): this {
    for (const child of children) child.parent = this;
    this.children.push(...children);
    return this;
  }
}

const getParent = (node: TestNode) => node.parent;

test('keeps only an existing outermost mutation root', () => {
  const child = new TestNode('child');
  const grandchild = new TestNode('grandchild');
  const parent = new TestNode('parent').append(child.append(grandchild));

  assert.deepEqual(findOutermostNodes([parent, child, grandchild], getParent), [
    parent,
  ]);
});

test('replaces previously collected descendants when their ancestor appears later', () => {
  const child = new TestNode('child');
  const grandchild = new TestNode('grandchild');
  const parent = new TestNode('parent').append(child.append(grandchild));

  assert.deepEqual(findOutermostNodes([grandchild, child, parent], getParent), [
    parent,
  ]);
});

test('deduplicates nodes while preserving disconnected root order', () => {
  const first = new TestNode('first');
  const secondChild = new TestNode('second-child');
  const second = new TestNode('second').append(secondChild);

  assert.deepEqual(
    findOutermostNodes([first, first, secondChild, second], getParent),
    [first, second],
  );
});
