const test = require('node:test');
const assert = require('node:assert/strict');
const settings = require('./settings.js');
const messages = require('./_locales/en/messages.json');

test('migrates legacy settings without losing user preferences', () => {
  assert.deepEqual(settings.migrateSettings({
    overlayOpacity: 0.42,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 3,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.42,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: false,
    captionColor: 'white'
  });
});

test('migrates schema 2 settings preserving new option defaults', () => {
  assert.deepEqual(settings.migrateSettings({
    settingsSchemaVersion: 2,
    extensionEnabled: false,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0.9,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 3,
    extensionEnabled: false,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0.9,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: false,
    captionColor: 'white'
  });
});

test('readable caption defaults are off with white text', () => {
  assert.equal(settings.DEFAULTS.readableCaptions, false);
  assert.equal(settings.DEFAULTS.captionColor, 'white');
});

test('needsMigration returns false for already-migrated defaults', () => {
  assert.equal(settings.needsMigration(settings.DEFAULTS, settings.DEFAULTS), false);
});

test('needsMigration returns true for empty or null stored settings', () => {
  assert.equal(settings.needsMigration({}, settings.DEFAULTS), true);
  assert.equal(settings.needsMigration(null, settings.DEFAULTS), true);
});

test('needsMigration returns true when a stored setting differs', () => {
  const oldSettings = {
    settingsSchemaVersion: 2,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.7,
    alwaysShowControls: false,
    progressBarSize: 'default',
    largeCursor: false
  };

  assert.equal(settings.needsMigration(oldSettings, settings.migrateSettings(oldSettings)), true);
});

test('needsMigration adds readable caption defaults to stored schema 3 settings', () => {
  const stored = { ...settings.DEFAULTS };
  delete stored.readableCaptions;
  delete stored.captionColor;

  assert.equal(stored.settingsSchemaVersion, 3);
  assert.equal(settings.needsMigration(stored, settings.migrateSettings(stored)), true);
});

test('profile message keys cover every profile and exist in English messages', () => {
  for (const profile of settings.PROFILE_VALUES) {
    const messageKey = settings.PROFILE_MESSAGE_KEYS[profile];
    assert.ok(messageKey, `missing message key for profile: ${profile}`);
    assert.ok(messages[messageKey], `missing English message: ${messageKey}`);
  }
});

test('normalizes invalid and out-of-range settings', () => {
  assert.deepEqual(settings.normalizeSettings({
    extensionEnabled: 'yes',
    accessibilityProfile: 'unknown',
    overlayOpacity: 12,
    alwaysShowControls: 1,
    progressBarSize: 'huge',
    highlightColor: 'orange',
    largeCursor: 'yes',
    readableCaptions: 'yes',
    captionColor: 'pink'
  }), {
    settingsSchemaVersion: 3,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 1,
    alwaysShowControls: false,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: false,
    captionColor: 'white'
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
    overlayOpacity: { oldValue: 0.7, newValue: -2 },
    highlightColor: { oldValue: 'default', newValue: 'cyan' }
  }), {
    settingsSchemaVersion: 3,
    extensionEnabled: true,
    accessibilityProfile: 'low-vision',
    overlayOpacity: 0,
    alwaysShowControls: false,
    progressBarSize: 'default',
    highlightColor: 'cyan',
    largeCursor: false,
    readableCaptions: false,
    captionColor: 'white'
  });
});

test('defaults can be copied for reset without mutation', () => {
  const reset = { ...settings.DEFAULTS };
  reset.overlayOpacity = 0.2;

  assert.equal(settings.DEFAULTS.overlayOpacity, 0.7);
  assert.equal(settings.areSettingsEqual(settings.DEFAULTS, settings.normalizeSettings({})), true);
  assert.equal(settings.areSettingsEqual(settings.DEFAULTS, {
    ...settings.DEFAULTS,
    readableCaptions: true,
    captionColor: 'yellow'
  }), false);
  assert.equal(settings.areSettingsEqual(settings.DEFAULTS, { ...settings.DEFAULTS }), true);
});

test('cycleProfile advances and wraps around', () => {
  assert.equal(settings.cycleProfile('standard'), 'high-contrast');
  assert.equal(settings.cycleProfile('high-contrast'), 'low-vision');
  assert.equal(settings.cycleProfile('low-vision'), 'standard');
  assert.equal(settings.cycleProfile('missing'), 'standard');
});

test('applyCommand toggles enhancements on and off', () => {
  const off = settings.applyCommand(settings.DEFAULTS, 'toggle-enhancements');
  assert.equal(off.extensionEnabled, false);
  const on = settings.applyCommand(off, 'toggle-enhancements');
  assert.equal(on.extensionEnabled, true);
});

test('applyCommand cycle-profile advances profile, opacity, and re-enables', () => {
  const disabled = settings.normalizeSettings({
    extensionEnabled: false,
    accessibilityProfile: 'low-vision',
    readableCaptions: true,
    captionColor: 'yellow'
  });
  const next = settings.applyCommand(disabled, 'cycle-profile');
  assert.equal(next.accessibilityProfile, 'standard');
  assert.equal(next.overlayOpacity, 0.7);
  assert.equal(next.extensionEnabled, true);
  assert.equal(next.readableCaptions, true);
  assert.equal(next.captionColor, 'yellow');
});

test('applyCommand toggles always-show controls', () => {
  const on = settings.applyCommand(settings.DEFAULTS, 'toggle-always-show');
  assert.equal(on.alwaysShowControls, true);
  assert.equal(settings.applyCommand(on, 'toggle-always-show').alwaysShowControls, false);
});

test('applyCommand returns normalized settings for unknown commands', () => {
  const unknown = settings.applyCommand({ overlayOpacity: 9 }, 'not-a-command');
  assert.deepEqual(unknown, settings.normalizeSettings({ overlayOpacity: 9 }));
});
