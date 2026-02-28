// ==================== DATA SIMULATION ====================
let currentUser = null;          // { username, role, email, token (simulated) }
let games = [];
let users = [];
let downloadsLog = [];
let auditLog = [];

// Load from localStorage
function loadData() {
    try {
        users = JSON.parse(localStorage.getItem('vg_users')) || [];
        games = JSON.parse(localStorage.getItem('vg_games')) || [];
        downloadsLog = JSON.parse(localStorage.getItem('vg_downloads')) || [];
        auditLog = JSON.parse(localStorage.getItem('vg_audit')) || [];

        // Initialize default users if empty
        if (users.length === 0) {
            users.push(
                { id: '1', username: 'admin', password: 'admin123', email: 'admin@vibes.com', role: 'admin' },
                { id: '2', username: 'dev', password: 'dev123', email: 'dev@vibes.com', role: 'developer' },
                { id: '3', username: 'user', password: 'user123', email: 'user@vibes.com', role: 'user' }
            );
        }

        // Default games
        if (games.length === 0) {
            for (let i = 1; i <= 20; i++) {
                games.push({
                    id: i,
                    title: `Game ${i}`,
                    genre: i % 2 === 0 ? 'Action' : 'Puzzle',
                    description: 'Lorem ipsum dolor sit amet.',
                    downloads: Math.floor(Math.random() * 10000),
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    fileSize: (Math.random() * 2 + 0.5).toFixed(1) + ' GB',
                    image: `https://picsum.photos/200/200?random=${i}`,
                    developerId: '2',
                    approved: true,
                    featured: i < 5,
                    tags: ['multiplayer', 'offline'],
                    price: i % 3 === 0 ? 4.99 : 0,
                    apkName: `game${i}.apk`
                });
            }
        }
        saveData();
    } catch (e) { console.error(e); }
}

function saveData() {
    localStorage.setItem('vg_users', JSON.stringify(users));
    localStorage.setItem('vg_games', JSON.stringify(games));
    localStorage.setItem('vg_downloads', JSON.stringify(downloadsLog));
    localStorage.setItem('vg_audit', JSON.stringify(auditLog));
}

// ==================== ROUTING & VIEW RENDERING ====================
function renderView(view) {
    const main = document.getElementById('mainContent');
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    if (view === 'home') renderHome();
    else if (view === 'store') renderStore();
    else if (view === 'dashboard') renderDashboard();
}

// ==================== HOME ====================
function renderHome() {
    const featured = games.filter(g => g.featured).slice(0, 5);
    const trending = games.sort((a, b) => b.downloads - a.downloads).slice(0, 6);
    const recommended = getAIRecommendations();

    let html = `
        <section class="hero">
            <h1>Discover & Download</h1>
            <p>Thousands of games, AI‑powered recommendations.</p>
        </section>
        <section>
            <h2>Featured Games</h2>
            <div class="carousel" id="featuredCarousel">
                <div class="carousel-track" style="transform: translateX(0%);">
                    ${featured.map(g => `
                        <div class="carousel-slide">
                            <img src="${g.image}" onclick="openGameModal(${g.id})">
                        </div>
                    `).join('')}
                </div>
                <div class="carousel-buttons">
                    <button class="carousel-btn" onclick="moveCarousel(-1)">‹</button>
                    <button class="carousel-btn" onclick="moveCarousel(1)">›</button>
                </div>
            </div>
        </section>
        <section>
            <h2>Trending Now</h2>
            <div class="game-grid">
                ${trending.map(g => gameCard(g)).join('')}
            </div>
        </section>
        <section>
            <h2>AI Recommended for You</h2>
            <div class="game-grid">
                ${recommended.map(g => gameCard(g)).join('')}
            </div>
        </section>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

let carouselIndex = 0;
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide').length;
    carouselIndex = (carouselIndex + direction + slides) % slides;
    track.style.transform = `translateX(-${carouselIndex * 80}%)`;
}

function getAIRecommendations() {
    // Simulate AI based on category clicks (if any) – fallback to random
    return games.filter(g => g.rating > 4).sort(() => 0.5 - Math.random()).slice(0, 4);
}

// ==================== STORE ====================
let currentFilter = { genre: 'all', sort: 'downloads', search: '' };
let visibleGames = 12;

function renderStore() {
    let filtered = games.filter(g => g.approved);
    if (currentFilter.genre !== 'all') filtered = filtered.filter(g => g.genre === currentFilter.genre);
    if (currentFilter.search) {
        filtered = filtered.filter(g => g.title.toLowerCase().includes(currentFilter.search.toLowerCase()));
    }
    if (currentFilter.sort === 'downloads') filtered.sort((a,b) => b.downloads - a.downloads);
    else if (currentFilter.sort === 'rating') filtered.sort((a,b) => b.rating - a.rating);
    else if (currentFilter.sort === 'newest') filtered.sort((a,b) => b.id - a.id);

    const visible = filtered.slice(0, visibleGames);

    let html = `
        <div class="store-header">
            <input type="text" id="storeSearch" placeholder="Search games..." value="${currentFilter.search}">
            <select id="genreFilter">
                <option value="all">All Genres</option>
                <option value="Action">Action</option>
                <option value="Puzzle">Puzzle</option>
            </select>
            <select id="sortFilter">
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
            </select>
        </div>
        <div class="game-grid" id="gameGrid">
            ${visible.map(g => gameCard(g)).join('')}
        </div>
        ${visibleGames < filtered.length ? '<button id="loadMore">Load More</button>' : ''}
    `;
    document.getElementById('mainContent').innerHTML = html;

    document.getElementById('storeSearch')?.addEventListener('input', e => {
        currentFilter.search = e.target.value;
        renderStore();
    });
    document.getElementById('genreFilter')?.addEventListener('change', e => {
        currentFilter.genre = e.target.value;
        renderStore();
    });
    document.getElementById('sortFilter')?.addEventListener('change', e => {
        currentFilter.sort = e.target.value;
        renderStore();
    });
    document.getElementById('loadMore')?.addEventListener('click', () => {
        visibleGames += 12;
        renderStore();
    });
}

function gameCard(g) {
    return `
        <div class="game-card" onclick="openGameModal(${g.id})">
            <img src="${g.image}" loading="lazy">
            <div class="game-info">
                <div class="game-title">${g.title}</div>
                <div class="game-meta">
                    <span>⭐ ${g.rating}</span>
                    <span><i class="fas fa-download"></i> ${g.downloads}</span>
                </div>
            </div>
        </div>
    `;
}

// ==================== GAME MODAL ====================
function openGameModal(id) {
    const game = games.find(g => g.id === id);
    if (!game) return;
    const dev = users.find(u => u.id === game.developerId);
    const html = `
        <h2>${game.title}</h2>
        <img src="${game.image}" style="width:100%; border-radius:1rem;">
        <p>${game.description}</p>
        <div class="game-detail-meta">
            <span>⭐ ${game.rating}</span>
            <span><i class="fas fa-download"></i> ${game.downloads}</span>
            <span>📦 ${game.fileSize}</span>
        </div>
        <p><strong>Developer:</strong> ${dev ? dev.username : 'Unknown'}</p>
        <p><strong>Genre:</strong> ${game.genre}</p>
        <p><strong>Tags:</strong> ${game.tags.join(', ')}</p>
        <button onclick="downloadGame(${game.id})">Download APK</button>
        <button onclick="reportGame(${game.id})">Report</button>
    `;
    document.getElementById('gameDetailContent').innerHTML = html;
    document.getElementById('gameModal').style.display = 'flex';
}

function downloadGame(id) {
    const game = games.find(g => g.id === id);
    if (game) {
        game.downloads++;
        downloadsLog.push({ gameId: id, userId: currentUser?.id || 'guest', timestamp: new Date().toISOString() });
        saveData();
        alert(`Downloading ${game.title} (simulated). Actual file: ${game.apkName}`);
        // Simulate AI malware scan
        if (game.title.toLowerCase().includes('virus')) {
            alert('⚠️ AI Malware Detection: This file may be unsafe!');
        }
    }
    closeModal();
}

function reportGame(id) {
    auditLog.push({ action: 'report', target: id, user: currentUser?.username, time: new Date().toISOString() });
    saveData();
    alert('Game reported. Admin will review.');
}

// ==================== DASHBOARD ====================
function renderDashboard() {
    if (!currentUser) {
        alert('Please login first');
        return;
    }

    if (currentUser.role === 'admin') return renderAdminPanel();
    if (currentUser.role === 'developer') return renderDeveloperPanel();

    // User dashboard
    const userDownloads = downloadsLog.filter(d => d.userId === currentUser.id);
    const favoriteGames = games.filter(g => userDownloads.some(d => d.gameId === g.id)); // mock favorites

    let html = `
        <h2>Welcome, ${currentUser.username}</h2>
        <div class="dashboard-tabs">
            <button class="tab-btn active" data-tab="profile">Profile</button>
            <button class="tab-btn" data-tab="downloads">Downloads</button>
            <button class="tab-btn" data-tab="favorites">Favorites</button>
            <button class="tab-btn" data-tab="wishlist">Wishlist</button>
        </div>
        <div id="dashboardContent">
            <!-- profile -->
            <div class="tab-pane active">
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Role:</strong> ${currentUser.role}</p>
                <label><input type="checkbox" id="2faToggle"> Enable 2FA (simulated)</label>
                <button onclick="logout()">Logout</button>
            </div>
            <div class="tab-pane hidden">
                <h3>Download History</h3>
                <ul>${userDownloads.map(d => `<li>Game ID: ${d.gameId} at ${new Date(d.timestamp).toLocaleString()}</li>`).join('')}</ul>
            </div>
            <div class="tab-pane hidden">
                <h3>Favorites</h3>
                <div class="game-grid">${favoriteGames.map(g => gameCard(g)).join('')}</div>
            </div>
            <div class="tab-pane hidden">
                <h3>Wishlist (simulated)</h3>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
            e.target.classList.add('active');
            const idx = Array.from(document.querySelectorAll('.tab-btn')).indexOf(e.target);
            document.querySelectorAll('.tab-pane')[idx].classList.remove('hidden');
        });
    });
}

function renderDeveloperPanel() {
    const myGames = games.filter(g => g.developerId === currentUser.id);
    const totalDownloads = myGames.reduce((acc, g) => acc + g.downloads, 0);
    const revenue = totalDownloads * 0.3; // 30% platform fee, rest to dev

    let html = `
        <h2>Developer Dashboard</h2>
        <div class="stats-grid">
            <div class="stat-card">Total Downloads: ${totalDownloads}</div>
            <div class="stat-card">Estimated Revenue: $${revenue.toFixed(2)}</div>
            <div class="stat-card">Platform Fee (30%): $${(totalDownloads * 0.7).toFixed(2)}</div>
        </div>
        <button onclick="showUploadModal()">Upload New APK</button>
        <h3>Your Games</h3>
        <div class="game-grid">${myGames.map(g => gameCard(g)).join('')}</div>
        <button onclick="requestWithdrawal()">Request Withdrawal</button>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function showUploadModal() {
    const html = `
        <h3>Upload APK</h3>
        <form id="uploadForm">
            <input type="text" id="gameTitle" placeholder="Game Title" required>
            <input type="text" id="gameVersion" placeholder="Version" required>
            <select id="gameGenre">
                <option>Action</option><option>Puzzle</option>
            </select>
            <textarea id="gameDesc" placeholder="Description"></textarea>
            <input type="file" id="apkFile" accept=".apk" required>
            <button type="submit">Upload</button>
        </form>
    `;
    showModal(html, 'uploadModal');
    document.getElementById('uploadForm').addEventListener('submit', e => {
        e.preventDefault();
        const file = document.getElementById('apkFile').files[0];
        if (!file) return alert('Select APK');
        if (file.size > 100 * 1024 * 1024) return alert('File too large (max 100MB)');
        // Simulate virus scan
        if (file.name.includes('virus')) {
            alert('⚠️ AI Malware Detection: Potential threat! Upload blocked.');
            return;
        }
        const newGame = {
            id: games.length + 1,
            title: document.getElementById('gameTitle').value,
            genre: document.getElementById('gameGenre').value,
            description: document.getElementById('gameDesc').value,
            downloads: 0,
            rating: 0,
            fileSize: (file.size / (1024*1024)).toFixed(1) + ' MB',
            image: 'https://picsum.photos/200/200?random=' + Date.now(),
            developerId: currentUser.id,
            approved: false,
            featured: false,
            tags: [],
            price: 0,
            apkName: file.name
        };
        games.push(newGame);
        saveData();
        alert('Game uploaded. Waiting for admin approval.');
        closeModal();
        renderDeveloperPanel();
    });
}

function requestWithdrawal() {
    alert('Withdrawal request submitted (simulated).');
}

// ==================== ADMIN PANEL ====================
function renderAdminPanel() {
    const pendingGames = games.filter(g => !g.approved);
    const reportedGames = auditLog.filter(l => l.action === 'report').map(l => l.target);

    let html = `
        <h2>Admin Panel</h2>
        <div class="stats-grid">
            <div class="stat-card">Users: ${users.length}</div>
            <div class="stat-card">Games: ${games.length}</div>
            <div class="stat-card">Downloads: ${downloadsLog.length}</div>
        </div>
        <h3>Pending Approval</h3>
        <ul>${pendingGames.map(g => `<li>${g.title} <button onclick="approveGame(${g.id})">Approve</button> <button onclick="rejectGame(${g.id})">Reject</button></li>`).join('')}</ul>
        <h3>Reported Games</h3>
        <ul>${reportedGames.map(id => `<li>Game ID: ${id}</li>`).join('')}</ul>
        <h3>Audit Log</h3>
        <ul>${auditLog.slice(-10).map(l => `<li>${l.action} on ${l.target} by ${l.user} at ${l.time}</li>`).join('')}</ul>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function approveGame(id) {
    const game = games.find(g => g.id === id);
    if (game) {
        game.approved = true;
        saveData();
        renderAdminPanel();
        alert('Game approved.');
    }
}

function rejectGame(id) {
    games = games.filter(g => g.id !== id);
    saveData();
    renderAdminPanel();
    alert('Game rejected.');
}

// ==================== AUTH ====================
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const pass = document.getElementById('loginPassword').value;
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
        currentUser = { ...user, token: btoa(username + ':' + pass) }; // simulated JWT
        localStorage.setItem('vg_token', currentUser.token);
        closeModal();
        renderView('home');
        document.getElementById('loginBtn').innerHTML = '<i class="fas fa-user"></i><span>Account</span>';
    } else {
        alert('Invalid credentials');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    if (users.find(u => u.username === username)) {
        alert('Username taken');
        return;
    }
    const newUser = {
        id: (users.length + 1).toString(),
        username, email, password: pass, role
    };
    users.push(newUser);
    saveData();
    alert('Registered. Please login.');
    closeModal();
    document.getElementById('loginModal').style.display = 'flex';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('vg_token');
    location.reload();
}

// ==================== CHAT BOT ====================
const botResponses = [
    "I'm Vibes AI, how can I help?",
    "Try searching for 'action' games.",
    "We have thousands of free games.",
    "You can upload your own game as a developer.",
    "Our AI recommends based on your downloads."
];

function initChat() {
    document.getElementById('chatToggle').addEventListener('click', () => {
        document.getElementById('chatBot').classList.toggle('hidden');
    });
    document.getElementById('chatInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            const msg = e.target.value;
            const chat = document.getElementById('chatMessages');
            chat.innerHTML += `<div class="chat-message user">You: ${msg}</div>`;
            setTimeout(() => {
                const reply = botResponses[Math.floor(Math.random() * botResponses.length)];
                chat.innerHTML += `<div class="chat-message bot">AI: ${reply}</div>`;
                chat.scrollTop = chat.scrollHeight;
            }, 500);
            e.target.value = '';
        }
    });
}

// ==================== MODAL HELPERS ====================
function showModal(content, id) {
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `<div class="modal-content"><span class="close" onclick="closeModal('${id}')">&times;</span>${content}</div>`;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-content').innerHTML = `<span class="close" onclick="closeModal('${id}')">&times;</span>${content}`;
    }
    modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id) || document.querySelector('.modal[style*="flex"]');
    if (modal) modal.style.display = 'none';
}

// ==================== THEME ====================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// ==================== INIT ====================
window.onload = () => {
    loadData();

    // Check for saved token
    const token = localStorage.getItem('vg_token');
    if (token) {
        // decode simple (simulated)
        const parts = atob(token).split(':');
        const user = users.find(u => u.username === parts[0] && u.password === parts[1]);
        if (user) currentUser = user;
    }

    // Set login button text
    if (currentUser) {
        document.getElementById('loginBtn').innerHTML = '<i class="fas fa-user"></i><span>Account</span>';
    }

    // Event listeners
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', e => renderView(e.target.closest('.nav-btn').dataset.view));
    });
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('loginBtn').addEventListener('click', () => {
        if (currentUser) {
            renderView('dashboard');
        } else {
            document.getElementById('loginModal').style.display = 'flex';
        }
    });
    document.getElementById('showRegister').addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'flex';
    });

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Close modals on X click
    document.querySelectorAll('.close').forEach(el => {
        el.addEventListener('click', e => closeModal(e.target.closest('.modal').id));
    });

    // Initial view
    renderView('home');

    // Chat bot
    initChat();

    // Simulate PWA service worker registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.log);
    }
};
