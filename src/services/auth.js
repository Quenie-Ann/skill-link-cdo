/**
 * src/services/auth.js
 *  LOCAL AUTH SERVICE                                                                                                    │
 *  Handles sign-in, session persistence, and sign-out for    
 *  the static mock users defined in mockData.js.             
 */

import { STATIC_USERS } from '../data/mockData';

const SESSION_KEY = 'barangayskill_session';

export const localAuth = {

  /**
   * Sign in with email + password.
   * Used by: Login.jsx
   */
  signIn(email, password) {
    const match = STATIC_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (!match) {
      throw new Error('Invalid email or password. Please try again.');
    }

    // Strip password before storing — never persist credentials
    const { password: _pw, ...sessionUser } = match;

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { user: sessionUser };
  },

  /**
   * Check for an existing session on app load.
   * Used by: App.jsx (initial auth gate)
   */
  getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      // Corrupt storage — clear and force re-login
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  /**
   * Sign out the current user.
   * Used by: Sidebar.jsx logout button (all portals)
   */
  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Get the currently logged-in user.
   * Alias of getSession() — kept for backwards compatibility
   * with any component that calls localAuth.getCurrentUser().
   */
  getCurrentUser() {
    return this.getSession();
  },

  /**
   * Check if a user is currently authenticated.
   * Convenience helper for route guards.
   */
  isAuthenticated() {
    return this.getSession() !== null;
  },

  /**
   * Get the role of the current user.
   * Used by: App.jsx ProtectedRoute, Sidebar.jsx role checks.
   */
  getRole() {
    const user = this.getSession();
    return user ? user.role : null;
  },
};