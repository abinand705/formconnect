import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import ProjectList from './ProjectList'
import Sidebar from './components/sidebar'
import Dashboard from './Dashboard'
import ApiKeys from './ApiKeys'
import Support from './Support'
import Settings from './Settings'
import Analytics from './Analytics'
import { Wrench } from 'lucide-react'
import logo from './assets/logo.svg'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('email'))
  const [isRegistering, setIsRegistering] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (newToken, email) => {
    localStorage.setItem('token', newToken)
    if (email) {
      localStorage.setItem('email', email)
      setUserEmail(email)
    } else {
      // Fallback if email is missing
      const storedEmail = localStorage.getItem('email')
      setUserEmail(storedEmail)
    }
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken(null)
    setUserEmail(null)
  }

  if (!token) {
    return isRegistering ? (
      <Register
        onRegisterSuccess={() => setIsRegistering(false)}
        onToggleLogin={() => setIsRegistering(false)}
      />
    ) : (
      <Login
        setToken={handleLogin}
        onToggleRegister={() => setIsRegistering(true)}
      />
    )
  }

  return (
    <div className="layout-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} email={userEmail} handleLogout={handleLogout} />

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, display: 'none' }}>FormConnect Dashboard</h1>
        </header>

        {activeTab === 'dashboard' ? (
          <Dashboard token={token} />
        ) : activeTab === 'projects' ? (
          <ProjectList token={token} />
        ) : activeTab === 'apikeys' ? (
          <ApiKeys token={token} />
        ) : activeTab === 'support' ? (
          <Support />
        ) : activeTab === 'analytics' ? (
          <Analytics token={token} />
        ) : activeTab === 'settings' ? (
          <Settings token={token} handleLogout={handleLogout} />
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
