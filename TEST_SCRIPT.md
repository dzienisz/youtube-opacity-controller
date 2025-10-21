# Test Script for v1.1 - Manual Testing

## 🎯 Purpose
Verify that v1.1 fixes all layout issues while maintaining functionality.

## 📋 Prerequisites
- [ ] Extension loaded in Chrome (`chrome://extensions/`)
- [ ] YouTube video open (suggested: https://www.youtube.com/watch?v=YmcACIOQdDc)
- [ ] DevTools open (F12) on Console tab
- [ ] Extension icon visible in Chrome toolbar

---

## ✅ Test 1: Basic Functionality

### 1.1 Extension Loads
- [ ] Go to YouTube video
- [ ] Player controls visible with black background
- [ ] No console errors on page load
- [ ] Default opacity appears to be 70%

**Expected:** Black backgrounds visible on player controls at 70% opacity

**Pass/Fail:** ___________

---

## ✅ Test 2: Popup UI

### 2.1 Open Popup
- [ ] Click extension icon in toolbar
- [ ] Popup opens immediately
- [ ] Slider shows current value (70%)
- [ ] All 4 preset buttons visible

**Expected:** Clean popup with slider at 70% and 4 buttons

**Pass/Fail:** ___________

### 2.2 Slider Functionality
- [ ] Drag slider left to 0%
- [ ] Controls become transparent (original YouTube look)
- [ ] Drag slider to 50%
- [ ] Controls show medium gray background
- [ ] Drag slider to 100%
- [ ] Controls show solid black background

**Expected:** Smooth transitions, instant visual updates

**Pass/Fail:** ___________

### 2.3 Preset Buttons
- [ ] Click "25%" - controls show light gray
- [ ] Click "50%" - controls show medium gray
- [ ] Click "75%" - controls show dark gray
- [ ] Click "100%" - controls show solid black

**Expected:** Instant changes, slider position updates

**Pass/Fail:** ___________

---

## ✅ Test 3: CRITICAL - Fullscreen Button (v1.1 Fix)

### 3.1 Visual Check
- [ ] Set opacity to 70%
- [ ] Locate fullscreen button (bottom-right corner)
- [ ] Button is in correct position (not shifted)
- [ ] Icon (4 arrows) is clearly visible
- [ ] Button has proper size (same as other buttons)
- [ ] Button doesn't overlap with other elements

**Expected:** ✅ Button in correct position, proper size, icon visible

**v1.0 Issue:** Button was misaligned/shifted due to cssText overwriting styles

**Pass/Fail:** ___________

### 3.2 Functionality Check
- [ ] Hover over fullscreen button
- [ ] Tooltip appears ("Fullscreen (f)")
- [ ] Click fullscreen button
- [ ] Video enters fullscreen mode
- [ ] Controls still have black backgrounds in fullscreen
- [ ] Click fullscreen button again (or press ESC)
- [ ] Video exits fullscreen
- [ ] Controls still work normally

**Expected:** ✅ Fullscreen works perfectly, controls persist

**Pass/Fail:** ___________

---

## ✅ Test 4: CRITICAL - Red Progress Bar Scrubber (v1.1 Fix)

### 4.1 Visual Check
- [ ] Set opacity to 70%
- [ ] Start playing video
- [ ] Look at progress bar at bottom
- [ ] Red progress line is visible
- [ ] Red scrubber dot/circle is visible ON TOP of black background
- [ ] Scrubber is NOT hidden behind black background

**Expected:** ✅ Red scrubber clearly visible above black background

**v1.0 Issue:** Scrubber was hidden under black background due to z-index

**Pass/Fail:** ___________

### 4.2 Hover and Drag
- [ ] Hover over progress bar
- [ ] Scrubber enlarges on hover
- [ ] Preview thumbnail appears (if available)
- [ ] Click and drag scrubber
- [ ] Scrubber moves smoothly
- [ ] Red dot stays visible during drag
- [ ] Release - video jumps to new position

**Expected:** ✅ Scrubber fully interactive, always visible

**Pass/Fail:** ___________

### 4.3 Different Opacity Levels
Test scrubber visibility at different opacities:
- [ ] Set opacity to 25% - scrubber visible
- [ ] Set opacity to 50% - scrubber visible
- [ ] Set opacity to 75% - scrubber visible
- [ ] Set opacity to 100% - scrubber visible on TOP

**Expected:** ✅ Scrubber visible at ALL opacity levels

**Pass/Fail:** ___________

---

## ✅ Test 5: All Player Buttons

Set opacity to 70% and test each button:

### 5.1 Bottom Control Bar Buttons
- [ ] Play/Pause - works, icon visible
- [ ] Next video - works, icon visible
- [ ] Volume - works, icon visible, slider appears on hover
- [ ] Settings (gear) - works, icon visible, menu opens
- [ ] Captions/CC - works, icon visible, menu opens
- [ ] Quality (if visible) - works, icon visible
- [ ] Theater mode - works, icon visible, toggles correctly
- [ ] Fullscreen - works, icon visible (already tested above)

**Expected:** ✅ All buttons work, icons clear, proper positioning

**Pass/Fail:** ___________

### 5.2 Button Visual Check
- [ ] No buttons are shifted or misaligned
- [ ] All icons are clearly visible
- [ ] Hover states work (buttons highlight)
- [ ] Click feedback works (buttons respond)

**Expected:** ✅ Perfect layout, no visual glitches

**Pass/Fail:** ___________

---

## ✅ Test 6: Settings Menu

### 6.1 Open Settings
- [ ] Click settings (gear icon)
- [ ] Menu opens with black background
- [ ] All menu items readable
- [ ] Text is white/light colored and clear

**Expected:** Settings menu has black background matching opacity level

**Pass/Fail:** ___________

### 6.2 Submenu Navigation
- [ ] Click "Quality"
- [ ] Submenu opens with black background
- [ ] All quality options visible
- [ ] Click "Playback speed"
- [ ] Submenu opens with black background
- [ ] All speed options visible

**Expected:** All submenus have black backgrounds, text readable

**Pass/Fail:** ___________

---

## ✅ Test 7: Different Video Modes

### 7.1 Normal Mode
- [ ] Video in normal size
- [ ] Controls have black background
- [ ] All buttons visible and working

**Pass/Fail:** ___________

### 7.2 Theater Mode
- [ ] Click theater mode button
- [ ] Video expands to theater mode
- [ ] Controls still have black background
- [ ] All buttons still visible and working
- [ ] Exit theater mode - still works

**Pass/Fail:** ___________

### 7.3 Fullscreen Mode
- [ ] Enter fullscreen (button or F key)
- [ ] Controls appear on mouse move
- [ ] Controls have black background in fullscreen
- [ ] All buttons work in fullscreen
- [ ] Exit fullscreen - everything still works

**Pass/Fail:** ___________

---

## ✅ Test 8: Navigation & Persistence

### 8.1 Video Navigation
- [ ] Set opacity to 60%
- [ ] Click on another video in recommendations
- [ ] New video loads
- [ ] Controls still have black background at 60%
- [ ] Open popup - slider shows 60%

**Expected:** Settings persist across video changes

**Pass/Fail:** ___________

### 8.2 Page Refresh
- [ ] Set opacity to 80%
- [ ] Refresh page (F5 or Cmd+R)
- [ ] Page reloads
- [ ] Controls have black background at 80%
- [ ] Open popup - slider shows 80%

**Expected:** Settings persist after refresh

**Pass/Fail:** ___________

### 8.3 Browser Restart (Optional)
- [ ] Set opacity to 55%
- [ ] Close Chrome completely
- [ ] Reopen Chrome
- [ ] Go to YouTube video
- [ ] Controls have black background at 55%

**Expected:** Settings persist after browser restart (Chrome Sync)

**Pass/Fail:** ___________

---

## ✅ Test 9: Edge Cases

### 9.1 Rapid Changes
- [ ] Quickly drag slider back and forth multiple times
- [ ] No flickering
- [ ] No lag
- [ ] Changes apply smoothly

**Expected:** Smooth performance with debouncing

**Pass/Fail:** ___________

### 9.2 Multiple Tabs
- [ ] Open 3 YouTube videos in different tabs
- [ ] Set opacity to 40% in tab 1
- [ ] Switch to tab 2 - controls at 40%
- [ ] Switch to tab 3 - controls at 40%
- [ ] Change opacity to 90% in tab 2
- [ ] Switch to tab 1 - controls at 90%

**Expected:** All tabs sync to same opacity

**Pass/Fail:** ___________

### 9.3 Playlist Autoplay
- [ ] Open a playlist
- [ ] Set opacity to 65%
- [ ] Let video end and autoplay next video
- [ ] Controls on new video have black background at 65%

**Expected:** Works through autoplay

**Pass/Fail:** ___________

---

## ✅ Test 10: Console Errors

### 10.1 Check DevTools Console
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Load YouTube video
- [ ] Look for errors (red messages)
- [ ] Change opacity several times
- [ ] Navigate to different video
- [ ] Check console again

**Expected:** ❌ NO errors, maybe some info/warnings from YouTube itself

**Critical Errors to Watch For:**
- "Cannot read property 'style' of null"
- "Permission denied"
- "Uncaught TypeError"
- Any errors mentioning our extension

**Pass/Fail:** ___________

---

## ✅ Test 11: Performance

### 11.1 CPU/Memory Check
- [ ] Open Chrome Task Manager (Shift+Esc)
- [ ] Find YouTube tab
- [ ] Note CPU and Memory usage
- [ ] Change opacity multiple times
- [ ] CPU spike should be brief and small
- [ ] Memory should not continuously increase

**Expected:** Minimal performance impact

**Pass/Fail:** ___________

---

## 📊 Test Summary

### Critical Tests (v1.1 Fixes)
- [ ] Fullscreen button: Position ✅ / Icon ✅ / Function ✅
- [ ] Red scrubber: Visible ✅ / On top ✅ / Interactive ✅

### All Tests Results
- Total Tests: 11 sections
- Passed: ___ / 11
- Failed: ___ / 11

### Issues Found
List any issues discovered:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Overall Assessment
- [ ] ✅ Ready to deploy v1.1 to Chrome Web Store
- [ ] ⚠️ Minor issues found but acceptable
- [ ] ❌ Critical issues found - needs fixes

---

## 🐛 If Issues Found

### Document the Issue
1. **What's wrong:** (describe the problem)
2. **Steps to reproduce:** (exact steps)
3. **Expected behavior:** (what should happen)
4. **Actual behavior:** (what actually happens)
5. **Screenshot:** (if possible)
6. **Console errors:** (copy any errors)

### Report on GitHub
Create issue at: https://github.com/dzienisz/youtube-opacity-controller/issues

---

## ✅ Sign-Off

**Tester:** _______________
**Date:** _______________
**Version Tested:** 1.1
**Browser:** Chrome _______________
**OS:** _______________

**Recommendation:**
- [ ] Approve for Chrome Web Store deployment
- [ ] Request changes before deployment

---

**Notes:**
Use this script to systematically test v1.1 before uploading to Chrome Web Store.
Focus especially on Tests 3 and 4 (fullscreen button and scrubber) as these were the critical fixes in v1.1.
