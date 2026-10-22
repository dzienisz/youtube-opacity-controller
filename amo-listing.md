# Firefox Add-ons Listing

Source of truth for the addons.mozilla.org listing. Update this file first,
then copy the text into the AMO Developer Hub.

## Name

YouTube Controls: Clearer & Larger

## Summary

Make YouTube controls easier to see, click, and keep visible.

## Full description

Make YouTube player controls easier to see, click, and keep visible.

Choose a control style that fits your needs: clear controls for everyday
viewing, stronger contrast, or larger buttons, icons, and timestamps. Keep the
controls visible, make the progress bar thicker and easier to grab, or choose
a highlight color for the progress bar, handle, icons, and time display.

Readable subtitles can be enlarged on a solid dark background, with white or
yellow text. A larger mouse pointer and keyboard shortcuts make common
controls easier to use.

The extension changes YouTube's existing player controls without moving,
cloning, or replacing them. A master switch restores YouTube's original style.

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

The package uses no compilation, transpilation, minification, or generated
application code. The source files are copied as-is into the Firefox package;
only the manifest is adapted for Firefox. To test it, load
`dist/firefox/manifest.json` as a temporary add-on from
`about:debugging#/runtime/this-firefox`.
