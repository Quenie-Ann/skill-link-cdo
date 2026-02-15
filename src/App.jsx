import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from './services/authService'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
//import WorkerManagement from './pages/WorkerManagement'
//import ServiceRequests from './pages/ServiceRequests'
//import Predictions from './pages/Predictions'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          user ? (
            <div className="flex">
              <Sidebar />
              <main className="flex-1 bg-gray-100">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/*<Route path="/workers" element={<WorkerManagement />} />
                  <Route path="/requests" element={<ServiceRequests />} />
                  <Route path="/predictions" element={<Predictions />} />*/}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App