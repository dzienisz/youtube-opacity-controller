# Release Testing Checklist

Run `npm run check` before manual testing. Load the repository through **Load unpacked** at `chrome://extensions/`, then refresh every existing YouTube tab.

## Firefox Temporary Add-on

- [ ] Run `npm run build:firefox` to generate `dist/firefox/`.
- [ ] Open `about:debugging#/runtime/this-firefox` in Firefox.
- [ ] Select **Load Temporary Add-on…** and choose `dist/firefox/manifest.json`.
- [ ] Refresh an open YouTube tab and verify the popup, player styles, and keyboard shortcuts.
- [ ] After changing source files, rebuild the package and reload the temporary add-on.

## Automated Gate

- [ ] `npm run check` exits successfully.
- [ ] All settings migration tests pass.
- [ ] `manifest.json` loads without Chrome errors.
- [ ] The console contains no content-script or popup errors.

To preview the Chrome-only rating prompt, set `installedAt` to at least eight days ago, `popupOpens` to `2`, `ratePromptDone` to `false`, and `ratePromptShown` to `0` in `chrome.storage.local`, then reopen the popup. Keep the current What's new version dismissed to show the rating prompt.

## Live Canary

The weekly canary checks the live YouTube watch player and an embedded player for the DOM selectors and key styles used by `overlay-fix.css`. It records the player variants, check results, and screenshots in `canary-artifacts/`. The workflow runs Mondays at 06:00 UTC; it can also be started manually or by changes to the canary script or workflow. GitHub runners usually receive YouTube's bot wall, so the scheduled canary checks DOM and styles only; its visual result is not verified.

Run it locally with `xvfb-run -a npm run canary`. **INCONCLUSIVE** means YouTube did not expose the player controls or a bot/sign-in wall or player error made the result unverified; it is not treated as a canary failure.

## Migration

Test with an installation that already contains `overlayOpacity` and `alwaysShowControls`.

- [ ] Version 2.0 opens with the Clear Controls style selected.
- [ ] Existing background strength is preserved.
- [ ] Existing always-show preference is preserved.
- [ ] New schema, enabled state, and style values persist after restarting Chrome.
- [ ] Reset restores Clear Controls, 70%, enabled, and auto-hide allowed.

## Popup Accessibility

Complete the following using only the keyboard.

- [ ] Tab order reaches the master switch, all control styles, keep-visible option, customization disclosure, slider, and reset button.
- [ ] Every focused element has a visible focus indicator.
- [ ] Arrow keys select control-style radios and adjust the slider.
- [ ] Space toggles checkboxes and opens the customization disclosure.
- [ ] Status changes are announced by a screen reader.
- [ ] Disabling the master switch removes the settings panel from keyboard interaction.
- [ ] Re-enabling restores the saved settings.
- [ ] Reduced-motion mode removes nonessential transitions.

## Control Styles

Use bright and visually busy footage for comparison.

### Clear Controls

- [ ] The background defaults to 70% for a new installation.
- [ ] Native control dimensions remain unchanged.
- [ ] Custom background changes apply immediately from 0% through 100%.

### Strong Contrast

- [ ] Control bars, menus, tooltips, and buttons have stronger dark backgrounds.
- [ ] Text and icons remain fully visible.
- [ ] Selecting the style sets the initial background to 90%.

## Player Regression Matrix

Repeat critical checks in normal, theater, and fullscreen modes at 100%, 125%, and 150% browser zoom.

- [ ] Play and pause work.
- [ ] Volume button and volume slider work.
- [ ] Captions button works.
- [ ] Settings, quality, and playback-speed menus work.
- [ ] Fullscreen enters and exits correctly.
- [ ] Progress bar remains aligned.
- [ ] Scrubbing works across the full timeline.
- [ ] Seek-preview thumbnail remains visible and unmodified.
- [ ] Chapter title and text tooltip remain readable.
- [ ] Native auto-hide works when always-show is disabled.
- [ ] Top and bottom bars stay visible when always-show is enabled.
- [ ] No button changes position unexpectedly.
- [ ] No player node is moved or duplicated.

## Navigation and Persistence

- [ ] Navigate between at least three videos without a page reload.
- [ ] Allow autoplay to advance to another video.
- [ ] Open a video in a new tab.
- [ ] Restart Chrome.
- [ ] The selected style and custom settings persist in every case.
- [ ] Master off removes all `data-ytoc-*` effects and the inline `--ytoc-overlay-opacity` property.

## Performance

In Chrome DevTools while a video plays:

- [ ] No repeating extension timer runs while idle.
- [ ] No extension `MutationObserver` is active.
- [ ] No continuous style or DOM mutations are attributed to the extension.
- [ ] Dragging the background slider does not trigger storage quota errors.
- [ ] The Network panel shows no extension-origin external requests.

## Release Gate

Do not publish when any critical player control fails, a control style causes overflow, migration loses a preference, or console/storage errors occur.

Record the Chrome version, operating system, YouTube URL, player mode, browser zoom, selected style, and screenshot for every failure.
