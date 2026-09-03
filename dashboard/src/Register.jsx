import { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import logo from './assets/logo.svg'
import './Login.css'

function Register({ onRegisterSuccess, onToggleLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('email', email)
      setSuccess(true)
      setTimeout(() => {
        onRegisterSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout-container">
        
        {/* ==================== LEFT SHOWCASE ==================== */}
        <div className="auth-showcase">
          <div className="brand-logo-container">
            <img
              src={logo}
              alt="FormConnect Logo"
              className="brand-logo-img"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain'
              }}
            />
            <h1 className="brand-title">FormConnect</h1>
          </div>

          <div>
            <h2 className="hero-heading">
              <span className="highlight-text">Smart Forms.</span>
              <br />
              Stronger Connections.
            </h2>
            <p className="hero-subtitle">
              Create, share, and manage beautiful forms effortlessly. All your data, connected.
            </p>
          </div>

          {/* Graphical Interface Mockup */}
          <div className="mockup-wrapper">
            <div className="mockup-glow"></div>
            <div className="mockup-dots"></div>
            <div className="mockup-dots-left"></div>

            <div className="floating-badge-card">
              <Users size={20} />
            </div>

            <div className="floating-chart-card">
              <div className="chart-bar" style={{ height: '22px' }}></div>
              <div className="chart-bar" style={{ height: '36px' }}></div>
              <div className="chart-bar" style={{ height: '28px' }}></div>
              <div className="chart-bar" style={{ height: '44px' }}></div>
              <div className="chart-bar" style={{ height: '52px' }}></div>
            </div>

            <div className="mockup-main-card">
              <div className="mockup-header-bar">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
                <div className="mockup-search-pill"></div>
              </div>

              <div className="mockup-content-grid">
                <div className="mockup-sidebar">
                  <div className="mockup-nav-line active"></div>
                  <div className="mockup-nav-line"></div>
                  <div className="mockup-nav-line"></div>
                  <div className="mockup-nav-line"></div>
                </div>

                <div className="mockup-body">
                  <div className="mockup-row">
                    <div className="mockup-check">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <div className="mockup-input-skeleton" style={{ width: '85%' }}></div>
                  </div>
                  <div className="mockup-row">
                    <div className="mockup-check">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <div className="mockup-input-skeleton" style={{ width: '65%' }}></div>
                  </div>
                  <div className="mockup-row" style={{ marginTop: '0.25rem' }}>
                    <div className="mockup-input-skeleton" style={{ height: '26px' }}></div>
                  </div>
                  <div className="mockup-submit-pill"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={20} />
              </div>
              <div className="feature-text-block">
                <h4>Secure</h4>
                <p>Your data is always protected</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Zap size={20} />
              </div>
              <div className="feature-text-block">
                <h4>Fast</h4>
                <p>Create and collect responses instantly</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <BarChart3 size={20} />
              </div>
              <div className="feature-text-block">
                <h4>Insightful</h4>
                <p>View and analyze data with ease</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT REGISTER FORM ==================== */}
        <div className="auth-card-container">
          <div className="auth-glass-card">
            <div className="auth-card-header">
              <h2>Get started 🚀</h2>
              <p>Create your FormConnect account</p>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Account created!</h3>
                <p style={{ color: '#94a3b8', margin: 0 }}>Redirecting to login...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="auth-alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="auth-form-group">
                    <label className="auth-label" htmlFor="register-email">
                      Email address
                    </label>
                    <div className="auth-input-container">
                      <div className="auth-input-icon">
                        <Mail size={18} />
                      </div>
                      <input
                        id="register-email"
                        type="email"
                        className="auth-input"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label" htmlFor="register-password">
                      Password
                    </label>
                    <div className="auth-input-container">
                      <div className="auth-input-icon">
                        <Lock size={18} />
                      </div>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-eye-button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-primary-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spinner-icon" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>

                <div className="auth-card-footer">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      if (onToggleLogin) {
                        onToggleLogin()
                      }
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Register
