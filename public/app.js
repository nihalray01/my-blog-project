// Helper to display alerts securely
function showAlert(message) {
    alert(message);
}

// Authentication Check
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        updateNavUI(data.authenticated, data.username);
        return data.authenticated;
    } catch (e) {
        console.error('Auth check failed:', e);
        return false;
    }
}

// Update Navigation based on Auth
function updateNavUI(isAuthenticated, username = '') {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (isAuthenticated) {
        navLinks.innerHTML = `
            <span style="color: var(--text-muted); font-weight: 600;">Welcome, <span style="color: var(--primary);">${username}</span></span>
            <a href="new-post.html" class="btn primary-btn" style="padding: 0.4rem 1rem;">Write</a>
            <button onclick="logout()" class="btn secondary-btn" style="padding: 0.4rem 1rem;">Logout</button>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="login.html" class="nav-btn">Log in</a>
            <a href="register.html" class="btn primary-btn" style="padding: 0.4rem 1rem;">Sign up</a>
        `;
    }
}

// Form Handlers
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                showAlert(result.error);
            }
        } catch (err) {
            showAlert('Login failed. Try again.');
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (res.ok) {
                showAlert('Registration successful! Please log in.');
                window.location.href = 'login.html';
            } else {
                showAlert(result.error);
            }
        } catch (err) {
            showAlert('Registration failed.');
        }
    });
}

const newPostForm = document.getElementById('new-post-form');
if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                const result = await res.json();
                showAlert(result.error || 'Failed to create post');
            }
        } catch (err) {
            showAlert('Failed to create post. Try again.');
        }
    });
}

// Fetch and display posts
async function fetchPosts() {
    checkAuthStatus(); // Update nav first

    const container = document.getElementById('posts-container');
    if (!container) return; // Only run on pages with this container

    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();

        container.innerHTML = ''; // Clear loading

        if (posts.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No stories yet. Be the first to write one!</p>`;
            return;
        }

        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
            
            // Basic XSS protection for display
            const safeTitle = post.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeContent = post.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');

            const el = document.createElement('article');
            el.className = 'post-card';
            el.innerHTML = `
                <div class="post-meta">
                    <span class="post-author">@${post.username}</span>
                    <span class="post-date">${date}</span>
                </div>
                <h2 class="post-title">${safeTitle}</h2>
                <div class="post-content">${safeContent}</div>
            `;
            container.appendChild(el);
        });
    } catch (e) {
        console.error('Failed to fetch posts', e);
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent);">Failed to load latest stories.</p>`;
    }
}

// Global Logout function
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (e) {
        console.error('Logout failed', e);
    }
}
