# Contributing to YouTube Overlay Opacity Controller

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🐛 Reporting Bugs

### Before Submitting a Bug Report
1. Check the [existing issues](https://github.com/dzienisz/youtube-opacity-controller/issues) to avoid duplicates
2. Test with the latest version of the extension
3. Try disabling other extensions to rule out conflicts
4. Clear browser cache and reload YouTube

### Bug Report Template
When creating a bug report, please include:

```
**Description:**
Clear description of the issue

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Chrome Version: [e.g. 120.0.6099.109]
- Extension Version: [e.g. 1.1]
- Operating System: [e.g. macOS 14.0]
- YouTube URL: [specific video where it happens]

**Screenshots:**
If applicable, add screenshots

**Console Errors:**
Open DevTools (F12) → Console tab and paste any errors
```

## 💡 Suggesting Features

Feature requests are welcome! Please:
1. Check if the feature has already been requested
2. Describe the feature clearly and why it would be useful
3. Consider if it aligns with the extension's core purpose
4. Provide examples or mockups if possible

## 🔧 Development Setup

### Prerequisites
- Google Chrome (or Chromium-based browser)
- Git
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of Chrome Extension APIs

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/youtube-opacity-controller.git
   cd youtube-opacity-controller
   ```

2. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

3. **Make Changes**
   - Edit files as needed
   - Click reload button in `chrome://extensions/` to test changes
   - Test on YouTube videos

4. **Test Thoroughly**
   - Use the [TESTING.md](TESTING.md) checklist
   - Test in different scenarios (normal, theater, fullscreen)
   - Verify all buttons and controls work
   - Check different opacity levels

## 📝 Code Style

### JavaScript
- Use ES6+ features
- Clear, descriptive variable names
- Add comments for complex logic
- Use `const` by default, `let` when reassignment needed
- Avoid `var`

### Example:
```javascript
// Good
const DEFAULT_OPACITY = 0.7;
let currentOpacity = DEFAULT_OPACITY;

// Apply opacity to player container
function applyOpacity(opacity) {
  // Implementation...
}

// Bad
var opacity = 0.7;
var o = opacity;

function apply(x) {
  // What is x?
}
```

### CSS
- Use descriptive class names
- Keep specificity low
- Use `!important` sparingly (only when necessary to override YouTube styles)
- Add comments for non-obvious rules

### File Organization
- Keep `content.js` focused on DOM manipulation
- Keep `popup.js` focused on UI logic
- Separate concerns clearly

## 🔄 Pull Request Process

### Before Submitting
1. Test your changes thoroughly
2. Update documentation if needed
3. Add entry to CHANGELOG.md under "Unreleased"
4. Ensure no console errors
5. Test on multiple YouTube videos

### PR Guidelines
1. **Title Format:** `[Type] Brief description`
   - Types: `[Fix]`, `[Feature]`, `[Refactor]`, `[Docs]`, `[Test]`
   - Example: `[Fix] Prevent scrubber from disappearing`

2. **Description Should Include:**
   - What changed and why
   - Related issue number (if applicable)
   - Screenshots/GIFs for UI changes
   - Testing performed

3. **Commit Messages:**
   - Use clear, descriptive messages
   - Reference issues when applicable
   - Format: `Fix button positioning in fullscreen mode (#123)`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on multiple YouTube videos
- [ ] Tested in normal/theater/fullscreen modes
- [ ] Tested with different opacity levels
- [ ] No console errors
- [ ] Checked with TESTING.md checklist

## Screenshots
If applicable, add screenshots

## Related Issues
Closes #123
```

## 🔍 Code Review

### What We Look For
- Code quality and readability
- Performance implications
- Edge cases handled
- No breaking changes (unless discussed)
- Documentation updated
- Tests performed

### Approval Process
- At least one maintainer review required
- CI checks must pass (if configured)
- No unresolved comments
- CHANGELOG updated

## 📋 Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR:** Breaking changes
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes

When your PR is merged, maintainers will handle version bumping and releases.

## 🎯 Areas That Need Help

Current priorities:
- Testing on different operating systems
- Accessibility improvements
- Performance optimizations
- Internationalization (i18n) - translations
- Better error handling
- Unit tests

## 📚 Resources

### Chrome Extension Documentation
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### YouTube Player
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- YouTube uses dynamic class names - inspect carefully

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

## 🤝 Community Guidelines

- Be respectful and constructive
- Help others when you can
- Ask questions if something is unclear
- Credit others for their work
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md) (if we add one)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙋 Questions?

- Open a [discussion](https://github.com/dzienisz/youtube-opacity-controller/discussions)
- Comment on relevant issues
- Check existing documentation

---

Thank you for contributing! Every contribution, no matter how small, helps make this extension better for everyone.
