import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    // With implicit flow, Supabase puts the access_token in the URL hash.
    // The Supabase client detects it automatically via detectSessionInUrl.
    // We just listen for the SIGNED_IN event and redirect.

    // Check for errors passed as query params
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    const errorDesc =
      searchParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error')

    if (errorDesc) {
      setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      return
    }

    // Determine intended flow (signin vs signup) from localStorage or query param
    let mode = null
    try {
      mode = window.localStorage.getItem('oauth_mode') || null
      // remove it so future callbacks don't reuse it
      window.localStorage.removeItem('oauth_mode')
    } catch (e) {}
    if (!mode) mode = searchParams.get('mode') || null

    // Listen for the auth state change (Supabase processes the hash automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Route based on mode: signup -> profile, signin -> dashboard, default -> dashboard
        if (mode === 'signup') {
          navigate('/profile', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    })

    // Also handle if session is already available (hash was processed fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (mode === 'signup') {
          navigate('/profile', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    })

    // Fallback: if no event fires in 5s, something went wrong
    const timeout = setTimeout(() => {
      setError('Authentication timed out. Please try again.')
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
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
