# Firefox Add-ons Listing

Source of truth for the addons.mozilla.org listing. Update this file first,
then copy the text into the AMO Developer Hub.

The API submission reads `amo-metadata.json`, so keep this listing and that
file in sync.

## Name

YouTube Controls: Clearer & Larger

## Summary

Make YouTube controls easier to see, click, and keep visible.

## Full description

Make YouTube player controls easier to see, click, and keep visible.

Use recommended settings for strong contrast behind the controls, a bigger
progress bar, and easier-to-read subtitles, or pick each option yourself:
clear or strong-contrast control styles, controls that stay visible, a thicker
progress bar that is easier to grab, and a yellow, cyan, or green highlight
for the progress bar, handle, icons, and time display.

Readable subtitles are enlarged on a solid dark background, with white or
yellow text. A larger mouse pointer and keyboard shortcuts make common
controls easier to use. Works on youtube.com and in YouTube videos embedded
on other sites.

The extension restyles YouTube's existing player controls without moving,
cloning, or replacing them. Restore YouTube's look switches every change off
in one click.

No tracking, no accounts, no external requests. Preferences are stored in
the browser's extension storage.

## Category

Photos, Music & Videos (`photos-music-videos`)

## License

MIT

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

The package uses no compilation, transpilation, minification, or generated
application code. The source files are copied as-is into the Firefox package;
only the manifest is adapted for Firefox. To test it, load
`dist/firefox/manifest.json` as a temporary add-on from
`about:debugging#/runtime/this-firefox`.
