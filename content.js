// YouTube Player Accessibility
// All visual changes are driven by namespaced attributes and custom properties
// on <html>. The script never moves or clones YouTube-owned DOM nodes.

const settingsModel = globalThis.YtocSettings;
let currentSettings = settingsModel.DEFAULTS;
let hudElement = null;
let hudTimer = null;

function applySettings(value) {
  currentSettings = settingsModel.normalizeSettings(value);
  const root = document.documentElement;

  if (!currentSettings.extensionEnabled) {
    root.removeAttribute('data-ytoc-enabled');
    root.removeAttribute('data-ytoc-profile');
    root.removeAttribute('data-ytoc-always-show');
    root.removeAttribute('data-ytoc-progress');
    root.removeAttribute('data-ytoc-highlight');
    root.removeAttribute('data-ytoc-large-cursor');
    root.style.removeProperty('--ytoc-overlay-opacity');
    return;
  }

  root.setAttribute('data-ytoc-enabled', 'true');
  root.setAttribute('data-ytoc-profile', currentSettings.accessibilityProfile);
  root.toggleAttribute('data-ytoc-always-show', currentSettings.alwaysShowControls);
  root.toggleAttribute('data-ytoc-large-cursor', currentSettings.largeCursor);

  if (currentSettings.progressBarSize === settingsModel.PROGRESS_SIZES.LARGE) {
    root.setAttribute('data-ytoc-progress', 'large');
  } else {
    root.removeAttribute('data-ytoc-progress');
  }

  if (currentSettings.highlightColor !== settingsModel.HIGHLIGHT_COLORS.DEFAULT) {
    root.setAttribute('data-ytoc-highlight', currentSettings.highlightColor);
  } else {
    root.removeAttribute('data-ytoc-highlight');
  }

  root.style.setProperty('--ytoc-overlay-opacity', currentSettings.overlayOpacity);
}

function showHud(title, detail) {
  const player = document.getElementById('player-controls') || document.getElementById('movie_player');
  if (!player) return;

  if (!hudElement || !hudElement.isConnected) {
    hudElement = document.createElement('div');
    hudElement.className = 'ytoc-hud';
    hudElement.setAttribute('role', 'status');
    hudElement.setAttribute('aria-live', 'polite');
    player.appendChild(hudElement);
  }

  hudElement.replaceChildren();
  hudElement.appendChild(document.createTextNode(title));
  if (detail) {
    const detailLine = document.createElement('small');
    detailLine.textContent = detail;
    hudElement.appendChild(detailLine);
  }

  hudElement.setAttribute('data-visible', '');
  if (hudTimer) clearTimeout(hudTimer);
  hudTimer = setTimeout(() => {
    if (hudElement) hudElement.removeAttribute('data-visible');
  }, 1800);
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
  if (request.action === 'previewSettings') {
    applySettings(request.settings);
    sendResponse({ status: 'ok' });
    return;
  }

  if (request.action === 'showHud') {
    showHud(request.title, request.detail);
    sendResponse({ status: 'ok' });
  }
});

initializeSettings();
