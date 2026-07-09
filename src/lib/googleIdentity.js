const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

// This is the same web OAuth client ID currently used by the Android app's
// GoogleSignInOptions.requestIdToken call. It is public, not a secret.
const DEFAULT_GOOGLE_CLIENT_ID =
  '980089860878-jcqefu0gvq1tcmf739q5089h6roltb0h.apps.googleusercontent.com'

let googleIdentityScriptPromise

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
}

export function redirectLoopbackIpToLocalhost() {
  if (window.location.hostname !== '127.0.0.1') {
    return false
  }

  const localhostUrl = new URL(window.location.href)
  localhostUrl.hostname = 'localhost'
  window.location.replace(localhostUrl.toString())
  return true
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`
    )

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google)
      } else {
        reject(new Error('Google Identity Services did not load correctly.'))
      }
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load Google Identity Services.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = handleLoad
    script.onerror = () =>
      reject(new Error('Unable to load Google Identity Services.'))
    document.head.appendChild(script)
  })

  return googleIdentityScriptPromise
}
