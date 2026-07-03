import { state } from './state.js';

let activeStoryIndex = 0;
let activeItemIndex = 0;
let progressTimer = null;
let startTime = 0;
let elapsed = 0;
const SLIDE_DURATION = 5000;

export function openStoryViewer(storyId) {
  const storyIndex = state.stories.findIndex(s => s.id === storyId);
  if (storyIndex === -1) return;

  activeStoryIndex = storyIndex;
  activeItemIndex = 0;
  
  // Mark story as viewed
  state.stories[activeStoryIndex].viewed = true;
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'stories' } }));

  createStoryViewerModal();
  startStorySlide();
}

function createStoryViewerModal() {
  let modal = document.getElementById('story-viewer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'story-viewer-modal';
    modal.className = 'story-viewer-modal-overlay';
    document.body.appendChild(modal);
  }
  
  modal.classList.add('active');
}

function closeStoryViewer() {
  const modal = document.getElementById('story-viewer-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.innerHTML = '';
  }
  clearTimeout(progressTimer);
}

function startStorySlide() {
  const modal = document.getElementById('story-viewer-modal');
  if (!modal) return;

  const currentStory = state.stories[activeStoryIndex];
  const currentItem = currentStory.items[activeItemIndex];

  // Set up progress bars HTML
  const progressBarsHtml = currentStory.items.map((item, idx) => {
    let barClass = '';
    let innerStyle = 'width: 0%';
    if (idx < activeItemIndex) {
      innerStyle = 'width: 100%';
    }
    return `
      <div class="story-progress-track">
        <div class="story-progress-fill" id="story-bar-${idx}" style="${innerStyle}"></div>
      </div>
    `;
  }).join('');

  modal.innerHTML = `
    <div class="story-viewer-container">
      <!-- Top Progress Indicators -->
      <div class="story-progress-indicator-container">
        ${progressBarsHtml}
      </div>

      <!-- Top Header info -->
      <div class="story-viewer-header">
        <div class="story-viewer-user">
          <img src="${currentStory.avatar}" alt="${currentStory.username}">
          <span class="story-viewer-username">${currentStory.username}</span>
        </div>
        <button class="story-viewer-close-btn" id="close-story-viewer"><i class="fas fa-times"></i></button>
      </div>

      <!-- Content -->
      <div class="story-viewer-content">
        <img src="${currentItem.url}" class="story-viewer-image" alt="Story content">
        <!-- Tap Areas for Navigation -->
        <div class="story-tap-zone left-zone" id="story-tap-left"></div>
        <div class="story-tap-zone right-zone" id="story-tap-right"></div>
      </div>

      <!-- Bottom Chat box -->
      <div class="story-viewer-footer">
        <input type="text" class="story-reply-input" placeholder="Reply to ${currentStory.username === 'Your Story' ? 'your story' : currentStory.username}...">
        <button class="story-send-btn"><i class="far fa-paper-plane"></i></button>
      </div>
    </div>
  `;

  // Attach handlers
  document.getElementById('close-story-viewer').addEventListener('click', closeStoryViewer);
  document.getElementById('story-tap-left').addEventListener('click', navigatePrevious);
  document.getElementById('story-tap-right').addEventListener('click', navigateNext);
  
  // Enter key support for stories replies
  const input = modal.querySelector('.story-reply-input');
  const send = modal.querySelector('.story-send-btn');
  const submitReply = () => {
    if (input.value.trim()) {
      alert(`Story reply sent to ${currentStory.username}!`);
      input.value = '';
    }
  };
  send.addEventListener('click', submitReply);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitReply();
  });

  // Handle animation timer
  elapsed = 0;
  startTime = Date.now();
  animateProgressBar();
}

function animateProgressBar() {
  clearTimeout(progressTimer);
  
  const bar = document.getElementById(`story-bar-${activeItemIndex}`);
  if (!bar) return;

  const update = () => {
    const timePassed = Date.now() - startTime;
    const percentage = Math.min((timePassed / SLIDE_DURATION) * 100, 100);
    bar.style.width = `${percentage}%`;

    if (percentage < 100) {
      progressTimer = requestAnimationFrame(update);
    } else {
      navigateNext();
    }
  };

  progressTimer = requestAnimationFrame(update);
}

function navigateNext() {
  cancelAnimationFrame(progressTimer);
  const currentStory = state.stories[activeStoryIndex];

  if (activeItemIndex < currentStory.items.length - 1) {
    // Next item in current story
    activeItemIndex++;
    startStorySlide();
  } else {
    // Next user story
    if (activeStoryIndex < state.stories.length - 1) {
      activeStoryIndex++;
      activeItemIndex = 0;
      
      // Mark as viewed
      state.stories[activeStoryIndex].viewed = true;
      document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'stories' } }));
      
      startStorySlide();
    } else {
      // Last story finished
      closeStoryViewer();
    }
  }
}

function navigatePrevious() {
  cancelAnimationFrame(progressTimer);

  if (activeItemIndex > 0) {
    // Previous slide in same story
    activeItemIndex--;
    startStorySlide();
  } else {
    // Previous user story
    if (activeStoryIndex > 0) {
      activeStoryIndex--;
      // Go to last slide of previous story
      activeItemIndex = state.stories[activeStoryIndex].items.length - 1;
      startStorySlide();
    } else {
      // Already at first slide of first story, reset progress
      startStorySlide();
    }
  }
}
