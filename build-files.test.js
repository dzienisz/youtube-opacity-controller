const test = require('node:test');
const assert = require('node:assert/strict');
const buildFiles = require('./scripts/build-files');
const manifest = require('./manifest.json');

test('build files include the welcome page and its assets', () => {
  for (const file of ['welcome.html', 'welcome.css', 'welcome.js', 'welcome']) {
    assert.ok(buildFiles.includes(file), `${file} is missing from scripts/build-files.js`);
  }
});

test('manifest permissions remain limited to storage and activeTab', () => {
  assert.deepEqual(manifest.permissions, ['storage', 'activeTab']);
});
