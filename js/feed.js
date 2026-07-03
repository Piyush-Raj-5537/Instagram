import { state, toggleLikePost, addComment, toggleSavePost } from './state.js';
import { openStoryViewer } from './stories.js';

export function renderFeed(container) {
  container.innerHTML = '';

  // Main container layout
  const feedLayout = document.createElement('div');
  feedLayout.className = 'feed-layout';

  const feedContent = document.createElement('div');
  feedContent.className = 'feed-content';

  // 1. Stories Bar
  const storiesBar = document.createElement('div');
  storiesBar.className = 'stories-bar';
  renderStoriesBar(storiesBar);
  feedContent.appendChild(storiesBar);

  // 2. Posts Container
  const postsContainer = document.createElement('div');
  postsContainer.className = 'posts-container';
  renderPosts(postsContainer);
  feedContent.appendChild(postsContainer);

  feedLayout.appendChild(feedContent);

  // 3. Suggestions Sidebar (Visible on Desktop)
  const sidebar = document.createElement('div');
  sidebar.className = 'feed-sidebar';
  renderSidebar(sidebar);
  feedLayout.appendChild(sidebar);

  container.appendChild(feedLayout);
}

function renderStoriesBar(container) {
  container.innerHTML = '';
  
  state.stories.forEach(story => {
    const item = document.createElement('div');
    item.className = `story-item ${story.viewed ? 'viewed' : ''}`;
    
    // Gradient ring around avatar
    const ring = document.createElement('div');
    ring.className = 'story-ring';
    if (story.username === 'Your Story') {
      ring.classList.add('story-ring-add');
    }
    
    const img = document.createElement('img');
    img.src = story.avatar;
    img.alt = story.username;
    
    ring.appendChild(img);
    item.appendChild(ring);
    
    const label = document.createElement('span');
    label.className = 'story-label';
    label.textContent = story.username === 'Your Story' ? 'Your Story' : story.username;
    item.appendChild(label);
    
    // Uploader for 'Your Story'
    if (story.username === 'Your Story') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      item.appendChild(fileInput);

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            import('./state.js').then(stateModule => {
              stateModule.addStoryItem(evt.target.result);
              import('./app.js').then(appModule => {
                appModule.showToast('Story added to Your Story!', 'success');
              });
            });
          };
          reader.readAsDataURL(file);
        }
      });

      item.addEventListener('click', (e) => {
        // If clicking the plus icon overlay, trigger file upload. Otherwise view story if it contains items
        const rect = item.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const isClickingPlus = clickX > 40 && clickY > 40; // bottom-right sector
        
        if (isClickingPlus || story.items.length === 0) {
          fileInput.click();
        } else {
          openStoryViewer(story.id);
        }
      });
    } else {
      item.addEventListener('click', () => {
        openStoryViewer(story.id);
      });
    }
    
    container.appendChild(item);
  });
}

function renderPosts(container) {
  container.innerHTML = '';
  
  // Combine custom posts and feed posts, filtering out unfollowed users.
  const allPosts = [...state.currentUser.posts, ...state.posts];
  const filteredPosts = allPosts.filter(p => !state.unfollowedUsers.includes(p.username));
  const uniquePosts = Array.from(new Set(filteredPosts.map(p => p.id)))
                            .map(id => filteredPosts.find(p => p.id === id));

  if (uniquePosts.length === 0) {
    container.innerHTML = `<div class="empty-feed">No posts yet. Share something or check suggested accounts!</div>`;
    return;
  }

  uniquePosts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.id = post.id;
    
    const hasLiked = post.likedBy.includes(state.currentUser.username);
    
    card.innerHTML = `
      <div class="post-header">
        <div class="post-user-info">
          <img src="${post.avatar}" class="post-user-avatar" alt="${post.username}">
          <div class="post-user-meta">
            <span class="post-username">${post.username}</span>
            ${post.location ? `<span class="post-location">${post.location}</span>` : ''}
          </div>
        </div>
        <button class="post-options-btn"><i class="fas fa-ellipsis-h"></i></button>
      </div>
      
      <div class="post-image-container">
        <img src="${post.image}" class="post-image ${post.filterClass || ''}" alt="Post content">
        <div class="double-tap-heart"><i class="fas fa-heart"></i></div>
      </div>
      
      <div class="post-actions">
        <div class="left-actions">
          <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}">
            <i class="${hasLiked ? 'fas fa-heart' : 'far fa-heart'}"></i>
          </button>
          <button class="action-btn comment-btn"><i class="far fa-comment"></i></button>
          <button class="action-btn share-btn"><i class="far fa-paper-plane"></i></button>
        </div>
        <button class="action-btn save-btn ${post.saved ? 'saved' : ''}">
          <i class="${post.saved ? 'fas fa-bookmark' : 'far fa-bookmark'}"></i>
        </button>
      </div>
      
      <div class="post-details">
        <div class="post-likes-count">${post.likes.toLocaleString()} likes</div>
        <div class="post-caption">
          <span class="caption-username">${post.username}</span> ${post.caption}
        </div>
        <div class="post-comments-list">
          ${post.comments.map(c => `
            <div class="post-comment-item">
              <span class="comment-username">${c.username}</span> ${c.text}
            </div>
          `).join('')}
        </div>
        <span class="post-time">${post.timestamp}</span>
      </div>
      
      <div class="post-comment-input-area">
        <button class="emoji-picker-btn"><i class="far fa-smile"></i></button>
        <input type="text" class="post-comment-field" placeholder="Add a comment...">
        <button class="post-comment-submit-btn">Post</button>
      </div>
    `;

    // Interactivity
    const imageContainer = card.querySelector('.post-image-container');
    const heartOverlay = card.querySelector('.double-tap-heart');
    const likeBtn = card.querySelector('.like-btn');
    const commentBtn = card.querySelector('.comment-btn');
    const saveBtn = card.querySelector('.save-btn');
    const commentField = card.querySelector('.post-comment-field');
    const commentSubmit = card.querySelector('.post-comment-submit-btn');
    const optionsBtn = card.querySelector('.post-options-btn');

    optionsBtn.addEventListener('click', () => {
      import('./app.js').then(appModule => {
        import('./state.js').then(stateModule => {
          appModule.openOptionsSheet([
            {
              label: `Unfollow @${post.username}`,
              type: 'danger',
              onClick: () => {
                stateModule.unfollowUser(post.username);
                appModule.showToast(`Unfollowed @${post.username}`, 'success');
              }
            },
            {
              label: 'Copy Post Link',
              onClick: () => {
                navigator.clipboard.writeText(window.location.origin + '/p/' + post.id);
                appModule.showToast('Link copied to clipboard!', 'success');
              }
            }
          ]);
        });
      });
    });

    // Double tap to like
    let lastTap = 0;
    imageContainer.addEventListener('touchstart', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        handleLike();
        triggerDoubleTapAnimation();
      }
      lastTap = currentTime;
    });

    imageContainer.addEventListener('dblclick', () => {
      handleLike();
      triggerDoubleTapAnimation();
    });

    function triggerDoubleTapAnimation() {
      heartOverlay.classList.add('active');
      setTimeout(() => {
        heartOverlay.classList.remove('active');
      }, 800);
    }

    // Single Tap Like Button
    likeBtn.addEventListener('click', handleLike);

    function handleLike() {
      const updated = toggleLikePost(post.id);
      if (updated) {
        const isLiked = post.likedBy.includes(state.currentUser.username);
        likeBtn.classList.toggle('liked', isLiked);
        likeBtn.querySelector('i').className = isLiked ? 'fas fa-heart' : 'far fa-heart';
        card.querySelector('.post-likes-count').textContent = `${post.likes.toLocaleString()} likes`;
      }
    }

    // Save/Bookmark
    saveBtn.addEventListener('click', () => {
      toggleSavePost(post.id);
      saveBtn.classList.toggle('saved', post.saved);
      saveBtn.querySelector('i').className = post.saved ? 'fas fa-bookmark' : 'far fa-bookmark';
    });

    // Focus comment field
    commentBtn.addEventListener('click', () => {
      commentField.focus();
    });

    // Submit Comment
    const submitCommentAction = () => {
      const txt = commentField.value;
      if (txt.trim()) {
        addComment(post.id, txt);
        commentField.value = '';
        renderPosts(container); // Re-render feeds to show comments
      }
    };

    commentSubmit.addEventListener('click', submitCommentAction);
    commentField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitCommentAction();
    });

    container.appendChild(card);
  });
}

function renderSidebar(container) {
  container.innerHTML = `
    <div class="sidebar-user-profile">
      <img src="${state.currentUser.avatar}" alt="${state.currentUser.username}">
      <div class="sidebar-user-meta">
        <span class="sidebar-username">${state.currentUser.username}</span>
        <span class="sidebar-fullname">${state.currentUser.name}</span>
      </div>
      <button class="switch-profile-btn">Switch</button>
    </div>
    
    <div class="suggestions-header">
      <span>Suggested for you</span>
      <button class="see-all-btn">See All</button>
    </div>
    
    <div class="suggestions-list">
      <div class="suggestion-item">
        <img src="assets/app-icon.png" alt="travel_guru">
        <div class="suggestion-meta">
          <span class="suggestion-username">travel_guru</span>
          <span class="suggestion-relation">Followed by alex_adventures</span>
        </div>
        <button class="follow-action-btn">Follow</button>
      </div>
      <div class="suggestion-item">
        <img src="assets/story-1.png" alt="code_craft">
        <div class="suggestion-meta">
          <span class="suggestion-username">code_crafts</span>
          <span class="suggestion-relation">New to Instagram</span>
        </div>
        <button class="follow-action-btn">Follow</button>
      </div>
    </div>
    
    <div class="sidebar-footer">
      About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language
      <br><br>
      © 2026 INSTAGRAM CLONE BY ANTIGRAVITY
    </div>
  `;

  // Dynamic Suggestion Follow Buttons
  const followBtns = container.querySelectorAll('.follow-action-btn');
  followBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.textContent === 'Follow') {
        btn.textContent = 'Following';
        btn.classList.add('following');
      } else {
        btn.textContent = 'Follow';
        btn.classList.remove('following');
      }
    });
  });
}
