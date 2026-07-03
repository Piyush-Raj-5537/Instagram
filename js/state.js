// Global Application State Module (Fullstack Database Linked)

export const state = {
  unfollowedUsers: [],
  unreadMessagesCount: 0,
  unreadNotificationsCount: 0,
  currentUser: null, // Will hold logged in user details
  posts: [],
  stories: [],
  reels: [
    {
      id: 'reel-1',
      username: 'neon_dreamer',
      avatar: 'assets/story-1.png',
      image: 'assets/reel-1.png',
      caption: 'Diving deep into the bioluminescent forest. Magic is real. 🍄🌲✨ #magic #nature #reels',
      audio: 'Original Audio - neon_dreamer',
      likes: '14.2K',
      commentsCount: '312',
      liked: false
    },
    {
      id: 'reel-2',
      username: 'alex_adventures',
      avatar: 'assets/app-icon.png',
      image: 'assets/story-1.png',
      caption: 'High speed highway under the digital sun grid! 🏎️💨 #vaporwave #driving #aesthetics',
      audio: 'Synthwave Dreams - RetroActive',
      likes: '48.9K',
      commentsCount: '1.2K',
      liked: false
    }
  ],
  messages: [],
  notifications: []
};

// API Fetch Helpers
function getToken() {
  return localStorage.getItem('insta_token');
}

export function isAuthenticated() {
  return !!getToken();
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json().catch(() => ({}));
}

// Initialize and Fetch All State Data from backend
export async function initializeState() {
  if (!getToken()) {
    state.currentUser = null;
    return false;
  }

  try {
    // 1. Fetch Current User Profile
    const me = await apiFetch('/api/auth/me');
    
    // Fetch detailed profile for metrics
    const myProfile = await apiFetch(`/api/users/${me.username}`);
    state.currentUser = {
      username: myProfile.username,
      name: myProfile.name,
      avatar: myProfile.avatar,
      bio: myProfile.bio,
      postsCount: myProfile.postsCount,
      followersCount: myProfile.followersCount,
      followingCount: myProfile.followingCount,
      posts: myProfile.posts,
      saved: [] // local cached saves
    };

    // 2. Fetch Feed Posts
    state.posts = await apiFetch('/api/posts');

    // 3. Fetch Stories
    state.stories = await apiFetch('/api/stories');

    // 4. Fetch Chats / Threads
    const chats = await apiFetch('/api/chats');
    state.messages = [];
    
    // Pre-populate chat histories
    for (const chat of chats) {
      try {
        const history = await apiFetch(`/api/messages/${chat.username}`);
        state.messages.push(history);
      } catch (e) {
        state.messages.push({
          id: chat.id,
          username: chat.username,
          avatar: chat.avatar,
          chatHistory: []
        });
      }
    }

    // 5. Fetch Notifications
    state.notifications = await apiFetch('/api/notifications');
    state.unreadNotificationsCount = state.notifications.length;

    console.log("State loaded successfully from database!");
    return true;
  } catch (err) {
    console.error("Failed to load state from database", err);
    logout();
    return false;
  }
}

// ----------------------------------------------------
// AUTH ACTIONS
// ----------------------------------------------------

export async function loginUser(usernameOrEmail, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password })
  });
  
  localStorage.setItem('insta_token', data.token);
  await initializeState();
  
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'auth' } }));
  return data.user;
}

export async function registerUser(username, name, email, password, bio) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, name, email, password, bio })
  });
  
  localStorage.setItem('insta_token', data.token);
  await initializeState();
  
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'auth' } }));
  return data.user;
}

export function logout() {
  localStorage.removeItem('insta_token');
  state.currentUser = null;
  state.posts = [];
  state.stories = [];
  state.messages = [];
  state.notifications = [];
  
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'auth' } }));
}

// ----------------------------------------------------
// STATE MUTATORS (API SYNCED)
// ----------------------------------------------------

export async function addPost(post) {
  let bodyData;
  let headers = {};

  if (post.imageFile) {
    const formData = new FormData();
    formData.append('image', post.imageFile);
    formData.append('caption', post.caption);
    formData.append('location', post.location || '');
    formData.append('filterClass', post.filterClass || '');
    bodyData = formData;
  } else {
    bodyData = JSON.stringify({
      imageBase64: post.image,
      caption: post.caption,
      location: post.location || '',
      filterClass: post.filterClass || ''
    });
  }

  const newPost = await apiFetch('/api/posts', {
    method: 'POST',
    body: bodyData
  });

  // Reload feed posts & current user post list
  state.posts = await apiFetch('/api/posts');
  if (state.currentUser) {
    const myProfile = await apiFetch(`/api/users/${state.currentUser.username}`);
    state.currentUser.posts = myProfile.posts;
    state.currentUser.postsCount = myProfile.postsCount;
  }

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts' } }));
}

export async function toggleLikePost(postId) {
  const result = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
  
  // Find local copy and update
  let post = state.posts.find(p => p.id === String(postId));
  if (!post && state.currentUser) {
    post = state.currentUser.posts.find(p => p.id === String(postId));
  }

  if (post) {
    post.liked = result.liked;
    if (result.liked) {
      post.likes++;
      if (!post.likedBy.includes(state.currentUser.username)) {
        post.likedBy.push(state.currentUser.username);
      }
    } else {
      post.likes--;
      post.likedBy = post.likedBy.filter(u => u !== state.currentUser.username);
    }
  }

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts', postId } }));
  return true;
}

export async function addComment(postId, commentText) {
  if (!commentText.trim()) return false;

  const newComment = await apiFetch(`/api/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text: commentText })
  });

  let post = state.posts.find(p => p.id === String(postId));
  if (!post && state.currentUser) {
    post = state.currentUser.posts.find(p => p.id === String(postId));
  }

  if (post) {
    post.comments.push({
      username: newComment.username,
      text: newComment.text,
      time: 'Just now'
    });
  }

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts', postId } }));
  return true;
}

export function toggleSavePost(postId) {
  let post = state.posts.find(p => p.id === String(postId));
  if (!post && state.currentUser) {
    post = state.currentUser.posts.find(p => p.id === String(postId));
  }

  if (post) {
    post.saved = !post.saved;
    if (post.saved) {
      if (!state.currentUser.saved.some(p => p.id === String(postId))) {
        state.currentUser.saved.push(post);
      }
    } else {
      state.currentUser.saved = state.currentUser.saved.filter(p => p.id !== String(postId));
    }
    document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'profile' } }));
    return true;
  }
  return false;
}

export async function sendMessage(chatId, text) {
  if (!text.trim()) return false;

  // Retrieve receiver username from chat template
  const chat = state.messages.find(m => m.id === chatId);
  if (!chat) return false;

  const sentMessage = await apiFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverUsername: chat.username, text })
  });

  chat.chatHistory.push({
    sender: state.currentUser.username,
    text: sentMessage.text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'messages', chatId } }));
  return true;
}

export async function updateProfile(name, username, bio, avatarFile) {
  let bodyData;
  if (avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('name', name);
    formData.append('bio', bio);
    bodyData = formData;
  } else {
    bodyData = JSON.stringify({ name, bio });
  }

  await apiFetch('/api/users/profile', {
    method: 'PUT',
    body: bodyData
  });

  // Re-fetch current profile
  await initializeState();
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'profile' } }));
}

export async function addStoryItem(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  await apiFetch('/api/stories', {
    method: 'POST',
    body: formData
  });

  // Refresh stories from server
  state.stories = await apiFetch('/api/stories');
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'stories' } }));
}

export async function addNotification(notif) {
  // Save notification to backend
  const newNotif = await apiFetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({
      type: notif.type,
      fromUsername: notif.username,
      text: notif.text,
      imageUrl: notif.image || ''
    })
  }).catch(() => {
    // Fallback locally
    return {
      id: Date.now(),
      type: notif.type,
      username: notif.username,
      text: notif.text,
      time: 'Just now',
      image: notif.image || null
    };
  });

  state.notifications.unshift({
    id: newNotif.id,
    type: notif.type,
    username: notif.username,
    text: notif.text,
    time: 'Just now',
    image: notif.image || null
  });
  state.unreadNotificationsCount++;

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'notifications' } }));
}

export async function unfollowUser(username) {
  await apiFetch(`/api/users/${username}/follow`, { method: 'POST' });
  
  if (!state.unfollowedUsers.includes(username)) {
    state.unfollowedUsers.push(username);
  }
  
  // Reload posts from backend
  state.posts = await apiFetch('/api/posts');

  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'feed' } }));
}
