(function(root, factory) {
  const settingsApi = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = settingsApi;
  }

  root.YtocSettings = settingsApi;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SCHEMA_VERSION = 3;
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
  const PROGRESS_SIZES = Object.freeze({
    DEFAULT: 'default',
    LARGE: 'large'
  });
  const PROGRESS_SIZE_VALUES = Object.freeze(Object.values(PROGRESS_SIZES));
  const HIGHLIGHT_COLORS = Object.freeze({
    DEFAULT: 'default',
    YELLOW: 'yellow',
    CYAN: 'cyan',
    GREEN: 'green'
  });
  const HIGHLIGHT_VALUES = Object.freeze(Object.values(HIGHLIGHT_COLORS));
  const DEFAULTS = Object.freeze({
    settingsSchemaVersion: SCHEMA_VERSION,
    extensionEnabled: true,
    accessibilityProfile: PROFILES.STANDARD,
    overlayOpacity: PROFILE_DEFAULT_OPACITY[PROFILES.STANDARD],
    alwaysShowControls: false,
    progressBarSize: PROGRESS_SIZES.DEFAULT,
    highlightColor: HIGHLIGHT_COLORS.DEFAULT,
    largeCursor: false
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
        : DEFAULTS.alwaysShowControls,
      progressBarSize: PROGRESS_SIZE_VALUES.includes(input.progressBarSize)
        ? input.progressBarSize
        : DEFAULTS.progressBarSize,
      highlightColor: HIGHLIGHT_VALUES.includes(input.highlightColor)
        ? input.highlightColor
        : DEFAULTS.highlightColor,
      largeCursor: typeof input.largeCursor === 'boolean'
        ? input.largeCursor
        : DEFAULTS.largeCursor
    };
  }

  function migrateSettings(value) {
    return normalizeSettings(value);
  }

  function getProfileOpacity(profile) {
    return PROFILE_DEFAULT_OPACITY[profile] ?? DEFAULTS.overlayOpacity;
  }

  function cycleProfile(profile) {
    const index = PROFILE_VALUES.indexOf(profile);
    const nextIndex = index === -1 ? 0 : (index + 1) % PROFILE_VALUES.length;
    return PROFILE_VALUES[nextIndex];
  }

  const COMMANDS = Object.freeze({
    TOGGLE_ENHANCEMENTS: 'toggle-enhancements',
    CYCLE_PROFILE: 'cycle-profile',
    TOGGLE_ALWAYS_SHOW: 'toggle-always-show'
  });

  function applyCommand(settings, commandName) {
    const current = normalizeSettings(settings);

    switch (commandName) {
      case COMMANDS.TOGGLE_ENHANCEMENTS:
        return normalizeSettings({ ...current, extensionEnabled: !current.extensionEnabled });
      case COMMANDS.CYCLE_PROFILE: {
        const nextProfile = cycleProfile(current.accessibilityProfile);
        return normalizeSettings({
          ...current,
          extensionEnabled: true,
          accessibilityProfile: nextProfile,
          overlayOpacity: getProfileOpacity(nextProfile)
        });
      }
      case COMMANDS.TOGGLE_ALWAYS_SHOW:
        return normalizeSettings({ ...current, alwaysShowControls: !current.alwaysShowControls });
      default:
        return current;
    }
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
    PROGRESS_SIZES,
    PROGRESS_SIZE_VALUES,
    HIGHLIGHT_COLORS,
    HIGHLIGHT_VALUES,
    COMMANDS,
    DEFAULTS,
    normalizeOpacity,
    normalizeSettings,
    migrateSettings,
    getProfileOpacity,
    cycleProfile,
    applyCommand,
    applyStorageChanges,
    areSettingsEqual
  });
});
