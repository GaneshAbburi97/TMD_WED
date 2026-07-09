import { useState } from 'react'
import { BrainCircuit, Smile, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function WellnessTracking() {
  const { user } = useAuth()
  const [stress, setStress] = useState(5)
  const [mood, setMood] = useState(3)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
      
      // Save mood to wellness_records
      const { error: moodError } = await supabase.from('wellness_records').insert([{
        user_id: user.id,
        date: date,
        mood: mood.toString(),
        timestamp: Date.now()
      }])
      if (moodError) throw moodError;
      
      // Save stress to pain_records so it reflects in Dashboard/Progress
      const { error: stressError } = await supabase.from('pain_records').insert([{
        user_id: user.id,
        date: date,
        pain_level: 0,
        stress_level: parseInt(stress),
        location: '',
        type: 'Wellness Log',
        timestamp: Date.now()
      }])
      if (stressError) throw stressError;
      
      alert('Wellness logged successfully!')
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
          <h1 style={{ marginBottom: '0.25rem' }}>Daily Wellness</h1>
          <p className="text-secondary">Track your stress, mood, and tension triggers to identify patterns.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        
        <div className="card col-span-12">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={20} color="var(--brand-primary)" />
            Morning Check-in
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Stress Logger */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 500 }}>
                <span>Stress Level</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{stress} / 10</span>
              </label>
              <input 
                type="range" min="1" max="10" 
                value={stress} onChange={e => setStress(e.target.value)}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Relaxed</span>
                <span>Highly Stressed</span>
              </div>
            </div>

            {/* Mood Logger */}
            <div>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500 }}>Overall Mood</label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setMood(val)}
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      backgroundColor: mood === val ? 'var(--brand-light)' : 'var(--bg-secondary)',
                      border: `1px solid ${mood === val ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                      color: mood === val ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Smile size={24} style={{ opacity: val * 0.2 + 0.2 }} />
                  </button>
                ))}
              </div>
            </div>

          </div>

          <h4 style={{ marginBottom: '1rem' }}>Tension Triggers (Optional)</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {['Work Stress', 'Poor Sleep', 'Hard Foods', 'Clenching Jaw', 'Anxiety'].map(trigger => (
              <div key={trigger} style={{ 
                padding: '0.5rem 1rem', borderRadius: '24px', 
                border: '1px solid var(--surface-border)', color: 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.875rem'
              }}>
                {trigger}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <CheckCircle size={18} /> {isSaving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>

        <div className="card col-span-12" style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle color="var(--brand-primary)" />
            <div>
              <h4 style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>Did you know?</h4>
              <p className="text-secondary text-sm">Stress is a major contributor to TMJ disorders. Clenching or grinding teeth (bruxism) often occurs subconsciously during high-stress periods. Logging your stress helps the AI recommend proper relaxation techniques at the right time.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
