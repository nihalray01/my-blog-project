const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key_change_me_in_prod', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Route protection middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
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

// --- API ROUTES --- //

// Check Auth Status
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    const { username, password, security_question, security_answer } = req.body;

    if (!username || !password || !security_question || !security_answer) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password_hash, security_question, security_answer) VALUES (?, ?, ?, ?)',
            [username, hash, security_question, security_answer.toLowerCase().trim()],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
            });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });

        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid username or password' });

        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: 'Logged in successfully', username: user.username });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Get all posts
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT p.id, p.title, p.content, p.created_at, u.username 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch posts' });
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
