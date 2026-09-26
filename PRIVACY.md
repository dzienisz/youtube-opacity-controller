# Privacy Policy & Permissions

**Last updated: July 13, 2026**

## Data Collection

YouTube Controls: Clearer & Larger does not collect, sell, store on external servers, or transmit personal data. It has no analytics, advertisements, accounts, telemetry, or external network requests.

## Stored Settings

The extension stores only the following preferences in `chrome.storage.sync`:

- whether enhancements are enabled;
- selected control style;
- player-control background strength;
- whether player controls should remain visible;
- settings schema version used for safe migration.

Chrome may synchronize these settings between browsers when you are signed in. The extension developer does not receive or control that synchronization data.

## Required Permissions

### Storage

- **Purpose:** Save and synchronize extension preferences.
- **Data:** The five settings listed above.
- **Limitation:** No video URLs, titles, searches, account details, or viewing history are stored.

### Active Tab

- **Purpose:** Send an immediate settings preview to the active YouTube tab while the popup is open.
- **Use:** Only after you interact with the extension popup.
- **Limitation:** The extension does not read or store browsing history and cannot use this permission on unrelated inactive tabs.

### YouTube Host Access (`https://www.youtube.com/*`)

- **Purpose:** Load the content script and CSS that improve existing player controls.
- **Scope:** Restricted to `youtube.com`; no other website host access is requested.
- **Behavior:** Applies namespaced attributes and CSS properties. It does not extract page or video data, move player elements, or modify video content.

## The Extension Does Not

- collect or transmit viewing history;
- track videos, searches, channels, or clicks;
- contact analytics or advertising services;
- access websites other than YouTube;
- inject remote code;
- create user profiles or identifiers;
- sell or share user data.

## Open Source

The source code is available at:

https://github.com/dzienisz/youtube-opacity-controller

You can inspect the implementation to verify these claims.

## Policy Changes

Material privacy changes will be documented in the repository and reflected by the date at the top of this policy. A future release that collects data would require an explicit policy update and appropriate disclosure before publication.

## Contact

Open a privacy question or issue at:

https://github.com/dzienisz/youtube-opacity-controller/issues
