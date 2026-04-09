// Admin Dashboard Logic

async function fetchAdminData() {
    try {
        // Fetch stats
        const statsRes = await fetch('/api/admin/stats');
        
        if (statsRes.status === 401 || statsRes.status === 403) {
            window.location.href = 'admin-login.html';
            return;
        }

        const stats = await statsRes.json();
        document.getElementById('stat-users').innerText = stats.users || 0;
        document.getElementById('stat-posts').innerText = stats.posts || 0;

        // Fetch users
        const usersRes = await fetch('/api/admin/users');
        const users = await usersRes.json();
        const userTbody = document.getElementById('users-table-body');
        userTbody.innerHTML = ''; 

        if (users.length === 0) {
            userTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No users found.</td></tr>';
        } else {
            users.forEach(user => {
                const date = new Date(user.created_at).toLocaleString('en-US');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${user.id}</strong></td>
                    <td style="color: white; font-weight: 600;">@${user.username}</td>
                    <td style="color: var(--text-muted);">${date}</td>
                    <td><span class="hash-text">${user.password_hash}</span></td>
                    <td><button class="delete-btn" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button></td>
                `;
                userTbody.appendChild(tr);
            });
        }

        // Fetch posts
        const postsRes = await fetch('/api/admin/posts');
        const posts = await postsRes.json();
        const postTbody = document.getElementById('posts-table-body');
        postTbody.innerHTML = '';

        if (posts.length === 0) {
            postTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No posts found.</td></tr>';
        } else {
            posts.forEach(post => {
                const date = new Date(post.created_at).toLocaleString('en-US');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${post.id}</strong></td>
                    <td style="color: var(--primary);">@${post.username}</td>
                    <td style="color: white; font-weight: 600;">${post.title}</td>
                    <td style="color: var(--text-muted);">${date}</td>
                    <td><button class="delete-btn" onclick="deletePost(${post.id})">Delete</button></td>
                `;
                postTbody.appendChild(tr);
            });
        }

    } catch (e) {
        console.error('Failed to load admin data', e);
        alert(`Error loading admin data: ${e.message}\nCheck if the server is running at http://10.125.52.246:3000`);
    }
}

async function deleteUser(id, username) {
    if (!confirm(`WARNING: Are you sure you want to delete user @${username}? This will also delete all of their blog posts permanently.`)) return;

    try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchAdminData(); // Refresh
        } else {
            const data = await res.json();
            alert(`Delete failed: ${data.error || res.statusText}`);
        }
    } catch (err) {
        console.error('Deletion error:', err);
        alert(`Connection error during deletion: ${err.message}`);
    }
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
        const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchAdminData(); // Refresh
        } else {
            const data = await res.json();
            alert(`Delete failed: ${data.error || res.statusText}`);
        }
    } catch (err) {
        console.error('Deletion error:', err);
        alert(`Connection error during deletion: ${err.message}`);
    }
}

async function logoutAdmin() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = 'admin-login.html';
    } catch (e) {
        console.error('Logout failed', e);
        alert('Failed to logout');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAdminData();
});
