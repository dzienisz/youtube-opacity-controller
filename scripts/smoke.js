// End-to-end smoke test: loads the extension in Chromium, verifies the content
// script reacts to settings changes made through the real popup UI.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const fixture = fs.readFileSync(path.join(root, 'test/fixtures/player.html'), 'utf8');

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
      route.fulfill({ contentType: 'text/html', body: fixture });
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

    console.log('SMOKE PASSED');
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch(error => fail(error.stack || String(error)));
