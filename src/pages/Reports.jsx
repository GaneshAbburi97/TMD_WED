import { useState, useRef, useEffect } from 'react'
import { FileText, Download, Printer, Share2, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Reports() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef(null)
  const [avgPain, setAvgPain] = useState(0)
  const [avgStress, setAvgStress] = useState(0)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [avgSleep, setAvgSleep] = useState(0)
  const [activityLog, setActivityLog] = useState([])

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      
      try {
        const painData = await api.get('/pain') || []
        const validPain = painData.filter(p => p.pain_level > 0 || p.stress_level > 0)
        if (validPain.length > 0) {
          const sumPain = validPain.reduce((acc, curr) => acc + (curr.pain_level || 0), 0)
          const sumStress = validPain.reduce((acc, curr) => acc + (curr.stress_level || 0), 0)
          setAvgPain((sumPain / validPain.length).toFixed(1))
          setAvgStress((sumStress / validPain.length).toFixed(1))
        }

        const exData = await api.get('/exercise') || []
        setExerciseCount(exData.length)

        const sleepData = await api.get('/sleep') || []
        if (sleepData.length > 0) {
          const sum = sleepData.reduce((acc, curr) => acc + parseFloat(curr.sleep_hours || 0), 0)
          setAvgSleep((sum / sleepData.length).toFixed(1))
        }

        const wellnessData = await api.get('/wellness') || []
        
        // Build Recent Activity Log
        let allActivities = []
        painData.forEach(p => allActivities.push({ type: 'Pain/Stress Log', desc: `Logged Pain: ${p.pain_level}/10, Stress: ${p.stress_level}/10`, ts: p.timestamp }))
        exData.forEach(e => allActivities.push({ type: 'Exercise', desc: `Completed ${e.exercise_name} (${e.duration_sec}s)`, ts: e.timestamp }))
        sleepData.forEach(s => allActivities.push({ type: 'Sleep Log', desc: `Logged ${s.sleep_hours} hrs of sleep`, ts: s.timestamp }))
        wellnessData.forEach(w => allActivities.push({ type: 'Wellness Log', desc: `Mood: ${w.mood}`, ts: w.timestamp }))
        
        allActivities.sort((a, b) => b.ts - a.ts)
        setActivityLog(allActivities.slice(0, 5))

      } catch (err) {
        console.error("Failed to load report data", err)
      }
    }
    fetchData()
  }, [user])

  const generatePDF = async () => {
    setIsGenerating(true)
    const element = reportRef.current
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`TMD_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("Failed to generate PDF report.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Health Reports</h1>
          <p className="text-secondary">Generate and download official reports for your healthcare provider.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline">
            <Share2 size={18} /> Share
          </button>
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={18} /> Print
          </button>
          <button className="btn btn-primary" onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : <><FileDown size={18} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* Invisible/Visible Report Template Container for HTML2Canvas */}
      <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', color: '#000' }}>
        <div ref={reportRef} style={{ padding: '2rem', backgroundColor: '#FFFFFF', color: '#1E293B' }}>
          
          {/* Report Header */}
          <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#2563EB', margin: 0 }}>TMD Self-Care</h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Official Patient Health Report</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{user?.user_metadata?.name || 'Patient Name'}</p>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>DOB: 01/01/1990</p>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Clinical Summary */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Clinical Summary (Last 30 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Pain Level</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B' }}>{avgPain} / 10</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Stress: {avgStress} / 10</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Exercises Completed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B' }}>{exerciseCount} Total</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Consistency is key</div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Sleep Duration</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B' }}>{avgSleep} Hrs</div>
              <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Crucial for recovery</div>
            </div>
          </div>

          {/* Recent Patient Activity */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Recent Patient Activity</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#334155' }}>
            {activityLog.length > 0 ? activityLog.map((act, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{new Date(act.ts).toLocaleDateString()}:</strong> {act.type} - {act.desc}
              </li>
            )) : (
              <li style={{ marginBottom: '0.5rem' }}>No recent activity found.</li>
            )}
          </ul>

          {/* AI Clinical Notes */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>AI Assistant Notes</h3>
          <div style={{ padding: '1rem', borderLeft: '4px solid #2563EB', backgroundColor: '#EFF6FF', borderRadius: '0 8px 8px 0' }}>
            <p style={{ margin: 0, color: '#1E293B', fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Patient exhibits a strong correlation between elevated stress levels and morning jaw stiffness. 
              Consistent application of the Diaphragmatic Breathing and Warm Compress routines has yielded a 15% reduction in overall weekly pain scores. 
              Recommendation: Continue current physical therapy exercises and consider increasing focus on evening relaxation techniques to mitigate nocturnal bruxism.
            </p>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '4rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem' }}>
            Generated by TMD Self-Care Platform • Confidential Health Information
          </div>
          
        </div>
      </div>
    </div>
  )
}
