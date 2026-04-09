// --- HELPER UTILS --- //
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check Auth Status & Return User Data
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        updateNavUI(data.authenticated, data.username);
        return data;
    } catch (e) { return { authenticated: false }; }
}

function updateNavUI(isAuthenticated, username = '') {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (isAuthenticated) {
        navLinks.innerHTML = `
            <a href="index.html">Feed</a>
            <a href="review.html">Reviews</a>
            <a href="dashboard.html" class="nav-user">@${username}</a>
            <a href="new-post.html" class="btn primary-btn">Write</a>
            <button onclick="logout()" class="btn secondary-btn" style="padding: 0.4rem 0.8rem;">Exit</button>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html" class="btn primary-btn">Join Now</a>
        `;
    }
}

// --- FEED & POSTS --- //

async function fetchPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        container.innerHTML = '';

        posts.forEach(post => {
            const date = new Date(post.created_at).toLocaleDateString();
            const el = document.createElement('article');
            el.className = 'post-card';
            el.innerHTML = `
                <div class="post-meta">
                    <span class="post-author" onclick="location.href='dashboard.html?user=${post.username}'">@${post.username}</span>
                    <span class="post-date">${date}</span>
                </div>
                <h2 class="post-title">${escapeHtml(post.title)}</h2>
                <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
                <div class="post-actions" style="margin-top: 1.5rem; display: flex; gap: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                    <button onclick="handleLike(${post.id}, this)" class="btn-icon">❤️ <span class="count">${post.likes}</span></button>
                    <button onclick="location.href='post.html?id=${post.id}'" class="btn-icon">💬 <span class="count">${post.comments}</span></button>
                </div>
            `;
            container.appendChild(el);
        });
    } catch (e) { console.error(e); }
}

async function handleLike(postId, btn) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    const data = await res.json();
    const countEl = btn.querySelector('.count');
    let currentCount = parseInt(countEl.textContent);
    countEl.textContent = data.liked ? currentCount + 1 : currentCount - 1;
}

// --- TRENDING SIDEBAR --- //

async function fetchTrending() {
    // Trending Posts
    const postRes = await fetch('/api/trending/posts');
    const posts = await postRes.json();
    const postContainer = document.getElementById('trending-posts');
    if (postContainer) {
        postContainer.innerHTML = posts.map((p, i) => `
            <div class="trending-item">
                <span class="rank">0${i+1}</span>
                <div>
                    <div class="title">${escapeHtml(p.title)}</div>
                    <div class="meta">by @${p.username}</div>
                </div>
            </div>
        `).join('');
    }

    // Top Developers
    const devRes = await fetch('/api/trending/developers');
    const devs = await devRes.json();
    const devContainer = document.getElementById('top-devs');
    if (devContainer) {
        devContainer.innerHTML = devs.map(d => `
            <div class="trending-item">
                <img src="${d.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + d.username}" class="avatar-sm" style="width: 32px; height: 32px; border-radius: 50%;">
                <div>
                    <div class="title">@${d.username}</div>
                    <div class="meta">${d.reputation} Karma</div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchPosts();
    fetchTrending();
});

// Auth form logic unchanged... (Omitted for brevity but kept in original)
async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = 'index.html';
}

// Restoring Form Handlers
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) window.location.href = 'index.html';
        else alert('Login failed');
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) window.location.href = 'login.html';
        else alert('Registration failed');
    });
}

const newPostForm = document.getElementById('new-post-form');
if (newPostForm) {
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        if (res.ok) window.location.href = 'index.html';
    });
}

