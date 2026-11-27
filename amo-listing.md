# Firefox Add-ons Listing

Source of truth for the addons.mozilla.org listing. Update this file first,
then copy the text into the AMO Developer Hub.

The API submission reads `amo-metadata.json`, so keep this listing and that
file in sync.

## Name

YouTube Controls & Progress Bar

## Summary

A progress bar that stays visible when YouTube hides the controls, also in full screen. Custom colors, icons and clearer controls.

## Full description

Keep track of where you are in a YouTube video, and see the player controls clearly.

When YouTube hides the controls, YouTube Controls & Progress Bar keeps a thin progress bar at the bottom of the video, also in full screen and in the miniplayer. Turn on the time next to it to see how far you are without moving the mouse.

Make the progress bar yours: pick a color or your own two-color gradient, and swap the round handle for a star, heart, bolt or music note.

It also makes the player controls easier to see and use on bright and busy videos, without changing your whole browser or operating system.

FEATURES

• Thin progress bar when the controls hide, in the normal player, full screen, the miniplayer and embedded videos
• Optional elapsed and total time next to the thin bar
• Clear Controls style with an adjustable dark control background
• Strong Contrast style for stronger, clearer controls
• Bigger progress bar with a larger, easier-to-grab handle
• Custom progress bar: your own color or gradient, and a star, heart, bolt or note handle
• Easier-to-read subtitles: larger subtitles on a solid dark background (applies only when you turn captions on in a video)
• Keep Controls Visible, with the progress bar and time still moving
• Restore YouTube's look: one click turns every change off and keeps your choices for later
• Keyboard shortcuts with an on-player confirmation, rebindable at chrome://extensions/shortcuts
• Larger mouse pointer over the video
• Instant preview and settings synchronized through Chrome
• Master switch to return to the original YouTube appearance

SAFE BY DESIGN

• Does not move, clone, or replace YouTube controls — adds only the thin progress bar and one small on-player status overlay
• Runs only on youtube.com, including embedded players
• No account, analytics, tracking, advertisements, or external requests
• Open source at github.com/dzienisz/youtube-opacity-controller

HOW TO USE

1. Open a YouTube video. The thin progress bar appears when the controls hide.
2. Select the extension icon to turn the thin bar or its time on or off.
3. Choose Clear Controls or Strong Contrast.
4. New installs start with recommended settings; use "Use recommended settings" in the popup to apply them any time.
5. Optionally keep controls visible, enlarge the progress bar or pointer, pick a highlight color, or customize the background.
6. Press Alt+Shift+Y to toggle enhancements, Alt+Shift+J to cycle styles, Alt+Shift+V to toggle keep-controls-visible.
7. Use the "Restore YouTube's look" button or master switch at any time to turn every change off; your choices are kept for later.

Designed for viewers who want to see their place in a video at a glance, and for anyone who finds transparent controls difficult to locate, read, or operate.

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

## Screenshots

Run the **AMO listing screenshots** workflow with `new` to upload previews
when none exist. If an upload is interrupted by throttling, choose `resume` to
keep the existing previews and continue with the next screenshot. Choose
`replace` to delete all existing previews and upload them again.

## Reviewer notes

The package uses no compilation, transpilation, minification, or generated
application code. The source files are copied as-is into the Firefox package;
only the manifest is adapted for Firefox. To test it, load
`dist/firefox/manifest.json` as a temporary add-on from
`about:debugging#/runtime/this-firefox`.
