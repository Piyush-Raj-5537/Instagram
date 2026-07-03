import { state } from './state.js';
import { openPostDetailsModal } from './profile.js';

export function renderNotifications(container) {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'notifications-wrapper';

  wrapper.innerHTML = `
    <div class="notifications-header">
      <h2>Notifications</h2>
    </div>
    
    <div class="notifications-list-container">
      <div class="notifications-section">
        <h3>Recent</h3>
        <div class="notification-items-box">
          ${state.notifications.map(notif => {
            const isFollow = notif.type === 'follow';
            return `
              <div class="notification-item-row" data-id="${notif.id}" data-type="${notif.type}">
                <img src="${notif.username === 'alex_adventures' ? 'assets/app-icon.png' : 'assets/story-1.png'}" class="notification-user-avatar" alt="${notif.username}">
                
                <div class="notification-text-content">
                  <span class="notification-username">${notif.username}</span>
                  <span class="notification-desc">${notif.text}</span>
                  <span class="notification-time">${notif.time}</span>
                </div>
                
                <div class="notification-action-area">
                  ${isFollow 
                    ? `<button class="notification-follow-btn" data-username="${notif.username}">Follow Back</button>`
                    : notif.image 
                      ? `<img src="${notif.image}" class="notification-post-thumb" data-post-id="user-post-1">` // Fallback target
                      : ''
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  const rows = wrapper.querySelectorAll('.notification-item-row');
  rows.forEach(row => {
    const type = row.dataset.type;
    const postThumb = row.querySelector('.notification-post-thumb');
    const followBtn = row.querySelector('.notification-follow-btn');

    if (postThumb) {
      postThumb.addEventListener('click', () => {
        // Open details modal
        openPostDetailsModal('user-post-1');
      });
    }

    if (followBtn) {
      followBtn.addEventListener('click', () => {
        if (followBtn.textContent === 'Follow Back') {
          followBtn.textContent = 'Following';
          followBtn.classList.add('following');
        } else {
          followBtn.textContent = 'Follow Back';
          followBtn.classList.remove('following');
        }
      });
    }
  });

  container.appendChild(wrapper);
}
