// Popup script for YouTube Overlay Opacity Controller

const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');
const resetBtn = document.getElementById('resetBtn');
const presetButtons = document.querySelectorAll('.preset-btn');

// Default opacity value
const DEFAULT_OPACITY = 100;

// Load saved opacity value
chrome.storage.sync.get(['overlayOpacity'], function(result) {
  let opacity = DEFAULT_OPACITY;
  if (result.overlayOpacity !== undefined) {
    // Convert from 0-1 range to 0-100 range
    opacity = Math.round(result.overlayOpacity * 100);
  }
  opacitySlider.value = opacity;
  opacityValue.textContent = opacity;
});

// Update opacity when slider changes
opacitySlider.addEventListener('input', function() {
  const value = parseInt(this.value);
  opacityValue.textContent = value;

  // Convert from 0-100 range to 0-1 range for CSS
  const opacityDecimal = value / 100;

  // Save to storage
  chrome.storage.sync.set({ overlayOpacity: opacityDecimal }, function() {
    // Update active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateOpacity',
          opacity: opacityDecimal
        }).catch(() => {
          // Tab might not be ready yet, that's okay
        });
      }
    });
  });
});

// Handle preset buttons
presetButtons.forEach(button => {
  button.addEventListener('click', function() {
    const value = parseInt(this.dataset.value);
    opacitySlider.value = value;
    opacityValue.textContent = value;

    // Trigger change event
    opacitySlider.dispatchEvent(new Event('input'));

    // Visual feedback
    this.classList.add('active');
    setTimeout(() => {
      this.classList.remove('active');
    }, 200);
  });
});

// Reset button
resetBtn.addEventListener('click', function() {
  opacitySlider.value = DEFAULT_OPACITY;
  opacityValue.textContent = DEFAULT_OPACITY;
  opacitySlider.dispatchEvent(new Event('input'));

  // Visual feedback
  this.classList.add('active');
  setTimeout(() => {
    this.classList.remove('active');
  }, 200);
});

// Add keyboard support for slider
opacitySlider.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    setTimeout(() => {
      opacityValue.textContent = this.value;
    }, 0);
  }
});
