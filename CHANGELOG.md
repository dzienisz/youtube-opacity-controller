# Changelog

All notable changes to YouTube Player Accessibility will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7] - 2026-09-21

### Changed
- Reframed the popup around everyday outcomes: clearer, larger, and visible controls
- Promoted the keep-controls-visible option for faster first-use value
- Moved background customization further into advanced settings
- Updated the extension name and description to be easier for casual users to understand

## [1.6] - 2026-07-14

### Added
- Localization into 9 languages based on Chrome Web Store user regions: Portuguese (Brazil), Spanish, German, Japanese, Korean, Arabic, Ukrainian, Vietnamese, and Hindi
- `_locales/` message catalogs with English as the default locale; extension name, description, popup labels, aria-labels, and status messages all translated
- Right-to-left layout support for Arabic via `@@bidi_dir`
- Translated Chrome Web Store listing copy in `store-assets/store-descriptions.md`

### Changed
- Popup status messages now use `chrome.i18n` message keys with placeholders instead of hardcoded English strings

## [1.5] - 2026-07-13

### Added
- Standard, High Contrast, and Low Vision viewing profiles
- Master switch that removes all extension styling
- Larger control targets, icons, and timestamps in the Low Vision profile
- Versioned settings schema with validation and legacy preference migration
- Accessible profile-first popup with keyboard navigation, visible focus, live status, and reduced-motion support
- Automated tests for migration, normalization, profile defaults, storage changes, and reset behavior

### Changed
- Renamed the extension to YouTube Player Accessibility
- Moved background opacity into an optional customization section
- Replaced per-feature state handling with one normalized settings model shared by the popup and content script
- Scoped all visual behavior to namespaced `data-ytoc-*` attributes and `--ytoc-*` CSS properties
- Updated privacy, testing, and Chrome Web Store documentation for the accessibility release

### Removed
- Outside-player-bar DOM movement and its inactive CSS
- Broad `MutationObserver` and URL observer logic
- Legacy opacity preset buttons and opacity-first product positioning

### Security and Privacy
- Added no telemetry, backend, remote code, or external requests
- Retained host access restricted to `https://www.youtube.com/*`
- Preserved existing `overlayOpacity` and `alwaysShowControls` preferences during migration

## [1.4] - 2026-07-08

### Added
- **New Feature:** Always Show Player Controls option
- Toggle in popup UI to keep the control bar visible at all times
- Works alongside the existing opacity slider and outside-bar mode
- `alwaysShowControls` storage setting (boolean, default: false)

### Fixed
- **Control bar auto-hide works again** — the extension no longer forces the bars to stay permanently visible; use the new "Always Show Player Controls" toggle if you preferred that behavior
- Removed a MutationObserver feedback loop that re-applied inline styles roughly every 100 ms during playback, causing constant CPU usage
- Slider changes no longer risk exceeding the `chrome.storage.sync` write quota — persisting is debounced while live preview goes through direct messaging
- Seek-preview thumbnails are no longer touched at all; the dark background applies only to text tooltips
- Popup default opacity now matches the content script default (70%); "Reset to Default" restores 70%
- Popup now communicates directly with the content script via `chrome.runtime.onMessage` for instant updates
- Removed redundant storage writes from the content-script message handler

### Changed
- Styling is now driven by a single CSS custom property (`--yt-overlay-bg-opacity`) set on `<html>`, with all rules in `overlay-fix.css`, instead of per-element inline styles re-applied by JavaScript — faster and far more robust against YouTube DOM changes
- Removed dead code: unused cloned-bar helper, redundant popup keyboard handler, empty placeholder CSS rules
- Temporarily disabled the outside player bar feature (UI removed; code kept for later re-enable)
- Updated Chrome Web Store promotional images (small, large, and marquee tiles)
- Added 920x680 large promotional tile to the store-assets
- Updated README and Chrome Web Store guide with new feature details

## [1.3] - 2024-10-23

### Added
- **New Feature:** Move Player Bar Outside Video option
- Toggle control in popup UI to enable/disable outside player bar mode
- When enabled, the bottom control bar displays below the video instead of overlaying it
- Prevents controls from obstructing video content during playback
- Smooth integration with existing opacity controls
- Settings persist across browser sessions via Chrome Storage API

### Technical Changes
- Added `outsidePlayerBar` storage setting (boolean, default: false)
- Implemented `applyOutsidePlayerBar()` function to move control bar outside `#movie_player` container
- **Control bar is cloned and inserted after the player container in the DOM** (not just reordered)
- Original control bar is hidden, clone is shown outside for true separation from video
- Implemented `setupClonedControls()` to forward click events from clone to original
- MutationObserver syncs the cloned controls with original to maintain functionality
- Added `data-outside-bar` attribute to `#movie_player` for CSS targeting
- Added `data-moved-outside` attribute to cloned control bar
- CSS styles ensure cloned bar appears properly below the player
- Observer pattern ensures positioning persists through YouTube's dynamic updates
- Updated `getStoredSettings()` to handle both opacity and outside bar preferences
- Enhanced toggle UI with smooth animations and visual feedback

### UI Improvements
- Modern toggle switch design with gradient colors matching extension theme
- Clear feature description below toggle for better user understanding
- Responsive layout accommodates new control without increasing popup height significantly

### Why This Update?
This feature was inspired by the popular "Outside YouTube Player Bar" extension. Users who find overlaying controls distracting can now move the control bar below the video for an unobstructed viewing experience while still having full access to playback controls. The feature works seamlessly with the existing opacity controls.

## [1.2] - 2024-10-21

### Fixed
- **Critical:** Fixed progress bar scrubber appearing displaced vertically
- **Critical:** Fixed fullscreen button layout being disrupted by extension (from v1.1)
- **Critical:** Fixed button styles being overwritten causing layout issues (from v1.1)
- **Critical:** Fixed video preview thumbnail getting black overlay on hover
- **Critical:** Fixed black box/frame appearing around video
- Progress bar container now has transparent background to prevent visual interference
- Removed z-index modifications that were causing scrubber to float over entire player
- Scrubber now stays properly positioned within progress bar context
- Tooltips and preview elements excluded from background styling

### Added
- Smooth hover animation on progress bar scrubber
- Scrubber scales up (1.3x) with smooth transition on hover
- Red glow effect on scrubber hover for better visual feedback
- Container hover also triggers subtle scale (1.2x)

### Technical Changes
- Set transparent background on `.ytp-progress-bar-container` to prevent black background from affecting scrubber position
- Removed all z-index modifications on scrubber elements - YouTube's default stacking now works correctly
- Improved scrubber positioning by not interfering with YouTube's native absolute/fixed positioning
- Switched from `cssText` to `style.setProperty()` for all style modifications (from v1.1)
- Only modifies specific CSS properties instead of overwriting entire inline styles
- Added CSS transitions for scrubber: transform and box-shadow
- Excluded `.ytp-gradient-top`, `.ytp-gradient-bottom`, and `.ytp-chrome-controls` from background styling to prevent black box
- Excluded tooltip elements (`.ytp-tooltip`, `.ytp-tooltip-bg`, `.ytp-storyboard-framepreview`, `.ytp-preview`) from background styling
- Preview thumbnails now display correctly without opacity overlay

### Why This Update?
Version 1.1 attempted to fix scrubber visibility with z-index changes, but this caused the scrubber to appear displaced vertically (floating too high). This version removes those z-index modifications and instead uses transparent background on the progress bar container, allowing YouTube's native positioning to work correctly while still maintaining black backgrounds on other controls. Additionally, smooth hover animations improve user experience when interacting with the progress bar.

## [1.1] - 2024-10-14 (Not deployed)

### Fixed
- **Critical:** Fixed fullscreen button layout being disrupted by extension
- **Critical:** Fixed red progress bar scrubber (dot) positioning - now stays visible on top
- Fixed button styles being overwritten causing layout issues
- Improved CSS modification method - now uses `setProperty()` instead of `cssText` to preserve YouTube's native styles

### Technical Changes
- Switched from `cssText` to `style.setProperty()` for all style modifications
- Only modifies specific CSS properties instead of overwriting entire inline styles
- Better preservation of YouTube's native button positioning and layout
- More defensive position setting for progress bar elements

### Why This Update?
Previous version used `cssText` which overwrote ALL inline styles on elements, breaking YouTube's carefully crafted layouts. Now we only modify the specific properties we need (background, opacity, z-index) while preserving everything else.

## [1.0] - 2024-10-14

### Added
- Initial release
- Adjustable opacity slider (0-100%)
- Quick preset buttons (100%, 75%, 50%, 25%)
- Real-time opacity updates
- Settings persistence across browser sessions
- Default 70% opacity for optimal visibility
- Black backgrounds for YouTube player controls:
  - Main control bars (top and bottom)
  - Buttons (play, pause, volume, settings, etc.)
  - Progress bar and time displays
  - Tooltips and chapter titles
  - Settings menus and popups
  - Gradient overlays
- Handles YouTube's SPA navigation (works when switching videos)
- MutationObserver with debouncing for performance
- Z-index management for progress bar scrubber

### Features
- Clean, modern popup interface
- Works on all YouTube video pages
- No data collection - privacy focused
- Open source on GitHub
- Comprehensive privacy policy

### Technical Details
- Chrome Extension Manifest V3
- Uses Chrome Storage API for settings sync
- Content script injection on YouTube
- CSS modifications for transparency control
- Efficient observer pattern for dynamic content

---

## Version History Summary

- **v1.1** - Bug fixes for layout issues (buttons and scrubber)
- **v1.0** - Initial release with core functionality

---

## Planned Future Updates

Potential features for future versions:
- [ ] Keyboard shortcuts for quick opacity adjustment
- [ ] Per-channel opacity settings
- [ ] Different opacity for different elements (bars vs buttons)
- [ ] Dark mode theme for popup
- [ ] Polish language localization
- [ ] Export/import settings
- [ ] Opacity presets customization

## Reporting Issues

Found a bug? Have a suggestion?
- GitHub Issues: https://github.com/dzienisz/youtube-opacity-controller/issues
- Include: Browser version, YouTube URL, screenshot if possible

---

**Note:** This extension is submitted to Chrome Web Store and currently under review.
