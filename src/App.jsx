import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Requests from './pages/Requests'

import Sidebar from './components/layout/Sidebar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session on load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skill-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="flex">
                <Sidebar />
                <main className="flex-1 bg-gray-100 min-h-screen">
                  <Dashboard />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Workers */}
        <Route
          path="/workers"
          element={
            user ? (
              <div className="flex">
                <Sidebar />
                <main className="flex-1 bg-gray-100 min-h-screen">
                  <Workers />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Requests */}
        <Route
          path="/requests"
          element={
            user ? (
              <div className="flex">
                <Sidebar />
                <main className="flex-1 bg-gray-100 min-h-screen">
                  <Requests />
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  )
}

export default App