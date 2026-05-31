import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, MapPin, HeartPulse, BrainCircuit, Play, ArrowRight,
  TrendingUp, Calendar, AlertCircle
} from 'lucide-react'

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, trend, index }) => (
  <div className={`card col-span-3 hover-scale animate-fade-in`} style={{ display: 'flex', flexDirection: 'column', animationDelay: `${index * 0.1}s` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div>
        <h3 className="text-muted text-sm" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          {value}
        </div>
      </div>
      <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--brand-light)', color: colorClass }}>
        <Icon size={24} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
      {trend === 'up' && <TrendingUp size={16} color="var(--accent-red)" />}
      {trend === 'down' && <TrendingUp size={16} color="var(--accent-green)" style={{ transform: 'rotate(180deg)' }} />}
      <span className="text-xs text-secondary">{subtitle}</span>
    </div>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [painAvg, setPainAvg] = useState(0)
  const [exercisesDone, setExercisesDone] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return
      setLoading(true)

      const { data: painData } = await supabase
        .from('pain_records')
        .select('pain_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)
      
      if (painData && painData.length > 0) {
        const avg = painData.reduce((acc, curr) => acc + curr.pain_level, 0) / painData.length
        setPainAvg(avg.toFixed(1))
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: exData } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
      
      if (exData) setExercisesDone(exData.length)

      setLoading(false)
    }

    loadDashboardData()
  }, [user])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>Loading Dashboard...</div>

  return (
    <div className="dashboard-grid">
      
      {/* Welcome Banner */}
      <div className="card col-span-12 animate-fade-in" style={{ backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Welcome back, <span style={{ fontWeight: 800 }}>{user?.user_metadata?.name || 'Patient'}</span></h2>
          <p style={{ opacity: 0.9 }}>Your recovery score is looking good. Keep up the daily exercises.</p>
        </div>
        <button onClick={() => navigate('/exercises')} className="btn" style={{ backgroundColor: 'white', color: 'var(--brand-primary)' }}>
          <Play size={16} /> Start Daily Routine
        </button>
      </div>

      {/* Metrics Row */}
      <MetricCard 
        index={1}
        title="7-Day Pain Avg" 
        value={`${painAvg} / 10`} 
        subtitle="Down 12% from last week" 
        icon={MapPin} 
        colorClass="var(--accent-purple)" 
        trend="down"
      />
      <MetricCard 
        index={2}
        title="Exercises Today" 
        value={exercisesDone.toString()} 
        subtitle="Goal: 3 sessions" 
        icon={Activity} 
        colorClass="var(--brand-primary)" 
      />
      <MetricCard 
        index={3}
        title="Sleep Quality" 
        value="Good" 
        subtitle="Avg 7.2 hours" 
        icon={HeartPulse} 
        colorClass="var(--accent-teal)" 
      />
      <MetricCard 
        index={4}
        title="Stress Level" 
        value="Mild" 
        subtitle="Based on morning check-in" 
        icon={BrainCircuit} 
        colorClass="var(--accent-orange)" 
      />

      {/* AI Recommendation Widget */}
      <div className="card col-span-8 animate-fade-in hover-scale" style={{ animationDelay: '0.5s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }} className="gradient-text">Clinical Recommendations</h3>
          <button onClick={() => navigate('/ai-chat')} className="btn btn-ghost text-sm">
            Ask AI Assistant <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--brand-light)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--brand-primary)' }}>
          <AlertCircle size={24} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ marginBottom: '0.25rem', color: 'var(--brand-primary)' }}>Focus on Jaw Relaxation</h4>
            <p className="text-secondary text-sm">Based on your recent pain maps indicating tension in the right jaw, we recommend prioritizing the 'Diaphragmatic Breathing' and 'Warm Compress' routines today.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card col-span-4 animate-fade-in hover-scale" style={{ animationDelay: '0.6s' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={() => navigate('/pain-map')} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <MapPin size={18} /> Log Pain Now
          </button>
          <button onClick={() => navigate('/wellness')} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <BrainCircuit size={18} /> Daily Wellness Check
          </button>
          <button onClick={() => navigate('/sleep')} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Calendar size={18} /> Log Sleep
          </button>
        </div>
      </div>

    </div>
  )
}
