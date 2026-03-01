// ─ Static Local Auth Service ─

export const STATIC_USERS = [
  {
    id: '1',
    email: 'admin@skilllink.com',
    password: 'admin123',
    full_name: 'Barangay Admin',
    role: 'admin',
  },
  {
    id: '2',
    email: 'worker@skilllink.com',
    password: 'worker123',
    full_name: 'Juan Dela Cruz',
    role: 'worker',
  },
  {
    id: '3',
    email: 'resident@skilllink.com',
    password: 'resident123',
    full_name: 'Maria Santos',
    role: 'resident',
  },
];

const SESSION_KEY = 'skilllink_session';

export const localAuth = {
  /** Sign in with email + password. Returns { user } or throws. */
  signIn(email, password) {
    const found = STATIC_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error('Invalid email or password.');
    const { password: _pw, ...user } = found; // strip password from session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  },

  /** Sign out and clear session. */
  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  /** Returns the current user from localStorage, or null. */
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};

// Static Dashboard Stats
export const STATIC_STATS = {
  workers: 24,
  pending: 5,
  requests: 61,
};