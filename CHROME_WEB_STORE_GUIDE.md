# Chrome Web Store Submission Guide

## Required Items

### 1. Extension ZIP File
✅ Will be created automatically from the project files

### 2. Store Listing Information

#### Short Description (max 132 characters)
```
Control opacity of YouTube player overlays. Add black backgrounds to transparent controls for better visibility.
```
(126 characters)

#### Detailed Description
```
YouTube Overlay Opacity Controller allows you to customize the transparency of YouTube's new player controls by adding adjustable black backgrounds.

🎯 FEATURES:
• Adjustable opacity slider (0-100%)
• Quick preset buttons for common settings
• Real-time updates as you adjust
• Works on all YouTube video pages
• Settings persist across browser sessions
• Clean, modern user interface
• Default 70% opacity for optimal visibility

🎨 WHAT IT CONTROLS:
This extension adds black backgrounds to YouTube's transparent player elements:
• Player control buttons (play, pause, volume, settings, etc.)
• Progress bar and time displays
• Video title and channel name overlays
• Tooltips and chapter titles
• Menu panels and settings popups
• Gradient overlays
• All other semi-transparent UI elements within the player

🔒 PRIVACY:
• Only runs on YouTube.com
• Does not collect any data
• Does not track your viewing history
• Does not communicate with external servers
• Only stores your opacity preference locally

💡 HOW TO USE:
1. Navigate to any YouTube video
2. Click the extension icon in your Chrome toolbar
3. Use the slider to adjust opacity or choose a preset
4. Changes apply instantly
5. Your preference is saved automatically

Perfect for users who find YouTube's transparent player controls hard to see or prefer a more solid, classic look!
```

### 3. Screenshots (REQUIRED)
You need **1-5 screenshots** of size **1280x800px** or **640x400px**

Screenshots to take:
1. YouTube video with extension popup open showing the slider
2. Before/After comparison (transparent controls vs. with black background)
3. Settings menu with black background applied
4. Different opacity levels demonstration

### 4. Promotional Images (OPTIONAL but recommended)

#### Small Promotional Tile (440x280px)
Shows in search results and category pages

#### Marquee Promotional Tile (1400x560px)
Shows on the extension's detail page

### 5. Category
**Accessibility** or **Productivity**

### 6. Language
**English** (and/or **Polish** if you want to add Polish localization)

### 7. Privacy Policy (REQUIRED)
Chrome Web Store requires a privacy policy URL.

**Use this URL:**
```
https://github.com/dzienisz/youtube-opacity-controller/blob/main/PRIVACY.md
```

The PRIVACY.md file in the repository contains:
- Clear statement: NO data collection
- Detailed explanation of all permissions
- What the extension does and doesn't do
- Open source transparency

## Chrome Web Store Developer Account

### Cost
**$5 USD one-time registration fee**

### Steps
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Pay the $5 registration fee
4. Accept developer agreement
5. Complete account setup

## Submission Process

1. Log in to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload the ZIP file
4. Fill in store listing information
5. Upload screenshots and promotional images
6. Select category and language
7. Set pricing (Free)
8. **Privacy practices** - Fill in:
   - Privacy policy: `https://github.com/dzienisz/youtube-opacity-controller/blob/main/PRIVACY.md`
   - Data usage: Select "Does not collect user data"
9. **Justification for permissions** (Chrome will ask):
   - **storage**: "To save user's opacity preference setting (0-100%) locally"
   - **activeTab**: "To apply CSS style changes to YouTube player elements"
   - **youtube.com host**: "To inject content script that adds black backgrounds to transparent player controls"
10. Submit for review

## Review Time
Typically **1-3 days** for first review, sometimes up to a week.

## After Approval
Your extension will be live at:
`https://chromewebstore.google.com/detail/[unique-id]`
