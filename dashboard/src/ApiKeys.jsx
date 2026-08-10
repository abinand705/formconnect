import { useState, useEffect } from 'react'
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useLoadingMessage } from './hooks/useLoadingMessage'

function ApiKeyCard({ project, token, onRegenerate }) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regeneratedMsg, setRegeneratedMsg] = useState(false)

  const maskedKey = project.apiKey.length > 4 ? `fc_live_••••••••${project.apiKey.slice(-4)}` : project.apiKey

  const handleCopy = () => {
    navigator.clipboard.writeText(project.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (window.confirm(`Regenerate API key for '${project.name}'? The old key will stop working immediately — update it wherever it's connected.`)) {
      setRegenerating(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.id}/regenerate-key`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to regenerate key')
        
        const data = await response.json()
        onRegenerate(project.id, data.apiKey)
        
        setRegeneratedMsg(true)
        setTimeout(() => setRegeneratedMsg(false), 3000)
      } catch (err) {
        alert(err.message)
      } finally {
        setRegenerating(false)
      }
    }
  }

  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 0.75rem 0' }}>
          Created {new Date(project.createdAt).toLocaleDateString()}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <code style={{ 
            backgroundColor: '#000', 
            padding: '0.5rem 0.75rem', 
            borderRadius: '4px', 
            border: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            color: '#ddd',
            minWidth: '280px',
            display: 'inline-block'
          }}>
            {showKey ? project.apiKey : maskedKey}
          </code>
          
          <button 
            onClick={() => setShowKey(!showKey)}
            title={showKey ? 'Hide Key' : 'Show Key'}
            style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          
          <button 
            onClick={handleCopy}
            title="Copy to clipboard"
            style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Copy size={16} /> {copied && <span style={{ fontSize: '0.75rem' }}>Copied!</span>}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <button 
          onClick={handleRegenerate}
          disabled={regenerating}
          style={{ backgroundColor: 'transparent', border: '1px solid #cc0000', color: '#ff4a4a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={regenerating ? "spin" : ""} />
          {regenerating ? 'Regenerating...' : 'Regenerate Key'}
        </button>
        {regeneratedMsg && <span style={{ color: '#4caf50', fontSize: '0.85rem' }}>Key regenerated successfully</span>}
      </div>
    </div>
  )
}

function ApiKeys({ token }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingMessage = useLoadingMessage(loading)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch API keys')
        
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token])

  const handleKeyRegenerated = (projectId, newKey) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, apiKey: newKey } : p
    ))
  }

  if (loading) return <div style={{ padding: '2rem', color: '#8b92a5' }}>{loadingMessage}</div>
  if (error) return <div className="error-message" style={{ padding: '2rem' }}>Error: {error}</div>

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem', marginTop: 0 }}>API Keys</h2>
      <p style={{ color: '#8b92a5', marginBottom: '2rem' }}>Manage API keys for your projects. Keep these secure as they allow submitting data to your forms.</p>
      
      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8b92a5' }}>
          No projects yet — create one from the Projects tab.
        </div>
      ) : (
        projects.map(project => (
          <ApiKeyCard 
            key={project.id} 
            project={project} 
            token={token} 
            onRegenerate={handleKeyRegenerated} 
          />
        ))
      )}
    </div>
  )
}

export default ApiKeys
