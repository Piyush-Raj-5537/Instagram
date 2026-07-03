import { state, sendMessage } from './state.js';

let activeChatId = 'chat-alex';

export function renderMessages(container) {
  container.innerHTML = '';

  const inboxContainer = document.createElement('div');
  inboxContainer.className = 'inbox-container';

  // 1. Thread List (Sidebar)
  const threadSidebar = document.createElement('div');
  threadSidebar.className = 'thread-sidebar';
  renderThreadList(threadSidebar);

  // 2. Chat Pane
  const chatPane = document.createElement('div');
  chatPane.className = 'chat-pane';
  renderChatPane(chatPane);

  inboxContainer.appendChild(threadSidebar);
  inboxContainer.appendChild(chatPane);
  container.appendChild(inboxContainer);

  // Apply CSS layout checks for mobile back navigation
  setupMobileDMNavigation(inboxContainer);
}

function renderThreadList(container) {
  const activeChat = state.messages.find(m => m.id === activeChatId);
  
  container.innerHTML = `
    <div class="thread-sidebar-header">
      <span class="thread-sidebar-title">${state.currentUser.username}</span>
      <button class="new-message-btn"><i class="far fa-edit"></i></button>
    </div>
    <div class="thread-search-box">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Search">
    </div>
    <div class="thread-items-list">
      ${state.messages.map(chat => {
        const lastMsg = chat.chatHistory[chat.chatHistory.length - 1];
        const isSelected = chat.id === activeChatId;
        return `
          <div class="thread-item ${isSelected ? 'active' : ''}" data-id="${chat.id}">
            <img src="${chat.avatar}" alt="${chat.username}" class="thread-avatar">
            <div class="thread-details">
              <span class="thread-username">${chat.username}</span>
              <span class="thread-last-msg">${lastMsg ? lastMsg.text : 'No messages'}</span>
            </div>
            ${chat.id === 'chat-alex' && !isSelected ? `<div class="unread-badge"></div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach thread selection handlers
  const items = container.querySelectorAll('.thread-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      activeChatId = item.dataset.id;
      
      // Update state selection
      state.messages.forEach(m => m.active = m.id === activeChatId);
      
      const inboxContainer = document.querySelector('.inbox-container');
      if (inboxContainer) {
        // Show chat pane on mobile
        inboxContainer.classList.add('chat-open');
      }
      
      // Re-render
      const chatPane = document.querySelector('.chat-pane');
      if (chatPane) renderChatPane(chatPane);
      
      // Refresh thread list styles
      renderThreadList(container);
    });
  });
}

function renderChatPane(container) {
  const chat = state.messages.find(m => m.id === activeChatId);
  if (!chat) {
    container.innerHTML = `<div class="empty-chat-pane">Select a message to start chatting</div>`;
    return;
  }

  container.innerHTML = `
    <!-- Top Header -->
    <div class="chat-header">
      <button class="chat-back-btn" id="chat-back-btn"><i class="fas fa-arrow-left"></i></button>
      <img src="${chat.avatar}" class="chat-header-avatar" alt="${chat.username}">
      <div class="chat-header-user">
        <span class="chat-header-username">${chat.username}</span>
        <span class="chat-header-status">Active now</span>
      </div>
      <div class="chat-header-actions">
        <button class="chat-action-icon"><i class="fas fa-phone-alt"></i></button>
        <button class="chat-action-icon"><i class="fas fa-video"></i></button>
        <button class="chat-action-icon"><i class="fas fa-info-circle"></i></button>
      </div>
    </div>
    
    <!-- Messages Scroll List -->
    <div class="chat-messages-scroller" id="chat-scroller">
      <div class="chat-profile-detail">
        <img src="${chat.avatar}" alt="${chat.username}">
        <h3>${chat.username}</h3>
        <p>Instagram • 14.5K followers</p>
        <button class="view-profile-btn">View Profile</button>
      </div>
      
      <div class="messages-bubble-list">
        ${chat.chatHistory.map(msg => {
          const isMe = msg.sender === state.currentUser.username;
          return `
            <div class="msg-bubble-row ${isMe ? 'sent' : 'received'}">
              ${!isMe ? `<img src="${chat.avatar}" class="bubble-avatar">` : ''}
              <div class="msg-bubble-content">
                <div class="msg-bubble-text">${msg.text}</div>
                <div class="msg-bubble-time">${msg.time}</div>
              </div>
            </div>
          `;
        }).join('')}
        <div class="typing-indicator" id="chat-typing" style="display: none;">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
    
    <!-- Input Section -->
    <div class="chat-input-row">
      <button class="chat-input-btn"><i class="far fa-smile"></i></button>
      <input type="text" class="chat-text-field" id="chat-input-field" placeholder="Message...">
      <div class="chat-input-media-icons" id="chat-media-icons">
        <button class="chat-input-btn"><i class="far fa-image"></i></button>
        <button class="chat-input-btn"><i class="far fa-heart"></i></button>
      </div>
      <button class="chat-send-btn" id="chat-send-btn" style="display: none;">Send</button>
    </div>
  `;

  // Scroll to bottom
  const scroller = container.querySelector('#chat-scroller');
  scroller.scrollTop = scroller.scrollHeight;

  // Navigation handlers
  const backBtn = container.querySelector('#chat-back-btn');
  backBtn.addEventListener('click', () => {
    const inboxContainer = document.querySelector('.inbox-container');
    if (inboxContainer) {
      inboxContainer.classList.remove('chat-open');
    }
  });

  // Message field change event to show/hide Send button
  const inputField = container.querySelector('#chat-input-field');
  const sendBtn = container.querySelector('#chat-send-btn');
  const mediaIcons = container.querySelector('#chat-media-icons');

  inputField.addEventListener('input', () => {
    if (inputField.value.trim() !== '') {
      sendBtn.style.display = 'block';
      mediaIcons.style.display = 'none';
    } else {
      sendBtn.style.display = 'none';
      mediaIcons.style.display = 'flex';
    }
  });

  // Action methods
  const handleMessageSubmit = () => {
    const text = inputField.value;
    if (text.trim() === '') return;

    sendMessage(chat.id, text);
    inputField.value = '';
    sendBtn.style.display = 'none';
    mediaIcons.style.display = 'flex';

    // Re-render scroller content
    renderMessagesScroller(container, chat);

    // Trigger AI response after 1.5s
    triggerAutoResponse(chat, text, container);
  };

  sendBtn.addEventListener('click', handleMessageSubmit);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleMessageSubmit();
  });
}

function renderMessagesScroller(container, chat) {
  const bubbleList = container.querySelector('.messages-bubble-list');
  if (bubbleList) {
    bubbleList.innerHTML = `
      ${chat.chatHistory.map(msg => {
        const isMe = msg.sender === state.currentUser.username;
        return `
          <div class="msg-bubble-row ${isMe ? 'sent' : 'received'}">
            ${!isMe ? `<img src="${chat.avatar}" class="bubble-avatar">` : ''}
            <div class="msg-bubble-content">
              <div class="msg-bubble-text">${msg.text}</div>
              <div class="msg-bubble-time">${msg.time}</div>
            </div>
          </div>
        `;
      }).join('')}
      <div class="typing-indicator" id="chat-typing" style="display: none;">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    const scroller = container.querySelector('#chat-scroller');
    scroller.scrollTop = scroller.scrollHeight;
  }
}

function triggerAutoResponse(chat, userText, container) {
  const typingIndicator = container.querySelector('#chat-typing');
  if (typingIndicator) {
    // Show typing indicator
    setTimeout(() => {
      typingIndicator.style.display = 'flex';
      const scroller = container.querySelector('#chat-scroller');
      scroller.scrollTop = scroller.scrollHeight;
    }, 500);
  }

  setTimeout(() => {
    let replyText = "That sounds awesome! Let's build more cool features. 🚀";
    const cleanText = userText.toLowerCase();

    if (cleanText.includes('hi') || cleanText.includes('hello') || cleanText.includes('hey')) {
      replyText = `Hey there! How do you like this dynamic Instagram Android clone? It runs fully on client-side state! 😄`;
    } else if (cleanText.includes('pwa') || cleanText.includes('android')) {
      replyText = `PWAs are great for Android! You can click 'Install App' or 'Add to Home Screen' in your browser settings to run this clone full-screen like a native app. 📱🎉`;
    } else if (cleanText.includes('clone') || cleanText.includes('code') || cleanText.includes('framework')) {
      replyText = `We built this using pure HTML, Vanilla CSS, and modular ES Modules. It keeps it incredibly lightweight, clean, and blazingly fast. ⚡💻`;
    } else if (cleanText.includes('like') || cleanText.includes('heart') || cleanText.includes('double')) {
      replyText = `Double-tapping a post image triggers a sleek pop-up heart and increments the like count instantly. Give it a try on the Feed! ❤️`;
    } else if (cleanText.includes('filter') || cleanText.includes('create') || cleanText.includes('post')) {
      replyText = `In the Create Post tab, you can load any picture and apply CSS filters (Clarendon, Gingham, Moon, Sepia) in real-time before posting! 📸🌈`;
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chat.chatHistory.push({
      sender: chat.username,
      text: replyText,
      time: timeNow
    });

    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }

    renderMessagesScroller(container, chat);

    // Refresh inbox thread lists to show new last messages
    const threadSidebar = document.querySelector('.thread-sidebar');
    if (threadSidebar) renderThreadList(threadSidebar);
  }, 2000);
}

function setupMobileDMNavigation(inboxContainer) {
  // Handles layout adjustments
  if (window.innerWidth <= 768) {
    inboxContainer.classList.remove('chat-open');
  }
}
