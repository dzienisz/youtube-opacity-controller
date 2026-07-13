(function(root, factory) {
  const settingsApi = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = settingsApi;
  }

  root.YtocSettings = settingsApi;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SCHEMA_VERSION = 2;
  const PROFILES = Object.freeze({
    STANDARD: 'standard',
    HIGH_CONTRAST: 'high-contrast',
    LOW_VISION: 'low-vision'
  });
  const PROFILE_VALUES = Object.freeze(Object.values(PROFILES));
  const PROFILE_DEFAULT_OPACITY = Object.freeze({
    [PROFILES.STANDARD]: 0.7,
    [PROFILES.HIGH_CONTRAST]: 0.9,
    [PROFILES.LOW_VISION]: 0.95
  });
  const DEFAULTS = Object.freeze({
    settingsSchemaVersion: SCHEMA_VERSION,
    extensionEnabled: true,
    accessibilityProfile: PROFILES.STANDARD,
    overlayOpacity: PROFILE_DEFAULT_OPACITY[PROFILES.STANDARD],
    alwaysShowControls: false
  });

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function normalizeOpacity(value) {
    if (!isFiniteNumber(value)) return DEFAULTS.overlayOpacity;
    return Math.min(1, Math.max(0, value));
  }

  function normalizeSettings(value) {
    const input = value && typeof value === 'object' ? value : {};

    return {
      settingsSchemaVersion: SCHEMA_VERSION,
      extensionEnabled: typeof input.extensionEnabled === 'boolean'
        ? input.extensionEnabled
        : DEFAULTS.extensionEnabled,
      accessibilityProfile: PROFILE_VALUES.includes(input.accessibilityProfile)
        ? input.accessibilityProfile
        : DEFAULTS.accessibilityProfile,
      overlayOpacity: normalizeOpacity(input.overlayOpacity),
      alwaysShowControls: typeof input.alwaysShowControls === 'boolean'
        ? input.alwaysShowControls
        : DEFAULTS.alwaysShowControls
    };
  }

  function migrateSettings(value) {
    return normalizeSettings(value);
  }

  function getProfileOpacity(profile) {
    return PROFILE_DEFAULT_OPACITY[profile] ?? DEFAULTS.overlayOpacity;
  }

  function applyStorageChanges(settings, changes) {
    const updated = { ...normalizeSettings(settings) };
    Object.entries(changes || {}).forEach(([key, change]) => {
      updated[key] = change?.newValue;
    });
    return normalizeSettings(updated);
  }

  function areSettingsEqual(left, right) {
    return Object.keys(DEFAULTS).every(key => left[key] === right[key]);
  }

  return Object.freeze({
    SCHEMA_VERSION,
    PROFILES,
    PROFILE_VALUES,
    DEFAULTS,
    normalizeOpacity,
    normalizeSettings,
    migrateSettings,
    getProfileOpacity,
    applyStorageChanges,
    areSettingsEqual
  });
});
