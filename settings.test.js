const test = require('node:test');
const assert = require('node:assert/strict');
const settings = require('./settings.js');

test('migrates legacy settings without losing user preferences', () => {
  assert.deepEqual(settings.migrateSettings({
    overlayOpacity: 0.42,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 2,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.42,
    alwaysShowControls: true
  });
});

test('normalizes invalid and out-of-range settings', () => {
  assert.deepEqual(settings.normalizeSettings({
    extensionEnabled: 'yes',
    accessibilityProfile: 'unknown',
    overlayOpacity: 12,
    alwaysShowControls: 1
  }), {
    settingsSchemaVersion: 2,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 1,
    alwaysShowControls: false
  });
});

test('returns a defined opacity for every profile', () => {
  assert.equal(settings.getProfileOpacity('standard'), 0.7);
  assert.equal(settings.getProfileOpacity('high-contrast'), 0.9);
  assert.equal(settings.getProfileOpacity('low-vision'), 0.95);
  assert.equal(settings.getProfileOpacity('missing'), 0.7);
});

test('applies storage changes and normalizes the result', () => {
  assert.deepEqual(settings.applyStorageChanges(settings.DEFAULTS, {
    accessibilityProfile: { oldValue: 'standard', newValue: 'low-vision' },
    overlayOpacity: { oldValue: 0.7, newValue: -2 }
  }), {
    settingsSchemaVersion: 2,
    extensionEnabled: true,
    accessibilityProfile: 'low-vision',
    overlayOpacity: 0,
    alwaysShowControls: false
  });
});

test('defaults can be copied for reset without mutation', () => {
  const reset = { ...settings.DEFAULTS };
  reset.overlayOpacity = 0.2;

  assert.equal(settings.DEFAULTS.overlayOpacity, 0.7);
  assert.equal(settings.areSettingsEqual(settings.DEFAULTS, settings.normalizeSettings({})), true);
});
