# Privacy Policy & Permissions

## Data Collection
**This extension does NOT collect, store, or transmit any personal data.**

## Required Permissions

### Storage Permission
- **Why needed:** To save your opacity preference (0-100%)
- **What is stored:** A single numeric value representing your chosen opacity level
- **Where stored:** Locally in your browser using Chrome's storage API
- **Sync:** Settings sync across your Chrome devices if you're signed in

### Active Tab Permission
- **Why needed:** To apply opacity changes to the YouTube page you're viewing
- **When used:** Only when you click the extension icon
- **What it accesses:** The current YouTube tab to modify player CSS styles
- **Limitations:** Cannot access other tabs or your browsing history

### YouTube Host Permission (`https://www.youtube.com/*`)
- **Why needed:** To inject the content script that modifies player overlay opacity
- **What it does:** Adds black backgrounds to YouTube player controls
- **Scope:** Only YouTube.com - no access to any other websites
- **Method:** CSS style modifications only - no data extraction

## What This Extension Does NOT Do

❌ Does NOT collect your viewing history
❌ Does NOT track which videos you watch
❌ Does NOT send any data to external servers
❌ Does NOT display ads or analytics
❌ Does NOT access your personal information
❌ Does NOT access other websites besides YouTube
❌ Does NOT modify video content or inject advertisements

## What This Extension DOES Do

✅ Modifies CSS styles of YouTube player controls
✅ Adds black backgrounds to transparent elements
✅ Saves your opacity preference locally
✅ Listens for changes to your settings
✅ Re-applies styles when YouTube's player updates

## Open Source
This extension is open source and available for review at:
https://github.com/dzienisz/youtube-opacity-controller

You can inspect the code to verify these privacy claims.

## Contact
If you have questions or concerns about privacy, please open an issue on GitHub.

---

**Last Updated:** October 2024
