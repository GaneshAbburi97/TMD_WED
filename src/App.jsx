import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'

// Pages
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ForgotPassword from './pages/Auth/ForgotPassword'
import AuthCallback from './pages/Auth/AuthCallback'
import Dashboard from './pages/Dashboard'
import PainMap from './pages/PainMap'
import Exercises from './pages/Exercises'
import Progress from './pages/Progress'
import Support from './pages/Support'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import SleepTracking from './pages/SleepTracking'
import WellnessTracking from './pages/WellnessTracking'
import Settings from './pages/Settings'

import AiChat from './pages/AiChat'
import Stub from './pages/Stub'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  
  return children
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pain-map" element={<PainMap />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="progress" element={<Progress />} />
            <Route path="sleep" element={<SleepTracking />} />
            <Route path="wellness" element={<WellnessTracking />} />
            <Route path="reports" element={<Reports />} />
            <Route path="support" element={<Support />} />
            <Route path="profile" element={<Profile />} />
            <Route path="ai-chat" element={<AiChat />} />
            <Route path="settings/*" element={<Settings />} />

            {/* Stub Route for Support Sub-pages */}
            <Route path="support/*" element={<Stub title="Support Section" />} />
          </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
