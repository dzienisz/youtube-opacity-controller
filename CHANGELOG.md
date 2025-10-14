# Changelog

All notable changes to YouTube Overlay Opacity Controller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1] - 2024-10-14

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
