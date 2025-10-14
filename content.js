// YouTube Overlay Opacity Controller
// Adds black backgrounds to YouTube's transparent player elements

const DEFAULT_OPACITY = 0.7;
let currentOpacity = DEFAULT_OPACITY;
let applyTimeout = null;
let playerObserver = null;
let urlObserver = null;
let lastUrl = location.href;

// Single function to apply styles using CSS custom property
function applyOpacity(opacity) {
  currentOpacity = opacity;
  const playerContainer = document.querySelector('#movie_player');
  if (!playerContainer) return;

  // Use CSS custom property for efficiency
  playerContainer.style.setProperty('--yt-overlay-bg-opacity', opacity);

  // Apply background colors in one pass
  const bgColor = `rgba(0, 0, 0, ${opacity})`;
  const buttonBgColor = opacity > 0.5 ? `rgba(0, 0, 0, ${opacity * 0.3})` : '';

  // Main containers - combined selector for efficiency
  const mainContainers = '.ytp-chrome-controls, .ytp-chrome-top, .ytp-chrome-bottom, .ytp-gradient-top, .ytp-gradient-bottom';
  playerContainer.querySelectorAll(mainContainers).forEach(el => {
    el.style.cssText = `
      background: ${bgColor} !important;
      background-color: ${bgColor} !important;
      background-image: none !important;
      opacity: 1 !important;
    `;
  });

  // Secondary containers - combined selector
  const secondaryContainers = '.ytp-left-controls, .ytp-right-controls, .ytp-time-display, .ytp-chapter-container, .ytp-volume-area, .ytp-volume-panel, .ytp-settings-menu, .ytp-popup, .ytp-panel, .ytp-panel-menu, .ytp-popup-content, .ytp-tooltip, .ytp-tooltip-bg';
  playerContainer.querySelectorAll(secondaryContainers).forEach(el => {
    el.style.cssText = `
      background: ${bgColor} !important;
      background-color: ${bgColor} !important;
      opacity: 1 !important;
    `;
  });

  // Buttons with optional background
  if (buttonBgColor) {
    playerContainer.querySelectorAll('.yt-spec-button-shape-next, .ytp-button').forEach(el => {
      el.style.cssText = `
        opacity: 1 !important;
        background-color: ${buttonBgColor} !important;
      `;
    });
  } else {
    playerContainer.querySelectorAll('.yt-spec-button-shape-next, .ytp-button').forEach(el => {
      el.style.opacity = '1';
    });
  }

  // Text and icons - make opaque
  const opaqueElements = '.ytp-time-current, .ytp-time-duration, .ytp-chapter-title, .ytp-title, .ytp-menuitem, .yt-spec-button-shape-next__icon, .ytIconWrapperHost, .yt-spec-button-shape-next__button-text-content';
  playerContainer.querySelectorAll(opaqueElements).forEach(el => {
    el.style.opacity = '1';
  });

  // SVG elements
  playerContainer.querySelectorAll('svg, svg path').forEach(el => {
    el.style.opacity = '1';
  });

  // Progress bar z-index fix
  const scrubberElements = '.ytp-scrubber-container, .ytp-scrubber-button, .ytp-play-progress';
  playerContainer.querySelectorAll(scrubberElements).forEach(el => {
    el.style.cssText = `
      z-index: 100 !important;
      position: relative !important;
    `;
  });

  const progressBar = playerContainer.querySelector('.ytp-progress-bar');
  if (progressBar) {
    progressBar.style.cssText = `
      position: relative !important;
      z-index: 50 !important;
    `;
  }
}

// Debounced apply function
function applyOpacityDebounced(opacity) {
  if (applyTimeout) clearTimeout(applyTimeout);
  applyTimeout = setTimeout(() => applyOpacity(opacity), 100);
}

// Get opacity from storage
function getStoredOpacity(callback) {
  chrome.storage.sync.get(['overlayOpacity'], result => {
    const opacity = result.overlayOpacity !== undefined ? result.overlayOpacity : DEFAULT_OPACITY;
    callback(opacity);
  });
}

// Initialize opacity
function initializeOpacity() {
  getStoredOpacity(opacity => {
    currentOpacity = opacity;
    applyOpacity(opacity);
  });
}

// Listen for opacity changes from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.overlayOpacity) {
    applyOpacity(changes.overlayOpacity.newValue);
  }
});

// Start observing player for dynamic changes
function startObserving() {
  const playerContainer = document.querySelector('#movie_player');

  if (!playerContainer) {
    setTimeout(startObserving, 500);
    return;
  }

  // Clean up existing observer
  if (playerObserver) {
    playerObserver.disconnect();
  }

  // Create observer with debounced callback
  playerObserver = new MutationObserver(() => {
    applyOpacityDebounced(currentOpacity);
  });

  playerObserver.observe(playerContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}

// Handle SPA navigation
function setupUrlObserver() {
  if (urlObserver) {
    urlObserver.disconnect();
  }

  // Use more efficient approach - listen to yt-navigate-finish event
  window.addEventListener('yt-navigate-finish', handleNavigation);

  // Fallback: observe for URL changes
  urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      handleNavigation();
    }
  });

  urlObserver.observe(document.querySelector('ytd-app') || document.body, {
    childList: true,
    subtree: true
  });
}

function handleNavigation() {
  lastUrl = location.href;

  // Clean up
  if (playerObserver) {
    playerObserver.disconnect();
    playerObserver = null;
  }

  // Re-initialize
  setTimeout(() => {
    initializeOpacity();
    startObserving();
  }, 1000);
}

// Initialize
function init() {
  initializeOpacity();
  startObserving();
  setupUrlObserver();
}

// Start when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
