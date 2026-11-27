# Chrome Web Store Submission Guide

## Release

- **Product name:** YouTube Controls & Progress Bar
- **Version:** Use the version from the release package
- **Category:** Accessibility
- **Language:** English
- **Pricing:** Free
- **Existing item ID:** `dcmmcbdcbpaoefhnlogalnfnnmjolfbh`

## Store Listing

### Short Description

```text
A progress bar that stays visible when YouTube hides the controls, also in full screen. Plus clearer, larger controls.
```

### Detailed Description

```text
Keep track of where you are in a YouTube video, and see the player controls clearly.

When YouTube hides the controls, YouTube Controls & Progress Bar keeps a thin progress bar at the bottom of the video, also in full screen and in the miniplayer. Turn on the time next to it to see how far you are without moving the mouse.

It also makes the player controls easier to see and use on bright and busy videos, without changing your whole browser or operating system.

FEATURES

• Thin progress bar when the controls hide, in the normal player, full screen, the miniplayer and embedded videos
• Optional elapsed and total time next to the thin bar
• Clear Controls style with an adjustable dark control background
• Strong Contrast style for stronger, clearer controls
• Bigger progress bar with a larger, easier-to-grab handle
• Highlight colors for the progress bar, handle, icons, and time
• Keyboard shortcuts with an on-player confirmation, rebindable at chrome://extensions/shortcuts
• Larger mouse pointer over the video
• Keep Controls Visible, with the progress bar and time still moving
• Instant preview and settings synchronized through Chrome
• Master switch to return to the original YouTube appearance

SAFE BY DESIGN

• Does not move, clone, or replace YouTube controls — adds only the thin progress bar and one small on-player status overlay
• Runs only on youtube.com, including embedded players
• No account, analytics, tracking, advertisements, or external requests
• Open source at github.com/dzienisz/youtube-opacity-controller

HOW TO USE

1. Open a YouTube video. The thin progress bar appears when the controls hide.
2. Select the extension icon to turn the thin bar or its time on or off.
3. Choose Clear Controls or Strong Contrast.
4. New installs start with recommended settings; use "Use recommended settings" in the popup to apply them any time.
5. Optionally keep controls visible, enlarge the progress bar or pointer, pick a highlight color, or customize the background.
6. Press Alt+Shift+Y to toggle enhancements, Alt+Shift+J to cycle styles, Alt+Shift+V to keep controls visible, and Alt+Shift+H to hide or show controls. The on-player style hint shows the assigned shortcut.
7. Use the "Restore YouTube's look" button or master switch at any time to turn every change off; your choices are kept for later.

Designed for viewers who want to see their place in a video at a glance, and for anyone who finds transparent controls difficult to locate, read, or operate.
```

## Screenshots

Upload 1–5 screenshots at 1280×800 or 640×400, in this order:

1. Thin progress bar and time while controls are hidden: **A progress bar that stays visible** / **Even when YouTube hides the controls, also in full screen**.
2. Re-captured popup showing the updated visibility options.
3. Before/after view of the clearer YouTube controls.
4. Highlight colors for the larger progress bar.
5. Embedded YouTube player.

Do not claim complete WCAG compliance, screen-reader remediation for YouTube, or support outside desktop Chrome/Chromium.

## Promotional Images

- Small tile: 440×280
- Large tile: 920×680
- Marquee tile: 1400×560

Use the refreshed promotional images in `store-assets/` for this name and feature set.

## Privacy

Use:

```text
https://github.com/dzienisz/youtube-opacity-controller/blob/main/PRIVACY.md
```

Select **Does not collect user data**.

## Permission Justifications

### `storage`

```text
Stores and synchronizes the enabled state, selected control style, background strength, always-show preference, thin progress-bar and time-label options, progress-bar size, highlight colors, pointer size, and settings schema version. No browsing or viewing data is stored.
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
