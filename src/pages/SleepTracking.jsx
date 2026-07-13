import { useState } from 'react'
import { Moon, Clock, Heart, PlusCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function SleepTracking() {
  const { user } = useAuth()
  const [duration, setDuration] = useState('7.5')
  const [quality, setQuality] = useState('Good')
  const [jawClenching, setJawClenching] = useState(false)
  const [morningStiffness, setMorningStiffness] = useState('None')
  const [wakeupFeeling, setWakeupFeeling] = useState('Refreshed')
  const [isSaving, setIsSaving] = useState(false)

  const optionButtonStyle = (selected) => ({
    padding: '0.75rem',
    borderRadius: '8px',
    border: `1px solid ${selected ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
    backgroundColor: selected ? 'var(--brand-light)' : 'transparent',
    color: selected ? 'var(--brand-primary)' : 'var(--text-secondary)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  })
  
  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
      const result = await api.post('/sleep', {
        date: date,
        sleep_hours: parseFloat(duration),
        sleep_quality: quality,
        jaw_clenching: jawClenching,
        morning_stiffness: morningStiffness,
        wakeup_feeling: wakeupFeeling,
        notes: '',
        timestamp: Date.now()
      })
      if (result && result.error) throw new Error(result.error);
      alert('Sleep logged successfully!')
    } catch (error) {
      console.error(error)
      alert(`Error saving log: ${error.message}`)
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  style={optionButtonStyle(quality === q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--surface-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={jawClenching}
              onChange={(e) => setJawClenching(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)' }}
            />
            <span style={{ fontWeight: 500 }}>Jaw clenching or teeth grinding last night</span>
          </label>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>Morning Stiffness</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {['None', 'Mild', 'Moderate', 'Severe'].map(level => (
                <button
                  key={level}
                  onClick={() => setMorningStiffness(level)}
                  style={optionButtonStyle(morningStiffness === level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>Wake-up Feeling</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {['Refreshed', 'Tired', 'Jaw Sore'].map(feeling => (
                <button
                  key={feeling}
                  onClick={() => setWakeupFeeling(feeling)}
                  style={optionButtonStyle(wakeupFeeling === feeling)}
                >
                  {feeling}
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
