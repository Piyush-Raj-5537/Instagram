import { state, updateProfile, toggleLikePost, addComment, toggleSavePost, logout } from './state.js';

let activeProfileTab = 'posts';

export function renderProfile(container) {
  container.innerHTML = '';

  const profileWrapper = document.createElement('div');
  profileWrapper.className = 'profile-wrapper';

  // 1. Profile Info Header
  const headerSection = document.createElement('header');
  headerSection.className = 'profile-header';
  renderProfileHeader(headerSection);
  profileWrapper.appendChild(headerSection);

  // 2. Tab Bar navigation
  const tabBar = document.createElement('div');
  tabBar.className = 'profile-tab-bar';
  tabBar.innerHTML = `
    <button class="profile-tab-btn ${activeProfileTab === 'posts' ? 'active' : ''}" data-tab="posts">
      <i class="fas fa-th"></i> <span>POSTS</span>
    </button>
    <button class="profile-tab-btn ${activeProfileTab === 'saved' ? 'active' : ''}" data-tab="saved">
      <i class="far fa-bookmark"></i> <span>SAVED</span>
    </button>
    <button class="profile-tab-btn ${activeProfileTab === 'tagged' ? 'active' : ''}" data-tab="tagged">
      <i class="fas fa-user-tag"></i> <span>TAGGED</span>
    </button>
  `;
  profileWrapper.appendChild(tabBar);

  // 3. Grid Content display
  const gridSection = document.createElement('div');
  gridSection.className = 'profile-grid-section';
  renderProfileGrid(gridSection);
  profileWrapper.appendChild(gridSection);

  container.appendChild(profileWrapper);

  // Tab change handlers
  const tabs = tabBar.querySelectorAll('.profile-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeProfileTab = tab.dataset.tab;
      renderProfileGrid(gridSection);
    });
  });
}

function renderProfileHeader(container) {
  container.innerHTML = `
    <div class="profile-avatar-container">
      <img src="${state.currentUser.avatar}" alt="${state.currentUser.username}" id="profile-avatar-img">
    </div>
    
    <div class="profile-meta-details">
      <div class="profile-meta-top-row">
        <h2 class="profile-username-header">${state.currentUser.username}</h2>
        <div class="profile-header-actions">
          <button class="profile-edit-btn" id="edit-profile-trigger">Edit Profile</button>
          <button class="profile-settings-btn"><i class="fas fa-cog"></i></button>
        </div>
      </div>
      
      <ul class="profile-stats-row">
        <li><strong>${state.currentUser.posts.length}</strong> posts</li>
        <li><strong>${state.currentUser.followersCount}</strong> followers</li>
        <li><strong>${state.currentUser.followingCount}</strong> following</li>
      </ul>
      
      <div class="profile-bio-details">
        <h1 class="profile-fullname-header">${state.currentUser.name}</h1>
        <p class="profile-bio-text">${state.currentUser.bio.replace(/\n/g, '<br>')}</p>
        <a href="#" class="profile-bio-link">github.com/piyush</a>
      </div>
    </div>
  `;

  // Attach Edit Profile Modal trigger
  container.querySelector('#edit-profile-trigger').addEventListener('click', openEditProfileModal);
  
  // Attach Settings Log Out options sheet
  container.querySelector('.profile-settings-btn').addEventListener('click', () => {
    import('./app.js').then(appModule => {
      appModule.openOptionsSheet([
        {
          label: 'Log Out',
          type: 'danger',
          onClick: () => {
            logout();
            window.location.reload();
          }
        }
      ]);
    });
  });
}

function renderProfileGrid(container) {
  container.innerHTML = '';
  
  let targetPosts = [];
  if (activeProfileTab === 'posts') {
    targetPosts = state.currentUser.posts;
  } else if (activeProfileTab === 'saved') {
    targetPosts = state.currentUser.saved;
  } else {
    // Tagged posts (Empty mock state)
    container.innerHTML = `
      <div class="profile-empty-state">
        <i class="fas fa-user-tag empty-icon"></i>
        <h2>Photos of you</h2>
        <p>When people tag you in photos, they'll appear here.</p>
      </div>
    `;
    return;
  }

  if (targetPosts.length === 0) {
    let emptyTitle = activeProfileTab === 'posts' ? 'Share Photos' : 'Save Photos';
    let emptyDesc = activeProfileTab === 'posts' 
      ? "When you share photos, they'll appear on your profile."
      : "Save photos that you want to see again. No one is notified, and only you can see what you've saved.";
    let iconClass = activeProfileTab === 'posts' ? 'fas fa-camera' : 'far fa-bookmark';

    container.innerHTML = `
      <div class="profile-empty-state">
        <i class="${iconClass} empty-icon"></i>
        <h2>${emptyTitle}</h2>
        <p>${emptyDesc}</p>
      </div>
    `;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'posts-grid';

  targetPosts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'grid-post-item';
    item.innerHTML = `
      <img src="${post.image}" class="${post.filterClass || ''}" alt="Grid post">
      <div class="grid-post-overlay">
        <span><i class="fas fa-heart"></i> ${post.likes}</span>
        <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
      </div>
    `;

    item.addEventListener('click', () => {
      openPostDetailsModal(post.id);
    });

    grid.appendChild(item);
  });

  container.appendChild(grid);
}

function openEditProfileModal() {
  let modal = document.getElementById('edit-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-profile-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="edit-profile-dialog">
      <div class="dialog-header">
        <h3>Edit Profile</h3>
        <button class="dialog-close-btn" id="close-edit-profile"><i class="fas fa-times"></i></button>
      </div>
      <div class="dialog-body">
        <div class="edit-avatar-row">
          <img src="${state.currentUser.avatar}" id="edit-avatar-preview">
          <div class="edit-avatar-actions">
            <span class="edit-username-label">${state.currentUser.username}</span>
            <button class="change-photo-btn" id="change-photo-btn">Change Profile Photo</button>
            <input type="file" id="avatar-file-input" accept="image/*" style="display: none;">
          </div>
        </div>
        
        <div class="edit-input-field-group">
          <label for="edit-name-field">Name</label>
          <input type="text" id="edit-name-field" value="${state.currentUser.name}">
        </div>
        
        <div class="edit-input-field-group">
          <label for="edit-username-field">Username</label>
          <input type="text" id="edit-username-field" value="${state.currentUser.username}">
        </div>
        
        <div class="edit-input-field-group">
          <label for="edit-bio-field">Bio</label>
          <textarea id="edit-bio-field" rows="3">${state.currentUser.bio}</textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="dialog-cancel-btn" id="cancel-edit-profile">Cancel</button>
        <button class="dialog-submit-btn" id="submit-edit-profile">Save</button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const fileInput = modal.querySelector('#avatar-file-input');
  const changePhotoBtn = modal.querySelector('#change-photo-btn');
  const avatarPreview = modal.querySelector('#edit-avatar-preview');
  let selectedAvatarFile = null;

  changePhotoBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  const closeActions = () => {
    modal.classList.remove('active');
  };

  modal.querySelector('#close-edit-profile').addEventListener('click', closeActions);
  modal.querySelector('#cancel-edit-profile').addEventListener('click', closeActions);

  modal.querySelector('#submit-edit-profile').addEventListener('click', () => {
    const name = modal.querySelector('#edit-name-field').value;
    const username = modal.querySelector('#edit-username-field').value;
    const bio = modal.querySelector('#edit-bio-field').value;

    updateProfile(name, username, bio, selectedAvatarFile);
    closeActions();
    
    // Refresh header views
    const headerSection = document.querySelector('.profile-header');
    if (headerSection) renderProfileHeader(headerSection);
  });
}

export function openPostDetailsModal(postId) {
  let modal = document.getElementById('post-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'post-details-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  // Load post details from global state
  let post = state.posts.find(p => p.id === postId);
  if (!post) post = state.currentUser.posts.find(p => p.id === postId);
  if (!post) return;

  renderPostDetailsDialog(modal, post);
  modal.classList.add('active');
}

function renderPostDetailsDialog(modal, post) {
  const isLiked = post.likedBy.includes(state.currentUser.username);
  
  modal.innerHTML = `
    <div class="post-details-dialog">
      <button class="details-dialog-close-btn" id="close-post-details"><i class="fas fa-times"></i></button>
      
      <div class="details-split-container">
        <!-- Left Side Image -->
        <div class="details-image-pane">
          <img src="${post.image}" class="${post.filterClass || ''}" alt="Post content">
          <div class="double-tap-heart"><i class="fas fa-heart"></i></div>
        </div>
        
        <!-- Right Side Comments and Interaction -->
        <div class="details-info-pane">
          <div class="details-header">
            <img src="${post.avatar}" class="details-user-avatar">
            <div class="details-user-meta">
              <span class="details-username">${post.username}</span>
              ${post.location ? `<span class="details-location">${post.location}</span>` : ''}
            </div>
            <button class="details-options-btn"><i class="fas fa-ellipsis-h"></i></button>
          </div>
          
          <div class="details-scrollable-comments">
            <div class="details-caption-row">
              <img src="${post.avatar}" class="details-user-avatar">
              <div class="details-caption-content">
                <span class="details-username">${post.username}</span>
                <span>${post.caption}</span>
                <span class="details-timestamp-sub">${post.timestamp}</span>
              </div>
            </div>
            
            <div class="details-comments-list-box" id="details-comments-box">
              ${post.comments.map(c => `
                <div class="details-comment-row">
                  <img src="assets/avatar-current.png" class="details-user-avatar"> <!-- Fallback avatar -->
                  <div class="details-comment-content">
                    <span class="details-username">${c.username}</span>
                    <span>${c.text}</span>
                    <span class="details-timestamp-sub">${c.time}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="details-interaction-box">
            <div class="post-actions">
              <div class="left-actions">
                <button class="action-btn details-like-btn ${isLiked ? 'liked' : ''}">
                  <i class="${isLiked ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </button>
                <button class="action-btn details-comment-btn"><i class="far fa-comment"></i></button>
                <button class="action-btn details-share-btn"><i class="far fa-paper-plane"></i></button>
              </div>
              <button class="action-btn details-save-btn ${post.saved ? 'saved' : ''}">
                <i class="${post.saved ? 'fas fa-bookmark' : 'far fa-bookmark'}"></i>
              </button>
            </div>
            
            <div class="details-likes-count">${post.likes.toLocaleString()} likes</div>
            <div class="details-timestamp">${post.timestamp}</div>
          </div>
          
          <div class="details-comment-input-area">
            <button class="emoji-picker-btn"><i class="far fa-smile"></i></button>
            <input type="text" class="details-comment-field" placeholder="Add a comment...">
            <button class="details-comment-submit-btn">Post</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Interaction handlers
  const closeBtn = modal.querySelector('#close-post-details');
  const detailsImage = modal.querySelector('.details-image-pane img');
  const detailsImageContainer = modal.querySelector('.details-image-pane');
  const heartOverlay = modal.querySelector('.double-tap-heart');
  const likeBtn = modal.querySelector('.details-like-btn');
  const commentBtn = modal.querySelector('.details-comment-btn');
  const saveBtn = modal.querySelector('.details-save-btn');
  const commentInput = modal.querySelector('.details-comment-field');
  const commentSubmit = modal.querySelector('.details-comment-submit-btn');

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Double tap to like
  let lastTap = 0;
  detailsImageContainer.addEventListener('click', () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      handleLike();
      triggerDoubleTapAnimation();
    }
    lastTap = currentTime;
  });

  function triggerDoubleTapAnimation() {
    heartOverlay.classList.add('active');
    setTimeout(() => {
      heartOverlay.classList.remove('active');
    }, 800);
  }

  // Like click
  likeBtn.addEventListener('click', handleLike);

  function handleLike() {
    const updated = toggleLikePost(post.id);
    if (updated) {
      const currentlyLiked = post.likedBy.includes(state.currentUser.username);
      likeBtn.classList.toggle('liked', currentlyLiked);
      likeBtn.querySelector('i').className = currentlyLiked ? 'fas fa-heart' : 'far fa-heart';
      modal.querySelector('.details-likes-count').textContent = `${post.likes.toLocaleString()} likes`;
    }
  }

  // Save click
  saveBtn.addEventListener('click', () => {
    toggleSavePost(post.id);
    saveBtn.classList.toggle('saved', post.saved);
    saveBtn.querySelector('i').className = post.saved ? 'fas fa-bookmark' : 'far fa-bookmark';
  });

  // Focus comment
  commentBtn.addEventListener('click', () => {
    commentInput.focus();
  });

  // Submit comment
  const submitAction = () => {
    const txt = commentInput.value;
    if (txt.trim()) {
      addComment(post.id, txt);
      commentInput.value = '';
      // Refresh details box list
      renderPostDetailsDialog(modal, post);
    }
  };

  commentSubmit.addEventListener('click', submitAction);
  commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAction();
  });
}
