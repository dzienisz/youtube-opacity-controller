# YouTube Player Accessibility

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/dzienisz/youtube-opacity-controller/releases)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-brightgreen.svg)](https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A privacy-first Chrome extension that makes YouTube player controls easier to see, click, and keep visible. Choose a clear control style, keep controls visible when needed, or customize the dark background strength.

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh)** · **[Changelog](CHANGELOG.md)** · **[Privacy Policy](PRIVACY.md)** · **[Contributing](CONTRIBUTING.md)**

## Features

- Three control styles: Clear Controls, Strong Contrast, and Larger Controls
- Adjustable dark background behind player controls
- Larger controls and timestamps in the Larger Controls style
- Optional always-visible player controls
- Bigger progress bar with a larger, easier-to-grab handle
- Highlight colors for the progress bar, handle, icons, and time display
- Larger mouse pointer over the video
- Keyboard shortcuts with on-player confirmation (HUD)
- Master switch that removes all extension styling
- Settings synchronized through Chrome Sync
- No accounts, analytics, tracking, or external requests
- CSS-only visual changes without moving or cloning YouTube elements

## Installation

### Chrome Web Store

1. Open the [Chrome Web Store listing](https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh).
2. Select **Add to Chrome**.
3. Confirm by selecting **Add extension**.
4. Refresh an open YouTube tab after updating from an older version.

### Install from Source

1. Download or clone this repository.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the repository directory.

## Usage

1. Open a YouTube video.
2. Select the extension icon in the Chrome toolbar.
3. Keep the master switch enabled and choose a profile:
   - **Clear Controls:** Balanced visibility for everyday viewing.
   - **Strong Contrast:** Darker controls and clearer buttons.
   - **Larger Controls:** Bigger buttons, icons, and timestamps with stronger contrast.
4. Enable **Keep Controls Visible** if native auto-hide makes controls difficult to find.
5. Expand **More Visibility Options** to set the background from 0% to 100%.
6. Select **Use Recommended Settings** to restore the Clear Controls style at 70%.

Changes apply immediately and persist across browser sessions.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt+Shift+Y` | Toggle all control enhancements on or off |
| `Alt+Shift+P` | Cycle to the next control style |
| `Alt+Shift+V` | Toggle Keep Controls Visible |

Each press shows a small confirmation on the player. Shortcuts can be rebound at `chrome://extensions/shortcuts`.

## Scope

The extension styles only existing YouTube player UI:

- top and bottom control bars;
- player buttons, icons, and timestamps;
- settings menus and panels;
- text tooltips and chapter titles.

It leaves seek-preview thumbnails untouched and only changes progress-bar thickness when the Bigger progress bar option is on. It does not move, clone, or replace YouTube controls and does not modify video content. The only element it adds is one small on-player status overlay (`.ytoc-hud`) that confirms keyboard commands.

## Compatibility and Migration

Version 2.0 migrates settings to schema v3, preserving existing preferences and adding the new progress bar, highlight color, and pointer options with their defaults. Existing installations keep their prior values.

The release targets desktop Chrome and Chromium-based browsers on `youtube.com`. YouTube interface experiments may require selector updates.

## Development

Requires Node.js with the built-in `node:test` runner.

```bash
npm install
npm test        # unit tests (settings model, locale catalogs)
npm run check   # syntax checks + tests
npm run build   # release ZIP in dist/
npm run smoke   # Playwright end-to-end test in Chromium
```

`npm run check` validates JavaScript syntax and runs settings migration and locale tests. `npm run smoke` loads the unpacked extension in Chromium and verifies styling end to end — it needs `xvfb-run -a` on machines without a display.

## Technical Details

- Manifest V3
- `storage` and `activeTab` permissions
- host access restricted to `https://www.youtube.com/*`
- versioned settings schema stored in `chrome.storage.sync`
- namespaced `data-ytoc-*` attributes and `--ytoc-*` CSS properties
- background service worker handles only keyboard commands and update bookkeeping — no remote code or external network calls

## Privacy

The extension runs only on YouTube, stores only its settings through Chrome Sync, and does not collect browsing or viewing data. See the [Privacy Policy](PRIVACY.md) for details.

## Support

Report issues at [GitHub Issues](https://github.com/dzienisz/youtube-opacity-controller/issues). Include the Chrome version, YouTube URL, selected profile, screenshot, and relevant console errors.

## License

MIT. See [LICENSE](LICENSE).
