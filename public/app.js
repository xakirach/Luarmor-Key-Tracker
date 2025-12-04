import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ============================================
// FIREBASE CONFIG - GANTI INI!
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDZKzFPE-LILaEn87xj2wiselQdHVSbHx8",
  authDomain: "luarmor-key-tracker.firebaseapp.com",
  databaseURL: "https://luarmor-key-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "luarmor-key-tracker",
  storageBucket: "luarmor-key-tracker.firebasestorage.app",
  messagingSenderId: "599709658280",
  appId: "1:599709658280:web:04ceaf9aa647b91922a69d",
  measurementId: "G-WZ2Q2EH6ET"
};

// ============================================
// INITIALIZE
// ============================================
let app, db, isFirebaseReady = false;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    isFirebaseReady = true;
    console.log('✅ Firebase connected');
    updateStatusBadge(true);
} catch (error) {
    console.error('❌ Firebase failed:', error);
    updateStatusBadge(false);
}

setTimeout(() => document.getElementById('loadingOverlay').classList.add('hidden'), 500);

// ============================================
// STATE
// ============================================
let selectedDuration = 24;
let keys = [];
let accounts = [];
let currentFilter = 'all';

// ============================================
// FIREBASE FUNCTIONS
// ============================================
async function saveAccounts() {
    if (isFirebaseReady) {
        try {
            await set(ref(db, 'accounts'), accounts);
        } catch (e) {
            localStorage.setItem('accounts', JSON.stringify(accounts));
        }
    } else {
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
}

async function saveKey(keyData) {
    if (isFirebaseReady) {
        try {
            await set(ref(db, `keys/${keyData.id}`), keyData);
        } catch (e) {
            localStorage.setItem(`key:${keyData.id}`, JSON.stringify(keyData));
        }
    } else {
        localStorage.setItem(`key:${keyData.id}`, JSON.stringify(keyData));
    }
}

async function deleteKey(keyId) {
    if (isFirebaseReady) {
        try {
            await remove(ref(db, `keys/${keyId}`));
        } catch (e) {
            localStorage.removeItem(`key:${keyId}`);
        }
    } else {
        localStorage.removeItem(`key:${keyId}`);
    }
}

async function loadData() {
    if (isFirebaseReady) {
        try {
            const accountsSnap = await get(ref(db, 'accounts'));
            if (accountsSnap.exists()) accounts = accountsSnap.val() || [];
            
            const keysSnap = await get(ref(db, 'keys'));
            if (keysSnap.exists()) {
                const keysObj = keysSnap.val();
                keys = Object.values(keysObj);
            }
        } catch (e) {
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const raw = localStorage.getItem('accounts');
    if (raw) {
        try { accounts = JSON.parse(raw) || []; } catch (e) { accounts = []; }
    }
    
    keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('key:')) {
            try {
                const parsed = JSON.parse(localStorage.getItem(key));
                if (parsed) keys.push(parsed);
            } catch (e) {}
        }
    }
}

function updateStatusBadge(online) {
    const badge = document.getElementById('statusBadge');
    badge.textContent = online ? 'Online' : 'Offline';
    badge.className = `status-badge ${online ? 'online' : 'offline'}`;
}

// ============================================
// ACCOUNT MANAGEMENT
// ============================================
function addAccount() {
    const input = document.getElementById('accountInput');
    const name = input.value.trim();
    
    if (!name) return alert('Nama akun ga boleh kosong!');
    if (accounts.includes(name)) return alert('Akun udah ada!');
    
    accounts.push(name);
    saveAccounts();
    input.value = '';
    renderAccounts();
    renderAccountSelect();
    renderFilterBar();
}

function deleteAccount(name) {
    if (!confirm(`Hapus akun "${name}"?`)) return;
    
    accounts = accounts.filter(a => a !== name);
    saveAccounts();
    
    const toRemove = keys.filter(k => k.account === name);
    keys = keys.filter(k => k.account !== name);
    toRemove.forEach(k => deleteKey(k.id));
    
    renderAll();
}

function renderAccounts() {
    const container = document.getElementById('accountList');
    container.innerHTML = '';
    
    if (accounts.length === 0) {
        const small = document.createElement('small');
        small.textContent = 'Belum ada akun. Tambah akun pertama lo!';
        container.appendChild(small);
        return;
    }
    
    accounts.forEach(account => {
        const tag = document.createElement('div');
        tag.className = 'account-tag';
        tag.innerHTML = `<span>${account}</span><button>×</button>`;
        tag.querySelector('button').onclick = () => deleteAccount(account);
        container.appendChild(tag);
    });
}

function renderAccountSelect() {
    const select = document.getElementById('accountSelect');
    const prev = select.value;
    select.innerHTML = '<option value="">-- Pilih Akun --</option>';
    
    accounts.forEach(a => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = a;
        select.appendChild(opt);
    });
    
    if (accounts.includes(prev)) select.value = prev;
}

function renderFilterBar() {
    const container = document.getElementById('filterBar');
    container.innerHTML = '';
    
    const btnAll = document.createElement('button');
    btnAll.className = 'filter-btn' + (currentFilter === 'all' ? ' active' : '');
    btnAll.textContent = 'Semua';
    btnAll.onclick = () => setFilter('all');
    container.appendChild(btnAll);
    
    accounts.forEach(acc => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (currentFilter === acc ? ' active' : '');
        btn.textContent = acc;
        btn.onclick = () => setFilter(acc);
        container.appendChild(btn);
    });
}

function setFilter(filter) {
    currentFilter = filter;
    renderFilterBar();
    renderKeys();
}

// ============================================
// KEY MANAGEMENT
// ============================================
function addKey() {
    const accountSelect = document.getElementById('accountSelect');
    const keyInput = document.getElementById('keyInput');
    const account = accountSelect.value;
    const keyName = keyInput.value.trim();
    
    if (!account) return alert('Pilih akun dulu!');
    if (!keyName) return alert('Key ga boleh kosong!');
    
    const now = new Date();
    let expireTime, duration;
    
    if (selectedDuration === 'custom') {
        const h = parseFloat(document.getElementById('customHours').value) || 0;
        const m = parseFloat(document.getElementById('customMinutes').value) || 0;
        
        if (h === 0 && m === 0) return alert('Isi jam atau menit!');
        
        const totalMin = (h * 60) + m;
        expireTime = new Date(now.getTime() + (totalMin * 60 * 1000));
        duration = h + (m / 60);
    } else {
        expireTime = new Date(now.getTime() + (selectedDuration * 60 * 60 * 1000));
        duration = selectedDuration;
    }
    
    const newKey = {
        id: Date.now(),
        account,
        name: keyName,
        createdAt: now.toISOString(),
        expiresAt: expireTime.toISOString(),
        duration
    };
    
    keys.push(newKey);
    saveKey(newKey);
    keyInput.value = '';
    document.getElementById('customHours').value = '';
    document.getElementById('customMinutes').value = '';
    renderKeys();
}

function deleteKeyById(keyId) {
    if (!confirm('Yakin mau hapus key ini?')) return;
    
    keys = keys.filter(k => k.id !== keyId);
    deleteKey(keyId);
    renderKeys();
}

function deleteExpiredKeys() {
    const now = new Date();
    const expired = keys.filter(k => new Date(k.expiresAt) <= now);
    
    if (expired.length === 0) return alert('Ga ada key yang expired!');
    if (!confirm(`Hapus ${expired.length} key yang expired?`)) return;
    
    expired.forEach(k => deleteKey(k.id));
    keys = keys.filter(k => new Date(k.expiresAt) > now);
    renderKeys();
}

function clearAll() {
    if (!confirm('Clear ALL keys dan akun? Ini permanen!')) return;
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('key:')) localStorage.removeItem(key);
    }
    localStorage.removeItem('accounts');
    
    keys = [];
    accounts = [];
    renderAll();
}

function calculateTimeLeft(expiresAt) {
    const now = new Date();
    const expire = new Date(expiresAt);
    const diff = expire - now;
    
    if (diff <= 0) return { expired: true, display: 'EXPIRED' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const expiringSoon = diff < (3 * 60 * 60 * 1000);
    
    return {
        expired: false,
        expiringSoon,
        display: `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
    };
}

function renderKeys() {
    const container = document.getElementById('keysList');
    container.innerHTML = '';
    
    let filtered = keys.slice();
    if (currentFilter !== 'all') filtered = filtered.filter(k => k.account === currentFilter);
    filtered.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
    
    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<h2>Belum ada key</h2><p>${currentFilter === 'all' ? 'Tambah key pertama lo!' : `Belum ada key untuk "${currentFilter}"`}</p>`;
        container.appendChild(empty);
        return;
    }
    
    filtered.forEach(key => {
        const t = calculateTimeLeft(key.expiresAt);
        
        const card = document.createElement('div');
        card.className = 'key-card' + (t.expired ? ' expired' : t.expiringSoon ? ' expiring-soon' : '');
        
        const expires = new Date(key.expiresAt).toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        card.innerHTML = `
            <div class="key-info-left">
                <div class="key-account">${key.account}</div>
                <div class="key-name">${key.name}</div>
                <div class="key-dates">Expired: ${expires}</div>
            </div>
            <div class="timer-display${t.expired ? ' expired' : t.expiringSoon ? ' expiring-soon' : ''}" id="timer-${key.id}">${t.display}</div>
            <button class="delete-btn">Hapus</button>
        `;
        
        card.querySelector('button').onclick = () => deleteKeyById(key.id);
        container.appendChild(card);
    });
}

function updateTimers() {
    keys.forEach(key => {
        const el = document.getElementById(`timer-${key.id}`);
        if (!el) return;
        
        const t = calculateTimeLeft(key.expiresAt);
        el.textContent = t.display;
        el.className = 'timer-display' + (t.expired ? ' expired' : t.expiringSoon ? ' expiring-soon' : '');
    });
}

function renderAll() {
    renderAccounts();
    renderAccountSelect();
    renderFilterBar();
    renderKeys();
}

// ============================================
// EXPORT / IMPORT
// ============================================
function exportJSON() {
    const data = { accounts, keys };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'key-timer-backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data.accounts)) accounts = data.accounts;
            if (Array.isArray(data.keys)) keys = data.keys;
            
            saveAccounts();
            keys.forEach(k => saveKey(k));
            renderAll();
            alert('Import berhasil!');
        } catch (e) {
            alert('File ga valid!');
        }
    };
    input.click();
}

// ============================================
// DURATION BUTTONS
// ============================================
function setupDurationButtons() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const hours = this.dataset.hours;
            if (hours === 'custom') {
                selectedDuration = 'custom';
                document.getElementById('customTimeInput').style.display = 'block';
            } else {
                selectedDuration = parseInt(hours);
                document.getElementById('customTimeInput').style.display = 'none';
            }
        });
    });
}

// ============================================
// PWA INSTALL
// ============================================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPrompt').style.display = 'flex';
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('installPrompt').style.display = 'none';
});

// ============================================
// SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ SW registration failed:', err));
}

// ============================================
// EVENT LISTENERS
// ============================================
document.getElementById('addAccountBtn').addEventListener('click', addAccount);
document.getElementById('accountInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addAccount();
});
document.getElementById('addKeyBtn').addEventListener('click', addKey);
document.getElementById('keyInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKey();
});
document.getElementById('deleteExpiredBtn').addEventListener('click', deleteExpiredKeys);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);
document.getElementById('exportBtn').addEventListener('click', exportJSON);
document.getElementById('importBtn').addEventListener('click', importJSON);

setupDurationButtons();

// ============================================
// INITIALIZE APP
// ============================================
(async function init() {
    await loadData();
    renderAll();
    setInterval(updateTimers, 1000);
})();