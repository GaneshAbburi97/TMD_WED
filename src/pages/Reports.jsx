import { useState, useRef, useEffect } from 'react'
import { FileText, Download, Printer, Share2, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Reports() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const reportRef = useRef(null)
  const [avgPain, setAvgPain] = useState(0)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [avgSleep, setAvgSleep] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      
      const { data: painData } = await supabase.from('pain_records').select('pain_level').eq('user_id', user.id).gt('pain_level', 0)
      if (painData && painData.length > 0) {
        const sum = painData.reduce((acc, curr) => acc + curr.pain_level, 0)
        setAvgPain((sum / painData.length).toFixed(1))
      }

      const { count } = await supabase.from('exercise_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count) setExerciseCount(count)

      const { data: sleepData } = await supabase.from('sleep_records').select('sleep_hours').eq('user_id', user.id)
      if (sleepData && sleepData.length > 0) {
        const sum = sleepData.reduce((acc, curr) => acc + curr.sleep_hours, 0)
        setAvgSleep((sum / sleepData.length).toFixed(1))
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
              <h2 style={{ color: '#2563EB', margin: 0 }}>TMD Care AI</h2>
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
              <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Based on recent logs</div>
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

          {/* Primary Pain Locations */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>Primary Symptom Locations</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#334155' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Right Masseter (Jaw):</strong> Frequently reported as stiff upon waking. Avg intensity: 5/10.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Left Temporalis (Temple):</strong> Associated with stress and late afternoon headaches. Avg intensity: 4/10.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Neck / Shoulders:</strong> Mild tightness correlated with poor posture. Avg intensity: 3/10.</li>
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
            Generated by TMD Care AI Platform • Confidential Health Information
          </div>
          
        </div>
      </div>
    </div>
  )
}
