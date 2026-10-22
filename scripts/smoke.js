// End-to-end smoke test: loads the extension in Chromium, verifies the content
// script reacts to settings changes made through the real popup UI.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const fixture = fs.readFileSync(path.join(root, 'test/fixtures/player.html'), 'utf8');
const modernFixture = fs.readFileSync(path.join(root, 'test/fixtures/player-modern.html'), 'utf8');
const embedLineFixture = fs.readFileSync(path.join(root, 'test/fixtures/embed-line.html'), 'utf8');
const embedFixture = fs.readFileSync(path.join(root, 'test/fixtures/embed.html'), 'utf8');

async function assertHeaderLayout(popup) {
  const locales = fs.readdirSync(path.join(root, '_locales'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  if (locales.length !== 15) {
    fail(`expected 15 locales for header geometry checks, found ${locales.length}`);
  }

  const original = await popup.evaluate(() => ({
    eyebrow: document.querySelector('.eyebrow').textContent,
    heading: document.querySelector('h1').textContent,
    direction: document.documentElement.dir
  }));
  try {
    for (const locale of locales) {
      const messages = JSON.parse(fs.readFileSync(
        path.join(root, '_locales', locale, 'messages.json'),
        'utf8'
      ));
      const header = {
        eyebrow: messages.eyebrow.message,
        heading: messages.headerTitle.message,
        direction: locale === 'ar' ? 'rtl' : 'ltr'
      };
      const actual = await popup.evaluate(async ({ eyebrow, heading, direction }) => {
        document.documentElement.dir = direction;
        document.querySelector('.eyebrow').textContent = eyebrow;
        document.querySelector('h1').textContent = heading;
        await document.fonts.ready;
        await new Promise(resolve => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });

        const rect = element => {
          const { top, right, bottom, left } = element.getBoundingClientRect();
          return { top, right, bottom, left };
        };
        const eyebrowElement = document.querySelector('.eyebrow');
        const headingElement = document.querySelector('h1');
        return {
          eyebrow: rect(eyebrowElement),
          heading: rect(headingElement),
          toggle: rect(document.querySelector('.switch')),
          eyebrowOverflow: eyebrowElement.scrollWidth > eyebrowElement.clientWidth + 1,
          headingOverflow: headingElement.scrollWidth > headingElement.clientWidth + 1
        };
      }, header);
      const overlapsToggle = element => element.left < actual.toggle.right
        && element.right > actual.toggle.left
        && element.top < actual.toggle.bottom
        && element.bottom > actual.toggle.top;
      if (overlapsToggle(actual.eyebrow) || actual.eyebrowOverflow) {
        fail(`${locale} eyebrow overlaps the toggle or overflows its column`);
      }
      if (overlapsToggle(actual.heading) || actual.headingOverflow) {
        fail(`${locale} heading overlaps the toggle or overflows its column`);
      }
    }
    console.log(`Popup header geometry passed for ${locales.length} locales`);
  } finally {
    await popup.evaluate(({ eyebrow, heading, direction }) => {
      document.querySelector('.eyebrow').textContent = eyebrow;
      document.querySelector('h1').textContent = heading;
      document.documentElement.dir = direction;
    }, original);
  }
}

function fail(message) {
  console.error(`SMOKE FAILED: ${message}`);
  process.exit(1);
}

async function assertCaptionStyles(player, label, expected) {
  const actual = await player.locator('.caption-window').evaluate(windowEl => {
    const segment = windowEl.querySelector('.ytp-caption-segment');
    const container = windowEl.closest('.ytp-caption-window-container');
    const windowRect = windowEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
      zoom: getComputedStyle(windowEl).zoom,
      backgroundColor: getComputedStyle(segment).backgroundColor,
      color: getComputedStyle(segment).color,
      centerDelta: Math.abs(
        (windowRect.left + windowRect.width / 2)
        - (containerRect.left + containerRect.width / 2)
      )
    };
  });

  for (const [property, value] of Object.entries(expected)) {
    if (property === 'centered') continue;
    if (actual[property] !== value) {
      fail(`expected ${label} ${property} ${value}, got ${actual[property]}`);
    }
  }
  if (expected.centered && actual.centerDelta >= 2) {
    fail(`expected ${label} caption window centered within 2px, got ${actual.centerDelta}px`);
  }
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ytoc-smoke-'));
  const options = {
    args: [
      `--disable-extensions-except=${root}`,
      `--load-extension=${root}`
    ]
  };
  if (process.env.CI) {
    options.channel = 'chromium';
    options.headless = true;
  } else {
    options.headless = false;
  }

  const context = await chromium.launchPersistentContext(profile, options);

  try {
    // The MV3 service worker exposes the extension id.
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const cycleShortcut = await worker.evaluate(() => new Promise(resolve => {
      chrome.commands.getAll(commands => {
        resolve(commands.find(command => command.name === 'cycle-profile')?.shortcut);
      });
    }));
    if (cycleShortcut !== 'Alt+Shift+J') {
      fail(`expected cycle-profile shortcut Alt+Shift+J, got ${cycleShortcut || 'unassigned'}`);
    }
    const hintFormatting = await worker.evaluate(() => ({
      assigned: profileShortcutHint('Alt+Shift+J'),
      unassigned: profileShortcutHint('') === undefined
    }));
    if (!hintFormatting.assigned?.includes('Alt+Shift+J') || !hintFormatting.unassigned) {
      fail(`expected the HUD hint to include an assigned shortcut and omit an unassigned one: ${JSON.stringify(hintFormatting)}`);
    }

    const page = await context.newPage();
    await context.route('https://www.youtube.com/**', route => {
      const url = route.request().url();
      const body = url.includes('/embed/line')
        ? embedLineFixture
        : url.includes('/embed/')
          ? embedFixture
        : url.includes('/modern')
          ? modernFixture
          : fixture;
      route.fulfill({ contentType: 'text/html', body });
    });
    await page.goto('https://www.youtube.com/watch?v=smoke');
    await page.waitForSelector('html[data-ytoc-enabled]', { timeout: 15000 });

    // The overlay background transitions in over 0.2s; wait for the final alpha.
    await page.waitForFunction(() => {
      const el = document.querySelector('.ytp-chrome-bottom');
      return getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0.9)';
    }, null, { timeout: 15000 });
    const overlay = await page.locator('.ytp-chrome-bottom')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (overlay !== 'rgba(0, 0, 0, 0.9)') {
      fail(`expected overlay rgba(0, 0, 0, 0.9), got ${overlay}`);
    }
    const brandingBackground = await page.locator('.branding-img-container')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (brandingBackground !== 'rgba(0, 0, 0, 0)') {
      fail(`expected classic branding background transparent, got ${brandingBackground}`);
    }
    await assertCaptionStyles(page, 'classic recommended', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 255, 255)',
      centered: true
    });

    const modern = await context.newPage();
    await modern.goto('https://www.youtube.com/modern');
    await modern.waitForFunction(() => {
      const rightControls = document.querySelector('.ytp-right-controls');
      return document.documentElement.hasAttribute('data-ytoc-enabled')
        && rightControls
        && getComputedStyle(rightControls).backgroundColor === 'rgba(0, 0, 0, 0.9)';
    }, null, { timeout: 15000 });
    const modernDefaultStyles = await modern.locator('#movie_player').evaluate(player => {
      const backgroundColor = selector => getComputedStyle(player.querySelector(selector)).backgroundColor;
      return {
        chromeBottom: backgroundColor('.ytp-chrome-bottom'),
        volumeArea: backgroundColor('.ytp-volume-area'),
        timeWrapper: backgroundColor('.ytp-time-wrapper'),
        rightControls: backgroundColor('.ytp-right-controls'),
        playButton: backgroundColor('.ytp-play-button'),
        settingsButton: backgroundColor('.ytp-settings-button'),
        branding: backgroundColor('.branding-img-container'),
        rightControlsRadius: getComputedStyle(player.querySelector('.ytp-right-controls')).borderRadius,
        rightControlsMarginTop: getComputedStyle(player.querySelector('.ytp-right-controls')).marginTop
      };
    });
    const expectedModernDefaultStyles = {
      chromeBottom: 'rgba(0, 0, 0, 0)',
      volumeArea: 'rgba(0, 0, 0, 0.9)',
      timeWrapper: 'rgba(0, 0, 0, 0.9)',
      rightControls: 'rgba(0, 0, 0, 0.9)',
      playButton: 'rgba(0, 0, 0, 0.9)',
      settingsButton: 'rgba(0, 0, 0, 0)',
      branding: 'rgba(0, 0, 0, 0)',
      rightControlsRadius: '28px',
      rightControlsMarginTop: '8px'
    };
    for (const [style, expected] of Object.entries(expectedModernDefaultStyles)) {
      const actual = modernDefaultStyles[style];
      if (actual !== expected) {
        fail(`expected modern ${style} ${expected}, got ${actual}`);
      }
    }
    await assertCaptionStyles(modern, 'modern recommended', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 255, 255)',
      centered: true
    });

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.setViewportSize({ width: 360, height: 1 });
    await popup.waitForFunction(() => {
      const profile = document.querySelector('input[name="accessibilityProfile"][value="high-contrast"]');
      return document.getElementById('extensionEnabled').checked
        && profile?.checked
        && document.getElementById('progressBarSize').checked
        && document.getElementById('readableCaptions').checked;
    });
    if (!await popup.locator('#extensionEnabled').isChecked()) {
      fail('expected extension enabled with the recommended settings');
    }
    await assertHeaderLayout(popup);
    await popup.waitForFunction(() => {
      const keys = Array.from(document.querySelectorAll('#shortcutKeys kbd'), key => key.textContent);
      return keys.join('|') === 'Alt|Shift|Y';
    });
    const shortcutKeys = await popup.locator('#shortcutKeys kbd').allTextContents();
    if (JSON.stringify(shortcutKeys) !== JSON.stringify(['Alt', 'Shift', 'Y'])) {
      fail(`expected shortcut keys Alt, Shift, Y, got ${shortcutKeys.join(', ')}`);
    }
    await popup.evaluate(() => new Promise(resolve => {
      chrome.storage.local.set({ whatsNewVersion: '2.0', whatsNewDismissed: '2.0' }, resolve);
    }));
    const closedPopupHeight = await popup.evaluate(() => {
      document.querySelector('details.customize').open = false;
      document.getElementById('whatsNew').hidden = true;
      return document.documentElement.scrollHeight;
    });
    if (closedPopupHeight > 600) {
      fail(`expected closed popup height at most 600px, got ${closedPopupHeight}px`);
    }
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-captions') === 'white';
    }, null, { timeout: 15000 });
    await modern.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-captions') === 'white';
    }, null, { timeout: 15000 });
    await popup.emulateMedia({ colorScheme: 'dark' });
    const darkPopupBackground = await popup.locator('body')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (darkPopupBackground !== 'rgb(18, 21, 28)') {
      fail(`expected dark popup background rgb(18, 21, 28), got ${darkPopupBackground}`);
    }
    await popup.emulateMedia({ colorScheme: 'light' });
    await popup.setViewportSize({ width: 360, height: 720 });
    await popup.locator('details.customize > summary').click();
    await popup.locator('input[name="highlightColor"][value="yellow"]').check();
    await popup.locator('input[name="captionColor"][value="yellow"]').check();
    await popup.locator('#alwaysShowControls').check();
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-highlight') === 'yellow'
        && html.getAttribute('data-ytoc-captions') === 'yellow'
        && html.hasAttribute('data-ytoc-always-show');
    }, null, { timeout: 15000 });

    await popup.locator('#restoreYouTube').click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled'));
    await modern.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled'));
    await popup.waitForTimeout(300);
    const restoredSettings = await popup.evaluate(() => new Promise(resolve => {
      chrome.storage.sync.get(null, resolve);
    }));
    if (restoredSettings.extensionEnabled !== false
      || restoredSettings.accessibilityProfile !== 'high-contrast'
      || restoredSettings.overlayOpacity !== 0.9
      || restoredSettings.progressBarSize !== 'large'
      || restoredSettings.readableCaptions !== true
      || restoredSettings.captionColor !== 'yellow'
      || restoredSettings.highlightColor !== 'yellow'
      || restoredSettings.alwaysShowControls !== true) {
      fail(`Restore YouTube changed saved choices: ${JSON.stringify(restoredSettings)}`);
    }
    const restoreState = await popup.evaluate(() => ({
      enabled: document.getElementById('extensionEnabled').checked,
      restoreDisabled: document.getElementById('restoreYouTube').disabled,
      panelInert: document.getElementById('settingsPanel').inert
    }));
    if (restoreState.enabled || !restoreState.restoreDisabled || !restoreState.panelInert) {
      fail(`expected restored UI disabled with panel inert, got ${JSON.stringify(restoreState)}`);
    }

    await popup.locator('#extensionEnabled').check();
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-highlight') === 'yellow'
        && html.getAttribute('data-ytoc-captions') === 'yellow'
        && html.hasAttribute('data-ytoc-always-show');
    }, null, { timeout: 15000 });
    await modern.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-highlight') === 'yellow'
        && html.getAttribute('data-ytoc-captions') === 'yellow'
        && html.hasAttribute('data-ytoc-always-show');
    }, null, { timeout: 15000 });
    await popup.waitForTimeout(300);
    if (!await popup.locator('#extensionEnabled').isChecked()) {
      fail('expected extension toggle on after re-enabling enhancements');
    }
    if (await popup.locator('#restoreYouTube').isDisabled()) {
      fail('expected Restore YouTube button enabled after turning enhancements back on');
    }

    await popup.locator('#restoreYouTube').click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled'));
    await modern.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled'));
    const inertResetState = await popup.evaluate(() => ({
      enabled: document.getElementById('extensionEnabled').checked,
      restoreDisabled: document.getElementById('restoreYouTube').disabled,
      panelInert: document.getElementById('settingsPanel').inert
    }));
    if (inertResetState.enabled || !inertResetState.restoreDisabled || !inertResetState.panelInert) {
      fail(`expected recommended button available with settings inert, got ${JSON.stringify(inertResetState)}`);
    }

    await popup.locator('#resetSettings').click();
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-captions') === 'white'
        && !html.hasAttribute('data-ytoc-highlight')
        && !html.hasAttribute('data-ytoc-always-show');
    }, null, { timeout: 15000 });
    const recommendedState = await popup.evaluate(() => ({
      enabled: document.getElementById('extensionEnabled').checked,
      profile: document.querySelector('input[name="accessibilityProfile"][value="high-contrast"]').checked,
      progress: document.getElementById('progressBarSize').checked,
      captions: document.getElementById('readableCaptions').checked,
      opacity: document.getElementById('overlayOpacity').value,
      restoreDisabled: document.getElementById('restoreYouTube').disabled
    }));
    if (!recommendedState.enabled || !recommendedState.profile || !recommendedState.progress
      || !recommendedState.captions || recommendedState.opacity !== '90' || recommendedState.restoreDisabled) {
      fail(`expected recommended popup defaults, got ${JSON.stringify(recommendedState)}`);
    }

    await popup.locator('#readableCaptions').check();
    const readableCaptionsStored = await popup.evaluate(() => new Promise(resolve => {
      chrome.storage.sync.get('readableCaptions', result => resolve(result.readableCaptions));
    }));
    if (readableCaptionsStored !== true) {
      fail(`expected readableCaptions stored as true, got ${readableCaptionsStored}`);
    }
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'white');
    await modern.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'white');
    await assertCaptionStyles(page, 'classic readable', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 255, 255)',
      centered: true
    });
    await assertCaptionStyles(modern, 'modern readable', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 255, 255)',
      centered: true
    });
    await popup.locator('input[name="captionColor"][value="yellow"]').check();
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'yellow');
    await modern.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'yellow');
    await assertCaptionStyles(page, 'classic yellow', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 212, 0)',
      centered: true
    });
    await assertCaptionStyles(modern, 'modern yellow', {
      zoom: '1.4',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'rgb(255, 212, 0)',
      centered: true
    });
    await popup.locator('input[name="accessibilityProfile"][value="high-contrast"]').check();
    await popup.locator('#progressBarSize').check();
    await popup.locator('input[name="highlightColor"][value="yellow"]').check();

    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-highlight') === 'yellow';
    }, null, { timeout: 15000 });

    const progressHeight = await page.locator('.ytp-progress-list')
      .evaluate(el => getComputedStyle(el).height);
    if (progressHeight !== '12px') {
      fail(`expected progress-list height 12px, got ${progressHeight}`);
    }

    const progressColor = await page.locator('.ytp-play-progress')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (progressColor !== 'rgb(255, 212, 0)') {
      fail(`expected play-progress rgb(255, 212, 0), got ${progressColor}`);
    }
    const classicTimeColor = await page.locator('.ytp-time-current')
      .evaluate(el => getComputedStyle(el).color);
    if (classicTimeColor !== 'rgb(255, 212, 0)') {
      fail(`expected classic time color rgb(255, 212, 0), got ${classicTimeColor}`);
    }
    const modernTimeColor = await modern.locator('.ytp-time-current')
      .evaluate(el => getComputedStyle(el).color);
    if (modernTimeColor !== 'rgb(255, 212, 0)') {
      fail(`expected modern time color rgb(255, 212, 0), got ${modernTimeColor}`);
    }

    // --- Embed scenario: same settings applied to the newer embed control DOM ---
    const embed = await context.newPage();
    await embed.goto('https://www.youtube.com/embed/test');
    await embed.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-highlight') === 'yellow';
    }, null, { timeout: 15000 });

    const fillStyle = await embed.locator('.ytChapteredProgressBarChapteredPlayerBarFill')
      .evaluate(el => {
        const style = getComputedStyle(el);
        return { height: style.height, backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
      });
    if (fillStyle.height !== '12px') {
      fail(`expected embed fill height 12px, got ${fillStyle.height}`);
    }
    if (fillStyle.backgroundColor !== 'rgb(255, 212, 0)') {
      fail(`expected embed fill background-color rgb(255, 212, 0), got ${fillStyle.backgroundColor}`);
    }
    if (fillStyle.backgroundImage !== 'none') {
      fail(`expected embed fill background-image none, got ${fillStyle.backgroundImage}`);
    }

    const chapterSeenColor = await embed.locator('.ytChapteredProgressBarChapteredPlayerBarChapterSeen')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (chapterSeenColor !== 'rgb(255, 212, 0)') {
      fail(`expected embed chapter background-color rgb(255, 212, 0), got ${chapterSeenColor}`);
    }

    const dotTransform = await embed.locator('.ytProgressBarPlayheadProgressBarPlayheadDot')
      .evaluate(el => getComputedStyle(el).transform);
    if (dotTransform !== 'matrix(1.8, 0, 0, 1.8, 0, 0)') {
      fail(`expected embed playhead transform matrix(1.8, 0, 0, 1.8, 0, 0), got ${dotTransform}`);
    }

    const iconFill = await embed.locator('button.icon-button svg path')
      .evaluate(el => getComputedStyle(el).fill);
    if (iconFill !== 'rgb(255, 212, 0)') {
      fail(`expected embed icon fill rgb(255, 212, 0), got ${iconFill}`);
    }

    const lineEmbed = await context.newPage();
    await lineEmbed.goto('https://www.youtube.com/embed/line');
    await lineEmbed.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'high-contrast'
        && html.getAttribute('data-ytoc-progress') === 'large'
        && html.getAttribute('data-ytoc-highlight') === 'yellow';
    }, null, { timeout: 15000 });

    const playedLineStyle = await lineEmbed.locator('.ytProgressBarLineProgressBarPlayed')
      .evaluate(el => {
        const style = getComputedStyle(el);
        return { height: style.height, backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
      });
    if (playedLineStyle.height !== '12px') {
      fail(`expected embed line height 12px, got ${playedLineStyle.height}`);
    }
    if (playedLineStyle.backgroundColor !== 'rgb(255, 212, 0)') {
      fail(`expected embed line background-color rgb(255, 212, 0), got ${playedLineStyle.backgroundColor}`);
    }
    if (playedLineStyle.backgroundImage !== 'none') {
      fail(`expected embed line background-image none, got ${playedLineStyle.backgroundImage}`);
    }

    // --- Reset: highlight and progress back to default restores embed styling ---
    await popup.locator('input[name="highlightColor"][value="default"]').check();
    await popup.locator('#progressBarSize').uncheck();
    await popup.locator('#readableCaptions').uncheck();

    await embed.waitForFunction(() => {
      const html = document.documentElement;
      return !html.hasAttribute('data-ytoc-highlight') && !html.hasAttribute('data-ytoc-progress');
    }, null, { timeout: 15000 });
    await lineEmbed.waitForFunction(() => {
      const html = document.documentElement;
      return !html.hasAttribute('data-ytoc-highlight') && !html.hasAttribute('data-ytoc-progress');
    }, null, { timeout: 15000 });
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-captions'));
    await modern.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-captions'));
    await assertCaptionStyles(page, 'classic reset', {
      zoom: '1',
      backgroundColor: 'rgba(8, 8, 8, 0.75)',
      color: 'rgb(255, 255, 255)'
    });
    await assertCaptionStyles(modern, 'modern reset', {
      zoom: '1',
      backgroundColor: 'rgba(8, 8, 8, 0.75)',
      color: 'rgb(255, 255, 255)'
    });

    const resetFill = await embed.locator('.ytChapteredProgressBarChapteredPlayerBarFill')
      .evaluate(el => {
        const style = getComputedStyle(el);
        return { height: style.height, backgroundImage: style.backgroundImage };
      });
    if (resetFill.height !== '3px') {
      fail(`expected embed fill height back to 3px, got ${resetFill.height}`);
    }
    if (resetFill.backgroundImage === 'none') {
      fail('expected embed fill background-image restored to a gradient, got none');
    }
    const resetPlayedLineStyle = await lineEmbed.locator('.ytProgressBarLineProgressBarPlayed')
      .evaluate(el => {
        const style = getComputedStyle(el);
        return { height: style.height, backgroundImage: style.backgroundImage };
      });
    if (resetPlayedLineStyle.height !== '3px') {
      fail(`expected embed line height back to 3px, got ${resetPlayedLineStyle.height}`);
    }
    if (!resetPlayedLineStyle.backgroundImage.includes('linear-gradient')) {
      fail(`expected embed line background-image restored to a gradient, got ${resetPlayedLineStyle.backgroundImage}`);
    }

    await popup.locator('#readableCaptions').check();
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'yellow');
    await modern.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-captions') === 'yellow');
    await popup.locator('#extensionEnabled').uncheck();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled')
      && !document.documentElement.hasAttribute('data-ytoc-captions'));
    await modern.waitForFunction(() => !document.documentElement.hasAttribute('data-ytoc-enabled')
      && !document.documentElement.hasAttribute('data-ytoc-captions'));

    await popup.evaluate(() => new Promise(resolve => {
      chrome.storage.sync.set({
        extensionEnabled: true,
        accessibilityProfile: 'low-vision',
        overlayOpacity: 0.95
      }, resolve);
    }));
    await page.reload();
    await page.waitForFunction(() => document.documentElement.getAttribute('data-ytoc-profile') === 'high-contrast');
    await popup.reload();
    await popup.waitForFunction(() => {
      const profile = document.querySelector('input[name="accessibilityProfile"][value="high-contrast"]');
      return profile?.checked && document.getElementById('overlayOpacity').value === '95';
    });

    console.log('SMOKE PASSED');
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch(error => fail(error.stack || String(error)));
