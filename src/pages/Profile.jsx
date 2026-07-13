import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import { 
  Camera, Edit, Palette, Ruler, Bell, Shield, FileText, Download, 
  History, HelpCircle, MessageSquare, Stethoscope, Calendar, Settings,
  LogOut, Trash2, ChevronRight 
} from 'lucide-react'

const SectionHeader = ({ title }) => (
  <div style={{
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
    marginBottom: '1rem',
    paddingLeft: '0.5rem',
    borderBottom: '1px solid var(--surface-border)',
    paddingBottom: '0.5rem'
  }}>
    {title}
  </div>
)

const LinkRow = ({ icon: Icon, title, subtitle, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      cursor: 'pointer',
      borderBottom: '1px solid var(--surface-border)',
      transition: 'background-color 0.2s'
    }}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    <div style={{ padding: '0.5rem', backgroundColor: color ? `${color}1A` : 'var(--brand-light)', borderRadius: '8px', color: color || 'var(--brand-primary)', marginRight: '1rem' }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: color || 'var(--text-primary)', fontWeight: subtitle ? 600 : 500, fontSize: '0.9375rem' }}>{title}</div>
      {subtitle && <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{subtitle}</div>}
    </div>
    <ChevronRight size={20} color="var(--text-muted)" opacity={0.5} />
  </div>
)

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Patient Profile</h1>
        <p className="text-secondary">Manage your clinical details and platform settings.</p>
      </header>

      <div className="dashboard-grid">
        
        {/* Left Column: Account Info */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: 'var(--brand-primary)', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-md)'
              }}>
                {(user?.name || user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '8px',
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--brand-primary)'
              }}>
                <Camera size={18} />
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{user?.name || user?.user_metadata?.name || 'User Name'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{user?.email}</p>

            <button className="btn btn-primary" style={{ width: '100%' }}>
              <Edit size={16} /> Edit Clinical Profile
            </button>
          </div>

          {/* Account Management */}
          <div className="card" style={{ padding: '1rem' }}>
            <LinkRow icon={LogOut} title="Secure Logout" color="#EF4444" onClick={handleLogout} />
            <LinkRow icon={Trash2} title="Delete Account" color="#EF4444" />
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
            TMD Self-Care Platform v2.4.1 (Clinical Release)
          </div>

        </div>

        {/* Right Column: Settings & Links */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader title="PLATFORM SETTINGS" />
            <div style={{ borderRadius: '8px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
              <LinkRow icon={Settings} title="General Settings" subtitle="Theme, Units, Notifications" onClick={() => navigate('/settings')} />
              <LinkRow icon={Shield} title="Privacy & Security" subtitle="Data sharing and HIPAA compliance" onClick={() => navigate('/settings/privacy')} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader title="CLINICAL REPORTS" />
            <div style={{ borderRadius: '8px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
              <LinkRow icon={FileText} title="View Health Reports" onClick={() => navigate('/reports')} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <SectionHeader title="SUPPORT & RESOURCES" />
            <div style={{ borderRadius: '8px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
              <LinkRow icon={HelpCircle} title="Help Center & FAQs" onClick={() => navigate('/support')} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
