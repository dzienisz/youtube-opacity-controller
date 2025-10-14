# How to Update Extension on Chrome Web Store

This guide explains how to submit updates to the Chrome Web Store after the initial submission.

## 📋 Pre-Update Checklist

Before submitting an update:

- [ ] Code changes tested thoroughly (use [TESTING.md](TESTING.md))
- [ ] Version number bumped in `manifest.json`
- [ ] CHANGELOG.md updated with new version entry
- [ ] README.md version badge updated (if applicable)
- [ ] All changes committed to Git
- [ ] GitHub release created for new version
- [ ] New ZIP file created with updated code

## 🔄 Update Process

### Step 1: Prepare Update Package

1. **Update version in manifest.json**
   ```json
   {
     "version": "1.2",  // Increment from 1.1
     ...
   }
   ```

2. **Create new ZIP file**
   ```bash
   cd /path/to/youtube-opacity-controller
   rm youtube-opacity-controller.zip
   zip -r youtube-opacity-controller.zip \
     manifest.json \
     content.js \
     overlay-fix.css \
     popup.html \
     popup.js \
     popup.css \
     icons/*.png \
     icons/*.svg \
     -x "*.DS_Store"
   ```

3. **Verify ZIP contents**
   ```bash
   unzip -l youtube-opacity-controller.zip
   ```

### Step 2: Submit to Chrome Web Store

1. **Go to Developer Dashboard**
   - Navigate to: https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

2. **Find Your Extension**
   - Click on "YouTube Overlay Opacity Controller"
   - Or find it in your items list

3. **Upload New Version**
   - Click "Package" tab (or "Upload new package")
   - Click "Upload new package" button
   - Select your new ZIP file
   - Wait for upload to complete

4. **Update Store Listing (if needed)**
   - Click "Store listing" tab
   - Update screenshots if UI changed
   - Update description if features changed
   - Update promotional images if needed

5. **Submit for Review**
   - Click "Submit for review" button
   - Confirm submission

### Step 3: What Happens Next

1. **Automatic Verification** (immediate)
   - Malware scan
   - Manifest validation
   - Permission check

2. **Manual Review** (1-3 days)
   - Human reviewer checks changes
   - Verifies no policy violations
   - Tests basic functionality

3. **Possible Outcomes**
   - ✅ **Approved** - Goes live automatically
   - ⚠️ **Requires Changes** - Email with feedback
   - ❌ **Rejected** - Must fix issues and resubmit

## 📊 After Approval

### Monitor Performance
- Check install numbers
- Read user reviews
- Monitor crash reports
- Check for bug reports on GitHub

### Communicate Update
- Respond to user reviews
- Update GitHub README if needed
- Post about update (social media, forums, etc.)

## 🐛 If Review Fails

### Common Rejection Reasons
1. **Permission Changes**
   - If you added new permissions, explain why in submission notes
   - Provide detailed justification

2. **Policy Violations**
   - Code obfuscation
   - Misleading description
   - Privacy policy issues

3. **Broken Functionality**
   - Extension doesn't work as described
   - Critical bugs

### How to Fix and Resubmit
1. Address the issues mentioned in rejection email
2. Update code and test thoroughly
3. Increment version again (e.g., 1.2 → 1.2.1)
4. Create new ZIP
5. Upload and resubmit

## 📝 Version Numbering Guidelines

### Semantic Versioning (MAJOR.MINOR.PATCH)

**Examples:**
- `1.0.0` → `1.0.1` - Bug fix (patch)
- `1.0.1` → `1.1.0` - New feature (minor)
- `1.1.0` → `2.0.0` - Breaking change (major)

**For This Extension:**
- **Patch (x.x.1):** Bug fixes, minor tweaks
- **Minor (x.1.x):** New features, improvements
- **Major (2.x.x):** Complete redesign, breaking changes

## 🔔 Update Notes Template

When submitting update, you can add notes for reviewers:

```
Version 1.2 Update

Changes in this version:
- Fixed fullscreen button layout issue
- Improved performance with debouncing
- Better handling of dynamic content

Technical changes:
- Switched from cssText to setProperty() for style modifications
- This preserves YouTube's native styles while applying our changes

Testing performed:
- Tested on 20+ different YouTube videos
- Verified in normal, theater, and fullscreen modes
- No console errors
- All buttons and controls work correctly

Privacy: No changes to data collection (still zero data collected)
Permissions: No new permissions requested
```

## ⏱️ Update Timeline

| Stage | Duration | Notes |
|-------|----------|-------|
| Upload | Instant | ZIP file uploaded |
| Auto verification | 1-5 minutes | Automatic checks |
| Queue | Varies | Waiting for reviewer |
| Manual review | 1-3 days | Human review process |
| Approval | Instant | Goes live immediately |
| User updates | 1-7 days | Auto-update to users |

## 🚀 Rollout Strategy

### For Critical Bugs
- Bump patch version immediately
- Submit ASAP
- Monitor closely

### For New Features
- Test extensively first
- Consider beta testing with early users
- Announce in advance
- Monitor feedback

### For Breaking Changes
- Communicate clearly in changelog
- Consider migration path
- Provide detailed documentation
- Expect more scrutiny in review

## 📞 If You Need Help

- **Dashboard Issues:** Check Chrome Web Store help
- **Review Questions:** Reply to rejection email
- **Technical Issues:** Check Chrome Extension documentation
- **Community Help:** Post on extension developer forums

## ✅ Current Status

**Extension:** YouTube Overlay Opacity Controller
**Current Version:** 1.1
**Status:** Under review (initial submission)
**Submitted:** 2024-10-14

**Next Update Plan:**
- Wait for v1.1 approval
- Monitor user feedback
- Fix any reported issues
- Plan v1.2 features

---

**Remember:** Each update goes through review again, even for minor changes. Plan updates carefully and batch small fixes together when possible to avoid excessive review cycles.
