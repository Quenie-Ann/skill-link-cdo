// 1. Change BrowserRouter to HashRouter
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from './services/authService'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Layout
import Sidebar from './components/layout/Sidebar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-light">
        {/* Added a simple spinner feel */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skill-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Explicit Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Main Application Logic */}
        <Route path="/*" element={
          user ? (
            <div className="flex">
              <Sidebar />
              <main className="flex-1 bg-gray-100 min-h-screen">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Default inner route */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App