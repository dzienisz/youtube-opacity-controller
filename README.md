# YouTube Overlay Opacity Controller

[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/dzienisz/youtube-opacity-controller/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/chrome-extension-yellow.svg)](https://chrome.google.com/webstore)

A Chrome extension that allows you to control the opacity of YouTube's transparent player overlays, making them less transparent and more visible.

**📖 [Changelog](CHANGELOG.md)** • **🔒 [Privacy Policy](PRIVACY.md)** • **🤝 [Contributing](CONTRIBUTING.md)**

## Features

- Adjust opacity of YouTube player overlays with a simple slider (0-100%)
- Quick preset buttons for common opacity levels
- Real-time updates as you adjust the slider
- Works on all YouTube video pages
- Persists your settings across browser sessions
- Clean, modern user interface

## Installation

### Install from Source (Developer Mode)

1. Download or clone this extension folder to your computer

2. Open Google Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" by toggling the switch in the top-right corner

4. Click "Load unpacked" button

5. Navigate to and select the `youtube-opacity-controller` folder

6. The extension should now be installed and active

## Usage

1. Navigate to any YouTube video (e.g., https://www.youtube.com/watch?v=YmcACIOQdDc)

2. Click the extension icon in your Chrome toolbar

3. Use the slider to adjust the opacity:
   - **0%** = Completely transparent (invisible)
   - **50%** = Half transparent
   - **100%** = Fully opaque (no transparency)

4. Or use the quick preset buttons:
   - **Fully Opaque** (100%) - No transparency at all
   - **Less Transparent** (75%) - Mostly opaque
   - **Half Transparent** (50%) - Balanced visibility
   - **Very Transparent** (25%) - Mostly transparent

5. Changes apply instantly to the current video

6. Click "Reset to Default" to restore 100% opacity

## What It Controls

This extension modifies the opacity of **inner elements** within YouTube's player that are semi-transparent, including:

- Player control buttons (play, pause, volume, settings, etc.)
- Progress bar and time displays
- Video title and channel name overlays
- SVG icons within buttons
- Tooltips and chapter titles
- Menu panels and settings
- Gradient overlays (top and bottom)
- Channel watermark
- Cards and end screen elements
- All other semi-transparent UI elements within the player

The extension intelligently detects and modifies ANY element with reduced opacity (< 100%) within the YouTube player container.

## Troubleshooting

### Extension not working?

1. Refresh the YouTube page after installing the extension
2. Make sure the extension is enabled in `chrome://extensions/`
3. Check that you're on a YouTube video page (not the homepage)

### Changes not appearing?

- Some overlay elements may load dynamically. Try pausing and playing the video.
- The extension works best when you adjust the opacity while the video is playing.

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Storage, Active Tab
- **Host Permissions**: YouTube only
- **Content Scripts**: Runs on all YouTube pages
- **Storage**: Uses Chrome Sync Storage to persist settings

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main script that modifies YouTube overlays
- `overlay-fix.css` - CSS styles for overlay modifications
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `popup.css` - Popup styling
- `icons/` - Extension icons in multiple sizes
- `CHANGELOG.md` - Version history and release notes
- `PRIVACY.md` - Privacy policy and permissions explanation

## Privacy

This extension:
- Only runs on YouTube.com
- Does not collect any data
- Does not track your viewing history
- Does not communicate with external servers
- Only stores your opacity preference locally

## License

Free to use and modify for personal use.

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.

---

Made with care for those who prefer their overlays less transparent!
