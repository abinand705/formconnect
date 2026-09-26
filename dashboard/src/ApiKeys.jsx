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
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem' }}>{project.name}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0' }}>
          Created on {new Date(project.createdAt).toLocaleDateString()}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <code style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '0.55rem 0.85rem', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-color)',
            fontSize: '0.88rem',
            color: '#111827',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            display: 'inline-block',
            maxWidth: '100%'
          }}>
            {showKey ? project.apiKey : maskedKey}
          </code>
          
          <button 
            type="button"
            className="btn-secondary"
            onClick={() => setShowKey(!showKey)}
            title={showKey ? 'Hide Key' : 'Show Key'}
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center' }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          
          <button 
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            title="Copy to clipboard"
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Copy size={16} /> {copied && <span style={{ fontSize: '0.75rem', color: 'var(--primary-forest)', fontWeight: 600 }}>Copied!</span>}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <button 
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'none' }}
        >
          <RefreshCw size={16} className={regenerating ? "spin" : ""} />
          {regenerating ? 'Regenerating...' : 'Regenerate Key'}
        </button>
        {regeneratedMsg && <span style={{ color: 'var(--primary-forest)', fontSize: '0.85rem', fontWeight: 600 }}>Key regenerated successfully</span>}
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
    <div>
      <h2 style={{ marginBottom: '0.4rem', marginTop: 0 }}>API Keys</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>Manage API keys for your projects. Keep these secure as they allow submitting data to your forms.</p>
      
      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
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
