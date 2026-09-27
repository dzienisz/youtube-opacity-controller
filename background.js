// MV3 service worker: keyboard command handling and update bookkeeping.

importScripts('settings.js');

const PROFILE_NAME_KEYS = {
  standard: 'profileStandard',
  'high-contrast': 'profileHighContrast',
  'low-vision': 'profileLowVision'
};

function message(key) {
  return chrome.i18n.getMessage(key);
}

function sendHud(title, detail) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { action: 'showHud', title, detail }).catch(() => {});
  });
}

chrome.commands.onCommand.addListener(command => {
  chrome.storage.sync.get(null, result => {
    const settings = YtocSettings.migrateSettings(result);
    const next = YtocSettings.applyCommand(settings, command);

    chrome.storage.sync.set(next, () => {
      switch (command) {
        case 'toggle-enhancements':
          sendHud(message(next.extensionEnabled ? 'hudEnhancementsOn' : 'hudEnhancementsOff'));
          break;
        case 'cycle-profile':
          sendHud(message(PROFILE_NAME_KEYS[next.accessibilityProfile]), message('hudProfileHint'));
          break;
        case 'toggle-always-show':
          sendHud(message(next.alwaysShowControls ? 'hudControlsVisible' : 'hudControlsAutoHide'));
          break;
        default:
          break;
      }
    });
  });
});

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'update') {
    chrome.storage.local.set({ whatsNewVersion: chrome.runtime.getManifest().version });
  }
});
