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
  Loader2
} from 'lucide-react'
import logo from './assets/logo.svg'
import './Login.css'

function Login({ setToken, onToggleRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('email', email)
      setToken(data.token, email)
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

            {/* Floating User Badge */}
            <div className="floating-badge-card">
              <Users size={20} />
            </div>

            {/* Floating Chart Card */}
            <div className="floating-chart-card">
              <div className="chart-bar" style={{ height: '22px' }}></div>
              <div className="chart-bar" style={{ height: '36px' }}></div>
              <div className="chart-bar" style={{ height: '28px' }}></div>
              <div className="chart-bar" style={{ height: '44px' }}></div>
              <div className="chart-bar" style={{ height: '52px' }}></div>
            </div>

            {/* Main Window Mockup */}
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

          {/* 3 Feature Highlights */}
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

        {/* ==================== RIGHT LOGIN FORM ==================== */}
        <div className="auth-card-container">
          <div className="auth-glass-card">
            <div className="auth-card-header">
              <h2>Welcome back 👋</h2>
              <p>Login to your FormConnect account</p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">
                  Email address
                </label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    id="login-email"
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
                <div className="auth-form-group-header">
                  <label className="auth-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => setError('Password reset instructions will be sent to your email.')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  if (onToggleRegister) {
                    onToggleRegister()
                  }
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
