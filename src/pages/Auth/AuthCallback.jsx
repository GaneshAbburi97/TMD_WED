import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('tmd_token')
    if (token) {
      navigate('/dashboard', { replace: true })
    } else {
      setError('Authentication failed or timed out.')
    }
  }, [navigate])

  if (error) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Authentication Error</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid var(--primary-color)',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <h2 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Signing you in…</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please wait while we complete authentication.</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
