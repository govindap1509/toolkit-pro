// ============================================================
// SHARED — Auth, Modals, Navigation
// ============================================================

// ── SUPABASE SETUP ───────────────────────────────────────────
// To enable Supabase auth, add your project URL and anon key below.
// The Supabase JS SDK is loaded via CDN in each HTML page's <head>.
// When SUPABASE_URL is set, auth will use Supabase; otherwise
// it falls back to the localStorage demo auth.

const SUPABASE_URL  = '';   // e.g. 'https://xyzcompany.supabase.co'
const SUPABASE_KEY  = '';   // e.g. 'eyJhbGciOi...'

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY && window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ── AUTH STATE ───────────────────────────────────────────────
const AUTH_KEY = 'qtp-auth';
let currentUser = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');

// On page load, check Supabase session if available
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      currentUser = {
        email: data.session.user.email,
        name: data.session.user.user_metadata?.name || data.session.user.email.split('@')[0]
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
    }
    updateAuthUI();
  });
}

function updateAuthUI() {
  const loginBtn  = document.getElementById('header-login-btn');
  const userBar   = document.getElementById('header-user');
  const gate      = document.getElementById('community-gate');
  const forum     = document.getElementById('community-forum');
  const avatar    = document.getElementById('header-avatar');
  const uname     = document.getElementById('header-username');
  if (currentUser) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userBar)   userBar.style.display   = 'flex';
    if (avatar)    avatar.textContent      = currentUser.name.slice(0,1).toUpperCase();
    if (uname)     uname.textContent       = currentUser.name;
    if (gate)      gate.style.display      = 'none';
    if (forum)     { forum.style.display = 'block'; if (typeof renderForum === 'function') renderForum(); }
  } else {
    if (loginBtn)  loginBtn.style.display  = 'block';
    if (userBar)   userBar.style.display   = 'none';
    if (gate)      gate.style.display      = 'flex';
    if (forum)     forum.style.display     = 'none';
  }
}

function switchAuthTab(tab) {
  document.getElementById('auth-tab-in').classList.toggle('active', tab === 'in');
  document.getElementById('auth-tab-up').classList.toggle('active', tab === 'up');
  document.getElementById('auth-form-in').style.display = tab === 'in' ? 'block' : 'none';
  document.getElementById('auth-form-up').style.display = tab === 'up' ? 'block' : 'none';
}

async function doSignIn() {
  const email = document.getElementById('auth-email-in').value.trim();
  const pass  = document.getElementById('auth-pass-in').value;
  const err   = document.getElementById('auth-err-in');
  if (!email || !pass) { showAuthErr(err, 'Please fill in all fields.'); return; }

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { showAuthErr(err, error.message); return; }
    currentUser = { email: data.user.email, name: data.user.user_metadata?.name || email.split('@')[0] };
  } else {
    const users = JSON.parse(localStorage.getItem('qtp-users') || '{}');
    if (!users[email] || users[email].pass !== btoa(pass)) {
      showAuthErr(err, 'Invalid email or password.'); return;
    }
    currentUser = { email, name: users[email].name };
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
  closeModal('auth');
  updateAuthUI();
}

async function doSignUp() {
  const name  = document.getElementById('auth-name-up').value.trim();
  const email = document.getElementById('auth-email-up').value.trim();
  const pass  = document.getElementById('auth-pass-up').value;
  const err   = document.getElementById('auth-err-up');
  if (!name || !email || !pass) { showAuthErr(err, 'Please fill in all fields.'); return; }
  if (pass.length < 6) { showAuthErr(err, 'Password must be at least 6 characters.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAuthErr(err, 'Please enter a valid email address.'); return; }

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { name } }
    });
    if (error) { showAuthErr(err, error.message); return; }
    currentUser = { email, name };
  } else {
    const users = JSON.parse(localStorage.getItem('qtp-users') || '{}');
    if (users[email]) { showAuthErr(err, 'An account with this email already exists.'); return; }
    users[email] = { name, pass: btoa(pass) };
    localStorage.setItem('qtp-users', JSON.stringify(users));
    currentUser = { email, name };
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
  closeModal('auth');
  updateAuthUI();
}

function showAuthErr(el, msg) {
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

async function logOut() {
  if (supabase) { await supabase.auth.signOut(); }
  currentUser = null;
  localStorage.removeItem(AUTH_KEY);
  updateAuthUI();
}

// ── MODALS ───────────────────────────────────────────────────
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

function submitHelp() {
  const name = document.getElementById('m-name').value.trim();
  const email = document.getElementById('m-email').value.trim();
  if (!name || !email) { alert('Please fill in your name and email.'); return; }
  document.getElementById('help-form').style.display = 'none';
  document.getElementById('help-success').style.display = 'block';
}

// ── NAVIGATION ───────────────────────────────────────────────
function go(id) {
  if (id === 'home') {
    window.location.href = 'index.html';
  } else {
    window.location.href = id + '.html';
  }
}
