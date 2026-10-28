const t = key => chrome.i18n.getMessage(key);

document.documentElement.lang = chrome.i18n.getUILanguage().replace('_', '-');
document.documentElement.dir = t('@@bidi_dir') === 'rtl' || t('welcomeDirection') === 'rtl'
  ? 'rtl'
  : 'ltr';
document.querySelectorAll('[data-i18n]').forEach(element => {
  const message = t(element.dataset.i18n);
  if (message) element.textContent = message;
});
document.querySelectorAll('[data-i18n-alt]').forEach(element => {
  element.alt = t(element.dataset.i18nAlt);
});
document.title = t('welcomeTitle');

chrome.storage.sync.get(null, stored => {
  const settings = YtocSettings.migrateSettings(stored);
  if (YtocSettings.areSettingsEqual(settings, YtocSettings.RECOMMENDED)) return;

  const subtitle = document.querySelector('[data-i18n="welcomeSubtitle"]');
  subtitle.dataset.i18n = 'welcomeSubtitleSaved';
  subtitle.textContent = t('welcomeSubtitleSaved');
});

chrome.commands.getAll(commands => {
  document.querySelectorAll('[data-command]').forEach(element => {
    const shortcut = commands.find(command => command.name === element.dataset.command)?.shortcut || '';
    element.replaceChildren();

    if (!shortcut) {
      element.textContent = t('welcomeNotSet');
      return;
    }

    shortcut.split('+').forEach((key, index) => {
      if (index > 0) element.append(document.createTextNode('+'));
      const keyElement = document.createElement('kbd');
      keyElement.textContent = key.trim();
      element.append(keyElement);
    });
  });
});
