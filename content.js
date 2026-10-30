// YouTube Player Accessibility
// All visual changes are driven by namespaced attributes and custom properties
// on <html>. The script never moves or clones YouTube-owned DOM nodes.

const settingsModel = globalThis.YtocSettings;
let currentSettings = settingsModel.DEFAULTS;
let hudElement = null;
let hudTimer = null;
let settingsInitialized = false;
let playerHintRetryCount = 0;
let playerHintRetryTimer = null;
let playerHintCheckPending = false;
let playerHintShown = false;

function videoHasOwnTheme() {
  return !!document.querySelector('#movie_player .ytp-decorated-scrubber-button[src]');
}

function applySettings(value) {
  currentSettings = settingsModel.normalizeSettings(value);
  const root = document.documentElement;

  const keepVideoTheme = currentSettings.respectVideoTheme && videoHasOwnTheme();
  const highlight = keepVideoTheme
    ? settingsModel.HIGHLIGHT_COLORS.DEFAULT
    : currentSettings.highlightColor;
  const scrubber = keepVideoTheme
    ? settingsModel.SCRUBBER_ICONS.DEFAULT
    : currentSettings.scrubberIcon;

  if (!currentSettings.extensionEnabled) {
    root.removeAttribute('data-ytoc-enabled');
    root.removeAttribute('data-ytoc-profile');
    root.removeAttribute('data-ytoc-always-show');
    root.removeAttribute('data-ytoc-progress');
    root.removeAttribute('data-ytoc-highlight');
    root.removeAttribute('data-ytoc-scrubber');
    root.removeAttribute('data-ytoc-video-theme');
    root.removeAttribute('data-ytoc-large-cursor');
    root.removeAttribute('data-ytoc-captions');
    root.style.removeProperty('--ytoc-overlay-opacity');
    root.style.removeProperty('--ytoc-highlight');
    root.style.removeProperty('--ytoc-highlight-end');
    return;
  }

  root.setAttribute('data-ytoc-enabled', 'true');
  root.setAttribute('data-ytoc-profile', currentSettings.accessibilityProfile);
  root.toggleAttribute('data-ytoc-always-show', currentSettings.alwaysShowControls);
  root.toggleAttribute('data-ytoc-large-cursor', currentSettings.largeCursor);
  root.toggleAttribute('data-ytoc-video-theme', keepVideoTheme);

  if (currentSettings.progressBarSize === settingsModel.PROGRESS_SIZES.LARGE) {
    root.setAttribute('data-ytoc-progress', 'large');
  } else {
    root.removeAttribute('data-ytoc-progress');
  }

  if (highlight !== settingsModel.HIGHLIGHT_COLORS.DEFAULT) {
    root.setAttribute('data-ytoc-highlight', highlight);
  } else {
    root.removeAttribute('data-ytoc-highlight');
  }

  if (highlight === settingsModel.HIGHLIGHT_COLORS.CUSTOM) {
    root.style.setProperty('--ytoc-highlight', currentSettings.highlightCustomColor);
    if (currentSettings.highlightGradientColor) {
      root.style.setProperty('--ytoc-highlight-end', currentSettings.highlightGradientColor);
    } else {
      root.style.removeProperty('--ytoc-highlight-end');
    }
  } else {
    root.style.removeProperty('--ytoc-highlight');
    root.style.removeProperty('--ytoc-highlight-end');
  }

  if (scrubber !== settingsModel.SCRUBBER_ICONS.DEFAULT) {
    root.setAttribute('data-ytoc-scrubber', scrubber);
  } else {
    root.removeAttribute('data-ytoc-scrubber');
  }

  if (currentSettings.readableCaptions) {
    root.setAttribute('data-ytoc-captions', currentSettings.captionColor);
  } else {
    root.removeAttribute('data-ytoc-captions');
  }

  root.style.setProperty('--ytoc-overlay-opacity', currentSettings.overlayOpacity);
}

// YouTube swaps the decorated scrubber image when a video ships its own
// player theme; re-apply settings when that signal appears or disappears.
let lastVideoThemePresence = null;
let videoThemeCheckPending = false;
const videoThemeObserver = new MutationObserver(() => {
  if (videoThemeCheckPending) return;
  videoThemeCheckPending = true;
  requestAnimationFrame(() => {
    videoThemeCheckPending = false;
    const presence = videoHasOwnTheme();
    if (presence === lastVideoThemePresence) return;
    lastVideoThemePresence = presence;
    applySettings(currentSettings);
  });
});
videoThemeObserver.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['src']
});

function showHud(title, detail, duration = 1800) {
  const player = document.getElementById('movie_player');
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
  }, duration);
}

function maybeShowPlayerHint() {
  if (
    !settingsInitialized
    || window !== window.top
    || location.pathname !== '/watch'
    || !currentSettings.extensionEnabled
    || playerHintCheckPending
    || playerHintShown
  ) return;

  if (!document.getElementById('movie_player')) {
    if (playerHintRetryCount < 10 && !playerHintRetryTimer) {
      playerHintRetryCount += 1;
      playerHintRetryTimer = setTimeout(() => {
        playerHintRetryTimer = null;
        maybeShowPlayerHint();
      }, 500);
    }
    return;
  }

  playerHintRetryCount = 0;
  playerHintCheckPending = true;
  chrome.storage.local.get('playerHintPending', stored => {
    playerHintCheckPending = false;
    if (!stored.playerHintPending || !currentSettings.extensionEnabled) return;

    playerHintShown = true;
    chrome.storage.local.set({ playerHintPending: false }, () => {
      showHud(
        chrome.i18n.getMessage('playerHintTitle'),
        chrome.i18n.getMessage('playerHintBody'),
        8000
      );
    });
  });
}

function initializeSettings() {
  chrome.storage.sync.get(null, result => {
    const migrated = settingsModel.migrateSettings(result);
    applySettings(migrated);
    settingsInitialized = true;
    maybeShowPlayerHint();

    if (settingsModel.needsMigration(result, migrated)) {
      chrome.storage.sync.set(migrated);
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'sync') return;

  applySettings(settingsModel.applyStorageChanges(currentSettings, changes));
  maybeShowPlayerHint();
});

document.addEventListener('yt-navigate-finish', () => {
  if (playerHintRetryTimer) clearTimeout(playerHintRetryTimer);
  playerHintRetryTimer = null;
  playerHintRetryCount = 0;
  maybeShowPlayerHint();
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
