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
let playerHintPreviewTimer = null;
let playerHintCheckPending = false;
let playerHintShown = false;
let keepControlsAwakeTimer = null;
let keepControlsAwakePointIndex = 0;
let lastRealPointerMove = Date.now();
let thinProgressTimer = null;
let thinProgressElements = null;

function videoHasOwnTheme() {
  return !!document.querySelector('#movie_player .ytp-decorated-scrubber-button[src]');
}

function shouldKeepControlsAwake() {
  return currentSettings.extensionEnabled
    && (currentSettings.alwaysShowControls
      || document.documentElement.hasAttribute('data-ytoc-hint-preview'));
}

function stopKeepingControlsAwake() {
  if (keepControlsAwakeTimer) {
    clearInterval(keepControlsAwakeTimer);
    keepControlsAwakeTimer = null;
  }
  document.documentElement.removeAttribute('data-ytoc-cursor-idle');
}

function keepControlsAwakeTick() {
  if (!shouldKeepControlsAwake()) {
    stopKeepingControlsAwake();
    return;
  }

  const root = document.documentElement;
  const player = document.getElementById('movie_player');
  if (!player) {
    root.removeAttribute('data-ytoc-cursor-idle');
    return;
  }

  const video = player.querySelector('video');
  const videoIsPlaying = video && !video.paused && !video.ended;
  if (videoIsPlaying && Date.now() - lastRealPointerMove > 3000) {
    root.setAttribute('data-ytoc-cursor-idle', '');
  } else {
    root.removeAttribute('data-ytoc-cursor-idle');
  }

  if (
    !player.classList.contains('ytp-autohide')
    || !videoIsPlaying
    || document.visibilityState !== 'visible'
  ) return;

  let target = player.querySelector('.html5-video-container') || player;
  let rect = target.getBoundingClientRect();
  if (rect.width <= 1 || rect.height <= 1) {
    target = player;
    rect = target.getBoundingClientRect();
  }
  if (rect.width <= 1 || rect.height <= 1) return;

  const xOffset = keepControlsAwakePointIndex === 0 ? 100 : 107;
  const yOffset = keepControlsAwakePointIndex === 0 ? 100 : 105;
  keepControlsAwakePointIndex = 1 - keepControlsAwakePointIndex;
  const clientX = Math.min(rect.right - 1, Math.max(rect.left, rect.left + xOffset));
  const clientY = Math.min(rect.bottom - 1, Math.max(rect.top, rect.top + yOffset));
  target.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true,
    clientX,
    clientY
  }));
}

function syncKeepControlsAwake() {
  if (!shouldKeepControlsAwake()) {
    stopKeepingControlsAwake();
    return;
  }

  if (!keepControlsAwakeTimer) {
    // YouTube stops painting progress while autohidden; a moving synthetic mousemove keeps it awake.
    keepControlsAwakeTimer = setInterval(keepControlsAwakeTick, 1000);
  }
}

function getThinProgressElements(player) {
  if (!thinProgressElements) {
    const container = document.createElement('div');
    container.className = 'ytoc-thin-progress';
    container.setAttribute('aria-hidden', 'true');

    const buffer = document.createElement('div');
    buffer.className = 'ytoc-thin-progress-buffer';
    const play = document.createElement('div');
    play.className = 'ytoc-thin-progress-play';
    const time = document.createElement('div');
    time.className = 'ytoc-thin-progress-time';
    container.append(buffer, play, time);

    thinProgressElements = { container, buffer, play, time };
  }

  if (thinProgressElements.container.parentElement !== player) {
    player.appendChild(thinProgressElements.container);
  }
  return thinProgressElements;
}

function formatThinProgressTime(value, showHours) {
  const totalSeconds = Math.floor(Math.max(0, value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (showHours || hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${Math.floor(totalSeconds / 60)}:${String(seconds).padStart(2, '0')}`;
}

function setThinProgressTransform(element, fraction) {
  const transform = `scaleX(${fraction})`;
  if (element.style.transform !== transform) element.style.transform = transform;
}

function updateThinProgress() {
  if (document.visibilityState !== 'visible') return;

  const player = document.getElementById('movie_player');
  if (!player) {
    if (thinProgressElements && !thinProgressElements.container.hidden) {
      thinProgressElements.container.hidden = true;
    }
    return;
  }

  const elements = getThinProgressElements(player);
  const video = player.querySelector('video');
  const duration = video?.duration;
  if (
    window.location.pathname.startsWith('/shorts/')
    || !video
    || player.classList.contains('ad-showing')
    || !Number.isFinite(duration)
    || duration <= 0
  ) {
    if (!elements.container.hidden) elements.container.hidden = true;
    return;
  }

  const currentTime = Number.isFinite(video.currentTime)
    ? Math.min(duration, Math.max(0, video.currentTime))
    : 0;
  const playFraction = currentTime / duration;
  let bufferFraction = 0;
  try {
    for (let index = 0; index < video.buffered.length; index += 1) {
      const start = video.buffered.start(index);
      const end = video.buffered.end(index);
      if (currentTime >= start && currentTime <= end) {
        bufferFraction = end / duration;
        break;
      }
    }
  } catch {
    bufferFraction = 0;
  }

  setThinProgressTransform(elements.buffer, Math.min(1, Math.max(0, bufferFraction)));
  setThinProgressTransform(elements.play, playFraction);
  const showHours = duration >= 3600;
  const timeText = `${formatThinProgressTime(currentTime, showHours)} / ${formatThinProgressTime(duration, showHours)}`;
  if (
    currentSettings.thinProgressTime
    && elements.time.textContent !== timeText
  ) {
    elements.time.textContent = timeText;
  }
  if (elements.container.hidden) elements.container.hidden = false;
}

function stopThinProgress() {
  if (thinProgressTimer) {
    clearInterval(thinProgressTimer);
    thinProgressTimer = null;
  }
  if (thinProgressElements && !thinProgressElements.container.hidden) {
    thinProgressElements.container.hidden = true;
  }
}

function syncThinProgress() {
  if (!currentSettings.extensionEnabled || !currentSettings.thinProgressBar) {
    stopThinProgress();
    return;
  }

  if (!thinProgressTimer) {
    updateThinProgress();
    thinProgressTimer = setInterval(updateThinProgress, 250);
  }
}

document.addEventListener('mousemove', event => {
  if (!event.isTrusted) return;
  lastRealPointerMove = Date.now();
  document.documentElement.removeAttribute('data-ytoc-cursor-idle');
}, { capture: true, passive: true });

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
    stopKeepingControlsAwake();
    stopThinProgress();
    root.removeAttribute('data-ytoc-enabled');
    root.removeAttribute('data-ytoc-profile');
    root.removeAttribute('data-ytoc-always-show');
    root.removeAttribute('data-ytoc-hide-controls');
    root.removeAttribute('data-ytoc-thin-progress');
    root.removeAttribute('data-ytoc-thin-progress-time');
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
  root.toggleAttribute(
    'data-ytoc-hide-controls',
    currentSettings.hideControls && !window.location.pathname.startsWith('/shorts/')
  );
  root.toggleAttribute('data-ytoc-thin-progress', currentSettings.thinProgressBar);
  root.toggleAttribute(
    'data-ytoc-thin-progress-time',
    currentSettings.thinProgressBar && currentSettings.thinProgressTime
  );
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
  syncKeepControlsAwake();
  syncThinProgress();
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
      const previewDuration = 8000;
      if (!document.getElementById('movie_player')) return;
      document.documentElement.setAttribute('data-ytoc-hint-preview', '');
      syncKeepControlsAwake();
      if (playerHintPreviewTimer) clearTimeout(playerHintPreviewTimer);
      playerHintPreviewTimer = setTimeout(() => {
        document.documentElement.removeAttribute('data-ytoc-hint-preview');
        playerHintPreviewTimer = null;
        syncKeepControlsAwake();
      }, previewDuration);
      showHud(
        chrome.i18n.getMessage('playerHintTitle'),
        chrome.i18n.getMessage('playerHintBody'),
        previewDuration
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
  applySettings(currentSettings);
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
