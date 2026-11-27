# Screenshots Guide for Chrome Web Store

Chrome Web Store requires **1-5 screenshots** of your extension in action.

## Required Dimensions
- **1280x800 pixels** (recommended)
- OR **640x400 pixels**

## Current screenshots

The five `screenshot*.png` files are 1280×800 composites made from real captures
of the unpacked extension on YouTube. Keep the interface itself unmocked; adding
headlines and arranging real captures on a branded background is fine.

1. `screenshot1.png`: hidden controls with the thin progress bar and time label.
   Headline: **A progress bar that stays visible**. Subline: **Even when
   YouTube hides the controls, also in full screen**. Capture around 40–60% of
   a video and choose a scene where the red bar is easy to see.
2. `screenshot2.png`: player with the enabled popup open and the thin-bar option
   checked. Keep “More visibility options” collapsed so the popup and its bottom
   buttons fit without a scrollbar.
3. `screenshot3.png`: before/after comparison of the clearer controls (previous
   `screenshot2.png`).
4. `screenshot4.png`: custom progress-bar color, gradient and handle icon, with controls visible.
5. `screenshot5.png`: YouTube embedded on another site (previous
   `screenshot5.png`).

The former keyboard-shortcuts image is dropped. Preserve the screenshot order
in `scripts/amo-previews.mjs`.

## Capture requirements

- Load the current unpacked extension and use real YouTube watch or embedded
  pages; do not draw or mock the player or popup UI.
- Wait for `#movie_player` to have `ytp-autohide` before capturing screenshot 1.
- Screenshot 1 must show the thin bar and time label while the controls are
  hidden. Capture a second moment when possible to confirm the bar advances.
- For screenshot 2, capture the real popup with the thin-bar rows visible.
- Keep the five final composites at 1280×800 and use consistent typography and
  background styling.

## Tools for Taking Screenshots

### macOS
- **Command + Shift + 4**: Select area to screenshot
- **Command + Shift + 3**: Full screen screenshot
- **Command + Shift + 5**: Screenshot toolbar with more options

### Windows
- **Windows + Shift + S**: Snipping tool
- **PrtScn**: Full screen screenshot
- **Alt + PrtScn**: Active window screenshot

### Chrome Extension for Screenshots
- **Awesome Screenshot** - Can capture specific area and edit
- **Nimbus Screenshot** - Can capture full page or area

## Editing Screenshots

### Online Tools (Free)
- **Photopea**: https://www.photopea.com/ (Photoshop-like)
- **Canva**: https://www.canva.com/ (Easy templates)
- **Pixlr**: https://pixlr.com/ (Online editor)

### Desktop Tools
- **GIMP** (Free, Windows/Mac/Linux)
- **Preview** (macOS - built-in)
- **Paint.NET** (Windows)
- **Photoshop** (Paid)

## Tips
1. **Use high-quality video**: Pick a YouTube video with good visuals
2. **Show contrast**: Make sure the black backgrounds are clearly visible
3. **Keep it clean**: Remove browser bookmarks/tabs that aren't relevant
4. **Add annotations**: You can add arrows or text to highlight features
5. **Consistent size**: All screenshots should be the same dimensions
6. **Good lighting**: Use videos with varied backgrounds to show the effect

## After Creating Screenshots
Save them as:
- `screenshot1.png`
- `screenshot2.png`
- `screenshot3.png`
- etc.

Place them in the `store-assets` folder.

## Quick Command to Resize (if needed)
```bash
# If screenshots are not exactly 1280x800
convert screenshot.png -resize 1280x800^ -gravity center -extent 1280x800 screenshot-resized.png
```
