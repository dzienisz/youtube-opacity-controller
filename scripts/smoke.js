// End-to-end smoke test: loads the extension in Chromium, verifies the content
// script reacts to settings changes made through the real popup UI.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const fixture = fs.readFileSync(path.join(root, 'test/fixtures/player.html'), 'utf8');
const embedFixture = fs.readFileSync(path.join(root, 'test/fixtures/embed.html'), 'utf8');

function fail(message) {
  console.error(`SMOKE FAILED: ${message}`);
  process.exit(1);
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
      const body = route.request().url().includes('/embed/') ? embedFixture : fixture;
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

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.locator('details.customize > summary').click();
    await popup.locator('input[name="accessibilityProfile"][value="low-vision"]').check();
    await popup.locator('#progressBarSize').check();
    await popup.locator('input[name="highlightColor"][value="yellow"]').check();

    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'low-vision'
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

    // --- Embed scenario: same settings applied to the newer embed control DOM ---
    const embed = await context.newPage();
    await embed.goto('https://www.youtube.com/embed/test');
    await embed.waitForFunction(() => {
      const html = document.documentElement;
      return html.getAttribute('data-ytoc-profile') === 'low-vision'
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

    // --- Reset: highlight and progress back to default restores embed styling ---
    await popup.locator('input[name="highlightColor"][value="default"]').check();
    await popup.locator('#progressBarSize').uncheck();

    await embed.waitForFunction(() => {
      const html = document.documentElement;
      return !html.hasAttribute('data-ytoc-highlight') && !html.hasAttribute('data-ytoc-progress');
    }, null, { timeout: 15000 });

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

    console.log('SMOKE PASSED');
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch(error => fail(error.stack || String(error)));
