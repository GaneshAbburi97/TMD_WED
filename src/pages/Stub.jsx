import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Stub({ title }) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-variant)', display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginRight: '1rem' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{title}</h1>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Coming Soon</p>
          <p>The {title} screen is under development.</p>
        </div>
      </div>
    </div>
  )
}
