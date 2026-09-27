const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const localesDir = path.join(__dirname, '_locales');
const locales = fs.readdirSync(localesDir)
  .filter(dir => fs.existsSync(path.join(localesDir, dir, 'messages.json')));

const readMessages = locale =>
  JSON.parse(fs.readFileSync(path.join(localesDir, locale, 'messages.json'), 'utf8'));

const en = readMessages('en');
const enKeys = Object.keys(en).sort();

test('every locale defines exactly the same keys as en', () => {
  for (const locale of locales) {
    const keys = Object.keys(readMessages(locale)).sort();
    assert.deepEqual(keys, enKeys, `${locale} key set differs from en`);
  }
});

test('every locale keeps the same placeholder names as en', () => {
  for (const locale of locales) {
    const messages = readMessages(locale);
    for (const key of enKeys) {
      const enPlaceholders = Object.keys(en[key].placeholders || {}).sort();
      const placeholders = Object.keys(messages[key].placeholders || {}).sort();
      assert.deepEqual(placeholders, enPlaceholders, `${locale}:${key} placeholders differ`);
    }
  }
});

test('every message has a non-empty translated string', () => {
  for (const locale of locales) {
    const messages = readMessages(locale);
    for (const key of enKeys) {
      assert.ok(
        typeof messages[key].message === 'string' && messages[key].message.trim().length > 0,
        `${locale}:${key} message is missing or empty`
      );
    }
  }
});
