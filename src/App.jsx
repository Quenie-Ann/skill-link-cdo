import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import Sidebar from './components/layout/Sidebar'

// Auth
import Login from './pages/auth/Login'

// Dashboards (Role-based)
import AdminDashboard from './pages/admin/AdminDashboard'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import ResidentDashboard from './pages/resident/ResidentDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    let isMounted = true;

    const fetchUserAndRole = async (currentUser) => {
      if (!isMounted) return;
      
      if (!currentUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // UPDATED: Added 'full_name' to the select query
        const { data: profile, error } = await Promise.race([
          supabase.from('profiles').select('role, full_name').eq('id', currentUser.id).single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        if (error || !profile) {
          // Fallback to metadata if DB fetch fails
          setUser({
            ...currentUser,
            full_name: currentUser.user_metadata?.full_name || 'User'
          });
          setUserRole(currentUser.user_metadata?.role || null);
        } else {
          // SUCCESS: Set user with the real name from DB
          setUser({
            ...currentUser,
            full_name: profile.full_name
          });
          setUserRole(profile.role);
        }
      } catch (err) {
        console.error("Auth Error:", err.message);
        setUserRole(currentUser.user_metadata?.role || null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Initial Check
    supabase.auth.getSession().then(({ data }) => {
      fetchUserAndRole(data.session?.user || null);
    });

    // Listener for future changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only fetch if we aren't already loading the initial session
      fetchUserAndRole(session?.user || null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skill-primary"></div>
      </div>
    )
  }

  // Helper to wrap protected routes with Sidebar
  const ProtectedLayout = ({ children }) => (
    <div className="flex min-h-screen bg-skill-light dark:bg-dark-bg">
      {/* Pass the full_name directly from the user state */}
      <Sidebar 
        currentUser={{ 
          role: userRole, 
          full_name: user?.full_name || user?.user_metadata?.full_name || 'User' 
        }} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );

  return (
  <Router>
    <Routes>
      {/* LOGIN / LANDING PAGE */}
      <Route
        path="/login"
        element={
          user && userRole ? (
            <Navigate to={`/${userRole}/dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* ROLE-BASED DASHBOARDS */}
      <Route
        path="/admin/dashboard"
        element={
          user && userRole === 'admin' ? (
            <ProtectedLayout><AdminDashboard /></ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/worker/dashboard"
        element={
          user && userRole === 'worker' ? (
            <ProtectedLayout><WorkerDashboard /></ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/resident/dashboard"
        element={
          user && userRole === 'resident' ? (
            <ProtectedLayout><ResidentDashboard /></ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);
}

export default App