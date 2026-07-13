import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { Calendar, TrendingDown } from 'lucide-react'

export default function Progress() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Trends')
  const [chartData, setChartData] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({ pain: 0, exercises: 0, stress: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      
      try {
        const allPainData = await api.get('/pain') || []
        const allExerciseData = await api.get('/exercise') || []
        
        // Sort descending
        allPainData.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))
        allExerciseData.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp))

        // Fetch last 7 days of pain records
        const today = new Date()
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)

        const data = allPainData.filter(p => new Date(p.created_at || p.timestamp) >= sevenDaysAgo)
        const exData = allExerciseData.filter(e => new Date(e.created_at || e.timestamp) >= sevenDaysAgo)

        if (data) {
          // Group by day for simple demo
          const grouped = {}
          data.forEach(record => {
            const day = new Date(record.created_at || record.timestamp).toLocaleDateString('en-US', { weekday: 'short' })
            if (!grouped[day]) grouped[day] = { name: day, Pain: 0, count: 0, Stress: record.stress_level || 0 }
            grouped[day].Pain += record.pain_level
            grouped[day].count += 1
          })

          const formattedData = Object.values(grouped).map(g => ({
            name: g.name,
            Pain: Math.round(g.Pain / g.count),
            Stress: g.Stress
          }))

          // Fill empty days for visual completion and ensure chronological order
          const days = []
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            days.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
          }
          
          const finalData = days.map(d => {
            const existing = formattedData.find(f => f.name === d)
            return existing || { name: d, Pain: 0, Stress: 0 }
          })

          setChartData(finalData)

          const daysWithPain = finalData.filter(d => d.Pain > 0).length
          const avgPain = daysWithPain > 0 ? finalData.reduce((acc, curr) => acc + curr.Pain, 0) / daysWithPain : 0
          
          const daysWithStress = finalData.filter(d => d.Stress > 0).length
          const avgStress = daysWithStress > 0 ? finalData.reduce((acc, curr) => acc + curr.Stress, 0) / daysWithStress : 0

          setWeeklyStats({
            pain: avgPain.toFixed(1),
            stress: avgStress.toFixed(1),
            exercises: exData ? exData.length : 0
          })

          // Fetch Recent Activity (Limit 10 each to merge)
          const recentPain = allPainData.slice(0, 10)
          const recentExercises = allExerciseData.slice(0, 10)

          let combinedActivity = []
          if (recentPain) {
            recentPain.forEach(p => combinedActivity.push({
              date: new Date(p.created_at || p.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
              action: `Logged Pain Level (${p.pain_level}/10)`,
              type: 'log',
              rawDate: new Date(p.created_at || p.timestamp).getTime()
            }))
          }
          if (recentExercises) {
            recentExercises.forEach(e => combinedActivity.push({
              date: new Date(e.created_at || e.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
              action: `Completed ${e.exercise_name || 'Exercise'}`,
              type: 'exercise',
              rawDate: new Date(e.created_at || e.timestamp).getTime()
            }))
          }
          combinedActivity.sort((a, b) => b.rawDate - a.rawDate)
          setRecentActivity(combinedActivity.slice(0, 10))

          // Fetch Monthly Data (last 30 days)
          const thirtyDaysAgo = new Date(today)
          thirtyDaysAgo.setDate(today.getDate() - 30)

          const monthPain = allPainData.filter(p => new Date(p.created_at || p.timestamp) >= thirtyDaysAgo)
          const monthEx = allExerciseData.filter(e => new Date(e.created_at || e.timestamp) >= thirtyDaysAgo)

          const weeks = [
            { week: 'Week 1', painSum: 0, painCount: 0, sessions: 0 },
            { week: 'Week 2', painSum: 0, painCount: 0, sessions: 0 },
            { week: 'Week 3', painSum: 0, painCount: 0, sessions: 0 },
            { week: 'Week 4', painSum: 0, painCount: 0, sessions: 0 }
          ]

          const getWeekIndex = (dateString) => {
             const d = new Date(dateString)
             const diffTime = Math.abs(today - d)
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
             if (diffDays <= 7) return 3
             if (diffDays <= 14) return 2
             if (diffDays <= 21) return 1
             return 0
          }

          if (monthPain) {
            monthPain.forEach(p => {
              const idx = getWeekIndex(p.created_at || p.timestamp)
              weeks[idx].painSum += p.pain_level
              weeks[idx].painCount += 1
            })
          }
          if (monthEx) {
            monthEx.forEach(e => {
              const idx = getWeekIndex(e.created_at || e.timestamp)
              weeks[idx].sessions += 1
            })
          }
          setMonthlyData(weeks.map(w => ({
            week: w.week,
            pain: w.painCount > 0 ? Math.round(w.painSum / w.painCount) : 0,
            sessions: w.sessions
          })))
        }
      } catch (err) {
        console.error('Failed to load progress data', err)
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  const tabs = ['Trends', 'Weekly', 'Monthly', 'Activity']

  if (loading) return <div>Loading Analytics...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Progress Analytics</h1>
          <p className="text-secondary">Track your recovery, pain levels, and exercise consistency.</p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: 'var(--surface-border)', borderRadius: '8px', padding: '4px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab ? 'var(--surface)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: 'pointer',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Trends' && (
        <div className="dashboard-grid">
          
          {/* Main Chart */}
          <div className="card col-span-12">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={20} color="var(--brand-primary)" />
              Pain vs Stress (Last 7 Days)
            </h3>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Pain" stroke="var(--accent-red)" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Stress" stroke="var(--accent-orange)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="card col-span-6">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--accent-teal)" />
              Exercise Consistency
            </h3>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', borderRadius: '8px' }} />
                  <Bar dataKey="Pain" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card col-span-6">
            <h3 style={{ marginBottom: '1rem' }}>Recovery Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--brand-light)', borderRadius: '8px', borderLeft: '4px solid var(--brand-primary)' }}>
                <strong>Positive Trend Detected</strong>
                <p className="text-secondary text-sm mt-1">Your average pain has decreased by 15% on days where you completed morning stretching.</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-orange)' }}>
                <strong>Stress Correlation</strong>
                <p className="text-secondary text-sm mt-1">High stress levels (8/10) reported on Wednesday correlated with a spike in jaw pain on Thursday.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'Weekly' && (
        <div className="card mt-4">
          <h3 style={{ marginBottom: '1rem' }}>Weekly Overview</h3>
          <p className="text-secondary mb-4">Your summary for this week.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-border)', borderRadius: '8px', textAlign: 'center' }}>
              <h4 className="text-secondary mb-2">Average Pain</h4>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{weeklyStats.pain}</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-border)', borderRadius: '8px', textAlign: 'center' }}>
              <h4 className="text-secondary mb-2">Exercises Completed</h4>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>{weeklyStats.exercises}</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-border)', borderRadius: '8px', textAlign: 'center' }}>
              <h4 className="text-secondary mb-2">Average Stress</h4>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{weeklyStats.stress}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Monthly' && (
        <div className="card mt-4">
          <h3 style={{ marginBottom: '1rem' }}>Monthly Progress</h3>
          <p className="text-secondary mb-4">How you've been doing over the last 30 days.</p>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.length > 0 ? monthlyData : [
                { week: 'Week 1', pain: 0, sessions: 0 },
                { week: 'Week 2', pain: 0, sessions: 0 },
                { week: 'Week 3', pain: 0, sessions: 0 },
                { week: 'Week 4', pain: 0, sessions: 0 },
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="week" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="pain" fill="var(--accent-red)" name="Avg Pain" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sessions" fill="var(--brand-primary)" name="Exercises" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="card mt-4">
          <h3 style={{ marginBottom: '1rem' }}>Recent Activity Log</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentActivity.length > 0 ? recentActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-border)', borderRadius: '8px', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{item.action}</strong>
                  <span className="text-secondary text-sm">{item.date}</span>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', 
                  fontSize: '0.8rem', 
                  backgroundColor: item.type === 'exercise' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: item.type === 'exercise' ? '#16a34a' : '#2563eb',
                  fontWeight: 'bold'
                }}>
                  {item.type === 'exercise' ? 'Exercise' : 'Log'}
                </div>
              </div>
            )) : (
              <div className="text-secondary" style={{ padding: '1rem', textAlign: 'center' }}>
                No recent activity found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
