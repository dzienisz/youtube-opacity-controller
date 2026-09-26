# Release Testing Checklist

Run `npm run check` before manual testing. Load the repository through **Load unpacked** at `chrome://extensions/`, then refresh every existing YouTube tab.

## Automated Gate

- [ ] `npm run check` exits successfully.
- [ ] All settings migration tests pass.
- [ ] `manifest.json` loads without Chrome errors.
- [ ] The console contains no content-script or popup errors.

## Migration

Test with an installation that already contains `overlayOpacity` and `alwaysShowControls`.

- [ ] Version 1.7 opens with the Clear Controls style selected.
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

### Larger Controls

- [ ] Buttons retain correct alignment and have the intended 48px target size.
- [ ] Icons and timestamps are visibly larger.
- [ ] The bottom bar does not overflow or hide essential controls.
- [ ] Selecting the style sets the initial background to 95%.

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

Do not publish when any critical player control fails, the Larger Controls style causes overflow, migration loses a preference, or console/storage errors occur.

Record the Chrome version, operating system, YouTube URL, player mode, browser zoom, selected style, and screenshot for every failure.
