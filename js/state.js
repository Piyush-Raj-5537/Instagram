// Global Application State Module

// Initial State Data
export const state = {
  unfollowedUsers: [],
  unreadMessagesCount: 0,
  unreadNotificationsCount: 0,
  currentUser: {
    username: 'pixel_pioneer',
    name: 'Piyush Explorer',
    avatar: 'assets/avatar-current.png',
    bio: 'Building the future, one line of code at a time. Coding clean clones. ✨\nAndroid & PWA developer.',
    postsCount: 2,
    followersCount: 1420,
    followingCount: 382,
    posts: [
      {
        id: 'user-post-1',
        username: 'pixel_pioneer',
        avatar: 'assets/avatar-current.png',
        image: 'assets/post-2.png',
        caption: 'Late night sessions, coding this awesome Instagram PWA clone from scratch. Coffee is the real MVP. ☕💻',
        location: 'Dev Studio',
        likes: 42,
        likedBy: [],
        comments: [
          { username: 'creative_soul', text: 'Looks clean! Super smooth layout.', time: '2h' },
          { username: 'neon_dreamer', text: 'Is it installable on Android?', time: '1h' },
          { username: 'pixel_pioneer', text: 'Yes, full PWA support! 🚀', time: '30m' }
        ],
        timestamp: '3h ago',
        saved: false
      },
      {
        id: 'user-post-2',
        username: 'pixel_pioneer',
        avatar: 'assets/avatar-current.png',
        image: 'assets/post-1.png',
        caption: 'Neon vibes. Tokyo streets aesthetic. 🌃✨ #cyberpunk #photography',
        location: 'Shinjuku, Tokyo',
        likes: 128,
        likedBy: [],
        comments: [
          { username: 'alex_adventures', text: 'Incredible shot! Love the magenta tones.', time: '4h' }
        ],
        timestamp: '1d ago',
        saved: false
      }
    ],
    saved: []
  },

  posts: [
    {
      id: 'feed-post-1',
      username: 'alex_adventures',
      avatar: 'assets/app-icon.png', // Fallback/reuse app icon or simple avatar
      image: 'assets/post-1.png',
      caption: 'Walking through the neon rain in Shibuya. The city never sleeps. 🌧️🌌 #neon #tokyo #travel',
      location: 'Shibuya, Japan',
      likes: 852,
      likedBy: [],
      comments: [
        { username: 'pixel_pioneer', text: 'Stunning capture, Alex! Need to visit soon.', time: '5h' },
        { username: 'creative_soul', text: 'This grading is insane!', time: '4h' }
      ],
      timestamp: '5h ago',
      saved: false
    },
    {
      id: 'feed-post-2',
      username: 'creative_soul',
      avatar: 'assets/avatar-current.png',
      image: 'assets/post-2.png',
      caption: 'A clean desk is a productive desk. Starting the day with gratitude and high-focus coding. 🌿☕',
      location: 'Creative Workspace',
      likes: 312,
      likedBy: [],
      comments: [
        { username: 'neon_dreamer', text: 'Cozy vibes are off the charts!', time: '1d' }
      ],
      timestamp: '1d ago',
      saved: false
    }
  ],

  stories: [
    {
      id: 'story-user',
      username: 'Your Story',
      avatar: 'assets/avatar-current.png',
      viewed: false,
      items: [
        { type: 'image', url: 'assets/story-1.png', duration: 5000 }
      ]
    },
    {
      id: 'story-alex',
      username: 'alex_adventures',
      avatar: 'assets/app-icon.png',
      viewed: false,
      items: [
        { type: 'image', url: 'assets/post-1.png', duration: 5000 }
      ]
    },
    {
      id: 'story-neon',
      username: 'neon_dreamer',
      avatar: 'assets/story-1.png',
      viewed: false,
      items: [
        { type: 'image', url: 'assets/story-1.png', duration: 5000 }
      ]
    }
  ],

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

  messages: [
    {
      id: 'chat-alex',
      username: 'alex_adventures',
      avatar: 'assets/app-icon.png',
      active: true,
      chatHistory: [
        { sender: 'alex_adventures', text: 'Hey there! Loved your latest post.', time: '10:30 AM' },
        { sender: 'pixel_pioneer', text: 'Thanks Alex! Appreciate the feedback. I am building a clone of Instagram!', time: '10:31 AM' },
        { sender: 'alex_adventures', text: 'Whoa, that sounds epic. Does it run dynamically?', time: '10:32 AM' }
      ]
    },
    {
      id: 'chat-creative',
      username: 'creative_soul',
      avatar: 'assets/avatar-current.png',
      active: false,
      chatHistory: [
        { sender: 'creative_soul', text: 'Are you using vanilla JS for state management?', time: 'Yesterday' },
        { sender: 'pixel_pioneer', text: 'Yes! Pure state management modules.', time: 'Yesterday' }
      ]
    },
    {
      id: 'chat-neon',
      username: 'neon_dreamer',
      avatar: 'assets/story-1.png',
      active: false,
      chatHistory: [
        { sender: 'neon_dreamer', text: 'Check out this aesthetic!', time: 'Wednesday' }
      ]
    }
  ],

  notifications: [
    { id: 1, type: 'like', username: 'alex_adventures', text: 'liked your post.', time: '2h ago', image: 'assets/post-2.png' },
    { id: 2, type: 'comment', username: 'creative_soul', text: 'commented: "Looks clean! Super smooth..."', time: '3h ago', image: 'assets/post-2.png' },
    { id: 3, type: 'follow', username: 'neon_dreamer', text: 'started following you.', time: '1d ago', image: null }
  ]
};

// State manipulation helpers
export function addPost(post) {
  const newPost = {
    id: `custom-post-${Date.now()}`,
    username: state.currentUser.username,
    avatar: state.currentUser.avatar,
    image: post.image,
    caption: post.caption,
    location: post.location || '',
    likes: 0,
    likedBy: [],
    comments: [],
    timestamp: 'Just now',
    saved: false,
    filterClass: post.filterClass || ''
  };

  // Add to global feed
  state.posts.unshift(newPost);
  // Add to user posts
  state.currentUser.posts.unshift(newPost);
  state.currentUser.postsCount++;

  // Trigger custom state update event
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts' } }));
}

export function toggleLikePost(postId) {
  // Check global posts
  let post = state.posts.find(p => p.id === postId);
  if (!post) {
    // Check user posts
    post = state.currentUser.posts.find(p => p.id === postId);
  }

  if (post) {
    const userIndex = post.likedBy.indexOf(state.currentUser.username);
    if (userIndex === -1) {
      post.likedBy.push(state.currentUser.username);
      post.likes++;
    } else {
      post.likedBy.splice(userIndex, 1);
      post.likes--;
    }
    document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts', postId } }));
    return true;
  }
  return false;
}

export function addComment(postId, commentText) {
  let post = state.posts.find(p => p.id === postId);
  if (!post) {
    post = state.currentUser.posts.find(p => p.id === postId);
  }

  if (post && commentText.trim() !== '') {
    post.comments.push({
      username: state.currentUser.username,
      text: commentText,
      time: 'Just now'
    });
    document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'posts', postId } }));
    return true;
  }
  return false;
}

export function toggleSavePost(postId) {
  let post = state.posts.find(p => p.id === postId);
  if (!post) {
    post = state.currentUser.posts.find(p => p.id === postId);
  }

  if (post) {
    post.saved = !post.saved;
    if (post.saved) {
      // Add to saved list if not already there
      if (!state.currentUser.saved.some(p => p.id === postId)) {
        state.currentUser.saved.push(post);
      }
    } else {
      // Remove from saved list
      state.currentUser.saved = state.currentUser.saved.filter(p => p.id !== postId);
    }
    document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'profile' } }));
    return true;
  }
  return false;
}

export function sendMessage(chatId, text) {
  const chat = state.messages.find(m => m.id === chatId);
  if (chat && text.trim() !== '') {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chat.chatHistory.push({
      sender: state.currentUser.username,
      text: text,
      time: timeNow
    });
    document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'messages', chatId } }));
    return true;
  }
  return false;
}

export function updateProfile(name, username, bio, avatar) {
  state.currentUser.name = name;
  state.currentUser.username = username;
  state.currentUser.bio = bio;
  if (avatar) {
    state.currentUser.avatar = avatar;
    // Update avatar across user posts
    state.currentUser.posts.forEach(p => p.avatar = avatar);
  }
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'profile' } }));
}

export function addStoryItem(imageSrc) {
  let userStory = state.stories.find(s => s.id === 'story-user');
  if (!userStory) {
    userStory = {
      id: 'story-user',
      username: 'Your Story',
      avatar: state.currentUser.avatar,
      viewed: false,
      items: []
    };
    state.stories.unshift(userStory);
  }
  
  userStory.items.push({
    type: 'image',
    url: imageSrc,
    duration: 5000
  });
  
  userStory.viewed = false;
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'stories' } }));
}

export function addNotification(notif) {
  const newNotif = {
    id: Date.now(),
    type: notif.type, // 'like', 'comment', 'follow'
    username: notif.username,
    text: notif.text,
    time: 'Just now',
    image: notif.image || null
  };
  
  state.notifications.unshift(newNotif);
  state.unreadNotificationsCount++;
  
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'notifications', notification: newNotif } }));
}

export function unfollowUser(username) {
  if (!state.unfollowedUsers.includes(username)) {
    state.unfollowedUsers.push(username);
  }
  document.dispatchEvent(new CustomEvent('state-updated', { detail: { type: 'feed' } }));
}
