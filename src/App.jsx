import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { localAuth } from './services/auth';
import Sidebar from './components/layout/Sidebar';

// Auth
import Login from './pages/auth/Login';

// Dashboards
import AdminDashboard    from './pages/admin/AdminDashboard';
import WorkerDashboard   from './pages/worker/WorkerDashboard';
import ResidentDashboard from './pages/resident/ResidentDashboard';

// Admin sub-pages
import Requests from './pages/admin/Requests';
import Workers  from './pages/admin/Workers';

// Worker & Resident sub-page/s
import WorkerHistory      from './pages/worker/WorkerHistory';
import WorkerProfile      from './pages/worker/WorkerProfile';
import ResidentDirectory  from './pages/resident/ResidentDirectory';


function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const session = localAuth.getSession();
    if (session) setCurrentUser(session);
        setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skill-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    localAuth.signOut();
    setCurrentUser(null);
  };

  /** Wraps authenticated pages with the Sidebar layout */
  const ProtectedLayout = ({ children }) => (
    <div className="flex min-h-screen bg-skill-light dark:bg-dark-bg">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );

  /** Renders a route only when the user has the required role */
  const ProtectedRoute = ({ role, children }) => {
    if (!currentUser) 
      return <Navigate to="/login" replace />;
    if (currentUser.role !== role) 
      return <Navigate to="/login" replace />;
    return <ProtectedLayout>{children}</ProtectedLayout>;
  };

  return (
  <Router>
    <Routes>
        {/* ── Login ── */}
      <Route
        path="/login"
        element={
            currentUser
              ? <Navigate to={`/${currentUser.role}/dashboard`} replace />
              : <Login onLoginSuccess={setCurrentUser} />
        }
      />

        {/* ── Admin ── */}
      <Route
        path="/admin/dashboard"
        element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <Workers />
            </ProtectedRoute>
          }
      />
      <Route
        path="/admin/requests"
          element={
            <ProtectedRoute role="admin">
              <Requests />
            </ProtectedRoute>
          }
      />

        {/* ── Worker ── */}
      <Route
        path="/worker/dashboard"
        element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/worker/history"
          element={
            <ProtectedRoute role="worker">
              <WorkerHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/profile"
          element={
            <ProtectedRoute role="worker">
              <WorkerProfile />
            </ProtectedRoute>
        }
      />


        {/* ── Resident ── */}
      <Route
        path="/resident/dashboard"
        element={
            <ProtectedRoute role="resident">
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/resident/directory" 
          element={
            <ProtectedRoute role="resident">
              <ResidentDirectory />
            </ProtectedRoute>
        }
      />

        {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);
}

export default App;