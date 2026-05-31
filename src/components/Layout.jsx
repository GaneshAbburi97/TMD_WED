import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, Activity, MapPin, BarChart2, MessageSquare, Menu, X,
  LogOut, Settings, Moon, Sun, Bell, User, BookOpen, Shield, FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Pain Map', path: '/pain-map', icon: MapPin },
    { name: 'Exercises', path: '/exercises', icon: Activity },
    { name: 'Analytics', path: '/progress', icon: BarChart2 },
    { name: 'Sleep Log', path: '/sleep', icon: Moon },
    { name: 'Wellness', path: '/wellness', icon: Shield },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'AI Assistant', path: '/ai-chat', icon: MessageSquare },
    { name: 'Support', path: '/support', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

const NavItem = ({ item, isSidebarOpen, navigate, location }) => {
  const isActive = location.pathname.startsWith(item.path)
  const Icon = item.icon
  return (
    <div
      onClick={() => navigate(item.path)}
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0 8px 8px 0',
        cursor: 'pointer',
        backgroundColor: isActive ? 'var(--brand-light)' : 'transparent',
        color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
        borderLeft: isActive ? '4px solid var(--brand-primary)' : '4px solid transparent',
        fontWeight: isActive ? 600 : 500,
        marginBottom: '0.25rem',
        transition: 'all 0.2s',
        animationDelay: '0.1s'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      <Icon size={20} />
      {isSidebarOpen && <span>{item.name}</span>}
    </div>
  )
}

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR */}
      <aside className="glass-panel" style={{
        width: isSidebarOpen ? '260px' : '72px',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 50,
        border: 'none', // Override glass border on left/top/bottom
        borderRight: '1px solid var(--surface-border)'
      }}>
        {/* Sidebar Header */}
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: isSidebarOpen ? '0 1.5rem' : '0', 
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid var(--surface-border)'
        }}>
          {isSidebarOpen && <h1 style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', margin: 0 }}>TMD Care AI</h1>}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <div style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto' }}>
          {navItems.map(item => <NavItem key={item.path} item={item} isSidebarOpen={isSidebarOpen} navigate={navigate} location={location} />)}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOP HEADER */}
        <header className="glass-panel" style={{
          height: '64px',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          zIndex: 40,
          border: 'none', // Override glass border
          borderBottom: '1px solid var(--surface-border)',
          backdropFilter: 'blur(16px)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>
              {navItems.find(n => location.pathname.startsWith(n.path))?.name || 'Portal'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Bell size={20} />
            </button>

            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  padding: '0.25rem 0.5rem', borderRadius: '24px', backgroundColor: 'var(--surface-hover)'
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '0.875rem'
                }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.user_metadata?.name || 'User'}
                </span>
              </div>

              {isProfileMenuOpen && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0, width: '200px',
                  backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)',
                  borderRadius: '8px', boxShadow: 'var(--shadow-md)', padding: '0.5rem', zIndex: 100
                }}>
                  <div 
                    onClick={() => { navigate('/profile'); setProfileMenuOpen(false) }}
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)' }}
                  >
                    <User size={16} /> Profile
                  </div>
                  <div 
                    onClick={handleLogout}
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '4px', color: 'var(--accent-red)' }}
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
