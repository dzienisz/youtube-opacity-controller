const t = (key, substitutions) => chrome.i18n.getMessage(key, substitutions);
const featureVersion = version => String(version).split('.').slice(0, 2).join('.');

document.documentElement.lang = t('@@ui_locale').replace('_', '-');
document.documentElement.dir = t('@@bidi_dir');
document.title = t('appName') || document.title;
document.querySelectorAll('[data-i18n]').forEach(el => {
  const message = t(el.dataset.i18n);
  if (message) el.textContent = message;
});
document.getElementById('whatsNewTitle').textContent = t(
  'whatsNewTitle',
  [featureVersion(chrome.runtime.getManifest().version)]
);
document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
  const message = t(el.dataset.i18nAriaLabel);
  if (message) el.setAttribute('aria-label', message);
});

const settingsModel = globalThis.YtocSettings;
const extensionEnabled = document.getElementById('extensionEnabled');
const settingsPanel = document.getElementById('settingsPanel');
const profileInputs = Array.from(document.querySelectorAll('[name="accessibilityProfile"]'));
const alwaysShowControls = document.getElementById('alwaysShowControls');
const progressBarSize = document.getElementById('progressBarSize');
const readableCaptions = document.getElementById('readableCaptions');
const highlightColorInputs = Array.from(document.querySelectorAll('[name="highlightColor"]'));
const highlightCustomColor = document.getElementById('highlightCustomColor');
const highlightGradient = document.getElementById('highlightGradient');
const highlightGradientColor = document.getElementById('highlightGradientColor');
const highlightGradientRow = document.getElementById('highlightGradientRow');
const scrubberIconInputs = Array.from(document.querySelectorAll('[name="scrubberIcon"]'));
const respectVideoTheme = document.getElementById('respectVideoTheme');
const captionColorInputs = Array.from(document.querySelectorAll('[name="captionColor"]'));
const largeCursor = document.getElementById('largeCursor');
const overlayOpacity = document.getElementById('overlayOpacity');
const whatsNew = document.getElementById('whatsNew');
const whatsNewDismiss = document.getElementById('whatsNewDismiss');
const ratePrompt = document.getElementById('ratePrompt');
const ratePromptRate = document.getElementById('ratePromptRate');
const ratePromptDismiss = document.getElementById('ratePromptDismiss');
const rateUrl = settingsModel.ratePromptUrl({
  protocol: location.protocol,
  userAgent: navigator.userAgent
});
const editShortcuts = document.getElementById('editShortcuts');
const openShortcutSettings = Reflect.get(chrome.commands, 'openShortcutSettings');
const shortcutKeys = document.getElementById('shortcutKeys');
const shortcutHint = document.getElementById('shortcutHint');
const shortcutUnset = document.getElementById('shortcutUnset');
const editShortcutsSeparator = document.getElementById('editShortcutsSeparator');
const customize = document.querySelector('details.customize');
const opacityValue = document.getElementById('opacityValue');
const resetSettings = document.getElementById('resetSettings');
const restoreYouTube = document.getElementById('restoreYouTube');
const status = document.getElementById('status');
let currentSettings = settingsModel.DEFAULTS;
let saveTimeout = null;

function renderShortcut() {
  chrome.commands.getAll(commands => {
    const shortcut = commands.find(command => command.name === 'toggle-enhancements')?.shortcut || '';
    shortcutKeys.replaceChildren();

    if (!shortcut) {
      shortcutKeys.hidden = true;
      shortcutHint.hidden = true;
      shortcutUnset.hidden = false;
      return;
    }

    const keys = shortcut.includes('+') ? shortcut.split('+').map(key => key.trim()) : Array.from(shortcut);
    keys.forEach((key, index) => {
      if (index > 0) shortcutKeys.append(document.createTextNode('+'));
      const keyElement = document.createElement('kbd');
      keyElement.textContent = key;
      shortcutKeys.append(keyElement);
    });
    shortcutKeys.hidden = false;
    shortcutHint.hidden = false;
    shortcutUnset.hidden = true;
  });
}

renderShortcut();

function updateControls(settings) {
  extensionEnabled.checked = settings.extensionEnabled;
  restoreYouTube.disabled = !settings.extensionEnabled;
  settingsPanel.setAttribute('aria-disabled', String(!settings.extensionEnabled));
  settingsPanel.inert = !settings.extensionEnabled;
  settingsPanel.querySelectorAll('input').forEach(input => {
    input.disabled = !settings.extensionEnabled;
  });

  profileInputs.forEach(input => {
    input.checked = input.value === settings.accessibilityProfile;
  });
  alwaysShowControls.checked = settings.alwaysShowControls;
  progressBarSize.checked = settings.progressBarSize === settingsModel.PROGRESS_SIZES.LARGE;
  readableCaptions.checked = settings.readableCaptions;
  highlightColorInputs.forEach(input => {
    input.checked = input.value === settings.highlightColor;
  });
  captionColorInputs.forEach(input => {
    input.checked = input.value === settings.captionColor;
  });
  highlightCustomColor.value = settings.highlightCustomColor;
  highlightGradient.checked = Boolean(settings.highlightGradientColor);
  highlightGradientColor.value = settings.highlightGradientColor || '#ff2791';
  highlightGradientColor.disabled = !highlightGradient.checked || !settings.extensionEnabled;
  highlightGradientRow.hidden = settings.highlightColor !== 'custom';
  scrubberIconInputs.forEach(input => {
    input.checked = input.value === settings.scrubberIcon;
  });
  respectVideoTheme.checked = settings.respectVideoTheme;
  largeCursor.checked = settings.largeCursor;

  const opacityPercent = Math.round(settings.overlayOpacity * 100);
  overlayOpacity.value = opacityPercent;
  opacityValue.value = `${opacityPercent}%`;
}

function previewSettings() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab?.id || !tab.url?.includes('youtube.com')) return;

    chrome.tabs.sendMessage(tab.id, {
      action: 'previewSettings',
      settings: currentSettings
    }).catch(() => {});
  });
}

function persistSettings(message) {
  chrome.storage.sync.set(currentSettings, () => {
    status.textContent = message;
  });
  previewSettings();
}

function applyUpdate(update, message) {
  currentSettings = settingsModel.normalizeSettings({ ...currentSettings, ...update });
  updateControls(currentSettings);
  persistSettings(message);
}

chrome.storage.sync.get(null, result => {
  currentSettings = settingsModel.migrateSettings(result);
  updateControls(currentSettings);

  if (settingsModel.needsMigration(result, currentSettings)) {
    chrome.storage.sync.set(currentSettings);
  }
});

extensionEnabled.addEventListener('change', () => {
  applyUpdate({ extensionEnabled: extensionEnabled.checked }, t(extensionEnabled.checked ? 'statusEnabled' : 'statusDisabled'));
});

profileInputs.forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked) return;

    applyUpdate({
      accessibilityProfile: input.value,
      overlayOpacity: settingsModel.getProfileOpacity(input.value)
    }, t('statusProfileSelected', [t(settingsModel.PROFILE_MESSAGE_KEYS[input.value])]));
  });
});

alwaysShowControls.addEventListener('change', () => {
  applyUpdate({ alwaysShowControls: alwaysShowControls.checked }, t(alwaysShowControls.checked ? 'statusControlsVisible' : 'statusControlsAutoHide'));
});

progressBarSize.addEventListener('change', () => {
  const large = progressBarSize.checked;
  applyUpdate(
    { progressBarSize: large ? settingsModel.PROGRESS_SIZES.LARGE : settingsModel.PROGRESS_SIZES.DEFAULT },
    t(large ? 'statusProgressBarLarge' : 'statusProgressBarDefault')
  );
});

readableCaptions.addEventListener('change', () => {
  applyUpdate(
    { readableCaptions: readableCaptions.checked },
    t(readableCaptions.checked ? 'statusCaptionsOn' : 'statusCaptionsOff')
  );
});

const HIGHLIGHT_NAME_KEYS = {
  default: 'highlightDefault',
  yellow: 'highlightYellow',
  cyan: 'highlightCyan',
  green: 'highlightGreen',
  custom: 'highlightCustom'
};

highlightColorInputs.forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    applyUpdate({ highlightColor: input.value }, t('statusHighlight', [t(HIGHLIGHT_NAME_KEYS[input.value])]));
  });
});

function saveDebounced(message) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.sync.set(currentSettings, () => {
      status.textContent = message;
    });
  }, 200);
}

highlightCustomColor.addEventListener('input', () => {
  const customRadio = highlightColorInputs.find(input => input.value === 'custom');
  currentSettings = settingsModel.normalizeSettings({
    ...currentSettings,
    highlightColor: 'custom',
    highlightCustomColor: highlightCustomColor.value
  });
  if (customRadio) customRadio.checked = true;
  previewSettings();
  saveDebounced(t('statusHighlight', [t('highlightCustom')]));
});

highlightGradient.addEventListener('change', () => {
  highlightGradientColor.disabled = !highlightGradient.checked;
  applyUpdate({
    highlightGradientColor: highlightGradient.checked ? highlightGradientColor.value : ''
  }, t('statusHighlight', [t('highlightCustom')]));
});

highlightGradientColor.addEventListener('input', () => {
  if (!highlightGradient.checked) return;
  currentSettings = settingsModel.normalizeSettings({
    ...currentSettings,
    highlightGradientColor: highlightGradientColor.value
  });
  previewSettings();
  saveDebounced(t('statusHighlight', [t('highlightCustom')]));
});

const SCRUBBER_NAME_KEYS = {
  default: 'scrubberDefault',
  star: 'scrubberStar',
  heart: 'scrubberHeart',
  bolt: 'scrubberBolt',
  note: 'scrubberNote'
};

scrubberIconInputs.forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    applyUpdate({ scrubberIcon: input.value }, t('statusScrubber', [t(SCRUBBER_NAME_KEYS[input.value])]));
  });
});

respectVideoTheme.addEventListener('change', () => {
  applyUpdate(
    { respectVideoTheme: respectVideoTheme.checked },
    t(respectVideoTheme.checked ? 'statusRespectThemeOn' : 'statusRespectThemeOff')
  );
});

const CAPTION_COLOR_NAME_KEYS = {
  white: 'captionColorWhite',
  yellow: 'captionColorYellow'
};

captionColorInputs.forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    applyUpdate({ captionColor: input.value }, t('statusCaptionColor', [t(CAPTION_COLOR_NAME_KEYS[input.value])]));
  });
});

largeCursor.addEventListener('change', () => {
  applyUpdate({ largeCursor: largeCursor.checked }, t(largeCursor.checked ? 'statusCursorLarge' : 'statusCursorDefault'));
});

overlayOpacity.addEventListener('input', () => {
  const overlayOpacityValue = Number(overlayOpacity.value) / 100;
  currentSettings = settingsModel.normalizeSettings({ ...currentSettings, overlayOpacity: overlayOpacityValue });
  opacityValue.value = `${overlayOpacity.value}%`;
  previewSettings();

  saveDebounced(t('statusStrengthSaved'));
});

resetSettings.addEventListener('click', () => {
  currentSettings = { ...settingsModel.RECOMMENDED };
  updateControls(currentSettings);
  persistSettings(t('statusReset'));
});

restoreYouTube.addEventListener('click', () => {
  applyUpdate({ extensionEnabled: false }, t('statusRestoredYouTube'));
});

if (
  typeof openShortcutSettings !== 'function'
  && location.protocol !== 'chrome-extension:'
) {
  editShortcuts.hidden = true;
  editShortcutsSeparator.hidden = true;
}
editShortcuts.addEventListener('click', () => {
  if (typeof openShortcutSettings === 'function') {
    openShortcutSettings.call(chrome.commands);
  } else if (location.protocol === 'chrome-extension:') {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }
});

whatsNewDismiss.addEventListener('click', () => {
  whatsNew.hidden = true;
  chrome.storage.local.set({ whatsNewDismissed: featureVersion(chrome.runtime.getManifest().version) });
});

function finishRatePrompt() {
  ratePrompt.hidden = true;
  chrome.storage.local.set({ ratePromptDone: true });
}

ratePromptRate.addEventListener('click', () => {
  finishRatePrompt();
  chrome.tabs.create({ url: rateUrl });
});

ratePromptDismiss.addEventListener('click', finishRatePrompt);

chrome.storage.local.get([
  'whatsNewVersion',
  'whatsNewDismissed',
  'installedAt',
  'popupOpens',
  'ratePromptDone',
  'ratePromptShown'
], result => {
  const popupOpens = Number.isFinite(result.popupOpens) ? result.popupOpens + 1 : 1;
  chrome.storage.local.set({ popupOpens });

  const version = featureVersion(chrome.runtime.getManifest().version);
  if (featureVersion(result.whatsNewVersion) === version && result.whatsNewDismissed !== version) {
    whatsNew.hidden = false;
    customize.open = true;
    return;
  }

  if (rateUrl && settingsModel.shouldShowRatePrompt({ ...result, popupOpens }, Date.now())) {
    ratePrompt.hidden = false;
    chrome.storage.local.set({
      ratePromptShown: (Number.isFinite(result.ratePromptShown) ? result.ratePromptShown : 0) + 1
    });
  }
});
