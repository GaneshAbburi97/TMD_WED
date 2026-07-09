import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  getGoogleClientId,
  loadGoogleIdentityScript,
  redirectLoopbackIpToLocalhost,
} from '../lib/googleIdentity'

const googleButtonTextByMode = {
  signin: 'continue_with',
  signup: 'signup_with',
}

export default function GoogleAuthButton({
  mode = 'signin',
  onSuccess,
  onError,
}) {
  const buttonRef = useRef(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function mountGoogleButton() {
      setState('loading')

      try {
        if (redirectLoopbackIpToLocalhost()) {
          return
        }

        const google = await loadGoogleIdentityScript()

        if (cancelled || !buttonRef.current) {
          return
        }

        google.accounts.id.initialize({
          client_id: getGoogleClientId(),
          callback: async (response) => {
            try {
              if (!response?.credential) {
                throw new Error('Google did not return an ID token. Please try again.')
              }

              const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
              })

              if (error) {
                throw error
              }

              onSuccess?.()
            } catch (err) {
              onError?.(err)
            }
          },
          cancel_on_tap_outside: false,
        })

        buttonRef.current.innerHTML = ''
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: googleButtonTextByMode[mode] || googleButtonTextByMode.signin,
          logo_alignment: 'left',
          width: Math.max(240, Math.min(buttonRef.current.clientWidth || 336, 400)),
        })

        if (!cancelled) {
          setState('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setState('error')
          onError?.(err)
        }
      }
    }

    mountGoogleButton()

    return () => {
      cancelled = true
    }
  }, [mode, onError, onSuccess])

  return (
    <div style={{ width: '100%', minHeight: '44px' }}>
      <div
        ref={buttonRef}
        style={{
          width: '100%',
          display: state === 'ready' ? 'flex' : 'none',
          justifyContent: 'center',
        }}
      />

      {state !== 'ready' && (
        <button
          type="button"
          className="btn"
          disabled
          style={{
            width: '100%',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #D1D5DB',
            opacity: state === 'error' ? 0.75 : 0.9,
            cursor: 'not-allowed',
          }}
        >
          {state === 'error' ? 'Google sign-in unavailable' : 'Loading Google...'}
        </button>
      )}
    </div>
  )
}
