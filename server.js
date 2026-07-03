const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'instagram_pwa_secret_key_987654';

// Setup directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded media
app.use('/uploads', express.static(uploadsDir));

// SQLite Database Setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    avatar TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_url TEXT,
    caption TEXT,
    location TEXT,
    filter_class TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER,
    following_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    from_username TEXT,
    text TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Seed default data if users is empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) console.error(err);
    if (row && row.count === 0) {
      console.log("Seeding database with default Instagram data...");
      const passHash = bcrypt.hashSync('password123', 10);

      // 1. Insert Users
      db.run(`INSERT INTO users (username, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`,
        ['pixel_pioneer', 'Piyush Explorer', 'piyush@example.com', passHash, 'assets/avatar-current.png', 'Building the future, one line of code at a time. Coding clean clones. ✨\nAndroid & PWA developer.'],
        function(e) {
          const user1 = this.lastID;
          
          db.run(`INSERT INTO users (username, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`,
            ['alex_adventures', 'Alex Mercer', 'alex@example.com', passHash, 'assets/app-icon.png', 'Aventurer, Traveler, and Synthwave enthusiast. 🎒🌅'],
            function(e) {
              const user2 = this.lastID;

              db.run(`INSERT INTO users (username, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`,
                ['creative_soul', 'Elena Rostova', 'elena@example.com', passHash, 'assets/avatar-current.png', 'Minimalist aesthetics and cozy coding vibes. 🌿☕'],
                function(e) {
                  const user3 = this.lastID;

                  db.run(`INSERT INTO users (username, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`,
                    ['neon_dreamer', 'Sora Cyber', 'sora@example.com', passHash, 'assets/story-1.png', 'Cyberpunk lifestyle, dark modes, and night photography. 🌌✨'],
                    function(e) {
                      const user4 = this.lastID;

                      // 2. Insert Follows
                      db.run(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, [user1, user2]);
                      db.run(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, [user1, user3]);
                      db.run(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, [user1, user4]);
                      db.run(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, [user2, user1]);
                      db.run(`INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`, [user3, user1]);

                      // 3. Insert Posts
                      // Pixel Pioneer Post 1
                      db.run(`INSERT INTO posts (user_id, image_url, caption, location, filter_class) VALUES (?, ?, ?, ?, ?)`,
                        [user1, 'assets/post-2.png', 'Late night sessions, coding this awesome Instagram PWA clone from scratch. Coffee is the real MVP. ☕💻', 'Dev Studio', ''],
                        function(e) {
                          const p1 = this.lastID;
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p1, user3, 'Looks clean! Super smooth layout.']);
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p1, user4, 'Is it installable on Android?']);
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p1, user1, 'Yes, full PWA support! 🚀']);
                          db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [p1, user2]);
                          db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [p1, user3]);
                        }
                      );

                      // Pixel Pioneer Post 2
                      db.run(`INSERT INTO posts (user_id, image_url, caption, location, filter_class) VALUES (?, ?, ?, ?, ?)`,
                        [user1, 'assets/post-1.png', 'Neon vibes. Tokyo streets aesthetic. 🌃✨ #cyberpunk #photography', 'Shinjuku, Tokyo', ''],
                        function(e) {
                          const p2 = this.lastID;
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p2, user2, 'Incredible shot! Love the magenta tones.']);
                          db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [p2, user4]);
                        }
                      );

                      // Alex Adventures Post
                      db.run(`INSERT INTO posts (user_id, image_url, caption, location, filter_class) VALUES (?, ?, ?, ?, ?)`,
                        [user2, 'assets/post-1.png', 'Walking through the neon rain in Shibuya. The city never sleeps. 🌧️🌌 #neon #tokyo #travel', 'Shibuya, Japan', ''],
                        function(e) {
                          const p3 = this.lastID;
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p3, user1, 'Stunning capture, Alex! Need to visit soon.']);
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p3, user3, 'This grading is insane!']);
                          db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [p3, user1]);
                        }
                      );

                      // Creative Soul Post
                      db.run(`INSERT INTO posts (user_id, image_url, caption, location, filter_class) VALUES (?, ?, ?, ?, ?)`,
                        [user3, 'assets/post-2.png', 'A clean desk is a productive desk. Starting the day with gratitude and high-focus coding. 🌿☕', 'Creative Workspace', ''],
                        function(e) {
                          const p4 = this.lastID;
                          db.run(`INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)`, [p4, user4, 'Cozy vibes are off the charts!']);
                          db.run(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [p4, user1]);
                        }
                      );

                      // 4. Insert Stories
                      db.run(`INSERT INTO stories (user_id, image_url) VALUES (?, ?)`, [user1, 'assets/story-1.png']);
                      db.run(`INSERT INTO stories (user_id, image_url) VALUES (?, ?)`, [user2, 'assets/post-1.png']);
                      db.run(`INSERT INTO stories (user_id, image_url) VALUES (?, ?)`, [user4, 'assets/story-1.png']);

                      // 5. Insert Chats / Messages
                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user2, user1, 'Hey there! Loved your latest post.']);
                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user1, user2, 'Thanks Alex! Appreciate the feedback. I am building a clone of Instagram!']);
                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user2, user1, 'Whoa, that sounds epic. Does it run dynamically?']);

                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user3, user1, 'Are you using vanilla JS for state management?']);
                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user1, user3, 'Yes! Pure state management modules.']);

                      db.run(`INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)`, [user4, user1, 'Check out this aesthetic!']);

                      // 6. Insert Notifications
                      db.run(`INSERT INTO notifications (user_id, type, from_username, text, image_url) VALUES (?, ?, ?, ?, ?)`, [user1, 'like', 'alex_adventures', 'liked your post.', 'assets/post-2.png']);
                      db.run(`INSERT INTO notifications (user_id, type, from_username, text, image_url) VALUES (?, ?, ?, ?, ?)`, [user1, 'comment', 'creative_soul', 'commented: "Looks clean! Super smooth..."', 'assets/post-2.png']);
                      db.run(`INSERT INTO notifications (user_id, type, from_username, text, image_url) VALUES (?, ?, ?, ?, ?)`, [user1, 'follow', 'neon_dreamer', 'started following you.', '']);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  });
});

// Configure Multer Storage for Uploaded Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Authenticate Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const { username, name, email, password, bio } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  const passHash = bcrypt.hashSync(password, 10);
  const defaultAvatar = 'assets/avatar-current.png';

  db.run(`INSERT INTO users (username, name, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)`,
    [username.toLowerCase().trim(), name || username, email.trim(), passHash, defaultAvatar, bio || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const userId = this.lastID;
      const token = jwt.sign({ id: userId, username: username.toLowerCase().trim() }, JWT_SECRET);
      res.json({ token, user: { id: userId, username, name, avatar: defaultAvatar, bio } });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Credentials and password required' });
  }

  const query = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.get(query, [usernameOrEmail.toLowerCase().trim(), usernameOrEmail.trim()], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) return res.status(400).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get("SELECT id, username, name, email, avatar, bio FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(user);
  });
});

// ----------------------------------------------------
// POSTS ENDPOINTS
// ----------------------------------------------------

app.get('/api/posts', authenticateToken, (req, res) => {
  const query = `
    SELECT posts.*, users.username, users.avatar,
           (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as likes_count,
           (SELECT EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?)) as user_liked
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;

  db.all(query, [req.user.id], (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });

    // Retrieve comments for each post
    let completed = 0;
    if (posts.length === 0) return res.json([]);

    posts.forEach(post => {
      db.all(`
        SELECT comments.*, users.username 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE post_id = ?
        ORDER BY comments.created_at ASC
      `, [post.id], (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        post.comments = comments.map(c => ({
          username: c.username,
          text: c.text,
          time: 'Just now' // simple placeholder or date parser
        }));
        
        post.id = String(post.id); // match frontend string structure
        post.likes = post.likes_count;
        post.liked = !!post.user_liked;
        post.likedBy = post.user_liked ? [req.user.username] : [];
        post.image = post.image_url;
        
        completed++;
        if (completed === posts.length) {
          res.json(posts);
        }
      });
    });
  });
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { caption, location, filterClass, imageBase64 } = req.body;
  let imageUrl = '';

  if (req.file) {
    imageUrl = 'uploads/' + req.file.filename;
  } else if (imageBase64) {
    // If base64, save to file
    try {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = 'upload-' + Date.now() + '.' + ext;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        imageUrl = 'uploads/' + filename;
      } else {
        imageUrl = imageBase64; // fallback to string
      }
    } catch (e) {
      imageUrl = imageBase64;
    }
  }

  if (!imageUrl) return res.status(400).json({ error: 'Post image is required' });

  db.run(`INSERT INTO posts (user_id, image_url, caption, location, filter_class) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, imageUrl, caption || '', location || '', filterClass || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: String(this.lastID), image: imageUrl, caption, location, filterClass });
    }
  );
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id;

  db.get("SELECT id FROM likes WHERE post_id = ? AND user_id = ?", [postId, userId], (err, like) => {
    if (err) return res.status(500).json({ error: err.message });

    if (like) {
      db.run("DELETE FROM likes WHERE id = ?", [like.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ liked: false });
      });
    } else {
      db.run("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ liked: true });
      });
    }
  });
});

app.post('/api/posts/:id/comment', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id;
  const { text } = req.body;

  if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is empty' });

  db.run("INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)", [postId, userId, text], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, username: req.user.username, text });
  });
});

// ----------------------------------------------------
// STORIES ENDPOINTS
// ----------------------------------------------------

app.get('/api/stories', authenticateToken, (req, res) => {
  const query = `
    SELECT stories.*, users.username, users.avatar 
    FROM stories
    JOIN users ON stories.user_id = users.id
    ORDER BY stories.created_at ASC
  `;
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Group stories by user
    const usersMap = {};
    rows.forEach(story => {
      if (!usersMap[story.username]) {
        usersMap[story.username] = {
          id: 'story-' + story.username,
          username: story.username === req.user.username ? 'Your Story' : story.username,
          avatar: story.avatar,
          viewed: false,
          items: []
        };
      }
      usersMap[story.username].items.push({
        type: 'image',
        url: story.image_url,
        duration: 5000
      });
    });

    res.json(Object.values(usersMap));
  });
});

app.post('/api/stories', authenticateToken, upload.single('image'), (req, res) => {
  let imageUrl = '';
  if (req.file) {
    imageUrl = 'uploads/' + req.file.filename;
  } else if (req.body.imageBase64) {
    try {
      const matches = req.body.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = 'story-' + Date.now() + '.' + ext;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        imageUrl = 'uploads/' + filename;
      }
    } catch (e) {}
  }

  if (!imageUrl) return res.status(400).json({ error: 'Story image is required' });

  db.run("INSERT INTO stories (user_id, image_url) VALUES (?, ?)", [req.user.id, imageUrl], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, image_url: imageUrl });
  });
});

// ----------------------------------------------------
// CHAT & MESSAGES ENDPOINTS
// ----------------------------------------------------

app.get('/api/chats', authenticateToken, (req, res) => {
  // Get all unique users the authenticated user has chatted with
  const query = `
    SELECT DISTINCT users.id, users.username, users.avatar
    FROM messages
    JOIN users ON (messages.sender_id = users.id OR messages.receiver_id = users.id)
    WHERE (messages.sender_id = ? OR messages.receiver_id = ?) AND users.id != ?
  `;

  db.all(query, [req.user.id, req.user.id, req.user.id], (err, chats) => {
    if (err) return res.status(500).json({ error: err.message });

    if (chats.length === 0) return res.json([]);

    let completed = 0;
    chats.forEach(chat => {
      // Find latest message for this chat
      db.get(`
        SELECT text, created_at FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC LIMIT 1
      `, [req.user.id, chat.id, chat.id, req.user.id], (err, msg) => {
        if (err) return res.status(500).json({ error: err.message });
        chat.id = 'chat-' + chat.username;
        chat.latestMessage = msg ? msg.text : '';
        chat.active = false;
        completed++;
        if (completed === chats.length) {
          res.json(chats);
        }
      });
    });
  });
});

app.get('/api/messages/:username', authenticateToken, (req, res) => {
  const targetUsername = req.params.username;
  
  db.get("SELECT id, username, avatar FROM users WHERE username = ?", [targetUsername], (err, targetUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const query = `
      SELECT messages.*, sender.username as sender_name
      FROM messages
      JOIN users sender ON messages.sender_id = sender.id
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY messages.created_at ASC
    `;

    db.all(query, [req.user.id, targetUser.id, targetUser.id, req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const chatHistory = rows.map(r => ({
        sender: r.sender_name,
        text: r.text,
        time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      res.json({
        id: 'chat-' + targetUser.username,
        username: targetUser.username,
        avatar: targetUser.avatar,
        chatHistory
      });
    });
  });
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { receiverUsername, text } = req.body;
  if (!receiverUsername || !text) return res.status(400).json({ error: 'Receiver username and text required' });

  db.get("SELECT id FROM users WHERE username = ?", [receiverUsername], (err, receiver) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!receiver) return res.status(404).json({ error: 'Receiver user not found' });

    db.run("INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)",
      [req.user.id, receiver.id, text],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, sender: req.user.username, text, time: 'Just now' });
      }
    );
  });
});

// ----------------------------------------------------
// PROFILE & SOCIAL ENDPOINTS
// ----------------------------------------------------

app.get('/api/users/:username', authenticateToken, (req, res) => {
  const targetUsername = req.params.username;

  db.get("SELECT id, username, name, avatar, bio FROM users WHERE username = ?", [targetUsername], (err, targetUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Fetch user posts
    db.all(`SELECT id, image_url, caption, location, filter_class, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC`, [targetUser.id], (err, posts) => {
      if (err) return res.status(500).json({ error: err.message });

      // Fetch followers count
      db.get(`SELECT COUNT(*) as count FROM follows WHERE following_id = ?`, [targetUser.id], (err, followers) => {
        if (err) return res.status(500).json({ error: err.message });

        // Fetch following count
        db.get(`SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`, [targetUser.id], (err, following) => {
          if (err) return res.status(500).json({ error: err.message });

          // Check if current user is following target user
          db.get(`SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?`, [req.user.id, targetUser.id], (err, isFollowing) => {
            if (err) return res.status(500).json({ error: err.message });

            const mappedPosts = posts.map(p => ({
              id: String(p.id),
              username: targetUser.username,
              avatar: targetUser.avatar,
              image: p.image_url,
              caption: p.caption,
              location: p.location,
              filterClass: p.filter_class,
              likes: 0, // simple mock
              comments: [], // simple mock
              timestamp: 'Just now'
            }));

            res.json({
              id: targetUser.id,
              username: targetUser.username,
              name: targetUser.name,
              avatar: targetUser.avatar,
              bio: targetUser.bio,
              postsCount: mappedPosts.length,
              followersCount: followers.count,
              followingCount: following.count,
              isFollowing: !!isFollowing,
              posts: mappedPosts
            });
          });
        });
      });
    });
  });
});

app.put('/api/users/profile', authenticateToken, upload.single('avatar'), (req, res) => {
  const { name, bio } = req.body;
  let avatarUrl = null;

  if (req.file) {
    avatarUrl = 'uploads/' + req.file.filename;
  }

  let updateQuery = "UPDATE users SET name = ?, bio = ?";
  let params = [name, bio];

  if (avatarUrl) {
    updateQuery += ", avatar = ?";
    params.push(avatarUrl);
  }

  updateQuery += " WHERE id = ?";
  params.push(req.user.id);

  db.run(updateQuery, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar: avatarUrl });
  });
});

app.post('/api/users/:username/follow', authenticateToken, (req, res) => {
  const targetUsername = req.params.username;

  db.get("SELECT id FROM users WHERE username = ?", [targetUsername], (err, targetUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    db.get("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?", [req.user.id, targetUser.id], (err, follow) => {
      if (err) return res.status(500).json({ error: err.message });

      if (follow) {
        db.run("DELETE FROM follows WHERE id = ?", [follow.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ following: false });
        });
      } else {
        db.run("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [req.user.id, targetUser.id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ following: true });
        });
      }
    });
  });
});

// ----------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// ----------------------------------------------------

app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const mapped = rows.map(r => ({
      id: r.id,
      type: r.type,
      username: r.from_username,
      text: r.text,
      time: 'Just now',
      image: r.image_url || null
    }));
    
    res.json(mapped);
  });
});

// ----------------------------------------------------
// SERVE CLIENT SPA
// ----------------------------------------------------

// Serve files from root directory (excluding database.sqlite and package.json)
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  // If request matches API routes or uploads folder, let it pass
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Instagram Clone Fullstack Server is active!`);
  console.log(`👉 Local:    http://localhost:${PORT}`);
  console.log(`==================================================`);
});
