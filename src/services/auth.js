// ─ Static Local Auth Service ─
import { STATIC_USERS } from '../data/mockData';

const SESSION_KEY = 'skilllink_session';

export const localAuth = {
  // For Login.jsx
  signIn: (email, password) => {
    const user = STATIC_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create a copy without the password for safety
    const sessionUser = { ...user };
    delete sessionUser.password;

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { user: sessionUser };
  },

  // For App.jsx (Initial load/session check)
  getSession: () => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  // 3. For Logout buttons
  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: () => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
};