// Main Application Bootstrap & Routing Module

import { state, isAuthenticated, initializeState, logout } from './state.js';
import { renderFeed } from './feed.js';
import { renderExplore } from './explore.js';
import { renderReels } from './reels.js';
import { renderMessages } from './messages.js';
import { renderCreate } from './create.js';
import { renderProfile } from './profile.js';
import { renderNotifications } from './notifications.js';

let currentActiveView = 'feed';

document.addEventListener('DOMContentLoaded', () => {
  const shell = document.getElementById('app-shell');

  // Check user authentication
  if (!isAuthenticated()) {
    shell.classList.add('logged-out');
    import('./auth.js').then(authModule => {
      authModule.renderLogin(document.getElementById('app-viewer'));
    });
    return;
  }

  // Initialize data from SQLite server database
  initializeState().then(success => {
    if (!success) {
      shell.classList.add('logged-out');
      import('./auth.js').then(authModule => {
        authModule.renderLogin(document.getElementById('app-viewer'));
      });
      return;
    }

    // Set avatars correctly on start
    const avatarCurrents = document.querySelectorAll('#sidebar-avatar-img, #bottom-avatar-img');
    avatarCurrents.forEach(img => {
      if (img && state.currentUser) img.src = state.currentUser.avatar;
    });

    // 1. Initialize PWA Service Worker for offline and Android install support
    registerServiceWorker();
    
    // 2. Setup Route / View navigation links
    initializeNavigation();

    // 3. Setup Theme Switcher (Dark / Light Mode)
    initializeThemeToggle();

    // 4. Listen for client state changes to hot-reload active panels
    initializeStateListener();

    // 5. Setup PWA Install Prompts (particularly helpful on Android)
    initializePWAInstall();

    // 6. Setup Ellipsis Bottom Sheet backdrop dismiss
    setupOptionsSheetBackdrop();

    // 7. Start the Activity/Notification simulator
    startLiveSimulator();

    // 8. Setup logout button listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.reload();
      });
    }

    // 9. Bootstrap Initial Screen
    switchView('feed');
  });
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered successfully: ', registration.scope);
        })
        .catch(err => {
          console.log('[PWA] Service Worker registration failed: ', err);
        });
    });
  }
}

function initializeNavigation() {
  const navItems = document.querySelectorAll('[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.dataset.view;
      switchView(targetView);
    });
  });

  // Mobile Top Headers actions redirect
  const mobileNotif = document.getElementById('mobile-notif-btn');
  const mobileChat = document.getElementById('mobile-chat-btn');
  if (mobileNotif) mobileNotif.addEventListener('click', () => switchView('notifications'));
  if (mobileChat) mobileChat.addEventListener('click', () => switchView('messages'));
}

export function switchView(viewName) {
  currentActiveView = viewName;
  const viewer = document.getElementById('app-viewer');
  if (!viewer) return;

  // Clear unread counts depending on navigation targets
  if (viewName === 'notifications') {
    state.unreadNotificationsCount = 0;
    updateBadgeCounts();
  }
  if (viewName === 'messages') {
    state.unreadMessagesCount = 0;
    updateBadgeCounts();
  }

  // Add a smooth fade loading transition
  viewer.innerHTML = `
    <div class="app-loading">
      <div class="spinner"></div>
    </div>
  `;

  // Update navigation active highlights (both sidebar and mobile bottom nav)
  updateNavigationHighlights(viewName);

  // Render correct components dynamically
  setTimeout(() => {
    switch (viewName) {
      case 'feed':
        renderFeed(viewer);
        break;
      case 'explore':
        renderExplore(viewer);
        break;
      case 'reels':
        renderReels(viewer);
        break;
      case 'messages':
        renderMessages(viewer);
        break;
      case 'notifications':
        renderNotifications(viewer);
        break;
      case 'create':
        renderCreate(viewer);
        break;
      case 'profile':
        renderProfile(viewer);
        break;
      default:
        renderFeed(viewer);
    }
  }, 150); // Minor mock buffer for screen transitions
}

function updateNavigationHighlights(viewName) {
  const navItems = document.querySelectorAll('.nav-item, .mobile-only-footer .nav-item');
  navItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
      // Update icons if font-awesome is used
      const icon = item.querySelector('i');
      if (icon) {
        if (viewName === 'feed') icon.className = 'fas fa-home';
        if (viewName === 'explore') icon.className = 'fas fa-compass';
        if (viewName === 'reels') icon.className = 'fas fa-film';
        if (viewName === 'messages') icon.className = 'fas fa-paper-plane';
        if (viewName === 'notifications') icon.className = 'fas fa-heart';
        if (viewName === 'create') icon.className = 'fas fa-plus-square';
      }
    } else {
      item.classList.remove('active');
      const icon = item.querySelector('i');
      if (icon) {
        // Revert to outline icons when inactive
        if (item.dataset.view === 'feed') icon.className = 'fas fa-home';
        if (item.dataset.view === 'explore') icon.className = 'far fa-compass';
        if (item.dataset.view === 'reels') icon.className = 'fas fa-film';
        if (item.dataset.view === 'messages') icon.className = 'far fa-paper-plane';
        if (item.dataset.view === 'notifications') icon.className = 'far fa-heart';
        if (item.dataset.view === 'create') icon.className = 'far fa-plus-square';
      }
    }
  });
}

function initializeThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    // Update menu button visual details
    toggleBtn.innerHTML = isLight
      ? `<i class="fas fa-sun"></i> <span>Light Mode</span>`
      : `<i class="fas fa-moon"></i> <span>Dark Mode</span>`;
  });
}

function initializeStateListener() {
  // Listen for state mutations to keep views fresh
  document.addEventListener('state-updated', (e) => {
    const updateType = e.detail.type;
    console.log(`[State Update] Refreshing active elements for: ${updateType}`);

    // Update avatar links globally if profile was modified
    if (updateType === 'profile') {
      const avatarCurrents = document.querySelectorAll('#sidebar-avatar-img, #bottom-avatar-img, #profile-avatar-img');
      avatarCurrents.forEach(img => {
        if (img) img.src = state.currentUser.avatar;
      });
    }

    // Dynamic rendering fallback if state is changed on the current view
    const viewer = document.getElementById('app-viewer');
    if (viewer) {
      if (currentActiveView === 'feed' && (updateType === 'feed' || updateType === 'posts' || updateType === 'stories')) {
        renderFeed(viewer);
      } else if (currentActiveView === 'profile' && updateType === 'profile') {
        renderProfile(viewer);
      }
    }
  });
}

function initializePWAInstall() {
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install dialog
    e.preventDefault();
    deferredPrompt = e;
    
    // Show PWA install button in the sidebar (desktop or tablet screens)
    installBtn.style.display = 'flex';
  });

  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted install prompt');
        } else {
          console.log('[PWA] User dismissed install prompt');
        }
        installBtn.style.display = 'none';
        deferredPrompt = null;
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Instagram Clone has been installed successfully');
    installBtn.style.display = 'none';
  });
}

// Option Sheet (ellipsis menu) functions
export function openOptionsSheet(options) {
  const sheet = document.getElementById('options-sheet');
  if (!sheet) return;
  const content = sheet.querySelector('.options-sheet-content');
  content.innerHTML = '';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `sheet-item ${opt.type || ''}`;
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      opt.onClick();
      closeOptionsSheet();
    });
    content.appendChild(btn);
  });

  const cancel = document.createElement('button');
  cancel.className = 'sheet-item';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', closeOptionsSheet);
  content.appendChild(cancel);

  sheet.classList.add('active');
}

export function closeOptionsSheet() {
  const sheet = document.getElementById('options-sheet');
  if (sheet) sheet.classList.remove('active');
}

function setupOptionsSheetBackdrop() {
  const sheet = document.getElementById('options-sheet');
  if (sheet) {
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) closeOptionsSheet();
    });
  }
}

// Floating Toast helpers
export function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const card = document.createElement('div');
  card.className = `toast-card ${type}`;
  card.innerHTML = `
    <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(card);
  setTimeout(() => {
    card.remove();
  }, 3000);
}

// Global Custom Toast Event Listener to prevent circular imports
document.addEventListener('show-toast', (e) => {
  showToast(e.detail.message, e.detail.type);
});

// Badge Counter Updates
export function updateBadgeCounts() {
  const notifBadges = document.querySelectorAll('#mobile-notif-btn .badge, #nav-notifications .badge');
  notifBadges.forEach(badge => {
    if (state.unreadNotificationsCount > 0) {
      badge.textContent = state.unreadNotificationsCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  });

  const msgBadges = document.querySelectorAll('#mobile-chat-btn .badge, #nav-messages .badge');
  msgBadges.forEach(badge => {
    if (state.unreadMessagesCount > 0) {
      badge.textContent = state.unreadMessagesCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Dynamic Interaction Simulator
function startLiveSimulator() {
  const simulatedEvents = [
    {
      type: 'like',
      username: 'creative_soul',
      text: 'liked your photo',
      toast: 'creative_soul liked your photo.'
    },
    {
      type: 'comment',
      username: 'alex_adventures',
      text: 'commented: "Stunning grading! 📸"',
      toast: 'alex_adventures commented on your post.'
    },
    {
      type: 'follow',
      username: 'neon_dreamer',
      text: 'started following you',
      toast: 'neon_dreamer followed you back.'
    }
  ];

  setInterval(() => {
    if (Math.random() > 0.4) {
      const idx = Math.floor(Math.random() * simulatedEvents.length);
      const ev = simulatedEvents[idx];

      import('./state.js').then(stateModule => {
        stateModule.addNotification({
          type: ev.type,
          username: ev.username,
          text: ev.text
        });

        // Show Toast popup alerts
        showToast(ev.toast, 'success');

        // Refresh dynamic UI elements
        updateBadgeCounts();
        
        // Notify the notifications view if active
        if (currentActiveView === 'notifications') {
          const viewer = document.getElementById('app-viewer');
          if (viewer) renderNotifications(viewer);
        }
      });
    }
  }, 22000); // Trigger check every 22 seconds
}
