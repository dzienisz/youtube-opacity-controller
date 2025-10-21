# Update to v1.1 - Step by Step Guide

## 🎯 Why Update to v1.1?

Version 1.1 fixes critical layout issues:
- ✅ **Fixed:** Fullscreen button positioning
- ✅ **Fixed:** Red progress bar scrubber visibility
- ✅ **Improved:** CSS modification method (setProperty vs cssText)

**IMPORTANT:** These fixes improve user experience significantly and should be deployed ASAP.

## 📦 What You Need

- ✅ **ZIP file:** `youtube-opacity-controller.zip` (v1.1) - already created at:
  ```
  /Users/home/Developer/google-youtube/youtube-opacity-controller/youtube-opacity-controller.zip
  ```
- ✅ **Chrome Web Store access:** https://chrome.google.com/webstore/devconsole
- ✅ **Your extension ID:** `dcmmcbdcbpaoefhnlogalnfnnmjolfbh`

## 🔄 Update Process

### Step 1: Access Developer Dashboard

1. Go to: **https://chrome.google.com/webstore/devconsole**
2. Sign in with your Google account (the one you used for initial submission)
3. You should see "YouTube Overlay Opacity Controller" in your items list

### Step 2: Open Your Extension

1. Click on **"YouTube Overlay Opacity Controller"**
2. You'll see the extension details page
3. Current version shown should be: **1.0**

### Step 3: Upload New Version

1. Look for the **"Package"** tab or **"Upload new package"** button
2. Click **"Upload new package"**
3. Click **"Choose file"** or drag-and-drop
4. Select: `/Users/home/Developer/google-youtube/youtube-opacity-controller/youtube-opacity-controller.zip`
5. Wait for upload to complete (should take a few seconds)
6. You should see: "Package uploaded successfully"

### Step 4: Verify Upload

Chrome will automatically scan the package. You should see:
- ✅ Manifest version: 3
- ✅ Version: **1.1** (updated from 1.0)
- ✅ No errors or warnings

### Step 5: Update Information (Optional but Recommended)

Even though the description hasn't changed, you can add update notes:

1. Go to **"Store listing"** tab
2. Scroll to bottom (or look for "What's new" / "Recent changes")
3. Add this text:

```
Version 1.1 - Bug Fixes

• Fixed fullscreen button layout issues
• Fixed red progress bar scrubber positioning
• Improved CSS modification method for better compatibility
• Better preservation of YouTube's native styles

This update improves reliability and fixes UI layout problems reported by users.
```

### Step 6: Submit for Review

1. Look for **"Submit for review"** button (usually at top or bottom)
2. Click **"Submit for review"**
3. You might see a confirmation dialog - confirm it
4. Status will change to: **"Pending review"** or **"In review"**

### Step 7: What to Write in Submission Notes (if asked)

If Chrome Web Store asks for submission notes or justification:

```
Update to version 1.1 - Bug Fix Release

This is a minor update that fixes critical layout issues affecting user experience:

1. Fullscreen button was misaligned due to CSS style overwriting
2. Progress bar scrubber (red dot) was hidden under black background
3. Some buttons lost their original positioning

Technical changes:
- Changed from using cssText (which overwrites all styles) to setProperty()
  (which only modifies specific CSS properties)
- This preserves YouTube's native layout styles while applying our backgrounds
- No new permissions requested
- No functionality changes - only bug fixes
- Fully tested on multiple YouTube videos

No changes to:
- Privacy policy (still no data collection)
- Permissions (same as v1.0)
- Core functionality
- User interface

This update improves stability and compatibility with YouTube's player.
```

## ⏱️ What Happens Next

### Review Timeline
- **Automatic scan:** Immediate (1-5 minutes)
- **Queue time:** Varies
- **Manual review:** 1-3 days (often faster for updates)
- **Approval:** Instant (goes live immediately)

### Email Notifications
You'll receive emails at:
- When upload succeeds
- When review starts
- When approved/rejected

### If Approved
- Extension updates to v1.1 automatically
- Existing users get auto-update within 1-7 days
- New users download v1.1 immediately

### If Requires Changes
- You'll get email with specific feedback
- Fix issues and re-upload
- No need to increment version unless they explicitly ask

## 🔍 After Submission - Monitor

1. **Check dashboard** regularly for status updates
2. **Monitor email** for notifications
3. **Test live version** after approval
4. **Read user reviews** for any new feedback
5. **Check GitHub issues** for bug reports

## 📊 Comparison: v1.0 vs v1.1

| Aspect | v1.0 | v1.1 |
|--------|------|------|
| Fullscreen button | ❌ Layout broken | ✅ Fixed |
| Progress scrubber | ❌ Hidden | ✅ Visible |
| CSS method | cssText (overwrites all) | setProperty (selective) |
| Layout preservation | ❌ Poor | ✅ Excellent |
| Permissions | Same | Same |
| Functionality | Same | Same |

## ✅ Verification Checklist

Before submitting, verify:
- [ ] ZIP file is 17KB (v1.1)
- [ ] manifest.json shows version "1.1"
- [ ] You're signed into correct Google account
- [ ] Extension ID matches: dcmmcbdcbpaoefhnlogalnfnnmjolfbh
- [ ] Submission notes prepared (if needed)
- [ ] You have access to email for notifications

## 🐛 Troubleshooting

### "Package is invalid"
- Re-download the ZIP from the correct location
- Make sure it's the v1.1 ZIP (17KB)

### "Version must be higher"
- Check manifest.json - should show "1.1"
- Current store version is 1.0, new must be 1.1

### "Permission changes detected"
- There should be NO permission changes
- If shown, it's an error - contact support

### "Can't find upload button"
- Try refreshing the page
- Look under "Package" or "Versions" tab
- Try different browser

## 📞 Need Help?

- **Chrome Web Store Help:** https://support.google.com/chrome_webstore/
- **Extension Dashboard:** https://chrome.google.com/webstore/devconsole
- **GitHub Issues:** https://github.com/dzienisz/youtube-opacity-controller/issues

## 🎉 After Approval

1. **Update GitHub:** Mark v1.1 as deployed
2. **Announce update:** In GitHub releases or social media
3. **Monitor feedback:** Read reviews and comments
4. **Plan next version:** Based on user feedback

---

**Current Status:**
- ✅ v1.0 is LIVE: https://chromewebstore.google.com/detail/youtube-overlay-opacity-c/dcmmcbdcbpaoefhnlogalnfnnmjolfbh
- 📦 v1.1 is READY to upload
- 🚀 Follow this guide to deploy v1.1

**Good luck! The update should go smoothly.** 🎯
