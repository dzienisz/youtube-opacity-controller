const test = require('node:test');
const assert = require('node:assert/strict');
const settings = require('./settings.js');
const messages = require('./_locales/en/messages.json');

test('migrates legacy settings without losing user preferences', () => {
  assert.deepEqual(settings.migrateSettings({
    overlayOpacity: 0.42,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 4,
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

test('empty storage gets the recommended settings', () => {
  assert.deepEqual(settings.migrateSettings({}), settings.RECOMMENDED);
  assert.equal(settings.DEFAULTS, settings.RECOMMENDED);
});

test('schema 3 partial settings are filled from legacy defaults', () => {
  assert.deepEqual(settings.migrateSettings({
    settingsSchemaVersion: 3,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 4,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.7,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: false,
    captionColor: 'white'
  });
});

test('schema 3 settings missing readable captions keep that feature off', () => {
  const stored = {
    ...settings.LEGACY_DEFAULTS,
    settingsSchemaVersion: 3
  };
  delete stored.readableCaptions;

  assert.equal(settings.migrateSettings(stored).readableCaptions, false);
});

test('schema 4 settings preserve their stored values', () => {
  const stored = {
    ...settings.RECOMMENDED,
    overlayOpacity: 0.65,
    alwaysShowControls: true
  };

  assert.deepEqual(settings.migrateSettings(stored), stored);
});

test('migrates schema 2 settings preserving new option defaults', () => {
  assert.deepEqual(settings.migrateSettings({
    settingsSchemaVersion: 2,
    extensionEnabled: false,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0.9,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 4,
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

test('migrates the removed low-vision profile to high contrast and preserves opacity', () => {
  const stored = {
    ...settings.DEFAULTS,
    accessibilityProfile: 'low-vision',
    overlayOpacity: 0.95
  };
  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.accessibilityProfile, 'high-contrast');
  assert.equal(migrated.overlayOpacity, 0.95);
  assert.equal(settings.needsMigration(stored, migrated), true);
  assert.equal(settings.needsMigration(migrated, settings.migrateSettings(migrated)), false);
});

test('readable caption defaults are on with white text', () => {
  assert.equal(settings.DEFAULTS.readableCaptions, true);
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

test('migrates schema 3 settings missing readable captions to the legacy default', () => {
  const stored = { ...settings.LEGACY_DEFAULTS, settingsSchemaVersion: 3 };
  delete stored.readableCaptions;
  delete stored.captionColor;

  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.settingsSchemaVersion, 4);
  assert.equal(migrated.readableCaptions, false);
  assert.equal(settings.needsMigration(stored, migrated), true);
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
    settingsSchemaVersion: 4,
    extensionEnabled: true,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 1,
    alwaysShowControls: false,
    progressBarSize: 'large',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white'
  });
});

test('returns a defined opacity for every profile', () => {
  assert.equal(settings.getProfileOpacity('standard'), 0.7);
  assert.equal(settings.getProfileOpacity('high-contrast'), 0.9);
  assert.equal(settings.getProfileOpacity('missing'), 0.9);
});

test('applies storage changes and normalizes the result', () => {
  assert.deepEqual(settings.applyStorageChanges(settings.DEFAULTS, {
    accessibilityProfile: { oldValue: 'standard', newValue: 'high-contrast' },
    overlayOpacity: { oldValue: 0.7, newValue: -2 },
    highlightColor: { oldValue: 'default', newValue: 'cyan' }
  }), {
    settingsSchemaVersion: 4,
    extensionEnabled: true,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0,
    alwaysShowControls: false,
    progressBarSize: 'large',
    highlightColor: 'cyan',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white'
  });
});

test('defaults can be copied for reset without mutation', () => {
  const reset = { ...settings.DEFAULTS };
  reset.overlayOpacity = 0.2;

  assert.equal(settings.DEFAULTS.overlayOpacity, 0.9);
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
  assert.equal(settings.cycleProfile('high-contrast'), 'standard');
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
    accessibilityProfile: 'high-contrast',
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
