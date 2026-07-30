import { useState, useEffect } from 'react'

function ProjectList({ token, onSelectProject }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
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

  if (loading) return <div>Loading projects...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <h2>Your Projects</h2>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map(project => (
          <div 
            key={project.id} 
            className="list-item"
            onClick={() => onSelectProject(project)}
          >
            <h3>{project.name}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#999' }}>API Key: {project.apiKey}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default ProjectList
