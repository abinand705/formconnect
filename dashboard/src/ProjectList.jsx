import { useState, useEffect } from 'react'
import { useLoadingMessage } from './hooks/useLoadingMessage'

function CreateProjectModal({ isOpen, onClose, onSuccess, token }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [createdProject, setCreatedProject] = useState(null)
  
  const [includeAllFields, setIncludeAllFields] = useState(true)
  const [emailFieldsInput, setEmailFieldsInput] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      })
      if (!response.ok) throw new Error('Failed to create project')
      const newProject = await response.json()
      setCreatedProject(newProject)
      setStep(2)
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetEmailFields = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const emailFields = includeAllFields ? null : emailFieldsInput.split(',').map(s => s.trim()).filter(Boolean)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${createdProject.id}/email-fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailFields })
      })
      if (!response.ok) throw new Error('Failed to update email fields')
      setStep(3)
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const snippet = `fetch('${import.meta.env.VITE_API_URL}/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${createdProject?.apiKey}',
    data: { name: 'John Doe', email: 'john@example.com', message: 'Hello!' }
  })
})`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }
  const modalStyle = {
    backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', 
    width: '450px', maxWidth: '90%', border: '1px solid var(--border-color)'
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {step === 1 && (
          <form onSubmit={handleCreate}>
            <h2>Create New Project</h2>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="My Awesome Form"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" onClick={onClose} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
              <button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSetEmailFields}>
            <h2>Email Notification Fields</h2>
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
              Which fields from the form submission should be included in the email notification?
            </p>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="includeAll"
                checked={includeAllFields} 
                onChange={e => setIncludeAllFields(e.target.checked)} 
                style={{ width: 'auto', marginBottom: 0 }}
              />
              <label htmlFor="includeAll" style={{ marginBottom: 0 }}>Include all fields</label>
            </div>
            {!includeAllFields && (
              <div className="form-group">
                <label>Fields to include (comma-separated)</label>
                <input 
                  type="text" 
                  value={emailFieldsInput} 
                  onChange={e => setEmailFieldsInput(e.target.value)} 
                  placeholder="name, email, message"
                  required={!includeAllFields}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Next'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ color: '#4caf50', marginTop: 0 }}>Project Created!</h2>
            <p>Your project is ready to receive submissions. Here is your connection code:</p>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <pre style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.85rem' }}>
                <code>{snippet}</code>
              </pre>
              <button 
                onClick={handleCopy}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => onSuccess(createdProject)}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project, token, onDeleteSuccess }) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const snippet = `fetch('${import.meta.env.VITE_API_URL}/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: '${project.apiKey}',
    data: { name: '...', email: '...', message: '...' }
  })
})`

  useEffect(() => {
    if (isExpanded && submissions.length === 0 && !loadingSubs) {
      setLoadingSubs(true)
      fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.id}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setSubmissions(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingSubs(false))
    }
  }, [isExpanded, project.id, token, submissions.length, loadingSubs])

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete '${project.name}'? This cannot be undone.`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to delete project')
        onDeleteSuccess(project.id)
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskedKey = project.apiKey.length > 4 ? `fc_live_••••••••${project.apiKey.slice(-4)}` : project.apiKey

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
            <span>API Key: {showApiKey ? project.apiKey : maskedKey}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowApiKey(!showApiKey); }}
              style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', backgroundColor: 'transparent', border: '1px solid #555' }}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {isExpanded ? 'Hide Details' : 'Details'}
          </button>
          <button onClick={handleDelete} style={{ backgroundColor: '#cc0000', border: '1px solid #990000' }}>
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 1rem 0' }}>
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Connection Code</h4>
            <div style={{ position: 'relative' }}>
              <pre style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.85rem', margin: 0, border: '1px solid var(--border-color)' }}>
                <code>{snippet}</code>
              </pre>
              <button 
                onClick={handleCopyCode}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 1rem 0' }}>Recent Submissions {loadingSubs ? '...' : `(${submissions.length})`}</h4>
            {submissions.length === 0 && !loadingSubs ? (
              <p style={{ fontSize: '0.9rem', color: '#888' }}>No submissions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {submissions.slice(0, 10).map(sub => (
                  <SubmissionItem key={sub.id} sub={sub} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SubmissionItem({ sub }) {
  const [expanded, setExpanded] = useState(false)

  let parsedData = sub.data
  if (typeof sub.data === 'string') {
    try {
      parsedData = JSON.parse(sub.data)
    } catch (e) {
      parsedData = { raw: sub.data }
    }
  } else if (!parsedData) {
    parsedData = {}
  }

  // Determine a summary to show when collapsed (e.g., first key or just a prompt)
  const keys = Object.keys(parsedData)
  const summaryKey = keys.includes('email') ? 'email' : (keys.includes('name') ? 'name' : keys[0])
  const summaryValue = summaryKey ? parsedData[summaryKey] : 'Empty submission'

  return (
    <div 
      className="submission-item" 
      style={{ 
        borderLeft: sub.read ? '1px solid var(--border-color)' : '4px solid var(--accent-color)',
        cursor: 'pointer',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '4px'
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {new Date(sub.createdAt).toLocaleString()} {!sub.read && <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>• New</span>}
        </span>
        <span>{expanded ? '▲ Hide' : '▼ View details'}</span>
      </div>
      
      {expanded ? (
        Object.entries(parsedData).map(([k, v]) => (
          <div key={k} style={{ fontSize: '0.9rem', marginBottom: '0.25rem', whiteSpace: 'pre-wrap' }}>
            <strong style={{ color: '#ccc' }}>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </div>
        ))
      ) : (
        <div style={{ fontSize: '0.9rem', color: '#ccc', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {summaryKey ? (
            <><strong style={{ color: '#ccc' }}>{summaryKey}:</strong> {typeof summaryValue === 'object' ? JSON.stringify(summaryValue) : String(summaryValue)}</>
          ) : (
            'Click to view details'
          )}
        </div>
      )}
    </div>
  )
}

function ProjectList({ token }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingMessage = useLoadingMessage(loading)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [token])

  const handleDeleteSuccess = (id) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  const handleModalSuccess = (newProject) => {
    setIsModalOpen(false)
    fetchProjects()
  }

  if (loading) return <div>{loadingMessage}</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Your Projects</h2>
        <button onClick={() => setIsModalOpen(true)}>Create Project</button>
      </div>

      {projects.length === 0 ? (
        <p>No projects found. Create one to get started!</p>
      ) : (
        projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            token={token} 
            onDeleteSuccess={handleDeleteSuccess} 
          />
        ))
      )}

      <CreateProjectModal 
        isOpen={isModalOpen}
        token={token}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default ProjectList
