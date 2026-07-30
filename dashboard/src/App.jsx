import { useState } from 'react'
import Login from './Login'
import ProjectList from './ProjectList'
import SubmissionsView from './SubmissionsView'

function App() {
  const [token, setToken] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  const handleLogout = () => {
    setToken(null)
    setSelectedProject(null)
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>FormConnect Dashboard</h1>
        {token && (
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
            Logout
          </button>
        )}
      </header>

      <main>
        {!token ? (
          <Login setToken={setToken} />
        ) : !selectedProject ? (
          <ProjectList token={token} onSelectProject={setSelectedProject} />
        ) : (
          <SubmissionsView 
            token={token} 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
          />
        )}
      </main>
    </div>
  )
}

export default App
