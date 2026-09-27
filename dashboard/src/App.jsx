import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import ProjectList from './ProjectList'
import Sidebar from './components/sidebar'
import TopBar from './components/TopBar'
import Dashboard from './Dashboard'
import ApiKeys from './ApiKeys'
import Support from './Support'
import Settings from './Settings'
import Analytics from './Analytics'
import SubmissionsView from './SubmissionsView'
import { Wrench } from 'lucide-react'
import { Toaster } from 'sonner'

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
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="layout-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        email={userEmail}
        handleLogout={handleLogout}
      />

      <div className="main-wrapper">
        <TopBar
          email={userEmail}
          onLogout={handleLogout}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        <main className="main-content">
          {activeTab === 'dashboard' ? (
            <Dashboard token={token} onNavigate={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'projects' ? (
            <ProjectList token={token} onNavigate={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'apikeys' ? (
            <ApiKeys token={token} />
          ) : activeTab === 'support' ? (
            <Support />
          ) : activeTab === 'analytics' ? (
            <Analytics token={token} />
          ) : activeTab === 'settings' ? (
            <Settings token={token} handleLogout={handleLogout} />
          ) : activeTab === 'submissions' ? (
            <SubmissionsView token={token} onNavigate={(tab) => setActiveTab(tab)} />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Wrench size={48} color="var(--primary-forest)" style={{ marginBottom: '1rem' }} />
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feature</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Coming soon to your FormConnect dashboard.</p>
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  )
}

export default App
