import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHsguruDeckCopyText,
  installDeckClipboardTranslation,
  translateCopiedDeckText,
} from '../src/clipboard';

const wildDeck = [
  '### XL Blood DK',
  '# Class: Death Knight',
  '# Format: Wild',
  '#',
  '# 2x (1) Example Card',
  '#',
  'AAEBAfHhBA6X7wTtWSoAbHpAa7sQaWywap9QaCmAeRqweZsQfQvwfqyQe=',
].join('\n');

const hsguruCopiedDeck = [
  '### Zee Shaman',
  'AAECAaoICNOeBsODB9C/B4LUB5vUB9DbB4jdB9/lBwue1ATt5gbgnQeYrAexsAePvge1wAfJwAfJ2wfI5Qfm/QcAAA==',
  '### You can view this deck at https://www.hsguru.com/deck/41132478',
].join('\n');

test('translates only the deck-name line in copied Hearthstone text', () => {
  const translated = translateCopiedDeckText(wildDeck);
  assert.equal(translated.split('\n')[0], '### XL血DK');
  assert.equal(
    translated.split('\n').slice(1).join('\n'),
    wildDeck.split('\n').slice(1).join('\n'),
  );
});

test('leaves unrelated copied text unchanged', () => {
  assert.equal(
    translateCopiedDeckText('### XL Blood DK\nordinary markdown'),
    '### XL Blood DK\nordinary markdown',
  );
});

test('translates the compact text copied by the HSGuru deck button', () => {
  const translated = translateCopiedDeckText(hsguruCopiedDeck);
  assert.equal(translated.split('\n')[0], '### 随从萨');
  assert.equal(
    translated.split('\n').slice(1).join('\n'),
    hsguruCopiedDeck.split('\n').slice(1).join('\n'),
  );
});

test('translates deckviewer ClipboardJS text for a dynamically added deck', () => {
  const deckviewerText = [
    '### Clone Mech Paladin',
    'AAEBAZ8FBJ+3A/mkBMekBp3dBw2l9QKHrgOStQTUvQTa0wSEpQXZ0AW5/gXi8Qa/+Qa6lgfa4gea/AcAAQTX/gKd3QfzswbHpAb2swbHpAbu3gbHpAYAAA==',
    '### You can view this deck at https://www.hsguru.com/deckviewer',
  ].join('\n');

  assert.equal(
    translateCopiedDeckText(deckviewerText).split('\n')[0],
    '### 复制机械骑',
  );
});

test('creates the exact translated text written by the intercepted copy button', () => {
  assert.equal(
    createHsguruDeckCopyText(
      'Two-Bit Rogue',
      'AAECAaIHBpegBM2eBoaoB4eoB4ioB4jZBwz3nwTQngbZogb3gQfBlweaswf5wwfVxQeh2AeN2ge/9wfl9wcAAA==',
      'https://www.hsguru.com/deck/41070707',
    ),
    [
      '### 二费贼',
      'AAECAaIHBpegBM2eBoaoB4eoB4ioB4jZBwz3nwTQngbZogb3gQfBlweaswf5wwfVxQeh2AeN2ge/9wfl9wcAAA==',
      '### You can view this deck at https://www.hsguru.com/deck/41070707',
    ].join('\n'),
  );
});

test('wraps clipboard writes and respects the translation toggle', async () => {
  const writes: string[] = [];
  const clipboard = {
    async writeText(text: string) {
      writes.push(text);
    },
  };
  let enabled = true;

  assert.equal(
    installDeckClipboardTranslation(clipboard, () => enabled),
    true,
  );
  await clipboard.writeText(wildDeck);
  enabled = false;
  await clipboard.writeText(wildDeck);

  assert.equal(writes[0].split('\n')[0], '### XL血DK');
  assert.equal(writes[1], wildDeck);
});

test('wraps a non-extensible browser-style clipboard through its prototype', async () => {
  class BrowserClipboard {
    readonly writes: string[] = [];

    async writeText(text: string) {
      this.writes.push(text);
    }
  }

  const clipboard = Object.preventExtensions(new BrowserClipboard());
  assert.equal(
    installDeckClipboardTranslation(clipboard, () => true),
    true,
  );
  await clipboard.writeText(hsguruCopiedDeck);

  assert.equal(clipboard.writes[0].split('\n')[0], '### 随从萨');
});
