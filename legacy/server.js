const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'nexus_startup_secret_7712', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// --- PASSPORT CONFIG --- //
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => done(err, user));
});

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'PLACEHOLDER',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'PLACEHOLDER',
    callbackURL: "/api/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    const githubId = `github_${profile.id}`;
    db.get('SELECT * FROM users WHERE username = ?', [githubId], (err, user) => {
        if (user) return done(err, user);
        db.run('INSERT INTO users (username, password_hash, github_username, avatar_url) VALUES (?, ?, ?, ?)',
            [githubId, 'oauth_user', profile.username, profile.photos[0].value],
            function(err2) {
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err3, newUser) => done(err3, newUser));
            });
    });
}));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER',
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    const googleId = `google_${profile.id}`;
    db.get('SELECT * FROM users WHERE username = ?', [googleId], (err, user) => {
        if (user) return done(err, user);
        db.run('INSERT INTO users (username, password_hash, avatar_url) VALUES (?, ?, ?)',
            [googleId, 'oauth_user', profile.photos[0].value],
            function(err2) {
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err3, newUser) => done(err3, newUser));
            });
    });
}));

// Route protection middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId || req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
};

// --- AUTH ROUTES --- //

// Redirect to Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login.html' }),
    (req, res) => res.redirect('/dashboard.html')
);

// Redirect to GitHub
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login.html' }),
    (req, res) => res.redirect('/dashboard.html')
);

// Check Auth Status (Updated for Passport)
app.get('/api/auth/status', (req, res) => {
    const user = req.user || (req.session.userId ? { username: req.session.username, id: req.session.userId } : null);
    if (user) {
        res.json({ authenticated: true, username: user.username, id: user.id });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        req.session.destroy();
        res.json({ message: 'Logged out successfully' });
    });
});

// --- ANALYTICS ENGINE --- //

// Track a view (Post or Profile)
app.post('/api/analytics/track', (req, res) => {
    const { type, target_id } = req.body;
    const viewer_id = req.sessionID; // Basic session-based tracking
    db.run('INSERT INTO analytics (type, target_id, viewer_id) VALUES (?, ?, ?)',
        [type, target_id, viewer_id],
        (err) => {
            if (err) return res.status(500).json({ error: 'Tracking failed' });
            res.json({ success: true });
        }
    );
});

// Get creator analytics
app.get('/api/analytics/summary', requireAuth, (req, res) => {
    const userId = req.user ? req.user.id : req.session.userId;
    const summaryQuery = `
        SELECT 
            (SELECT COUNT(*) FROM analytics WHERE type = 'profile_view' AND target_id = ?) as profile_views,
            (SELECT COUNT(*) FROM analytics a JOIN posts p ON a.target_id = p.id WHERE a.type = 'post_view' AND p.user_id = ?) as post_reach
    `;
    db.get(summaryQuery, [userId, userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Fetch failed' });
        res.json(row);
    });
});

// Get all posts (with interaction counts)
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        res.json(rows);
    });
});

// --- TRENDING & DISCOVERY --- //

// Weekly Hot Broadcasts
app.get('/api/trending/posts', (req, res) => {
    const query = `
        SELECT p.id, p.title, u.username,
        ((SELECT COUNT(*) FROM likes WHERE post_id = p.id) * 2 + 
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) * 5) as score
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.created_at >= date('now', '-7 days')
        ORDER BY score DESC LIMIT 5
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Trending fetch failed' });
        res.json(rows);
    });
});

// Top Developers
app.get('/api/trending/developers', (req, res) => {
    const query = `
        SELECT u.id, u.username, u.avatar_url,
        ((SELECT COUNT(*) FROM follows WHERE following_id = u.id) * 10 +
         (SELECT COUNT(*) FROM posts WHERE user_id = u.id) * 5) as reputation
        FROM users u
        ORDER BY reputation DESC LIMIT 5
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Top devs fetch failed' });
        res.json(rows);
    });
});

// Create a post
app.post('/api/posts', requireAuth, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    db.run('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
        [req.session.userId, title, content],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to create post' });
            res.status(201).json({ message: 'Post created successfully', postId: this.lastID });
        }
    );
});

// --- SOCIAL & PROFILE ROUTES --- //

// Get public profile
app.get('/api/users/:username', (req, res) => {
    const query = `
        SELECT username, bio, github_username, avatar_url, created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following
        FROM users WHERE username = ?
    `;
    db.get(query, [req.params.username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// Update Profile (including GitHub fetch)
app.put('/api/profile', requireAuth, (req, res) => {
    const { bio, github_username, avatar_url } = req.body;
    db.run('UPDATE users SET bio = ?, github_username = ?, avatar_url = ? WHERE id = ?',
        [bio, github_username, avatar_url, req.session.userId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Update failed' });
            res.json({ message: 'Profile updated' });
        }
    );
});

// Like/Unlike a post
app.post('/api/posts/:id/like', requireAuth, (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId;

    // Toggle logic: try to insert, if fails (already exists), delete
    db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId], function(err) {
        if (err) {
            db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err2) => {
                if (err2) return res.status(500).json({ error: 'Toggle like failed' });
                res.json({ liked: false });
            });
        } else {
            res.json({ liked: true });
        }
    });
});

// Follow/Unfollow a user
app.post('/api/users/:targetId/follow', requireAuth, (req, res) => {
    const targetId = req.params.targetId;
    const userId = req.session.userId;

    if (targetId == userId) return res.status(400).json({ error: 'Cannot follow yourself' });

    db.run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [userId, targetId], function(err) {
        if (err) {
            db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [userId, targetId], (err2) => {
                res.json({ following: false });
            });
        } else {
            res.json({ following: true });
        }
    });
});

// Add a comment
app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [req.params.id, req.session.userId, content],
        function(err) {
            if (err) return res.status(500).json({ error: 'Comment failed' });
            res.status(201).json({ message: 'Comment added' });
        }
    );
});

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
    const query = `
        SELECT c.*, u.username, u.avatar_url 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? 
        ORDER BY c.created_at ASC
    `;
    db.all(query, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Fetch failed' });
        res.json(rows);
    });
});

// --- CODE REVIEW ROUTES --- //

app.post('/api/snippets', requireAuth, (req, res) => {
    const { title, code, language } = req.body;
    db.run('INSERT INTO code_snippets (user_id, title, code, language) VALUES (?, ?, ?, ?)',
        [req.session.userId, title, code, language],
        function(err) {
            if (err) return res.status(500).json({ error: 'Snippet upload failed' });
            res.status(201).json({ message: 'Snippet uploaded', id: this.lastID });
        }
    );
});

app.get('/api/snippets', (req, res) => {
    db.all('SELECT s.*, u.username FROM code_snippets s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC', 
    [], (err, rows) => {
        res.json(rows);
    });
});
// --- FORGOT PASSWORD ROUTES --- //

// Get security question for a user
app.get('/api/forgot-password/question/:username', (req, res) => {
    const { username } = req.params;
    db.get('SELECT security_question FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json({ question: user.security_question });
    });
});

// Reset password via security answer
app.post('/api/forgot-password/reset', async (req, res) => {
    const { username, answer, newPassword } = req.body;

    if (!username || !answer || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.get('SELECT security_answer FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        // Compare answer (case-insensitive)
        if (user.security_answer !== answer.toLowerCase().trim()) {
            return res.status(401).json({ error: 'Answer is incorrect' });
        }

        try {
            const newHash = await bcrypt.hash(newPassword, 10);
            db.run('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, username], function (err) {
                if (err) return res.status(500).json({ error: 'Failed to update password' });
                res.json({ message: 'Password reset successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// --- ADMIN ROUTES --- //

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'adminnihal' && password === 'admin9122') {
        req.session.isAdmin = true;
        res.json({ message: 'Admin logged in successfully' });
    } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    res.json({ message: 'Admin logged out' });
});

// Get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
    const query = 'SELECT id, username, password_hash, created_at FROM users ORDER BY created_at DESC';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch users' });
        res.json(rows);
    });
});

// Get system stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    db.get('SELECT COUNT(*) as userCount FROM users', [], (err, uRow) => {
        if (err) return res.status(500).json({ error: 'Internal error' });
        db.get('SELECT COUNT(*) as postCount FROM posts', [], (err, pRow) => {
            if (err) return res.status(500).json({ error: 'Internal error' });
            res.json({ users: uRow.userCount, posts: pRow.postCount });
        });
    });
});

// Get all posts for management
app.get('/api/admin/posts', requireAdmin, (req, res) => {
    const query = `
        SELECT p.id, p.title, p.created_at, u.username 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch posts' });
        res.json(rows);
    });
});

// Delete a user and all their posts
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    // Note: SQLite doesn't always have FK cascade enabled by default unless configured.
    // We'll delete posts manually first to be safe.
    db.run('DELETE FROM posts WHERE user_id = ?', [userId], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete user posts' });

        db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to delete user' });
            res.json({ message: 'User and their posts deleted successfully' });
        });
    });
});

// Delete a specific post
app.delete('/api/admin/posts/:id', requireAdmin, (req, res) => {
    const postId = req.params.id;
    db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to delete post' });
        res.json({ message: 'Post deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
