const t = (key, substitutions) => chrome.i18n.getMessage(key, substitutions);

document.documentElement.lang = t('@@ui_locale').replace('_', '-');
document.documentElement.dir = t('@@bidi_dir');
document.title = t('appName') || document.title;
document.querySelectorAll('[data-i18n]').forEach(el => {
  const message = t(el.dataset.i18n);
  if (message) el.textContent = message;
});
document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
  const message = t(el.dataset.i18nAriaLabel);
  if (message) el.setAttribute('aria-label', message);
});

const PROFILE_NAME_KEYS = {
  standard: 'profileStandard',
  'high-contrast': 'profileHighContrast',
  'low-vision': 'profileLowVision'
};

const settingsModel = globalThis.YtocSettings;
const extensionEnabled = document.getElementById('extensionEnabled');
const settingsPanel = document.getElementById('settingsPanel');
const profileInputs = Array.from(document.querySelectorAll('[name="accessibilityProfile"]'));
const alwaysShowControls = document.getElementById('alwaysShowControls');
const overlayOpacity = document.getElementById('overlayOpacity');
const opacityValue = document.getElementById('opacityValue');
const resetSettings = document.getElementById('resetSettings');
const status = document.getElementById('status');
let currentSettings = settingsModel.DEFAULTS;
let saveTimeout = null;

function updateControls(settings) {
  extensionEnabled.checked = settings.extensionEnabled;
  settingsPanel.setAttribute('aria-disabled', String(!settings.extensionEnabled));
  settingsPanel.inert = !settings.extensionEnabled;
  settingsPanel.querySelectorAll('input').forEach(input => {
    input.disabled = !settings.extensionEnabled;
  });

  profileInputs.forEach(input => {
    input.checked = input.value === settings.accessibilityProfile;
  });
  alwaysShowControls.checked = settings.alwaysShowControls;

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

  const requiresMigration = Object.keys(settingsModel.DEFAULTS)
    .some(key => result[key] !== currentSettings[key]);
  if (requiresMigration) {
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
    }, t('statusProfileSelected', [t(PROFILE_NAME_KEYS[input.value])]));
  });
});

alwaysShowControls.addEventListener('change', () => {
  applyUpdate({ alwaysShowControls: alwaysShowControls.checked }, t(alwaysShowControls.checked ? 'statusControlsVisible' : 'statusControlsAutoHide'));
});

overlayOpacity.addEventListener('input', () => {
  const overlayOpacityValue = Number(overlayOpacity.value) / 100;
  currentSettings = settingsModel.normalizeSettings({ ...currentSettings, overlayOpacity: overlayOpacityValue });
  opacityValue.value = `${overlayOpacity.value}%`;
  previewSettings();

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.sync.set(currentSettings, () => {
      status.textContent = t('statusStrengthSaved');
    });
  }, 200);
});

resetSettings.addEventListener('click', () => {
  currentSettings = { ...settingsModel.DEFAULTS };
  updateControls(currentSettings);
  persistSettings(t('statusReset'));
});
