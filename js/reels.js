import { state } from './state.js';

export function renderReels(container) {
  container.innerHTML = '';

  const reelsContainer = document.createElement('div');
  reelsContainer.className = 'reels-wrapper';

  state.reels.forEach((reel, idx) => {
    const reelSlide = document.createElement('div');
    reelSlide.className = 'reel-slide';
    reelSlide.dataset.id = reel.id;

    reelSlide.innerHTML = `
      <div class="reel-media-container">
        <!-- Renders the custom generated portrait assets as the reel background -->
        <img src="${reel.image}" class="reel-media-image" alt="Reel media">
        <div class="double-tap-heart"><i class="fas fa-heart"></i></div>
        <div class="reel-volume-alert"><i class="fas fa-volume-up"></i></div>
      </div>
      
      <!-- Bottom Left Overlay Details -->
      <div class="reel-overlay-details">
        <div class="reel-user-row">
          <img src="${reel.avatar}" class="reel-user-avatar" alt="${reel.username}">
          <span class="reel-username">${reel.username}</span>
          <button class="reel-follow-btn">Follow</button>
        </div>
        <div class="reel-caption">${reel.caption}</div>
        <div class="reel-audio-row">
          <i class="fas fa-music"></i>
          <div class="reel-audio-scroller">
            <span>${reel.audio}</span>
          </div>
        </div>
      </div>
      
      <!-- Right Sidebar Action Buttons -->
      <div class="reel-actions-sidebar">
        <button class="reel-action-btn like-btn ${reel.liked ? 'liked' : ''}">
          <i class="${reel.liked ? 'fas fa-heart' : 'far fa-heart'}"></i>
          <span>${reel.likes}</span>
        </button>
        
        <button class="reel-action-btn comment-btn">
          <i class="far fa-comment"></i>
          <span>${reel.commentsCount}</span>
        </button>
        
        <button class="reel-action-btn share-btn">
          <i class="far fa-paper-plane"></i>
        </button>
        
        <button class="reel-action-btn save-btn">
          <i class="far fa-bookmark"></i>
        </button>
        
        <button class="reel-action-btn options-btn">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        
        <div class="reel-disc-wrapper">
          <img src="${reel.avatar}" class="reel-disc-icon" alt="Audio Disc">
        </div>
      </div>
    `;

    // Interactivity
    const mediaContainer = reelSlide.querySelector('.reel-media-container');
    const heartOverlay = reelSlide.querySelector('.double-tap-heart');
    const likeBtn = reelSlide.querySelector('.like-btn');
    const followBtn = reelSlide.querySelector('.reel-follow-btn');
    const saveBtn = reelSlide.querySelector('.save-btn');
    const optionsBtn = reelSlide.querySelector('.options-btn');

    // Double tap to like and single tap for sound alert toggles
    let lastTap = 0;
    let tapTimeout;
    let isMuted = false;

    mediaContainer.addEventListener('click', () => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      clearTimeout(tapTimeout);

      if (tapLength < 300 && tapLength > 0) {
        // Double Tap
        handleLike();
        triggerDoubleTapAnimation();
      } else {
        // Single Tap
        tapTimeout = setTimeout(() => {
          isMuted = !isMuted;
          triggerVolumeAlertAnimation(isMuted);
        }, 250);
      }

      lastTap = currentTime;
    });

    function triggerDoubleTapAnimation() {
      heartOverlay.classList.add('active');
      setTimeout(() => {
        heartOverlay.classList.remove('active');
      }, 800);
    }

    function triggerVolumeAlertAnimation(muted) {
      const alertDiv = reelSlide.querySelector('.reel-volume-alert');
      const icon = alertDiv.querySelector('i');
      icon.className = muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      
      alertDiv.classList.remove('active');
      void alertDiv.offsetWidth; // Force reflow to restart animation keyframe
      alertDiv.classList.add('active');
    }

    likeBtn.addEventListener('click', handleLike);

    function handleLike() {
      reel.liked = !reel.liked;
      likeBtn.classList.toggle('liked', reel.liked);
      likeBtn.querySelector('i').className = reel.liked ? 'fas fa-heart' : 'far fa-heart';
      
      // Update count text locally
      const numericLikes = parseFloat(reel.likes);
      if (reel.liked) {
        likeBtn.querySelector('span').textContent = `${(numericLikes + 0.1).toFixed(1)}K`;
      } else {
        likeBtn.querySelector('span').textContent = reel.likes;
      }
    }

    followBtn.addEventListener('click', () => {
      if (followBtn.textContent === 'Follow') {
        followBtn.textContent = 'Following';
        followBtn.classList.add('following');
      } else {
        followBtn.textContent = 'Follow';
        followBtn.classList.remove('following');
      }
    });

    saveBtn.addEventListener('click', () => {
      const icon = saveBtn.querySelector('i');
      icon.classList.toggle('fas');
      icon.classList.toggle('far');
    });

    optionsBtn.addEventListener('click', () => {
      import('./app.js').then(appModule => {
        import('./state.js').then(stateModule => {
          appModule.openOptionsSheet([
            {
              label: `Unfollow @${reel.username}`,
              type: 'danger',
              onClick: () => {
                stateModule.unfollowUser(reel.username);
                appModule.showToast(`Unfollowed @${reel.username}`, 'success');
              }
            },
            {
              label: 'Copy Reel Link',
              onClick: () => {
                navigator.clipboard.writeText(window.location.origin + '/reels/' + reel.id);
                appModule.showToast('Reel link copied to clipboard!', 'success');
              }
            }
          ]);
        });
      });
    });

    reelsContainer.appendChild(reelSlide);
  });

  container.appendChild(reelsContainer);

  // Enable vertical scroll assist
  reelsContainer.addEventListener('wheel', (e) => {
    // Basic wheel helper to snap slides if user scrolls
    if (Math.abs(e.deltaY) > 50) {
      e.preventDefault();
      const slideHeight = container.clientHeight;
      const currentScroll = reelsContainer.scrollTop;
      const index = Math.round(currentScroll / slideHeight);
      
      if (e.deltaY > 0) {
        reelsContainer.scrollTo({
          top: (index + 1) * slideHeight,
          behavior: 'smooth'
        });
      } else {
        reelsContainer.scrollTo({
          top: (index - 1) * slideHeight,
          behavior: 'smooth'
        });
      }
    }
  }, { passive: false });
}
