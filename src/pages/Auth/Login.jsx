import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogIn } from 'lucide-react'
import GoogleAuthButton from '../../components/GoogleAuthButton'

const PASSWORD_SPACE_ERROR = 'Password cannot contain spaces.'

const getAuthRedirectError = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const errorDesc = searchParams.get('error_description') || searchParams.get('error') ||
                    hashParams.get('error_description') || hashParams.get('error')

  return errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : null
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(() => getAuthRedirectError())
  const [loading, setLoading] = useState(false)
  
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (getAuthRedirectError()) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (/\s/.test(password)) {
      setError(PASSWORD_SPACE_ERROR)
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn({ email: email.trim(), password })
      if (error) throw error
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const nextPassword = e.target.value
    if (/\s/.test(nextPassword)) {
      setError(PASSWORD_SPACE_ERROR)
      setPassword(nextPassword.replace(/\s/g, ''))
      return
    }
    if (error === PASSWORD_SPACE_ERROR) setError(null)
    setPassword(nextPassword)
  }

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>TMD App</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back to your wellness journey</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              className="input-field" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="input-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>Forgot password?</Link>
            </div>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault()
              }}
              pattern="\S+"
              title="Password cannot contain spaces."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={18} style={{ marginRight: '8px' }} />
                Sign In with Password
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--surface-border)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--surface-border)' }}></div>
        </div>

        <GoogleAuthButton
          mode="signin"
          onSuccess={() => navigate('/dashboard')}
          onError={(err) => setError(err.message)}
        />

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  )
}
