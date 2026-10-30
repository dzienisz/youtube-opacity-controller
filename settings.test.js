const test = require('node:test');
const assert = require('node:assert/strict');
const settings = require('./settings.js');
const messages = require('./_locales/en/messages.json');

test('migrates legacy settings without losing user preferences', () => {
  assert.deepEqual(settings.migrateSettings({
    overlayOpacity: 0.42,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 6,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.42,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white',
    highlightCustomColor: '#ff0033',
    highlightGradientColor: '',
    scrubberIcon: 'default',
    respectVideoTheme: true
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
    settingsSchemaVersion: 6,
    extensionEnabled: true,
    accessibilityProfile: 'standard',
    overlayOpacity: 0.7,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white',
    highlightCustomColor: '#ff0033',
    highlightGradientColor: '',
    scrubberIcon: 'default',
    respectVideoTheme: true
  });
});

test('schema 3 settings missing readable captions turn them on', () => {
  const stored = {
    ...settings.LEGACY_DEFAULTS,
    settingsSchemaVersion: 3
  };
  delete stored.readableCaptions;

  assert.equal(settings.migrateSettings(stored).readableCaptions, true);
});

test('schema 5 settings preserve their stored values', () => {
  const stored = {
    ...settings.RECOMMENDED,
    settingsSchemaVersion: 6,
    readableCaptions: false,
    overlayOpacity: 0.65,
    alwaysShowControls: true
  };

  assert.deepEqual(settings.migrateSettings(stored), stored);
});

test('schema 4 settings enable readable captions and preserve other values', () => {
  const stored = {
    ...settings.RECOMMENDED,
    settingsSchemaVersion: 4,
    readableCaptions: false,
    captionColor: 'yellow',
    overlayOpacity: 0.65,
    accessibilityProfile: 'standard'
  };
  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.readableCaptions, true);
  assert.equal(migrated.captionColor, 'yellow');
  assert.equal(migrated.overlayOpacity, 0.65);
  assert.equal(migrated.accessibilityProfile, 'standard');
  assert.equal(migrated.settingsSchemaVersion, 6);
  assert.equal(settings.needsMigration(stored, migrated), true);
});

test('schema 4 migration preserves a disabled extension', () => {
  const stored = {
    ...settings.RECOMMENDED,
    settingsSchemaVersion: 4,
    extensionEnabled: false,
    readableCaptions: false
  };
  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.extensionEnabled, false);
  assert.equal(migrated.readableCaptions, true);
});

test('schema 5 settings keep readable captions off when selected by the user', () => {
  const stored = {
    ...settings.RECOMMENDED,
    settingsSchemaVersion: 6,
    readableCaptions: false
  };
  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.readableCaptions, false);
  assert.equal(settings.needsMigration(stored, migrated), false);
});

test('migrates schema 2 settings preserving new option defaults', () => {
  assert.deepEqual(settings.migrateSettings({
    settingsSchemaVersion: 2,
    extensionEnabled: false,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0.9,
    alwaysShowControls: true
  }), {
    settingsSchemaVersion: 6,
    extensionEnabled: false,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0.9,
    alwaysShowControls: true,
    progressBarSize: 'default',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white',
    highlightCustomColor: '#ff0033',
    highlightGradientColor: '',
    scrubberIcon: 'default',
    respectVideoTheme: true
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

test('migrates schema 3 settings missing readable captions to on', () => {
  const stored = { ...settings.LEGACY_DEFAULTS, settingsSchemaVersion: 3 };
  delete stored.readableCaptions;
  delete stored.captionColor;

  const migrated = settings.migrateSettings(stored);

  assert.equal(migrated.settingsSchemaVersion, 6);
  assert.equal(migrated.readableCaptions, true);
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
    settingsSchemaVersion: 6,
    extensionEnabled: true,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 1,
    alwaysShowControls: false,
    progressBarSize: 'large',
    highlightColor: 'default',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white',
    highlightCustomColor: '#ff0033',
    highlightGradientColor: '',
    scrubberIcon: 'default',
    respectVideoTheme: true
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
    settingsSchemaVersion: 6,
    extensionEnabled: true,
    accessibilityProfile: 'high-contrast',
    overlayOpacity: 0,
    alwaysShowControls: false,
    progressBarSize: 'large',
    highlightColor: 'cyan',
    largeCursor: false,
    readableCaptions: true,
    captionColor: 'white',
    highlightCustomColor: '#ff0033',
    highlightGradientColor: '',
    scrubberIcon: 'default',
    respectVideoTheme: true
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

const ratePromptNow = Date.UTC(2026, 0, 15);
const eligibleRatePromptState = {
  installedAt: ratePromptNow - 8 * 24 * 60 * 60 * 1000,
  popupOpens: 5,
  ratePromptDone: false,
  ratePromptShown: 0
};

test('rate prompt stays hidden when installedAt is missing', () => {
  const state = { ...eligibleRatePromptState };
  delete state.installedAt;
  assert.equal(settings.shouldShowRatePrompt(state, ratePromptNow), false);
});

test('rate prompt stays hidden before seven days have passed', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    installedAt: ratePromptNow - 7 * 24 * 60 * 60 * 1000 + 1
  }, ratePromptNow), false);
});

test('rate prompt is eligible exactly seven days after installation', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    installedAt: ratePromptNow - 7 * 24 * 60 * 60 * 1000
  }, ratePromptNow), true);
});

test('rate prompt stays hidden before three popup opens', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    popupOpens: 2
  }, ratePromptNow), false);
});

test('rate prompt stays hidden after the user is done', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    ratePromptDone: true
  }, ratePromptNow), false);
});

test('rate prompt stays hidden after three displays', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    ratePromptShown: settings.RATE_PROMPT_MAX_SHOWS
  }, ratePromptNow), false);
});

test('rate prompt shows for an eligible state under the display limit', () => {
  assert.equal(settings.shouldShowRatePrompt({
    ...eligibleRatePromptState,
    ratePromptShown: settings.RATE_PROMPT_MAX_SHOWS - 1
  }, ratePromptNow), true);
});

const chrome153UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';
const edge153UserAgent = `${chrome153UserAgent} Edg/153.0.0.0`;

test('rating prompt URL targets the Chrome Web Store for Chrome', () => {
  assert.equal(settings.ratePromptUrl({
    protocol: 'chrome-extension:',
    userAgent: chrome153UserAgent
  }), 'https://chromewebstore.google.com/detail/dcmmcbdcbpaoefhnlogalnfnnmjolfbh/reviews');
});

test('rating prompt URL targets Microsoft Edge Add-ons for Edge', () => {
  assert.equal(settings.ratePromptUrl({
    protocol: 'chrome-extension:',
    userAgent: edge153UserAgent
  }), 'https://microsoftedge.microsoft.com/addons/detail/elalileakmgdngfodpnoefmihimpmanb');
});

test('rating prompt URL is unavailable outside Chrome extension protocols', () => {
  assert.equal(settings.ratePromptUrl({
    protocol: 'moz-extension:',
    userAgent: chrome153UserAgent
  }), null);
});

test('uninstall survey URL is the anonymous Google Form without query parameters', () => {
  assert.equal(
    settings.UNINSTALL_SURVEY_URL,
    'https://docs.google.com/forms/d/e/1FAIpQLScX6GiejyO0j-Jv-LG42hy741e3AedQrMF6FYCI1VfSLC37Lg/viewform'
  );
  assert.ok(settings.UNINSTALL_SURVEY_URL.startsWith('https://docs.google.com/forms/'));
  assert.equal(settings.UNINSTALL_SURVEY_URL.includes('?'), false);
});

test('normalizeHexColor accepts hex colors and rejects the rest', () => {
  assert.equal(settings.normalizeHexColor('#ABC', '#ff0033'), '#aabbcc');
  assert.equal(settings.normalizeHexColor('#ff0033', '#000000'), '#ff0033');
  assert.equal(settings.normalizeHexColor('ff0033', '#ff0033'), '#ff0033');
  assert.equal(settings.normalizeHexColor('red', ''), '');
  assert.equal(settings.normalizeHexColor(12, '#ff0033'), '#ff0033');
});

test('custom highlight color and scrubber icon normalize safely', () => {
  const normalized = settings.normalizeSettings({
    highlightColor: 'custom',
    highlightCustomColor: '#00FF88',
    highlightGradientColor: 'blue',
    scrubberIcon: 'banana'
  });

  assert.equal(normalized.highlightColor, 'custom');
  assert.equal(normalized.highlightCustomColor, '#00ff88');
  assert.equal(normalized.highlightGradientColor, '');
  assert.equal(normalized.scrubberIcon, 'default');
  assert.equal(settings.SCRUBBER_ICON_VALUES.includes('star'), true);
});

test('recommended defaults include the player theme fields', () => {
  assert.equal(settings.DEFAULTS.highlightCustomColor, '#ff0033');
  assert.equal(settings.DEFAULTS.highlightGradientColor, '');
  assert.equal(settings.DEFAULTS.scrubberIcon, 'default');
  assert.equal(settings.DEFAULTS.respectVideoTheme, true);
  assert.equal(settings.DEFAULT_CUSTOM_HIGHLIGHT, '#ff0033');
});
