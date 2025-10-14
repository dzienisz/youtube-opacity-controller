# Screenshots Guide for Chrome Web Store

Chrome Web Store requires **1-5 screenshots** of your extension in action.

## Required Dimensions
- **1280x800 pixels** (recommended)
- OR **640x400 pixels**

## Recommended Screenshots to Take

### Screenshot 1: Extension Popup with Slider (REQUIRED)
**What to show:**
- YouTube video page open
- Extension popup open showing the opacity slider
- Slider set to around 70%
- Video player visible in background with black backgrounds applied

**How to take it:**
1. Open YouTube video: https://www.youtube.com/watch?v=YmcACIOQdDc
2. Pause the video so controls are visible
3. Click the extension icon to open popup
4. Take screenshot of the entire browser window
5. Crop to 1280x800 focusing on the popup and player

### Screenshot 2: Before/After Comparison
**What to show:**
- Side-by-side or split screen showing:
  - Left: Original YouTube with transparent controls
  - Right: YouTube with black backgrounds applied

**How to create:**
1. Take screenshot with extension disabled (transparent controls)
2. Take screenshot with extension at 100% (solid black)
3. Use image editor to combine into one 1280x800 image

### Screenshot 3: Settings Menu
**What to show:**
- YouTube video with settings menu open
- Black background applied to settings panel
- Shows how the extension improves visibility of menus

**How to take it:**
1. Open YouTube video
2. Click settings button (gear icon)
3. Take screenshot showing the settings menu with black background

### Screenshot 4: Different Opacity Levels
**What to show:**
- Multiple examples at different opacity levels (25%, 50%, 75%, 100%)
- Can be a collage or single image showing the progression

### Screenshot 5: Fullscreen Mode (Optional)
**What to show:**
- YouTube video in fullscreen
- Controls visible with black backgrounds
- Shows extension works in fullscreen too

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
