(function(root, factory) {
  const settingsApi = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = settingsApi;
  }

  root.YtocSettings = settingsApi;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SCHEMA_VERSION = 6;
  const RATE_PROMPT_MIN_DAYS = 7;
  const RATE_PROMPT_MIN_OPENS = 3;
  const RATE_PROMPT_MAX_SHOWS = 3;
  const CHROME_RATE_PROMPT_URL = 'https://chromewebstore.google.com/detail/dcmmcbdcbpaoefhnlogalnfnnmjolfbh/reviews';
  const EDGE_RATE_PROMPT_URL = 'https://microsoftedge.microsoft.com/addons/detail/elalileakmgdngfodpnoefmihimpmanb';
  const UNINSTALL_SURVEY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScX6GiejyO0j-Jv-LG42hy741e3AedQrMF6FYCI1VfSLC37Lg/viewform';
  const PROFILES = Object.freeze({
    STANDARD: 'standard',
    HIGH_CONTRAST: 'high-contrast'
  });
  const PROFILE_VALUES = Object.freeze(Object.values(PROFILES));
  const PROFILE_MESSAGE_KEYS = Object.freeze({
    [PROFILES.STANDARD]: 'profileStandard',
    [PROFILES.HIGH_CONTRAST]: 'profileHighContrast'
  });
  const PROFILE_DEFAULT_OPACITY = Object.freeze({
    [PROFILES.STANDARD]: 0.7,
    [PROFILES.HIGH_CONTRAST]: 0.9
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
    GREEN: 'green',
    CUSTOM: 'custom'
  });
  const HIGHLIGHT_VALUES = Object.freeze(Object.values(HIGHLIGHT_COLORS));
  const SCRUBBER_ICONS = Object.freeze({
    DEFAULT: 'default',
    STAR: 'star',
    HEART: 'heart',
    BOLT: 'bolt',
    NOTE: 'note'
  });
  const SCRUBBER_ICON_VALUES = Object.freeze(Object.values(SCRUBBER_ICONS));
  const DEFAULT_CUSTOM_HIGHLIGHT = '#ff0033';
  const CAPTION_COLORS = Object.freeze({
    WHITE: 'white',
    YELLOW: 'yellow'
  });
  const CAPTION_COLOR_VALUES = Object.freeze(Object.values(CAPTION_COLORS));
  const LEGACY_DEFAULTS = Object.freeze({
    extensionEnabled: true,
    accessibilityProfile: PROFILES.STANDARD,
    overlayOpacity: PROFILE_DEFAULT_OPACITY[PROFILES.STANDARD],
    alwaysShowControls: false,
    progressBarSize: PROGRESS_SIZES.DEFAULT,
    highlightColor: HIGHLIGHT_COLORS.DEFAULT,
    largeCursor: false,
    readableCaptions: false,
    captionColor: CAPTION_COLORS.WHITE,
    highlightCustomColor: DEFAULT_CUSTOM_HIGHLIGHT,
    highlightGradientColor: '',
    scrubberIcon: SCRUBBER_ICONS.DEFAULT,
    respectVideoTheme: true
  });
  const RECOMMENDED = Object.freeze({
    settingsSchemaVersion: SCHEMA_VERSION,
    extensionEnabled: true,
    accessibilityProfile: PROFILES.HIGH_CONTRAST,
    overlayOpacity: PROFILE_DEFAULT_OPACITY[PROFILES.HIGH_CONTRAST],
    alwaysShowControls: false,
    progressBarSize: PROGRESS_SIZES.LARGE,
    highlightColor: HIGHLIGHT_COLORS.DEFAULT,
    largeCursor: false,
    readableCaptions: true,
    captionColor: CAPTION_COLORS.WHITE,
    highlightCustomColor: DEFAULT_CUSTOM_HIGHLIGHT,
    highlightGradientColor: '',
    scrubberIcon: SCRUBBER_ICONS.DEFAULT,
    respectVideoTheme: true
  });
  const DEFAULTS = RECOMMENDED;

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function normalizeOpacity(value) {
    if (!isFiniteNumber(value)) return DEFAULTS.overlayOpacity;
    return Math.min(1, Math.max(0, value));
  }

  function normalizeHexColor(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
    if (!match) return fallback;
    const hex = match[1].toLowerCase();
    return hex.length === 3
      ? `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
      : `#${hex}`;
  }

  function normalizeSettings(value) {
    const input = value && typeof value === 'object' ? value : {};
    const accessibilityProfile = input.accessibilityProfile === 'low-vision'
      ? PROFILES.HIGH_CONTRAST
      : input.accessibilityProfile;

    return {
      settingsSchemaVersion: SCHEMA_VERSION,
      extensionEnabled: typeof input.extensionEnabled === 'boolean'
        ? input.extensionEnabled
        : DEFAULTS.extensionEnabled,
      accessibilityProfile: PROFILE_VALUES.includes(accessibilityProfile)
        ? accessibilityProfile
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
        : DEFAULTS.largeCursor,
      readableCaptions: typeof input.readableCaptions === 'boolean'
        ? input.readableCaptions
        : DEFAULTS.readableCaptions,
      captionColor: CAPTION_COLOR_VALUES.includes(input.captionColor)
        ? input.captionColor
        : DEFAULTS.captionColor,
      highlightCustomColor: normalizeHexColor(input.highlightCustomColor, DEFAULTS.highlightCustomColor),
      highlightGradientColor: normalizeHexColor(input.highlightGradientColor, ''),
      scrubberIcon: SCRUBBER_ICON_VALUES.includes(input.scrubberIcon)
        ? input.scrubberIcon
        : DEFAULTS.scrubberIcon,
      respectVideoTheme: typeof input.respectVideoTheme === 'boolean'
        ? input.respectVideoTheme
        : DEFAULTS.respectVideoTheme
    };
  }

  function migrateSettings(value) {
    const stored = value && typeof value === 'object' ? value : {};
    const hasStoredSettings = Object.keys(LEGACY_DEFAULTS)
      .some(key => Object.prototype.hasOwnProperty.call(stored, key));
    const schemaVersion = stored.settingsSchemaVersion;

    if (hasStoredSettings && (!Number.isFinite(schemaVersion) || schemaVersion < SCHEMA_VERSION)) {
      const base = !Number.isFinite(schemaVersion) || schemaVersion < 4
        ? { ...LEGACY_DEFAULTS, ...stored }
        : stored;
      const migrated = !Number.isFinite(schemaVersion) || schemaVersion < 5
        ? { ...base, readableCaptions: true }
        : base;
      return normalizeSettings(migrated);
    }

    return normalizeSettings(stored);
  }

  function needsMigration(stored, migrated) {
    return Object.keys(DEFAULTS).some(key => (stored || {})[key] !== migrated[key]);
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

  function shouldShowRatePrompt(state, now) {
    const current = state && typeof state === 'object' ? state : {};

    return isFiniteNumber(current.installedAt)
      && isFiniteNumber(now)
      && now - current.installedAt >= RATE_PROMPT_MIN_DAYS * 24 * 60 * 60 * 1000
      && isFiniteNumber(current.popupOpens)
      && current.popupOpens >= RATE_PROMPT_MIN_OPENS
      && !current.ratePromptDone
      && (current.ratePromptShown || 0) < RATE_PROMPT_MAX_SHOWS;
  }

  function ratePromptUrl({ protocol, userAgent }) {
    if (protocol !== 'chrome-extension:') {
      return null;
    }

    return /\bEdg\//.test(userAgent) ? EDGE_RATE_PROMPT_URL : CHROME_RATE_PROMPT_URL;
  }

  return Object.freeze({
    SCHEMA_VERSION,
    RATE_PROMPT_MIN_DAYS,
    RATE_PROMPT_MIN_OPENS,
    RATE_PROMPT_MAX_SHOWS,
    UNINSTALL_SURVEY_URL,
    PROFILES,
    PROFILE_VALUES,
    PROFILE_MESSAGE_KEYS,
    PROGRESS_SIZES,
    PROGRESS_SIZE_VALUES,
    HIGHLIGHT_COLORS,
    HIGHLIGHT_VALUES,
    CAPTION_COLORS,
    CAPTION_COLOR_VALUES,
    SCRUBBER_ICONS,
    SCRUBBER_ICON_VALUES,
    DEFAULT_CUSTOM_HIGHLIGHT,
    COMMANDS,
    LEGACY_DEFAULTS,
    RECOMMENDED,
    DEFAULTS,
    normalizeOpacity,
    normalizeHexColor,
    normalizeSettings,
    migrateSettings,
    needsMigration,
    getProfileOpacity,
    cycleProfile,
    applyCommand,
    applyStorageChanges,
    areSettingsEqual,
    shouldShowRatePrompt,
    ratePromptUrl
  });
});
