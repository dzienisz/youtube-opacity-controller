const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const settingsModel = require('../settings.js');

const root = path.join(__dirname, '..');
const artifactsDir = path.join(root, 'canary-artifacts');
const watchUrl = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
const embedPageUrl = 'https://ytoc-canary.test/embed-check';
const embedUrl = 'https://www.youtube.com/embed/aqz-KE-bpKQ';
const watchSelectors = [
  '.ytp-chrome-bottom',
  '.ytp-progress-bar-container',
  '.ytp-progress-bar',
  '.ytp-play-progress',
  '.ytp-scrubber-button',
  '.ytp-play-button',
  '.ytp-time-display',
  '.ytp-time-current',
  '.ytp-time-duration',
  '.ytp-right-controls',
  '.ytp-settings-button'
];
const modernWatchSelectors = ['.ytp-volume-area', '.ytp-time-wrapper'];
const embedProgressSelectors = [
  '.ytp-progress-bar',
  '.ytProgressBarLineHost',
  '.ytChapteredProgressBarHost'
];
const expectedYellow = 'rgb(255, 212, 0)';
const expectedProgressHeight = '12px';
const expectedPillBackground = 'rgba(0, 0, 0, 0.7)';

function createScenario(name, url) {
  return {
    name,
    url,
    variant: 'unknown',
    playability: 'not checked',
    readiness: 'INCONCLUSIVE',
    reason: '',
    checks: [],
    missingSelectors: [],
    selectorsAssessed: false,
    screenshot: ''
  };
}

function record(scenario, check, status, details = '') {
  scenario.checks.push({ check, status, details });
  const suffix = details ? ` — ${details}` : '';
  console.log(`[${scenario.name}] ${status}: ${check}${suffix}`);
}

function addMissingSelector(scenario, selector) {
  if (!scenario.missingSelectors.includes(selector)) {
    scenario.missingSelectors.push(selector);
  }
}

async function acceptConsentIfPresent(scope) {
  if (!scope.url().includes('consent.youtube.com')) return;

  const candidates = [
    scope.locator('#introAgreeButton'),
    scope.getByRole('button', { name: /accept all/i }),
    scope.locator('button[aria-label*="Accept all" i]')
  ];
  for (const candidate of candidates) {
    try {
      if (!(await candidate.count())) continue;
      await candidate.first().click({ timeout: 5000 });
      await scope.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      return;
    } catch {
      continue;
    }
  }
}

async function waitForWatchControls(page) {
  try {
    const handle = await page.waitForFunction(() => {
      const player = document.querySelector('#movie_player');
      const controls = player?.querySelector('.ytp-chrome-bottom');
      if (controls) return { state: 'ready', reason: '' };
      return false;
    }, null, { timeout: 30000, polling: 250 });
    return await handle.jsonValue();
  } catch (error) {
    if (error.name === 'TimeoutError' || /timeout/i.test(error.message)) {
      return { state: 'inconclusive', reason: '#movie_player .ytp-chrome-bottom did not appear within 30 seconds' };
    }
    throw error;
  }
}

async function waitForEmbedFrame(page) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const frame = page.frames().find(candidate => {
      if (candidate === page.mainFrame()) return false;
      try {
        const url = new URL(candidate.url());
        return url.hostname.endsWith('youtube.com')
          && (url.pathname.startsWith('/embed/') || url.hostname === 'consent.youtube.com');
      } catch {
        return false;
      }
    });
    if (frame) {
      await acceptConsentIfPresent(frame);
      try {
        const state = await frame.evaluate(() => {
          const player = document.querySelector('#movie_player');
          if (player) return { state: 'ready', reason: '' };
          return { state: 'waiting', reason: '' };
        });
        if (state.state !== 'waiting') return { frame, ...state };
      } catch {
        return {
          frame,
          state: 'inconclusive',
          reason: 'Embed frame navigated or became unavailable before #movie_player appeared'
        };
      }
    }
    await page.waitForTimeout(250);
  }
  return { frame: null, state: 'inconclusive', reason: 'YouTube embed frame or controls did not appear within 30 seconds' };
}

async function waitForEmbedControls(frame) {
  const player = frame.locator('#movie_player');
  const hasProgress = await frame.evaluate(selectors =>
    selectors.some(selector => document.querySelector(selector)), embedProgressSelectors);
  const playerClass = await player.getAttribute('class') || '';
  const activated = !hasProgress && playerClass.includes('unstarted-mode');

  if (activated) {
    try {
      await player.click({ force: true, timeout: 5000 });
    } catch {
      // A control overlay can intercept the center click while controls initialize.
    }
  }

  try {
    const handle = await frame.waitForFunction(() => {
      const hasProgress = [
        '.ytp-progress-bar',
        '.ytProgressBarLineHost',
        '.ytChapteredProgressBarHost'
      ].some(selector => document.querySelector(selector));
      if (hasProgress) return { state: 'ready', reason: '' };
      return false;
    }, null, { timeout: 10000, polling: 250 });
    const result = await handle.jsonValue();
    if (activated) {
      await frame.evaluate(() => document.querySelector('#movie_player video')?.pause()).catch(() => {});
    }
    return { ...result, activated };
  } catch (error) {
    if (error.name === 'TimeoutError' || /timeout/i.test(error.message)) {
      const controlsPresent = await frame.evaluate(() => [
        '#player-controls',
        '.ytp-chrome-bottom',
        '.ytp-chrome-controls',
        '.ytp-progress-bar-container'
      ].some(selector => document.querySelector(selector)));
      if (controlsPresent) return { state: 'ready', reason: '', activated };
      return {
        state: 'inconclusive',
        reason: 'Embed controls did not appear within 10 seconds after the player loaded',
        activated
      };
    }
    throw error;
  }
}

async function recordInconclusiveWatch(page, scenario, reason) {
  scenario.readiness = 'INCONCLUSIVE';
  scenario.reason = reason;
  const player = page.locator('#movie_player');
  if (await player.count()) {
    scenario.variant = await player.evaluate(element =>
      element.classList.contains('ytp-delhi-modern') ? 'modern' : 'classic'
    );
    record(scenario, 'Player variant', 'PASS', scenario.variant);
  } else {
    scenario.variant = 'unknown (player unavailable)';
    record(scenario, 'Player variant', 'INCONCLUSIVE', scenario.variant);
  }
  record(scenario, 'Player controls', 'INCONCLUSIVE', reason);
  const selectors = scenario.variant === 'modern'
    ? [...watchSelectors, ...modernWatchSelectors]
    : watchSelectors;
  for (const selector of selectors) {
    record(scenario, `Selector ${selector}`, 'INCONCLUSIVE', reason);
  }
  record(scenario, 'html[data-ytoc-enabled]', 'INCONCLUSIVE', reason);
  record(scenario, 'Yellow play-progress color', 'INCONCLUSIVE', reason);
  record(scenario, 'Large progress-bar height', 'INCONCLUSIVE', reason);
  record(scenario, 'Right-controls/pill background', 'INCONCLUSIVE', reason);
}

function recordInconclusiveEmbed(scenario, reason) {
  scenario.readiness = 'INCONCLUSIVE';
  scenario.reason = reason;
  scenario.selectorsAssessed = false;
  record(scenario, 'Embed player', 'INCONCLUSIVE', reason);
  record(scenario, 'Progress DOM variant', 'INCONCLUSIVE', reason);
  record(scenario, 'html[data-ytoc-enabled]', 'INCONCLUSIVE', reason);
}

async function recordWatchChecks(page, scenario) {
  const readiness = await waitForWatchControls(page);
  if (readiness.state !== 'ready') {
    await recordInconclusiveWatch(page, scenario, readiness.reason);
    return;
  }

  scenario.readiness = 'PASS';
  record(scenario, 'Player controls', 'PASS', '#movie_player .ytp-chrome-bottom appeared');
  const player = page.locator('#movie_player');
  scenario.variant = await player.evaluate(element =>
    element.classList.contains('ytp-delhi-modern') ? 'modern' : 'classic'
  );
  record(scenario, 'Player variant', 'PASS', scenario.variant);

  const selectors = scenario.variant === 'modern'
    ? [...watchSelectors, ...modernWatchSelectors]
    : watchSelectors;
  const selectorStates = await player.evaluate((element, required) =>
    Object.fromEntries(required.map(selector => {
      try {
        return [selector, Boolean(element.querySelector(selector))];
      } catch {
        return [selector, false];
      }
    })), selectors);

  for (const selector of selectors) {
    const present = selectorStates[selector];
    record(scenario, `Selector ${selector}`, present ? 'PASS' : 'FAIL', present ? 'present' : 'missing');
    if (!present) addMissingSelector(scenario, selector);
  }
  scenario.selectorsAssessed = true;

  try {
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-ytoc-enabled'), null, {
      timeout: 10000,
      polling: 250
    });
  } catch {
    // The attribute check below records whether the extension applied.
  }
  const enabled = await page.locator('html').evaluate(element => element.hasAttribute('data-ytoc-enabled'));
  record(scenario, 'html[data-ytoc-enabled]', enabled ? 'PASS' : 'FAIL', enabled ? 'present' : 'missing');
  if (!enabled) addMissingSelector(scenario, 'html[data-ytoc-enabled]');

  const progressColorElement = player.locator('.ytp-play-progress');
  if (await progressColorElement.count()) {
    const color = await progressColorElement.evaluate(element => getComputedStyle(element).backgroundColor);
    record(
      scenario,
      'Yellow play-progress color',
      color === expectedYellow ? 'PASS' : 'FAIL',
      `expected ${expectedYellow}; got ${color}`
    );
  } else {
    record(scenario, 'Yellow play-progress color', 'FAIL', '.ytp-play-progress is missing');
  }

  const progressList = player.locator('.ytp-progress-list');
  if (await progressList.count()) {
    const height = await progressList.evaluate(element => getComputedStyle(element).height);
    record(
      scenario,
      'Large progress-bar height',
      height === expectedProgressHeight ? 'PASS' : 'FAIL',
      `expected ${expectedProgressHeight}; got ${height}`
    );
  } else {
    record(scenario, 'Large progress-bar height', 'FAIL', '.ytp-progress-list is missing');
    addMissingSelector(scenario, '.ytp-progress-list (style check)');
  }

  const backgroundSelector = scenario.variant === 'modern'
    ? '.ytp-right-controls'
    : '.ytp-chrome-bottom';
  const backgroundLabel = scenario.variant === 'modern'
    ? 'Modern right-controls/pill background'
    : 'Classic chrome-bottom background';
  const backgroundElement = player.locator(backgroundSelector);
  if (await backgroundElement.count()) {
    try {
      await page.waitForFunction(({ selector, expected }) => {
        const element = document.querySelector(`#movie_player ${selector}`);
        return element && getComputedStyle(element).backgroundColor === expected;
      }, { selector: backgroundSelector, expected: expectedPillBackground }, { timeout: 5000, polling: 100 });
    } catch {
      // The computed value below records a transition or style mismatch.
    }
    const color = await backgroundElement.evaluate(element => getComputedStyle(element).backgroundColor);
    record(
      scenario,
      'Right-controls/pill background',
      color === expectedPillBackground ? 'PASS' : 'FAIL',
      `${backgroundLabel}: expected ${expectedPillBackground}; got ${color}`
    );
  } else {
    record(scenario, 'Right-controls/pill background', 'FAIL', `${backgroundSelector} is missing`);
    addMissingSelector(scenario, `${backgroundSelector} (style check)`);
  }
}

async function recordEmbedChecks(frame, scenario) {
  if (!(await frame.locator('#movie_player').count())) {
    recordInconclusiveEmbed(scenario, scenario.reason || '#movie_player did not appear in the YouTube frame');
    return;
  }

  scenario.readiness = 'PASS';
  record(scenario, 'Embed player', 'PASS', '#movie_player appeared in the embedded frame');
  const progressVariant = await frame.evaluate(selectors =>
    selectors.find(selector => document.querySelector(selector)) || '', embedProgressSelectors);
  scenario.selectorsAssessed = true;
  if (progressVariant) {
    scenario.variant = progressVariant;
    record(scenario, 'Progress DOM variant', 'PASS', progressVariant);
  } else {
    const alternatives = embedProgressSelectors.join(' or ');
    record(scenario, 'Progress DOM variant', 'FAIL', `none of ${alternatives} is present`);
    addMissingSelector(scenario, `one of ${alternatives}`);
  }

  try {
    await frame.waitForFunction(() => document.documentElement.hasAttribute('data-ytoc-enabled'), null, {
      timeout: 10000,
      polling: 250
    });
  } catch {
    // The attribute check below records whether the extension applied.
  }
  const enabled = await frame.locator('html')
    .evaluate(element => element.hasAttribute('data-ytoc-enabled'));
  record(scenario, 'html[data-ytoc-enabled]', enabled ? 'PASS' : 'FAIL', enabled ? 'present' : 'missing');
  if (!enabled) addMissingSelector(scenario, 'html[data-ytoc-enabled]');
}

async function saveScreenshot(scope, fallbackPage, selector, filePath, scenario) {
  try {
    const element = scope?.locator(selector);
    let playerScreenshot = false;
    if (element && await element.count() && await element.first().isVisible()) {
      try {
        await element.first().screenshot({ path: filePath, timeout: 15000 });
        playerScreenshot = true;
      } catch {
        // Fall back to the page when YouTube hides or replaces the player element.
      }
    }
    if (!playerScreenshot) await fallbackPage.screenshot({ path: filePath, timeout: 15000 });

    scenario.screenshot = path.relative(root, filePath);
    record(
      scenario,
      'Screenshot',
      'PASS',
      playerScreenshot ? scenario.screenshot : `player element unavailable; captured page screenshot: ${scenario.screenshot}`
    );
  } catch (error) {
    scenario.screenshot = path.relative(root, filePath);
    record(scenario, 'Screenshot', 'INCONCLUSIVE', error.message);
  }
}

async function probePlayability(scope, scenario) {
  if (!scope) {
    scenario.playability = 'inconclusive: player frame unavailable';
    return;
  }

  let reason;
  try {
    reason = await scope.evaluate(() => {
      const text = document.body?.innerText || '';
      if (/confirm\s+you(?:['’]re|\s+are)\s+not\s+a\s+bot|sign\s+in\s+to\s+confirm/i.test(text)) {
        return 'YouTube bot/sign-in wall text detected';
      }
      if (document.querySelector('.ytp-error')) return '.ytp-error present';

      const errorRenderer = document.querySelector('yt-playability-error-supported-renderers');
      if (errorRenderer) {
        const style = getComputedStyle(errorRenderer);
        const rect = errorRenderer.getBoundingClientRect();
        if (
          style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && rect.width > 0
          && rect.height > 0
        ) {
          return 'yt-playability-error-supported-renderers visible';
        }
      }
      return '';
    });
  } catch (error) {
    scenario.playability = `inconclusive: playability probe failed: ${error.message}`;
    return;
  }

  const blocked = Boolean(reason);
  scenario.playability = blocked ? `blocked: ${reason}` : 'ok';
  if (!blocked) return;

  const styleChecks = new Set([
    'Yellow play-progress color',
    'Large progress-bar height',
    'Right-controls/pill background'
  ]);
  for (const check of scenario.checks) {
    const isSelectorOrStyleCheck = check.check.startsWith('Selector ')
      || check.check === 'Progress DOM variant'
      || check.check === 'html[data-ytoc-enabled]'
      || styleChecks.has(check.check);
    if (check.status !== 'FAIL' || !isSelectorOrStyleCheck) continue;

    check.status = 'INCONCLUSIVE';
    check.details = `blocked: ${check.details}`;
    console.log(`[${scenario.name}] INCONCLUSIVE: ${check.check} — ${check.details}`);
  }
  console.warn(`::warning::${scenario.name} YouTube playability blocked: ${reason}`);
}

function buildReport(scenarios, runnerError) {
  const lines = [
    '# YouTube live canary report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Settings: extension enabled, always show controls, large progress bar, yellow highlight; other values use defaults.',
    ''
  ];

  if (runnerError) {
    lines.push('## Runner error', '', '```text', runnerError, '```', '');
  }

  for (const scenario of scenarios) {
    lines.push(
      `## ${scenario.name}`,
      '',
      `- URL: ${scenario.url}`,
      `- Player variant: ${scenario.variant}`,
      `- Playability: ${scenario.playability}`,
      ...(scenario.playability.startsWith('blocked:')
        ? ["- Note: DOM checks ran against the hidden player behind YouTube's bot wall; visual result not verified."]
        : []),
      `- Readiness: ${scenario.readiness}${scenario.reason ? ` — ${scenario.reason}` : ''}`,
      `- Screenshot: \`${scenario.screenshot || 'not captured'}\``,
      '',
      '| Check | Result | Details |',
      '|---|---|---|'
    );
    for (const check of scenario.checks) {
      const details = (check.details || '').replaceAll('|', '\\|').replaceAll('\n', ' ');
      lines.push(`| ${check.check} | ${check.status} | ${details} |`);
    }
    lines.push(
      '',
      `Missing selectors: ${scenario.missingSelectors.length
        ? scenario.missingSelectors.map(selector => `\`${selector}\``).join(', ')
        : scenario.selectorsAssessed
          ? 'None'
          : `Not assessed (INCONCLUSIVE${scenario.reason ? `: ${scenario.reason}` : ''})`}`,
      ''
    );
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ytoc-canary-'));
  const watch = createScenario('Watch page', watchUrl);
  const embed = createScenario('Embedded player', embedUrl);
  const scenarios = [watch, embed];
  let context;
  let runnerError = '';

  try {
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

    context = await chromium.launchPersistentContext(profile, options);
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const canarySettings = {
      ...settingsModel.DEFAULTS,
      alwaysShowControls: true,
      progressBarSize: 'large',
      highlightColor: 'yellow'
    };
    await worker.evaluate(settings => new Promise(resolve => {
      chrome.storage.sync.set(settings, resolve);
    }), canarySettings);

    const watchPage = await context.newPage();
    await watchPage.setViewportSize({ width: 1280, height: 720 });
    let watchNavigationError = '';
    try {
      await watchPage.goto(watchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await acceptConsentIfPresent(watchPage);
    } catch (error) {
      watchNavigationError = error.message;
    }
    if (watchNavigationError) {
      await recordInconclusiveWatch(
        watchPage,
        watch,
        `watch navigation did not complete: ${watchNavigationError}`
      );
    } else {
      await recordWatchChecks(watchPage, watch);
    }
    await probePlayability(watchPage, watch);
    await saveScreenshot(watchPage, watchPage, '#movie_player', path.join(artifactsDir, 'watch-player.png'), watch);

    const embedPage = await context.newPage();
    await embedPage.setViewportSize({ width: 1280, height: 720 });
    await embedPage.route('https://ytoc-canary.test/**', route => route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `<!doctype html><html><head><meta charset="utf-8"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></body></html>`
    }));

    let embedFrame = null;
    try {
      await embedPage.goto(embedPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const result = await waitForEmbedFrame(embedPage);
      embedFrame = result.frame;
      if (result.state === 'ready') {
        const controls = await waitForEmbedControls(embedFrame);
        if (controls.activated) {
          record(embed, 'Embedded player activation', 'PASS', 'activated the unstarted player to render its controls');
        } else {
          record(embed, 'Embedded player activation', 'PASS', 'controls were already available');
        }
        if (controls.state === 'ready') {
          await recordEmbedChecks(embedFrame, embed);
        } else {
          embed.reason = controls.reason;
          recordInconclusiveEmbed(embed, controls.reason);
        }
      } else {
        embed.reason = result.reason;
        recordInconclusiveEmbed(embed, result.reason);
      }
    } catch (error) {
      embed.reason = `embed navigation/check did not complete: ${error.message}`;
      recordInconclusiveEmbed(embed, embed.reason);
    }
    await probePlayability(embedFrame, embed);
    await saveScreenshot(
      embedFrame,
      embedPage,
      '.player',
      path.join(artifactsDir, 'embed-player.png'),
      embed
    );
  } catch (error) {
    runnerError = error.stack || String(error);
    console.error(`CANARY RUNNER FAILED: ${runnerError}`);
  } finally {
    if (context) await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }

  if (runnerError) {
    for (const scenario of scenarios) {
      if (!scenario.checks.length) {
        record(scenario, 'Canary runner', 'FAIL', 'Browser or extension setup failed');
      }
    }
  }

  for (const scenario of scenarios) {
    if (
      scenario.checks.some(check => check.status === 'INCONCLUSIVE')
      && !scenario.playability.startsWith('blocked:')
    ) {
      console.warn(`::warning::${scenario.name} canary is INCONCLUSIVE: ${scenario.reason || 'one or more checks could not be assessed'}`);
    }
  }

  const report = buildReport(scenarios, runnerError);
  const reportPath = path.join(artifactsDir, 'report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n${report}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
  }

  const failed = Boolean(runnerError)
    || scenarios.some(scenario => scenario.checks.some(check => check.status === 'FAIL'));
  process.exitCode = failed ? 1 : 0;
}

main().catch(error => {
  console.error(`CANARY RUNNER FAILED: ${error.stack || error}`);
  process.exitCode = 1;
});
