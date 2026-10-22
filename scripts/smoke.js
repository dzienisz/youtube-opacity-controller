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
      return getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0.7)';
    }, null, { timeout: 15000 });
    const overlay = await page.locator('.ytp-chrome-bottom')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (overlay !== 'rgba(0, 0, 0, 0.7)') {
      fail(`expected overlay rgba(0, 0, 0, 0.7), got ${overlay}`);
    }
    const brandingBackground = await page.locator('.branding-img-container')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (brandingBackground !== 'rgba(0, 0, 0, 0)') {
      fail(`expected classic branding background transparent, got ${brandingBackground}`);
    }
    await assertCaptionStyles(page, 'classic default', {
      zoom: '1',
      backgroundColor: 'rgba(8, 8, 8, 0.75)',
      color: 'rgb(255, 255, 255)'
    });

    const modern = await context.newPage();
    await modern.goto('https://www.youtube.com/modern');
    await modern.waitForFunction(() => {
      const rightControls = document.querySelector('.ytp-right-controls');
      return document.documentElement.hasAttribute('data-ytoc-enabled')
        && rightControls
        && getComputedStyle(rightControls).backgroundColor === 'rgba(0, 0, 0, 0.7)';
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
      volumeArea: 'rgba(0, 0, 0, 0.7)',
      timeWrapper: 'rgba(0, 0, 0, 0.7)',
      rightControls: 'rgba(0, 0, 0, 0.7)',
      playButton: 'rgba(0, 0, 0, 0.7)',
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
    await assertCaptionStyles(modern, 'modern default', {
      zoom: '1',
      backgroundColor: 'rgba(8, 8, 8, 0.75)',
      color: 'rgb(255, 255, 255)'
    });

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.setViewportSize({ width: 360, height: 1 });
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
    await popup.emulateMedia({ colorScheme: 'dark' });
    const darkPopupBackground = await popup.locator('body')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    if (darkPopupBackground !== 'rgb(18, 21, 28)') {
      fail(`expected dark popup background rgb(18, 21, 28), got ${darkPopupBackground}`);
    }
    await popup.emulateMedia({ colorScheme: 'light' });
    await popup.setViewportSize({ width: 360, height: 720 });
    await popup.locator('details.customize > summary').click();
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
