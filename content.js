// YouTube Player Accessibility
// All visual changes are driven by namespaced attributes and custom properties
// on <html>. The script never moves or clones YouTube-owned DOM nodes.

const settingsModel = globalThis.YtocSettings;
let currentSettings = settingsModel.DEFAULTS;

function applySettings(value) {
  currentSettings = settingsModel.normalizeSettings(value);
  const root = document.documentElement;

  if (!currentSettings.extensionEnabled) {
    root.removeAttribute('data-ytoc-enabled');
    root.removeAttribute('data-ytoc-profile');
    root.removeAttribute('data-ytoc-always-show');
    root.style.removeProperty('--ytoc-overlay-opacity');
    return;
  }

  root.setAttribute('data-ytoc-enabled', 'true');
  root.setAttribute('data-ytoc-profile', currentSettings.accessibilityProfile);
  root.toggleAttribute('data-ytoc-always-show', currentSettings.alwaysShowControls);
  root.style.setProperty('--ytoc-overlay-opacity', currentSettings.overlayOpacity);
}

function initializeSettings() {
  chrome.storage.sync.get(null, result => {
    const migrated = settingsModel.migrateSettings(result);
    applySettings(migrated);

    const requiresMigration = Object.keys(settingsModel.DEFAULTS)
      .some(key => result[key] !== migrated[key]);

    if (requiresMigration) {
      chrome.storage.sync.set(migrated);
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;

  applySettings(settingsModel.applyStorageChanges(currentSettings, changes));
});

// Direct messages provide instant preview while storage remains authoritative.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'previewSettings') return;

  applySettings(request.settings);
  sendResponse({ status: 'ok' });
});

initializeSettings();
