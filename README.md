# YouTube Player Accessibility

[![Version](https://img.shields.io/badge/version-1.7-blue.svg)](https://github.com/dzienisz/youtube-opacity-controller/releases)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-brightgreen.svg)](https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A privacy-first Chrome extension that makes YouTube player controls easier to see, click, and keep visible. Choose a clear control style, keep controls visible when needed, or customize the dark background strength.

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh)** · **[Changelog](CHANGELOG.md)** · **[Privacy Policy](PRIVACY.md)** · **[Contributing](CONTRIBUTING.md)**

## Features

- Three control styles: Clear Controls, Strong Contrast, and Larger Controls
- Adjustable dark background behind player controls
- Larger controls and timestamps in the Larger Controls style
- Optional always-visible player controls
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

## Scope

The extension styles only existing YouTube player UI:

- top and bottom control bars;
- player buttons, icons, and timestamps;
- settings menus and panels;
- text tooltips and chapter titles.

It leaves seek-preview thumbnails and progress-bar layout untouched. It does not move, clone, or replace YouTube controls and does not modify video content.

## Compatibility and Migration

Version 1.7 preserves existing `overlayOpacity` and `alwaysShowControls` preferences. Existing installations start on the Clear Controls style with prior values retained.

The release targets desktop Chrome and Chromium-based browsers on `youtube.com`. YouTube interface experiments may require selector updates.

## Development

Requires Node.js with the built-in `node:test` runner.

```bash
npm test
npm run check
```

`npm run check` validates JavaScript syntax and runs settings migration tests.

## Technical Details

- Manifest V3
- `storage` and `activeTab` permissions
- host access restricted to `https://www.youtube.com/*`
- versioned settings schema stored in `chrome.storage.sync`
- namespaced `data-ytoc-*` attributes and `--ytoc-*` CSS properties
- no background service worker, remote code, or external network calls

## Privacy

The extension runs only on YouTube, stores only its settings through Chrome Sync, and does not collect browsing or viewing data. See the [Privacy Policy](PRIVACY.md) for details.

## Support

Report issues at [GitHub Issues](https://github.com/dzienisz/youtube-opacity-controller/issues). Include the Chrome version, YouTube URL, selected profile, screenshot, and relevant console errors.

## License

MIT. See [LICENSE](LICENSE).
