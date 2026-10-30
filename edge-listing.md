# Microsoft Edge Add-ons Listing

Source of truth for the Microsoft Edge Add-ons listing. Update this file first,
then copy the text into Partner Center.

Edge uses the Chrome Manifest V3 package unchanged. Upload the
`youtube-controls-<version>.zip` release asset; no separate Edge build is
needed.

## Name

YouTube Controls: Clearer & Larger

## Short description

Make YouTube controls easier to see, click, and keep visible.

## Full description

Make YouTube player controls easier to see, click, and keep visible.

New installs start with recommended settings: strong contrast, a bigger
progress bar, and easier-to-read subtitles. Use "Use recommended settings" to apply
them any time, or choose clear or strong-contrast controls, keep controls
visible, adjust the progress bar, or choose any highlight color and a handle
icon for the progress bar, handle, icons, and time display.

Easier-to-read subtitles are larger on a solid dark background, with white or
yellow text, and apply only when you turn captions on in a video. A larger
mouse pointer and keyboard shortcuts make common controls easier to use.

The extension changes YouTube's existing player controls without moving,
cloning, or replacing them. The "Restore YouTube's look" button turns every
change off in one click and keeps your choices for later.

## Category

Accessibility (or the nearest available category).

## Data collection

None. The extension does not collect or transmit browsing or viewing data. It
has no accounts, analytics, tracking, or external requests. Preferences are
stored using the browser's extension storage.

## Permissions

- `storage` keeps the user's preferences.
- `activeTab` lets the extension apply those preferences to the current tab.
- `https://www.youtube.com/*` limits page access to YouTube, where the player
  controls are styled.

## Reviewer notes

Edge runs the Chrome package unchanged; the Firefox manifest transformation is
not applied to the Edge release asset.
