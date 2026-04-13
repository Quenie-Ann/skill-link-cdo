import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { localAuth } from './services/auth';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserVerification        from './pages/admin/UserVerification';
import RegisterUser from './pages/admin/RegisterUser';
import Requests       from './pages/admin/Requests';

// Worker
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerHistory   from './pages/worker/WorkerHistory';
import WorkerProfile   from './pages/worker/WorkerProfile';

// Resident
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentDirectory from './pages/resident/ResidentDirectory';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const session = localAuth.getSession();
    if (session) setCurrentUser(session);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-light dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skill-primary" />
          <p className="text-xs font-bold text-skill-primary uppercase tracking-widest animate-pulse">
            Loading BarangaySkill...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localAuth.signOut();
    setCurrentUser(null);
  };

  /** Sidebar + scrollable main area layout */
  const ProtectedLayout = ({ children }) => (
    <div className="flex min-h-screen bg-skill-light dark:bg-dark-bg">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );

  //** Guards a route by role */
  const ProtectedRoute = ({ role, children }) => {
    // 1. Check if user exists at all
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    // 2. Check if the role is valid and matches
    // Added .toLowerCase() to ensure 'Admin' vs 'admin' doesn't cause a crash
    const userRole = currentUser.role?.toLowerCase();
    const requiredRole = role.toLowerCase();

    if (userRole !== requiredRole) {
      // If the user has a role, but not the right one, 
      // send them to their OWN dashboard instead of Login.
      return <Navigate to={`/${userRole || 'resident'}/dashboard`} replace />;
    }

    return <ProtectedLayout>{children}</ProtectedLayout>;
  };

  return (
    <Router>
      <Routes>

        {/* Login Route */}
        <Route
          path="/login"
          element={
            currentUser && currentUser.role 
              ? <Navigate to={`/${currentUser.role.toLowerCase()}/dashboard`} replace />
              : <Login onLoginSuccess={setCurrentUser} />
          }
        />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"     element={<ProtectedRoute role="admin"><UserVerification /></ProtectedRoute>} />
        <Route path="/admin/requests"  element={<ProtectedRoute role="admin"><Requests /></ProtectedRoute>} />
        <Route path="/admin/register" element={<ProtectedRoute role="admin"><RegisterUser /></ProtectedRoute>} />
       
        {/* Worker */}
        <Route path="/worker/dashboard" element={<ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/history"   element={<ProtectedRoute role="worker"><WorkerHistory /></ProtectedRoute>} />
        <Route path="/worker/profile"   element={<ProtectedRoute role="worker"><WorkerProfile /></ProtectedRoute>} />

        {/* Resident */}
        <Route path="/resident/dashboard" element={<ProtectedRoute role="resident"><ResidentDashboard /></ProtectedRoute>} />
        <Route path="/resident/directory" element={<ProtectedRoute role="resident"><ResidentDirectory /></ProtectedRoute>} />

        {/* Fallback - IMPORTANT: Don't redirect to login if user is already logged in */}
        <Route path="*" element={
          currentUser 
            ? <Navigate to={`/${currentUser.role || 'resident'}/dashboard`} replace /> 
            : <Navigate to="/login" replace />
        } />

      </Routes>
    </Router>
  );
}

/** Wrap the whole app with ThemeProvider so dark mode is global */
export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}