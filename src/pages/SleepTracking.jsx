import { useState, useEffect } from 'react'
import { Moon, Clock, Heart, PlusCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function SleepTracking() {
  const { user } = useAuth()
  const [duration, setDuration] = useState('7.5')
  const [quality, setQuality] = useState('Good')
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
      await supabase.from('sleep_records').insert([{
        user_id: user.id,
        date: date,
        sleep_hours: parseFloat(duration),
        sleep_quality: quality,
        timestamp: Date.now()
      }])
      alert('Sleep logged successfully!')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Sleep Tracking</h1>
          <p className="text-secondary">Monitor your sleep quality to understand its impact on TMJ recovery.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* Log Sleep Form */}
        <div className="card col-span-8">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Moon size={20} color="var(--brand-primary)" />
            Log Last Night's Sleep
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Duration (Hours)</label>
            <input 
              type="range" 
              min="2" max="12" step="0.5" 
              value={duration} 
              onChange={e => setDuration(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <div style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>
              {duration} Hours
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>Sleep Quality</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${quality === q ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                    backgroundColor: quality === q ? 'var(--brand-light)' : 'transparent',
                    color: quality === q ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={isSaving}>
            <PlusCircle size={18} /> {isSaving ? 'Saving...' : 'Save Sleep Log'}
          </button>
        </div>

        {/* Sleep Insights */}
        <div className="card col-span-4">
          <h3 style={{ marginBottom: '1.5rem' }}>Sleep Insights</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
            <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="text-secondary text-sm">Avg Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>7.2 Hours</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              <Heart size={24} />
            </div>
            <div>
              <div className="text-secondary text-sm">Avg Quality</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Good</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
