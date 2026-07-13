import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UserPlus } from 'lucide-react'
import GoogleAuthButton from '../../components/GoogleAuthButton'

const PASSWORD_SPACE_ERROR = 'Password cannot contain spaces.'

const getAuthRedirectError = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const errorDesc = searchParams.get('error_description') || searchParams.get('error') ||
                    hashParams.get('error_description') || hashParams.get('error')

  return errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : null
}

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(() => getAuthRedirectError())
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  
  const { signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (getAuthRedirectError()) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (user) {
      navigate('/profile')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg('')

    if (/\s/.test(password)) {
      setError(PASSWORD_SPACE_ERROR)
      return
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    setLoading(true)

    try {
      const { data, error } = await signUp({ 
        email: trimmedEmail, 
        password,
        options: {
          data: {
            full_name: trimmedName
          }
        }
      })
      if (error) throw error
      
      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered.')
      } else {
        setSuccessMsg('Successfully signed up! Please check your email to verify your account or proceed to login.')
        setTimeout(() => navigate('/login'), 3000)
      }
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
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join us on your wellness journey</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              className="input-field" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="input-label" htmlFor="password">Password</label>
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
            {loading ? 'Creating account...' : (
              <>
                <UserPlus size={18} style={{ marginRight: '8px' }} />
                Sign Up with Email
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
          mode="signup"
          onSuccess={() => navigate('/profile')}
          onError={(err) => setError(err.message)}
        />

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
