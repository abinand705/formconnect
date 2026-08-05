import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import ProjectList from './ProjectList'
import Sidebar from './components/sidebar'
import { Wrench } from 'lucide-react'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isRegistering, setIsRegistering] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return (
      <div className="app-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>FormConnect Dashboard</h1>
        </header>

        <main>
          {isRegistering ? (
            <>
              <Register onRegisterSuccess={() => setIsRegistering(false)} />
              <p style={{ textAlign: 'center' }}>
                Already have an account? <button onClick={() => setIsRegistering(false)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>Login</button>
              </p>
            </>
          ) : (
            <>
              <Login setToken={handleLogin} />
              <p style={{ textAlign: 'center' }}>
                Don't have an account? <button onClick={() => setIsRegistering(true)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>Register</button>
              </p>
            </>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="layout-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, display: 'none' }}>FormConnect Dashboard</h1>
          <div style={{marginLeft: 'auto'}}>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
              Logout
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <ProjectList token={token} />
        ) : (
          <div className="maintenance-view">
            <Wrench size={64} color="var(--accent-color)" />
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('keys', ' Keys')} Under Maintenance</h2>
            <p>This feature is currently being built. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
