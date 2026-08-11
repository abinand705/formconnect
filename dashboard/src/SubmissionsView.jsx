import { useState, useEffect } from 'react'

function SubmissionsView({ token, project, onBack }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.id}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch submissions')
        }
        const data = await response.json()
        setSubmissions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [token, project.id])

  const handleMarkAsRead = async (submissionId, currentReadStatus) => {
    if (currentReadStatus) return // Already read

    try {
      // Optimistically update UI
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, read: true } : sub
      ))

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: true })
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }
    } catch (err) {
      console.error(err)
      // Revert if failed
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, read: false } : sub
      ))
    }
  }

  if (loading) return <div>Loading submissions...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>
        &larr; Back to Projects
      </button>
      <h2>Submissions for {project.name}</h2>
      
      {submissions.length === 0 ? (
        <p>No submissions found for this project.</p>
      ) : (
        submissions.map(sub => {
          let parsedData = sub.data;
          if (typeof sub.data === 'string') {
            try {
              parsedData = JSON.parse(sub.data)
            } catch (e) {
              parsedData = { raw: sub.data }
            }
          } else if (!parsedData) {
            parsedData = {}
          }

          return (
            <div 
              key={sub.id} 
              className={`submission-item ${!sub.read ? 'submission-unread' : ''}`}
              onClick={() => handleMarkAsRead(sub.id, sub.read)}
            >
              <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
                {new Date(sub.createdAt).toLocaleString()} {sub.read ? '' : '• New'}
              </div>
              
              {Object.entries(parsedData).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '0.25rem' }}>
                  <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

export default SubmissionsView
