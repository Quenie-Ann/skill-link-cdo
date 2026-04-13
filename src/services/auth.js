/**
 * src/services/auth.js
 *
 * AUTH SERVICE
 * Handles sign-in, session persistence, and sign-out.
 * After login, fetches /api/me/ so that full_name is always
 * available in the session — used by the Sidebar and any
 * component that needs the user's display name.
 */

const SESSION_KEY = 'barangayskill_session';
const BASE_URL    = 'http://127.0.0.1:8000/api';

export const localAuth = {

  /**
   * Sign in with email + password.
   * Django LoginView returns: { access, refresh, role, email, user_id }
   * We then call /api/me/ with the fresh token to get full_name.
   */
  async signIn(email, password) {

    localStorage.removeItem(SESSION_KEY);
    // Step 1: get JWT + role 
    const res = await fetch(`${BASE_URL}/login/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = 'Invalid credentials';
      try {
        const err = await res.json();
        message = err.error || err.detail || message;
      } catch { /* ignore parse errors */ }
      throw new Error(message);
    }

    const data = await res.json();

    if (!data.role) {
      throw new Error('Server did not return a role. Contact your administrator.');
    }

    // Step 2: fetch full_name from /api/me/ 
    // MeView returns { id, email, role, full_name, ... }
    let fullName = data.email; // safe fallback if /me/ fails
    try {
      const meRes = await fetch(`${BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        fullName = me.full_name || me.email || data.email;
      }
    } catch {
      // Non-fatal — sidebar will fall back to email
    }

    const sessionUser = {
      email:     data.email,
      role:      data.role.toLowerCase(),
      user_id:   data.user_id,
      full_name: fullName, 
      access:    data.access,
      refresh:   data.refresh,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { user: sessionUser };
  },

  /** Check for an existing session on app load. Used by: App.jsx */
  getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  /** Sign out. Used by: Sidebar.jsx */
  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  /** Alias of getSession() — backwards compatibility */
  getCurrentUser() { return this.getSession(); },

  isAuthenticated() { return this.getSession() !== null; },

  getRole() {
    const user = this.getSession();
    return user ? user.role : null;
  },
};