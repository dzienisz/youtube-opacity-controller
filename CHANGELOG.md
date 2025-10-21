# Changelog

All notable changes to YouTube Overlay Opacity Controller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
