# Chrome Web Store Submission Guide

## Release

- **Product name:** YouTube Controls: Clearer & Larger
- **Version:** 2.0
- **Category:** Accessibility
- **Language:** English
- **Pricing:** Free
- **Existing item ID:** `dcmmcbdcbpaoefhnlogalnfnnmjolfbh`

## Store Listing

### Short Description

```text
Make YouTube controls easier to see, click, and keep visible.
```

### Detailed Description

```text
Make YouTube player controls easier to see and use without changing your whole browser or operating system.

YouTube Controls: Clearer & Larger improves the existing player interface on bright and visually busy videos. Choose a ready-made control style, keep controls visible when needed, or customize the background strength.

FEATURES

• Clear Controls style with an adjustable dark control background
• Strong Contrast style for stronger, clearer controls
• Larger Controls style with bigger buttons, icons, timestamps, and menu text
• Bigger progress bar with a larger, easier-to-grab handle
• Highlight colors for the progress bar, handle, icons, and time
• Keyboard shortcuts with an on-player confirmation, rebindable at chrome://extensions/shortcuts
• Larger mouse pointer over the video
• Optional Keep Controls Visible setting
• Instant preview and settings synchronized through Chrome
• Master switch to return to the original YouTube appearance
• Lightweight CSS-only visual changes

SAFE BY DESIGN

• Does not move, clone, or replace YouTube controls — adds only one small on-player status overlay
• Runs only on youtube.com
• No account, analytics, tracking, advertisements, or external requests
• Open source at github.com/dzienisz/youtube-opacity-controller

HOW TO USE

1. Open a YouTube video.
2. Select the extension icon.
3. Choose Clear Controls, Strong Contrast, or Larger Controls.
4. Optionally keep controls visible, enlarge the progress bar or pointer, pick a highlight color, or customize the background.
5. Press Alt+Shift+Y to toggle enhancements, Alt+Shift+P to cycle styles, Alt+Shift+V to toggle keep-controls-visible.
6. Use the master switch at any time to restore the original appearance.

Designed for viewers who find transparent controls difficult to locate, read, or operate on bright and busy video content.
```

## Screenshots

Upload 1–5 screenshots at 1280×800 or 640×400. Replace opacity-only screenshots with the release UI.

1. Before/after on bright footage with **See Every Control Clearly**.
2. Popup showing all three control styles with **Choose the View That Works for You**.
3. Larger Controls style with **Bigger Controls & Timestamps**.
4. Strong Contrast and Keep Controls Visible with **Keep Controls Easy to Find**.
5. Privacy message with **No Tracking. No Account.**

Do not claim complete WCAG compliance, screen-reader remediation for YouTube, or support outside desktop Chrome/Chromium.

## Promotional Images

- Small tile: 440×280
- Large tile: 920×680
- Marquee tile: 1400×560

Existing opacity-controller artwork must be replaced or withheld because it does not represent the three-profile release.

## Privacy

Use:

```text
https://github.com/dzienisz/youtube-opacity-controller/blob/main/PRIVACY.md
```

Select **Does not collect user data**.

## Permission Justifications

### `storage`

```text
Stores and synchronizes the enabled state, selected accessibility profile, control-background strength, always-show preference, progress bar size, highlight color, pointer size, and settings schema version. No browsing or viewing data is stored.
```

### `activeTab`

```text
Sends an immediate preview of settings chosen in the extension popup to the active YouTube tab. It is not used to collect page content or browsing history.
```

### `https://www.youtube.com/*`

```text
Loads the extension's content script and CSS on YouTube so it can style existing player controls. Host access is restricted to YouTube and no page or video data is extracted.
```

## Package Contents

Include only:

- `manifest.json`
- `settings.js`
- `content.js`
- `background.js`
- `overlay-fix.css`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/`
- `_locales/`

Exclude source tests, `package.json`, documentation, store assets, screenshots, Git metadata, and previous ZIP files.

## Submission Steps

1. Complete every item in `TESTING.md`.
2. Build and inspect a fresh release ZIP.
3. Open the existing item in the Chrome Web Store Developer Dashboard.
4. Upload the ZIP as version 2.0.
5. Replace the product name, short description, detailed description, and screenshots.
6. Select Accessibility and English.
7. Confirm the privacy-policy URL and permission justifications.
8. Confirm **Does not collect user data**.
9. Submit for review.
10. After approval, compare active users and acquisition with the saved baseline after 30 days.
