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
  applyUpdate({ extensionEnabled: extensionEnabled.checked }, extensionEnabled.checked ? 'Enhancements enabled' : 'Enhancements disabled');
});

profileInputs.forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked) return;

    applyUpdate({
      accessibilityProfile: input.value,
      overlayOpacity: settingsModel.getProfileOpacity(input.value)
    }, `${input.closest('.profile-card').querySelector('strong').textContent} profile selected`);
  });
});

alwaysShowControls.addEventListener('change', () => {
  applyUpdate({ alwaysShowControls: alwaysShowControls.checked }, alwaysShowControls.checked ? 'Controls will stay visible' : 'Controls can auto-hide');
});

overlayOpacity.addEventListener('input', () => {
  const overlayOpacityValue = Number(overlayOpacity.value) / 100;
  currentSettings = settingsModel.normalizeSettings({ ...currentSettings, overlayOpacity: overlayOpacityValue });
  opacityValue.value = `${overlayOpacity.value}%`;
  previewSettings();

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.sync.set(currentSettings, () => {
      status.textContent = 'Background strength saved';
    });
  }, 200);
});

resetSettings.addEventListener('click', () => {
  currentSettings = { ...settingsModel.DEFAULTS };
  updateControls(currentSettings);
  persistSettings('Settings reset');
});
