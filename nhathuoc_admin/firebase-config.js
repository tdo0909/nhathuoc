// Shared Firebase configuration for the pharmacy admin.
const firebaseConfig = {
    databaseURL: "https://appnhathuoc-6ba94-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "appnhathuoc-6ba94.firebasestorage.app"
};

// Initialize Firebase App
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = (typeof firebase !== 'undefined') ? firebase.database() : null;
const storage = (typeof firebase !== 'undefined' && firebase.storage) ? firebase.storage() : null;
window.db = db;

async function uploadImage(file, folder) {
    if (!file) throw new Error('Vui lòng chọn một ảnh.');
    if (!file.type.startsWith('image/')) throw new Error('Chỉ được chọn tệp hình ảnh.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ảnh không được vượt quá 5MB.');
    return compressImage(file);
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            const image = new Image();
            image.onload = () => {
                const maxSize = 1400;
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            image.onerror = () => {
                const fallbackReader = new FileReader();
                fallbackReader.onload = fallbackEvent => resolve(fallbackEvent.target.result);
                fallbackReader.onerror = () => reject(new Error('Không thể đọc ảnh đã chọn.'));
                fallbackReader.readAsDataURL(file);
            };
            image.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('Không thể đọc file ảnh.'));
        reader.readAsDataURL(file);
    });
}

async function removeImage(url) {
    if (!storage || !url || !url.includes('firebasestorage.googleapis.com')) return;
    try { await storage.refFromURL(url).delete(); } catch (error) { console.warn('Không thể xóa ảnh cũ:', error); }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
}

// Auth Helper
function checkAdminAuth() {
    const loggedIn = sessionStorage.getItem('admin_logged_in');
    if (loggedIn !== 'true') {
        window.location.href = 'index.html';
    }
}

function logoutAdmin() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị Firebase?')) {
        sessionStorage.removeItem('admin_logged_in');
        sessionStorage.removeItem('admin_username');
        sessionStorage.removeItem('admin_name');
        window.location.href = 'index.html';
    }
}

async function changeAdminPassword() {
    const username = sessionStorage.getItem('admin_username') || 'admin';
    const password = prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');
    if (!password) return;
    if (password.length < 6) { alert('Mật khẩu cần tối thiểu 6 ký tự.'); return; }
    const snapshot = await db.ref('admins').once('value');
    const admins = snapshot.val() || {};
    const key = Object.keys(admins).find(item => admins[item]?.username === username) || username;
    await db.ref('admins/' + key).update({ username, password, full_name: admins[key]?.full_name || 'Quản trị viên An Tâm' });
    alert('Đã đổi mật khẩu thành công.');
}

function toggleAdminMenu() {
    document.querySelector('.admin-menu')?.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#adminNameLabel').forEach(label => { label.textContent = 'Quản trị viên'; });
    document.querySelectorAll('.account-copy small').forEach(label => { label.textContent = 'Nhà thuốc An Tâm'; });
    const account = document.querySelector('.topbar-account');
    const avatar = document.querySelector('.admin-user-avatar');
    if (account && avatar && !document.querySelector('.admin-menu')) {
        avatar.addEventListener('click', toggleAdminMenu);
        avatar.setAttribute('title', 'Mở menu tài khoản');
        const menu = document.createElement('div');
        menu.className = 'admin-menu';
        menu.innerHTML = '<button type="button" onclick="changeAdminPassword()"><i class="fa-solid fa-key me-2"></i>Đổi mật khẩu</button><button type="button" onclick="logoutAdmin()"><i class="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất</button>';
        account.appendChild(menu);
    }
});

function cleanText(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}