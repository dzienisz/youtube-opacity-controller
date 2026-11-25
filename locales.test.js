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

test('store names and descriptions meet listing limits and keep YouTube untranslated', () => {
  for (const locale of locales) {
    const messages = readMessages(locale);
    const name = messages.appName.message;
    const description = messages.appDesc.message;
    assert.ok(name.length <= 45, `${locale}:appName exceeds 45 characters`);
    assert.ok(description.length <= 132, `${locale}:appDesc exceeds 132 characters`);
    assert.ok(name.includes('YouTube'), `${locale}:appName must keep YouTube untranslated`);
    assert.ok(description.includes('YouTube'), `${locale}:appDesc must keep YouTube untranslated`);
  }
});

test('welcome comparison images have localized alt text', () => {
  for (const locale of locales) {
    const messages = readMessages(locale);
    for (const key of ['welcomeBeforeAlt', 'welcomeAfterAlt']) {
      assert.ok(messages[key]?.message.trim(), `${locale}:${key} is missing or empty`);
    }
  }
});
