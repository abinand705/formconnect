import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Folder,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Copy,
  Trash2,
  RefreshCw,
  Clock,
  Mail,
  Sparkles,
  Inbox
} from 'lucide-react'
import { toast } from 'sonner'
import { useLoadingMessage } from './hooks/useLoadingMessage'

function getRelativeTime(isoDate) {
  if (!isoDate) return 'Just now'
  const now = new Date()
  const date = new Date(isoDate)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function parseSubmissionData(raw) {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return { raw: String(raw) }
  }
}

function SubmissionCard({ submission, onToggleRead, onDelete }) {
  const parsedData = useMemo(() => parseSubmissionData(submission.data), [submission.data])
  const [copied, setCopied] = useState(false)

  // Identify common prominent fields
  const entries = Object.entries(parsedData)
  const emailEntry = entries.find(([k]) => k.toLowerCase() === 'email')
  const nameEntry = entries.find(([k]) => ['name', 'fullname', 'full_name', 'username'].includes(k.toLowerCase()))
  const messageEntry = entries.find(([k]) => ['message', 'feedback', 'comments', 'comment', 'description', 'notes', 'body'].includes(k.toLowerCase()))

  const senderName = nameEntry ? String(nameEntry[1]) : (emailEntry ? String(emailEntry[1]).split('@')[0] : null)
  const senderEmail = emailEntry ? String(emailEntry[1]) : null
  const avatarLetter = senderName ? senderName.charAt(0).toUpperCase() : (senderEmail ? senderEmail.charAt(0).toUpperCase() : '#')

  // Other fields to display
  const otherEntries = entries.filter(([k]) => {
    const key = k.toLowerCase()
    if (emailEntry && key === emailEntry[0].toLowerCase()) return false
    if (nameEntry && key === nameEntry[0].toLowerCase()) return false
    if (messageEntry && key === messageEntry[0].toLowerCase()) return false
    return true
  })

  const handleCopyJson = (e) => {
    e.stopPropagation()
    const content = JSON.stringify(parsedData, null, 2)
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content).catch(() => {})
    }
    setCopied(true)
    toast.success('Submission JSON copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Delete this submission? This cannot be undone.')) {
      onDelete(submission.id)
    }
  }

  return (
    <div className={`submission-card ${!submission.read ? 'unread' : ''}`}>
      {/* Top Header */}
      <div className="submission-card-top">
        <div className="submission-card-sender">
          <div className="submission-avatar">
            {avatarLetter}
          </div>
          <div className="submission-sender-info">
            <h4 className="submission-sender-name">
              {senderName || (senderEmail ? senderEmail : `Submission #${submission.id.slice(0, 6)}`)}
            </h4>
            {senderEmail && (
              <a
                href={`mailto:${senderEmail}`}
                className="submission-sender-sub"
                onClick={(e) => e.stopPropagation()}
                title="Send email"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Mail size={12} />
                {senderEmail}
              </a>
            )}
            {!senderEmail && (
              <div className="submission-sender-sub">
                ID: {submission.id.slice(0, 8)}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className={`submission-status-pill ${!submission.read ? 'unread' : 'read'}`}>
            {!submission.read ? (
              <>
                <span className="submissions-project-unread-dot" />
                New
              </>
            ) : (
              'Read'
            )}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="submission-body">
        {/* If message exists, display in highlighted quote callout */}
        {messageEntry && (
          <div className="submission-message-box">
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary-forest)', fontWeight: 700, marginBottom: '0.25rem' }}>
              {messageEntry[0]}
            </div>
            {String(messageEntry[1])}
          </div>
        )}

        {/* Other fields */}
        {otherEntries.length > 0 && (
          <div className="submission-fields-table">
            {otherEntries.map(([k, v]) => {
              let displayVal = v
              if (typeof v === 'object' && v !== null) {
                displayVal = JSON.stringify(v)
              } else {
                displayVal = String(v)
              }

              return (
                <div key={k} className="submission-field-row">
                  <span className="submission-field-key">{k}:</span>
                  <span className="submission-field-val">
                    {displayVal}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {entries.length === 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No form data payload provided.
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="submission-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={new Date(submission.createdAt).toLocaleString()}>
          <Clock size={13} color="var(--text-secondary)" />
          <span>{getRelativeTime(submission.createdAt)}</span>
        </div>

        <div className="submission-card-actions">
          <button
            type="button"
            className="submission-action-btn"
            onClick={() => onToggleRead(submission.id, submission.read)}
            title={submission.read ? 'Mark as Unread' : 'Mark as Read'}
          >
            {submission.read ? <Check size={14} /> : <CheckCheck size={14} color="var(--primary-forest)" />}
          </button>

          <button
            type="button"
            className="submission-action-btn"
            onClick={handleCopyJson}
            title="Copy JSON Payload"
          >
            <Copy size={13} color={copied ? 'var(--accent-mint)' : undefined} />
          </button>

          <button
            type="button"
            className="submission-action-btn delete"
            onClick={handleDelete}
            title="Delete Submission"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SubmissionsView({ token, project: initialProject, onNavigate, onBack }) {
  const [projects, setProjects] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingMessage = useLoadingMessage(loading)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(initialProject ? initialProject.id : 'all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'unread' | 'read'

  // Fetch projects and all submissions
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)

    try {
      // 1. Fetch user's projects
      const projectsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!projectsRes.ok) throw new Error('Failed to fetch projects')
      const fetchedProjects = await projectsRes.json()
      const projsList = Array.isArray(fetchedProjects) ? fetchedProjects : []
      setProjects(projsList)

      // 2. Fetch submissions
      // First try unified submissions endpoint
      let allSubs = []
      try {
        const subsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (subsRes.ok) {
          const subsData = await subsRes.json()
          if (Array.isArray(subsData)) {
            allSubs = subsData
          }
        }
      } catch {
        // Fallback to per-project fetch below
      }

      // If unified endpoint wasn't available or returned empty, fetch per-project
      if (allSubs.length === 0 && projsList.length > 0) {
        const subPromises = projsList.map(async (p) => {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${p.id}/submissions`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) return []
            const data = await res.json()
            if (!Array.isArray(data)) return []
            return data.map((sub) => ({
              ...sub,
              projectId: p.id,
              project: {
                id: p.id,
                name: p.name,
                apiKey: p.apiKey
              }
            }))
          } catch {
            return []
          }
        })

        const results = await Promise.all(subPromises)
        allSubs = results.flat()
      }

      // Ensure every submission has project data attached
      const projectMap = new Map(projsList.map((p) => [p.id, p]))
      const enriched = allSubs.map((sub) => {
        if (!sub.project && sub.projectId && projectMap.has(sub.projectId)) {
          const proj = projectMap.get(sub.projectId)
          return {
            ...sub,
            project: { id: proj.id, name: proj.name, apiKey: proj.apiKey }
          }
        }
        return sub
      })

      // Sort by createdAt descending
      enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setSubmissions(enriched)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Error loading submissions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Mark single submission read/unread
  const handleToggleRead = async (submissionId, currentReadStatus) => {
    const nextStatus = !currentReadStatus
    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, read: nextStatus } : sub))
    )

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ read: nextStatus })
      })
      if (!response.ok) throw new Error('Failed to update submission')
      toast.success(nextStatus ? 'Marked as read' : 'Marked as unread')
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
      // Revert on error
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? { ...sub, read: currentReadStatus } : sub))
      )
    }
  }

  // Delete submission
  const handleDeleteSubmission = async (submissionId) => {
    const previous = submissions
    setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId))

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to delete submission')
      toast.success('Submission deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete submission')
      setSubmissions(previous)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadCount = submissions.filter((s) => !s.read).length
    if (unreadCount === 0) {
      toast.info('All submissions are already marked as read')
      return
    }

    // Optimistic update
    setSubmissions((prev) => prev.map((s) => ({ ...s, read: true })))

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedProjectId !== 'all' ? { projectId: selectedProjectId } : {})
      })
      if (!response.ok) {
        // Fallback: update individual unread items concurrently
        const unreadItems = submissions.filter((s) => !s.read)
        await Promise.all(
          unreadItems.map((item) =>
            fetch(`${import.meta.env.VITE_API_URL}/api/submissions/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ read: true })
            }).catch(() => null)
          )
        )
      }
      toast.success('Marked all submissions as read')
    } catch (err) {
      console.error(err)
      toast.error('Failed to mark all as read')
      loadData(true)
    }
  }

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    toast.success(message)
  }

  // Filter submissions by Project, Status, and Search Query
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Project filter
      if (selectedProjectId !== 'all') {
        const pId = sub.projectId || sub.project?.id
        if (pId !== selectedProjectId) return false
      }

      // 2. Status filter
      if (statusFilter === 'unread' && sub.read) return false
      if (statusFilter === 'read' && !sub.read) return false

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const projName = (sub.project?.name || '').toLowerCase()
        if (projName.includes(query)) return true

        const parsed = parseSubmissionData(sub.data)
        const contentStr = JSON.stringify(parsed).toLowerCase()
        if (contentStr.includes(query)) return true

        return false
      }

      return true
    })
  }, [submissions, selectedProjectId, statusFilter, searchQuery])

  // Group filtered submissions by Project
  // We want to show projects that exist; if filtering by project or search, show relevant projects
  const groupedProjects = useMemo(() => {
    const map = new Map()

    // Determine which projects to include
    let targetProjects = projects
    if (selectedProjectId !== 'all') {
      targetProjects = projects.filter((p) => p.id === selectedProjectId)
    }

    targetProjects.forEach((p) => {
      map.set(p.id, {
        project: p,
        submissions: []
      })
    })

    // Populate submissions into groups
    filteredSubmissions.forEach((sub) => {
      const pId = sub.projectId || sub.project?.id
      if (pId && map.has(pId)) {
        map.get(pId).submissions.push(sub)
      } else if (pId) {
        // If project wasn't in target list (e.g. newly created or detached)
        map.set(pId, {
          project: sub.project || { id: pId, name: 'Untitled Project', apiKey: '' },
          submissions: [sub]
        })
      }
    })

    // If there is an active search query or status filter, only keep projects that have matches
    let list = Array.from(map.values())
    if (searchQuery.trim() || statusFilter !== 'all') {
      list = list.filter((group) => group.submissions.length > 0)
    }

    return list
  }, [projects, filteredSubmissions, selectedProjectId, searchQuery, statusFilter])

  // Summary statistics
  const totalSubmissionsCount = submissions.length
  const totalUnreadCount = submissions.filter((s) => !s.read).length
  const activeProjectsCount = new Set(submissions.map((s) => s.projectId || s.project?.id).filter(Boolean)).size

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
          <RefreshCw size={36} className="animate-spin" color="var(--primary-forest)" />
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {loadingMessage}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
          Loading your form submissions and projects...
        </p>
      </div>
    )
  }

  return (
    <div className="submissions-page">
      {/* Header Bar */}
      <div className="submissions-header-bar">
        <div>
          {onBack && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
            >
              &larr; Back to Projects
            </button>
          )}
          <h1 className="submissions-header-title">Submissions</h1>
          <p className="submissions-header-subtitle">
            View, review, and manage form submissions grouped by project.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {totalUnreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <CheckCheck size={16} />
              Mark All as Read ({totalUnreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="submissions-stats-row">
        <div className="submissions-stat-card">
          <div
            className="submissions-stat-icon-wrapper"
            style={{ backgroundColor: 'rgba(21, 66, 52, 0.09)', color: 'var(--primary-forest)' }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="submissions-stat-value">{totalSubmissionsCount.toLocaleString()}</div>
            <div className="submissions-stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="submissions-stat-card">
          <div
            className="submissions-stat-icon-wrapper"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.14)', color: 'var(--accent-mint-text)' }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div className="submissions-stat-value">{totalUnreadCount.toLocaleString()}</div>
            <div className="submissions-stat-label">Unread Messages</div>
          </div>
        </div>

        <div className="submissions-stat-card">
          <div
            className="submissions-stat-icon-wrapper"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}
          >
            <Folder size={20} />
          </div>
          <div>
            <div className="submissions-stat-value">{activeProjectsCount} / {projects.length}</div>
            <div className="submissions-stat-label">Active Projects</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="submissions-controls-bar">
        {/* Search */}
        <div className="submissions-search-wrapper">
          <Search size={16} className="submissions-search-icon" />
          <input
            type="text"
            className="submissions-search-input"
            placeholder="Search by name, email, keyword, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills & Project Dropdown */}
        <div className="submissions-filters-group">
          {/* Project select */}
          <select
            className="submissions-filter-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status buttons */}
          <button
            type="button"
            className={`submissions-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({submissions.length})
          </button>
          <button
            type="button"
            className={`submissions-filter-pill ${statusFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setStatusFilter('unread')}
          >
            Unread ({totalUnreadCount})
          </button>
          <button
            type="button"
            className={`submissions-filter-pill ${statusFilter === 'read' ? 'active' : ''}`}
            onClick={() => setStatusFilter('read')}
          >
            Read ({submissions.length - totalUnreadCount})
          </button>
        </div>
      </div>

      {/* Empty State: If user has 0 projects */}
      {projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(21, 66, 52, 0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-forest)',
              marginBottom: '1rem'
            }}
          >
            <Inbox size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Projects Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Create your first form project to get an endpoint and start collecting real-time submissions.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('projects')
            }}
          >
            Create Your First Project
          </button>
        </div>
      )}

      {/* Empty State: If search/filters produce 0 results */}
      {projects.length > 0 && groupedProjects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Search size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Submissions Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {searchQuery
              ? `No submissions matched your search for "${searchQuery}".`
              : statusFilter === 'unread'
              ? 'No unread submissions found.'
              : 'No submissions matched your selected filters.'}
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setSelectedProjectId('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Render Project Groups: Heading as Project Name & Submissions in Cards */}
      {groupedProjects.map(({ project, submissions: projectSubs }) => {
        const maskedKey =
          project.apiKey && project.apiKey.length > 8
            ? `fc_live_••••${project.apiKey.slice(-4)}`
            : project.apiKey || 'No key'
        const unreadInProject = projectSubs.filter((s) => !s.read).length

        return (
          <section key={project.id} className="submissions-project-group">
            {/* Heading: Project Name */}
            <div className="submissions-project-header">
              <div className="submissions-project-title-area">
                <div className="submissions-project-icon-badge">
                  <Folder size={20} />
                </div>
                <h2 className="submissions-project-heading">{project.name}</h2>

                <span className="submissions-project-count-badge">
                  {projectSubs.length} submission{projectSubs.length === 1 ? '' : 's'}
                </span>

                {unreadInProject > 0 && (
                  <span className="submissions-project-unread-badge">
                    <span className="submissions-project-unread-dot" />
                    {unreadInProject} New
                  </span>
                )}
              </div>

              <div className="submissions-project-meta">
                <span className="submissions-project-key-chip" title="Project API Key">
                  API Key: {maskedKey}
                </span>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => copyToClipboard(project.apiKey, `Copied API key for ${project.name}`)}
                  title="Copy API key for form integration"
                >
                  <Copy size={12} />
                  Copy Key
                </button>
              </div>
            </div>

            {/* Submissions in Cards */}
            {projectSubs.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-color)'
                }}
              >
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  No submissions yet for {project.name}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
                  Send a POST request with your form fields to <code>{import.meta.env.VITE_API_URL || 'https://formconnect.onrender.com'}/api/submit</code> with header <code>x-api-key: {maskedKey}</code>.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                  onClick={() => {
                    const sampleCode = `curl -X POST "${import.meta.env.VITE_API_URL || 'https://formconnect.onrender.com'}/api/submit" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${project.apiKey}" \\
  -d '{"name": "Jane Doe", "email": "jane@example.com", "message": "Hello from FormConnect!"}'`
                    copyToClipboard(sampleCode, 'Test curl command copied to clipboard!')
                  }}
                >
                  Copy Sample Test Request
                </button>
              </div>
            ) : (
              <div className="submissions-cards-grid">
                {projectSubs.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    onToggleRead={handleToggleRead}
                    onDelete={handleDeleteSubmission}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

export default SubmissionsView
