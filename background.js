// MV3 background context: keyboard command handling and update bookkeeping.

if (typeof importScripts === 'function') importScripts('settings.js');

function message(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions);
}

function profileShortcutHint(shortcut) {
  return shortcut ? message('hudProfileHint', shortcut) : undefined;
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
          chrome.commands.getAll(commands => {
            const shortcut = commands.find(item => item.name === 'cycle-profile')?.shortcut;
            sendHud(
              message(YtocSettings.PROFILE_MESSAGE_KEYS[next.accessibilityProfile]),
              profileShortcutHint(shortcut)
            );
          });
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
  if (details.reason === 'install') {
    chrome.storage.local.set({ installedAt: Date.now() });
  }

  if (details.reason === 'update') {
    chrome.storage.sync.get(null, stored => {
      const hasSettings = Object.keys(YtocSettings.LEGACY_DEFAULTS)
        .some(key => Object.prototype.hasOwnProperty.call(stored || {}, key));

      if (!hasSettings) {
        chrome.storage.sync.set({
          ...YtocSettings.LEGACY_DEFAULTS,
          settingsSchemaVersion: YtocSettings.SCHEMA_VERSION
        });
      }
    });
    chrome.storage.local.get('installedAt', stored => {
      const localSettings = {
        whatsNewVersion: chrome.runtime.getManifest().version
      };
      if (!Object.prototype.hasOwnProperty.call(stored || {}, 'installedAt')) {
        localSettings.installedAt = Date.now();
      }
      chrome.storage.local.set(localSettings);
    });
  }
});
