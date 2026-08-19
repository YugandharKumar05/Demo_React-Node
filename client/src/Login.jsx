import { useState } from 'react'
import { apiUrl } from './api'

function Login({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const body = mode === 'login' ? { email, password } : { name, email, password }
      const res = await fetch(apiUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      onAuthSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-visual" aria-label="Product overview">
          <div className="auth-brand">
            <span className="auth-brand-mark">D</span>
            <span>Demo App</span>
          </div>

          <div className="auth-hero">
            <p className="auth-kicker">Better operations</p>
            <h1>Welcome back to a smarter workflow.</h1>
            <p className="auth-copy">
              Manage people, inventory, devices, and insight from one secure workspace built for fast-moving teams.
            </p>
          </div>

          <ul className="auth-points">
            <li>Unified access across your workspace</li>
            <li>Actionable dashboards and resource visibility</li>
            <li>Built for secure collaboration</li>
          </ul>
        </aside>

        <section className="card auth-card" aria-label="Authentication form">
          <div className="auth-card-header">
            <p className="auth-kicker">{mode === 'login' ? 'Welcome back' : 'Get started'}</p>
            <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <label className="auth-field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {mode === 'login' && (
              <div className="auth-row">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="auth-link-btn">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              <div className="auth-social">
                <button type="button" className="auth-social-btn">
                  Google
                </button>
                <button type="button" className="auth-social-btn">
                  GitHub
                </button>
              </div>
            </>
          )}

          {error && <p className="error">{error}</p>}
        </section>
      </div>
    </div>
  )
}

export default Login
