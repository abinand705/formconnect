import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  Plug,
  Activity,
  Calendar,
  BarChart3,
  FolderPlus
} from 'lucide-react'
import { useLoadingMessage } from './hooks/useLoadingMessage'

function getRelativeTime(isoDate) {
  if (!isoDate) return 'No activity yet'
  const now = new Date()
  const date = new Date(isoDate)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

function getActivityDay(isoDate) {
  if (!isoDate) return 'None'
  const now = new Date()
  const date = new Date(isoDate)
  const isToday = now.toDateString() === date.toDateString()
  if (isToday) return 'Today'
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  if (yesterday.toDateString() === date.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CreateProjectInlineModal({ isOpen, onClose, onSuccess, token }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
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
      const newProj = await response.json()
      if (onSuccess) onSuccess(newProj)
      setName('')
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Create New Project</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Add a new form endpoint to start collecting submissions seamlessly.
        </p>

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Website Contact Form"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ token, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [realProjects, setRealProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingMessage = useLoadingMessage(loading)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Interactive Analytics state
  const [analyticsFilter, setAnalyticsFilter] = useState('all') // 'all' | 'top'
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0)
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState(null)
  const [projectSubmissionCounts, setProjectSubmissionCounts] = useState({})
  const [analyticsData, setAnalyticsData] = useState(null)

  // Interactive Project Progress state
  const [progressMetric, setProgressMetric] = useState('forms-health') // 'forms-health' | 'monthly-quota'
  const [activeSegment, setActiveSegment] = useState('all') // 'all' | 'completed' | 'inprogress' | 'pending'
  const [hoveredGaugeSegment, setHoveredGaugeSegment] = useState(null)

  // Fetch real stats, projects, analytics, and exact submission counts from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, analyticsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          fetch(`${import.meta.env.VITE_API_URL}/api/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null)
        ])

        if (statsRes && statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (projectsRes && projectsRes.ok) {
          const projsData = await projectsRes.json()
          if (Array.isArray(projsData)) {
            setRealProjects(projsData)

            // Extract or fetch exact submission count for each project
            const countsMap = {}
            const needsFetch = []

            projsData.forEach((p) => {
              if (p._count?.submissions !== undefined) {
                countsMap[p.id] = p._count.submissions
                countsMap[p.name] = p._count.submissions
              } else {
                needsFetch.push(p)
              }
            })

            // If any project needs accurate submissions count, fetch per-project submissions
            if (needsFetch.length > 0) {
              const fetchedCounts = await Promise.all(
                needsFetch.map(async (p) => {
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${p.id}/submissions`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    if (res.ok) {
                      const data = await res.json()
                      const cnt = Array.isArray(data) ? data.length : 0
                      return { id: p.id, name: p.name, count: cnt }
                    }
                  } catch {}
                  return { id: p.id, name: p.name, count: 0 }
                })
              )
              fetchedCounts.forEach((c) => {
                countsMap[c.id] = c.count
                countsMap[c.name] = c.count
              })
            }

            setProjectSubmissionCounts(countsMap)
          }
        }

        if (analyticsRes && analyticsRes.ok) {
          const aData = await analyticsRes.json()
          setAnalyticsData(aData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleProjectCreated = (newProj) => {
    setRealProjects((prev) => [newProj, ...prev])
    setProjectSubmissionCounts((prev) => ({
      ...prev,
      [newProj.id]: 0,
      [newProj.name]: 0
    }))
    setStats((prev) => ({
      ...prev,
      totalProjects: (prev?.totalProjects || 0) + 1
    }))
  }

  // Dynamic Project Analytics: Projects on X-axis, submission count on Y-axis
  const projectAnalytics = useMemo(() => {
    let projectsList = []

    if (realProjects && realProjects.length > 0) {
      projectsList = realProjects.map((p) => {
        let count = 0
        if (projectSubmissionCounts[p.id] !== undefined) {
          count = projectSubmissionCounts[p.id]
        } else if (p._count?.submissions !== undefined) {
          count = p._count.submissions
        } else if (projectSubmissionCounts[p.name] !== undefined) {
          count = projectSubmissionCounts[p.name]
        } else if (analyticsData?.byProject && Array.isArray(analyticsData.byProject)) {
          const match = analyticsData.byProject.find((item) => item.projectId === p.id || item.projectName === p.name)
          if (match) count = match.count
        }

        return {
          id: p.id,
          name: p.name,
          count: count
        }
      })
    } else if (analyticsData?.byProject && analyticsData.byProject.length > 0) {
      projectsList = analyticsData.byProject.map((item, idx) => ({
        id: item.projectId || idx,
        name: item.projectName,
        count: item.count
      }))
    } else {
      projectsList = []
    }

    if (projectsList.length === 0) {
      return {
        items: [],
        roundedMax: 0,
        totalSubmissions: 0,
        yAxisTicks: [0, 0, 0, 0, 0]
      }
    }

    if (analyticsFilter === 'top') {
      projectsList = [...projectsList].sort((a, b) => b.count - a.count)
    }

    const displayedProjects = analyticsFilter === 'top'
      ? projectsList.slice(0, 6)
      : projectsList.slice(0, 10)
    const maxCount = Math.max(...displayedProjects.map((p) => p.count), 0)

    let roundedMax = 5
    if (maxCount <= 5) roundedMax = 5
    else if (maxCount <= 10) roundedMax = 10
    else if (maxCount <= 20) roundedMax = 20
    else if (maxCount <= 50) roundedMax = Math.ceil(maxCount / 10) * 10
    else if (maxCount <= 100) roundedMax = Math.ceil(maxCount / 20) * 20
    else roundedMax = Math.ceil(maxCount / 50) * 50

    const totalSubmissions = displayedProjects.reduce((acc, curr) => acc + curr.count, 0)

    const items = displayedProjects.map((item, idx) => {
      const pctOfMax = roundedMax > 0 ? (item.count / roundedMax) * 100 : 0
      const pctOfTotal = totalSubmissions > 0 ? Math.round((item.count / totalSubmissions) * 100) : 0

      // Proportional vertical bar height:
      // If 0 count: 6px clean baseline. If > 0: between 22px and 115px
      let height = 6
      if (item.count > 0) {
        const minHeight = 22
        height = Math.round(minHeight + (item.count / roundedMax) * (115 - minHeight))
      }

      let type = 'solid-emerald'
      if (item.count === maxCount && maxCount > 0) type = 'solid-forest'
      else if (idx % 3 === 1) type = 'solid-mint'
      else if (idx % 3 === 2) type = 'striped'

      return {
        ...item,
        height,
        pctOfMax,
        pctOfTotal,
        type
      }
    })

    const step = roundedMax / 4
    return {
      items,
      roundedMax,
      totalSubmissions,
      yAxisTicks: [
        roundedMax,
        Math.round(step * 3),
        Math.round(step * 2),
        Math.round(step),
        0
      ]
    }
  }, [realProjects, projectSubmissionCounts, analyticsData, analyticsFilter])

  // Dynamic Progress calculation
  const progressData = useMemo(() => {
    const totalProjects = stats?.totalProjects !== undefined ? stats.totalProjects : realProjects.length

    if (progressMetric === 'forms-health') {
      if (totalProjects === 0) {
        return {
          percent: 0,
          label: 'No Forms Yet',
          subtitle: '0 Connected Forms',
          completedPct: 0,
          inProgressPct: 0,
          pendingPct: 0
        }
      }

      const activeProjectsCount = realProjects.filter(p => {
        const c = projectSubmissionCounts[p.id] !== undefined
          ? projectSubmissionCounts[p.id]
          : (analyticsData?.byProject?.find(item => item.projectId === p.id)?.count || 0)
        return c > 0
      }).length

      const completedPct = Math.round((activeProjectsCount / totalProjects) * 100)
      const inProgressPct = 100 - completedPct
      const pendingPct = 0

      let currentDisplayPercent = completedPct
      let currentDisplayLabel = 'Forms Active'
      let currentSubtitle = `${activeProjectsCount} of ${totalProjects} forms active`

      if (activeSegment === 'completed') {
        currentDisplayPercent = completedPct
        currentDisplayLabel = 'Active Forms'
        currentSubtitle = `${activeProjectsCount} forms with submissions`
      } else if (activeSegment === 'inprogress') {
        currentDisplayPercent = inProgressPct
        currentDisplayLabel = 'Awaiting Data'
        currentSubtitle = `${totalProjects - activeProjectsCount} forms awaiting responses`
      } else if (activeSegment === 'pending') {
        currentDisplayPercent = pendingPct
        currentDisplayLabel = 'Pending'
        currentSubtitle = 'All forms initialized'
      }

      return {
        percent: currentDisplayPercent,
        label: currentDisplayLabel,
        subtitle: currentSubtitle,
        completedPct,
        inProgressPct,
        pendingPct
      }
    } else {
      const quota = 1000
      const used = stats?.totalSubmissions !== undefined ? stats.totalSubmissions : 0
      const usedPct = Math.min(Math.round((used / quota) * 100), 100)
      const remainingPct = 100 - usedPct

      let currentDisplayPercent = usedPct
      let currentDisplayLabel = 'Quota Used'
      let currentSubtitle = `${used.toLocaleString()} / ${quota.toLocaleString()} Submissions`

      if (activeSegment === 'completed') {
        currentDisplayPercent = usedPct
        currentDisplayLabel = 'Used Submissions'
        currentSubtitle = `${used.toLocaleString()} received`
      } else if (activeSegment === 'inprogress') {
        currentDisplayPercent = remainingPct
        currentDisplayLabel = 'Remaining Quota'
        currentSubtitle = `${(quota - used).toLocaleString()} available`
      } else if (activeSegment === 'pending') {
        currentDisplayPercent = 0
        currentDisplayLabel = 'Overage'
        currentSubtitle = 'No overage fees'
      }

      return {
        percent: currentDisplayPercent,
        label: currentDisplayLabel,
        subtitle: currentSubtitle,
        completedPct: usedPct,
        inProgressPct: remainingPct,
        pendingPct: 0
      }
    }
  }, [progressMetric, activeSegment, stats, realProjects, projectSubmissionCounts, analyticsData])

  // Calculation for the semi-circular gauge geometry
  const gaugeGeo = useMemo(() => {
    const totalArcLen = Math.PI * 90 // ~282.7433
    const p1 = Math.max(0, Math.min(100, progressData.completedPct || 0))
    const p2 = Math.max(0, Math.min(100 - p1, progressData.inProgressPct || 0))
    const p3 = Math.max(0, Math.min(100 - p1 - p2, progressData.pendingPct || 0))

    const len1 = (p1 / 100) * totalArcLen
    const len2 = (p2 / 100) * totalArcLen
    const len3 = (p3 / 100) * totalArcLen

    // Angle calculations (in degrees, 180° at left (20, 110), 0° at right (200, 110))
    const angle1Deg = 180 - (p1 / 100) * 180
    const angle2Deg = 180 - ((p1 + p2) / 100) * 180

    const toRad = (deg) => (deg * Math.PI) / 180

    const getDividerCoords = (deg) => {
      const rad = toRad(deg)
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      // Center (110, 110), track radius 90, stroke width 24 (radii 78 to 102)
      return {
        x1: 110 + 76 * cos,
        y1: 110 - 76 * sin,
        x2: 110 + 104 * cos,
        y2: 110 - 104 * sin
      }
    }

    const div1 = getDividerCoords(angle1Deg)
    const div2 = getDividerCoords(angle2Deg)

    return {
      totalArcLen,
      p1,
      p2,
      p3,
      len1,
      len2,
      len3,
      div1,
      div2
    }
  }, [progressData])

  // Effective display values accounting for hover state
  const effectiveProgressDisplay = useMemo(() => {
    const active = hoveredGaugeSegment || activeSegment
    const totalProjects = stats?.totalProjects !== undefined ? stats.totalProjects : realProjects.length
    const used = stats?.totalSubmissions !== undefined ? stats.totalSubmissions : 0

    if (totalProjects === 0 && progressMetric === 'forms-health') {
      return {
        percent: 0,
        label: 'No Forms Yet',
        subtitle: '0 Connected Forms',
        color: 'var(--text-secondary)'
      }
    }

    if (active === 'completed') {
      return {
        percent: progressData.completedPct,
        label: progressMetric === 'forms-health' ? 'Active Forms' : 'Used Submissions',
        subtitle: progressMetric === 'forms-health' ? `${progressData.completedPct}% active` : `${used.toLocaleString()} received`,
        color: '#154234'
      }
    } else if (active === 'inprogress') {
      return {
        percent: progressData.inProgressPct,
        label: progressMetric === 'forms-health' ? 'Awaiting Data' : 'Remaining Quota',
        subtitle: progressMetric === 'forms-health' ? `${progressData.inProgressPct}% awaiting data` : `${(1000 - used).toLocaleString()} available`,
        color: '#16a34a'
      }
    } else if (active === 'pending') {
      return {
        percent: progressData.pendingPct,
        label: 'Pending',
        subtitle: 'No pending setup',
        color: '#64748b'
      }
    }

    return {
      percent: progressData.percent,
      label: progressData.label,
      subtitle: progressData.subtitle,
      color: activeSegment !== 'all' ? 'var(--primary-forest)' : 'var(--text-secondary)'
    }
  }, [hoveredGaugeSegment, activeSegment, progressData, progressMetric, stats, realProjects])

  // Calculated stats numbers
  const totalProjectsDisplay = stats?.totalProjects !== undefined ? stats.totalProjects : realProjects.length
  const apiKeysCountDisplay = stats?.totalProjects !== undefined ? stats.totalProjects : realProjects.length
  const totalSubmissionsDisplay = (stats?.totalSubmissions ?? 0).toLocaleString()
  const lastActivityDay = stats?.lastActivity ? getActivityDay(stats.lastActivity) : 'No activity'
  const lastActivityAgo = stats?.lastActivity ? getRelativeTime(stats.lastActivity) : 'No submissions yet'

  return (
    <div style={{ width: '100%' }}>
      {/* ==================== SVG PATTERNS DEFINITION ==================== */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {/* Diagonal hatch pattern matching Donezo's striped bars */}
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="#e2e8f0" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
          </pattern>
          {/* Subtle green striped pattern for progress chart */}
          <pattern
            id="greenStripedHatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="#f1f5f9" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#64748b"
              strokeWidth="2"
            />
          </pattern>
        </defs>
      </svg>

      {/* ==================== DASHBOARD HEADER ==================== */}
      <div className="dashboard-header-row">
        <div className="dashboard-title-group">
          <h1>Dashboard</h1>
          <p>Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>

        <div className="dashboard-actions-group">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: 'var(--primary-forest)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-forest)'
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* ==================== 4 STAT CARDS ROW ==================== */}
      <div className="stat-cards-grid">
        {/* Card 1: Total Projects (Featured Dark Forest Green) */}
        <div
          className="stat-card-featured"
          onClick={() => {
            if (onNavigate) onNavigate('projects')
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-featured-top">
            <span className="stat-card-featured-title">Total Projects</span>
            <div className="stat-card-featured-arrow">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="stat-card-featured-value">{totalProjectsDisplay}</div>
          <div className="stat-card-featured-badge">
            <TrendingUp size={13} />
            <span>{totalProjectsDisplay > 0 ? `${totalProjectsDisplay} active project${totalProjectsDisplay > 1 ? 's' : ''}` : 'Get started by adding a project'}</span>
          </div>
        </div>

        {/* Card 2: API Keys */}
        <div
          className="stat-card-standard"
          onClick={() => {
            if (onNavigate) onNavigate('apikeys')
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  flexShrink: 0
                }}
              >
                <Plug size={18} />
              </div>
              <span className="stat-card-standard-title">API Keys</span>
            </div>
            <div className="stat-card-standard-arrow">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="stat-card-standard-value">{apiKeysCountDisplay}</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: apiKeysCountDisplay > 0 ? '#16a34a' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: apiKeysCountDisplay > 0 ? '#22c55e' : '#cbd5e1',
                display: 'inline-block'
              }}
            />
            <span>{apiKeysCountDisplay > 0 ? 'Connected' : 'No keys yet'}</span>
          </div>
        </div>

        {/* Card 3: Total Submissions */}
        <div
          className="stat-card-standard"
          onClick={() => {
            if (onNavigate) onNavigate('submissions')
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  flexShrink: 0
                }}
              >
                <Activity size={18} />
              </div>
              <span className="stat-card-standard-title">Total Submissions</span>
            </div>
            <div className="stat-card-standard-arrow">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="stat-card-standard-value">{totalSubmissionsDisplay}</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#2563eb',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <span>All time</span>
          </div>
        </div>

        {/* Card 4: Last Activity */}
        <div
          className="stat-card-standard"
          onClick={() => {
            if (onNavigate) onNavigate('projects')
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706',
                  flexShrink: 0
                }}
              >
                <Calendar size={18} />
              </div>
              <span className="stat-card-standard-title">Last Activity</span>
            </div>
            <div className="stat-card-standard-arrow">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="stat-card-standard-value" style={{ fontSize: stats?.lastActivity ? '1.5rem' : '1.15rem' }}>{lastActivityDay}</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: stats?.lastActivity ? '#d97706' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <span>{lastActivityAgo}</span>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CARDS GRID ==================== */}
      <div className="dashboard-main-grid">
        {/* Card 1: Project Analytics */}
        <div className="card" style={{ padding: '1.4rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="section-card-header" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="section-card-title">Project Analytics</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Submissions per project
              </div>
            </div>

            {projectAnalytics.items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Filter Pills */}
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '2px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAnalyticsFilter('all')}
                    style={{
                      padding: '3px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      backgroundColor: analyticsFilter === 'all' ? '#ffffff' : 'transparent',
                      color: analyticsFilter === 'all' ? 'var(--primary-forest)' : '#64748b',
                      boxShadow: analyticsFilter === 'all' ? 'var(--shadow-xs)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    All Projects
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsFilter('top')}
                    style={{
                      padding: '3px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      backgroundColor: analyticsFilter === 'top' ? '#ffffff' : 'transparent',
                      color: analyticsFilter === 'top' ? 'var(--primary-forest)' : '#64748b',
                      boxShadow: analyticsFilter === 'top' ? 'var(--shadow-xs)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Top Volume
                  </button>
                </div>

                {/* View All Analytics Shortcut */}
                <button
                  type="button"
                  className="btn-micro-pill"
                  onClick={() => onNavigate && onNavigate('analytics')}
                  title="Open detailed analytics"
                  style={{ cursor: 'pointer' }}
                >
                  View All →
                </button>
              </div>
            )}
          </div>

          {/* Interactive Bar Chart or Empty State */}
          {projectAnalytics.items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                flex: 1
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(21, 66, 52, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-forest)',
                  marginBottom: '0.85rem'
                }}
              >
                <BarChart3 size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: '0.35rem' }}>
                No project analytics yet
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '270px', marginBottom: '1rem', lineHeight: 1.4 }}>
                Create a form project to start tracking submission volume and real-time activity.
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsModalOpen(true)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
              >
                + Add Project
              </button>
            </div>
          ) : (() => {
            const activeIdx = hoveredProjectIndex !== null ? hoveredProjectIndex : selectedProjectIndex
            const activeItem = projectAnalytics.items[activeIdx] || projectAnalytics.items[0]

            return (
              <div style={{ padding: '0.35rem 0 0 0' }}>
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', height: '155px', position: 'relative', minWidth: `${Math.max(260, projectAnalytics.items.length * 52 + 36)}px` }}>
                    {/* Y-Axis: Count of submissions */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      width: '30px',
                      paddingBottom: '26px',
                      paddingTop: '4px',
                      color: '#94a3b8',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      userSelect: 'none'
                    }}
                    title="Y-Axis: Count of submissions"
                  >
                    <span>{projectAnalytics.yAxisTicks[0]}</span>
                    <span>{projectAnalytics.yAxisTicks[1]}</span>
                    <span>{projectAnalytics.yAxisTicks[2]}</span>
                    <span>{projectAnalytics.yAxisTicks[3]}</span>
                    <span>0</span>
                  </div>

                  {/* Chart Plot Area with Gridlines & Pill Bars */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
                    {/* Horizontal Gridlines */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: 0,
                        right: 0,
                        bottom: '26px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pointerEvents: 'none'
                      }}
                    >
                      <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
                      <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
                      <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
                      <div style={{ borderBottom: '1px dashed #f1f5f9', width: '100%' }} />
                      <div style={{ borderBottom: '1px solid #e2e8f0', width: '100%' }} />
                    </div>

                    {/* Bars Area */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        paddingBottom: '2px',
                        zIndex: 1,
                        gap: '6px'
                      }}
                    >
                      {projectAnalytics.items.map((item, idx) => {
                        const isHovered = hoveredProjectIndex === idx
                        const isActive = activeIdx === idx
                        const showTooltip = isHovered || (hoveredProjectIndex === null && selectedProjectIndex === idx)

                        let barBg = '#16a34a'
                        if (item.count === 0) {
                          barBg = '#e2e8f0'
                        } else if (item.type === 'solid-forest') {
                          barBg = '#154234'
                        } else if (item.type === 'solid-mint') {
                          barBg = '#4ade80'
                        } else if (item.type === 'striped') {
                          barBg = 'repeating-linear-gradient(45deg, #16a34a, #16a34a 4px, #86efac 4px, #86efac 8px)'
                        } else {
                          barBg = '#16a34a'
                        }

                        return (
                          <div
                            key={item.id || idx}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              height: '100%',
                              cursor: 'pointer',
                              position: 'relative',
                              maxWidth: '48px',
                              padding: '0 2px'
                            }}
                            onMouseEnter={() => setHoveredProjectIndex(idx)}
                            onMouseLeave={() => setHoveredProjectIndex(null)}
                            onClick={() => {
                              setSelectedProjectIndex(idx)
                              if (onNavigate) onNavigate('submissions')
                            }}
                          >
                            {/* Floating Tooltip Bubble: appears immediately on hover */}
                            {showTooltip && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: `${Math.min(125, item.height + (item.count === 0 ? 14 : 10))}px`,
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 'var(--radius-pill)',
                                  padding: '3px 8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#154234',
                                  boxShadow: 'var(--shadow-md)',
                                  whiteSpace: 'nowrap',
                                  zIndex: 10,
                                  pointerEvents: 'none'
                                }}
                              >
                                {item.count} {item.count === 1 ? 'submission' : 'submissions'}
                              </div>
                            )}

                            {/* Pill Bar */}
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '34px',
                                height: `${item.height}px`,
                                borderRadius: item.count === 0 ? '4px' : '16px',
                                background: isHovered && item.count > 0 ? '#154234' : barBg,
                                boxShadow: isHovered
                                  ? '0 6px 16px rgba(21, 66, 52, 0.35)'
                                  : isActive && item.count > 0
                                  ? '0 4px 12px rgba(21, 66, 52, 0.22)'
                                  : 'none',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isHovered ? 'translateY(-3px) scaleY(1.05)' : 'translateY(0) scaleY(1)',
                                transformOrigin: 'bottom',
                                filter: isHovered ? 'brightness(1.08)' : 'none',
                                opacity: item.count === 0 ? 0.75 : 1
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* X-Axis: Project Names */}
                    <div
                      style={{
                        height: '24px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '4px',
                        gap: '6px'
                      }}
                    >
                      {projectAnalytics.items.map((item, idx) => {
                        const isHovered = hoveredProjectIndex === idx
                        const isActive = activeIdx === idx
                        return (
                          <div
                            key={item.id || idx}
                            style={{
                              flex: 1,
                              maxWidth: '56px',
                              textAlign: 'center',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredProjectIndex(idx)}
                            onMouseLeave={() => setHoveredProjectIndex(null)}
                            onClick={() => {
                              setSelectedProjectIndex(idx)
                              if (onNavigate) onNavigate('submissions')
                            }}
                            title={`${item.name}: ${item.count} submissions`}
                          >
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.72rem',
                                fontWeight: isActive ? 800 : 500,
                                color: isActive ? 'var(--primary-forest)' : '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'color 0.2s ease, transform 0.2s ease',
                                transform: isHovered ? 'scale(1.06)' : 'scale(1)'
                              }}
                            >
                              {item.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

                {/* Selected / Hovered Project Details Strip */}
                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.45rem 0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    border: '1px solid var(--border-color)',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {activeItem?.name || 'Project'}:{' '}
                    <span style={{ color: 'var(--primary-forest)', fontWeight: 700 }}>
                      {activeItem?.count ?? 0} {(activeItem?.count ?? 0) === 1 ? 'submission' : 'submissions'}
                    </span>
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {activeItem?.pctOfTotal ?? 0}% of total volume
                  </span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Card 2: Project Progress */}
        <div className="card" style={{ padding: '1.4rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="section-card-header" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="section-card-title">Project Progress</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {progressMetric === 'forms-health' ? 'System delivery health' : 'Monthly tier quota'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {/* Metric Mode Switcher */}
              <div
                style={{
                  display: 'inline-flex',
                  padding: '2px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setProgressMetric('forms-health')
                    setActiveSegment('all')
                  }}
                  style={{
                    padding: '3px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: progressMetric === 'forms-health' ? '#ffffff' : 'transparent',
                    color: progressMetric === 'forms-health' ? 'var(--primary-forest)' : '#64748b',
                    boxShadow: progressMetric === 'forms-health' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Health
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProgressMetric('monthly-quota')
                    setActiveSegment('all')
                  }}
                  style={{
                    padding: '3px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: progressMetric === 'monthly-quota' ? '#ffffff' : 'transparent',
                    color: progressMetric === 'monthly-quota' ? 'var(--primary-forest)' : '#64748b',
                    boxShadow: progressMetric === 'monthly-quota' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Quota
                </button>
              </div>

              {/* Manage shortcut */}
              <button
                type="button"
                className="btn-micro-pill"
                onClick={() => onNavigate && onNavigate('projects')}
                title="Manage projects"
                style={{ cursor: 'pointer' }}
              >
                Manage →
              </button>
            </div>
          </div>

          {/* Semi-circular Gauge Chart */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0'
            }}
          >
            <div style={{ position: 'relative', width: '220px', height: '124px' }}>
              <svg
                width="220"
                height="124"
                viewBox="0 0 220 124"
                style={{ overflow: 'visible' }}
              >
                {/* Background Track Arc */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="24"
                  strokeLinecap="round"
                />

                {/* Left Round Cap (Completed) */}
                {gaugeGeo.len1 > 0 && (
                  <circle
                    cx="20"
                    cy="110"
                    r="12"
                    fill="#154234"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'completed') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'completed')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'opacity 0.25s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'completed' ? 'all' : 'completed')}
                    onMouseEnter={() => setHoveredGaugeSegment('completed')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  />
                )}

                {/* Segment 1: Completed Arc */}
                {gaugeGeo.len1 > 0 && (
                  <path
                    d="M 20 110 A 90 90 0 0 1 200 110"
                    fill="none"
                    stroke="#154234"
                    strokeWidth={
                      hoveredGaugeSegment === 'completed' || activeSegment === 'completed' ? 25 : 24
                    }
                    strokeLinecap="butt"
                    strokeDasharray={`${gaugeGeo.len1} ${gaugeGeo.totalArcLen}`}
                    strokeDashoffset="0"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'completed') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'completed')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, stroke-width 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'completed' ? 'all' : 'completed')}
                    onMouseEnter={() => setHoveredGaugeSegment('completed')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  >
                    <title>{`Completed: ${progressData.completedPct}%`}</title>
                  </path>
                )}

                {/* Segment 2: In Progress Arc */}
                {gaugeGeo.len2 > 0 && (
                  <path
                    d="M 20 110 A 90 90 0 0 1 200 110"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth={
                      hoveredGaugeSegment === 'inprogress' || activeSegment === 'inprogress' ? 25 : 24
                    }
                    strokeLinecap="butt"
                    strokeDasharray={`0 ${gaugeGeo.len1} ${gaugeGeo.len2} ${gaugeGeo.totalArcLen}`}
                    strokeDashoffset="0"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'inprogress') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'inprogress')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, stroke-width 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'inprogress' ? 'all' : 'inprogress')}
                    onMouseEnter={() => setHoveredGaugeSegment('inprogress')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  >
                    <title>{`In Progress: ${progressData.inProgressPct}%`}</title>
                  </path>
                )}

                {/* Segment 3: Pending Arc (Striped Hatch) */}
                {gaugeGeo.len3 > 0 && (
                  <path
                    d="M 20 110 A 90 90 0 0 1 200 110"
                    fill="none"
                    stroke="url(#greenStripedHatch)"
                    strokeWidth={
                      hoveredGaugeSegment === 'pending' || activeSegment === 'pending' ? 25 : 24
                    }
                    strokeLinecap="butt"
                    strokeDasharray={`0 ${gaugeGeo.len1 + gaugeGeo.len2} ${gaugeGeo.len3} ${gaugeGeo.totalArcLen}`}
                    strokeDashoffset="0"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'pending') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'pending')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, stroke-width 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'pending' ? 'all' : 'pending')}
                    onMouseEnter={() => setHoveredGaugeSegment('pending')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  >
                    <title>{`Pending: ${progressData.pendingPct}%`}</title>
                  </path>
                )}

                {/* Right Round Cap */}
                {gaugeGeo.len3 > 0 ? (
                  <circle
                    cx="200"
                    cy="110"
                    r="12"
                    fill="url(#greenStripedHatch)"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'pending') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'pending')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'opacity 0.25s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'pending' ? 'all' : 'pending')}
                    onMouseEnter={() => setHoveredGaugeSegment('pending')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  />
                ) : gaugeGeo.len2 > 0 ? (
                  <circle
                    cx="200"
                    cy="110"
                    r="12"
                    fill="#16a34a"
                    opacity={
                      (hoveredGaugeSegment && hoveredGaugeSegment !== 'inprogress') ||
                      (!hoveredGaugeSegment && activeSegment !== 'all' && activeSegment !== 'inprogress')
                        ? 0.22
                        : 1
                    }
                    style={{
                      transition: 'opacity 0.25s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveSegment(activeSegment === 'inprogress' ? 'all' : 'inprogress')}
                    onMouseEnter={() => setHoveredGaugeSegment('inprogress')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                  />
                ) : null}

                {/* Radial Divider 1 (Between Segment 1 and Segment 2) */}
                {gaugeGeo.len1 > 0 && gaugeGeo.len2 > 0 && (
                  <line
                    x1={gaugeGeo.div1.x1}
                    y1={gaugeGeo.div1.y1}
                    x2={gaugeGeo.div1.x2}
                    y2={gaugeGeo.div1.y2}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Radial Divider 2 (Between Segment 2 and Segment 3) */}
                {gaugeGeo.len2 > 0 && gaugeGeo.len3 > 0 && (
                  <line
                    x1={gaugeGeo.div2.x1}
                    y1={gaugeGeo.div2.y1}
                    x2={gaugeGeo.div2.x2}
                    y2={gaugeGeo.div2.y2}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="butt"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </svg>

              {/* Gauge Center Text */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  width: '100%',
                  pointerEvents: 'none'
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {effectiveProgressDisplay.percent}%
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: effectiveProgressDisplay.color,
                    marginTop: '0.25rem',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {effectiveProgressDisplay.label}
                </div>
              </div>
            </div>

            {/* Subtitle count indicator */}
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
              {effectiveProgressDisplay.subtitle}
            </div>

            {/* Interactive Clickable Gauge Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                flexWrap: 'wrap'
              }}
            >
              {totalProjectsDisplay === 0 && progressMetric === 'forms-health' ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '4px 0' }}>
                  No forms connected yet
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSegment(activeSegment === 'completed' ? 'all' : 'completed')}
                    onMouseEnter={() => setHoveredGaugeSegment('completed')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.74rem',
                      color: activeSegment === 'completed' || hoveredGaugeSegment === 'completed' ? '#111827' : '#475569',
                      background: activeSegment === 'completed' || hoveredGaugeSegment === 'completed' ? '#e2e8f0' : '#f8fafc',
                      border: '1px solid',
                      borderColor: activeSegment === 'completed' || hoveredGaugeSegment === 'completed' ? '#94a3b8' : 'var(--border-color)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      boxShadow: activeSegment === 'completed' || hoveredGaugeSegment === 'completed' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click or hover to inspect completed rate"
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#154234' }} />
                    <span style={{ fontWeight: activeSegment === 'completed' || hoveredGaugeSegment === 'completed' ? 700 : 500 }}>
                      {progressMetric === 'forms-health' ? 'Active' : 'Used'} {progressData.completedPct}%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSegment(activeSegment === 'inprogress' ? 'all' : 'inprogress')}
                    onMouseEnter={() => setHoveredGaugeSegment('inprogress')}
                    onMouseLeave={() => setHoveredGaugeSegment(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.74rem',
                      color: activeSegment === 'inprogress' || hoveredGaugeSegment === 'inprogress' ? '#111827' : '#475569',
                      background: activeSegment === 'inprogress' || hoveredGaugeSegment === 'inprogress' ? '#e2e8f0' : '#f8fafc',
                      border: '1px solid',
                      borderColor: activeSegment === 'inprogress' || hoveredGaugeSegment === 'inprogress' ? '#94a3b8' : 'var(--border-color)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      boxShadow: activeSegment === 'inprogress' || hoveredGaugeSegment === 'inprogress' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click or hover to inspect in-progress rate"
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                    <span style={{ fontWeight: activeSegment === 'inprogress' || hoveredGaugeSegment === 'inprogress' ? 700 : 500 }}>
                      {progressMetric === 'forms-health' ? 'Awaiting Data' : 'Remaining'} {progressData.inProgressPct}%
                    </span>
                  </button>

                  {progressMetric === 'forms-health' && progressData.pendingPct > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveSegment(activeSegment === 'pending' ? 'all' : 'pending')}
                      onMouseEnter={() => setHoveredGaugeSegment('pending')}
                      onMouseLeave={() => setHoveredGaugeSegment(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.74rem',
                        color: activeSegment === 'pending' || hoveredGaugeSegment === 'pending' ? '#111827' : '#475569',
                        background: activeSegment === 'pending' || hoveredGaugeSegment === 'pending' ? '#e2e8f0' : '#f8fafc',
                        border: '1px solid',
                        borderColor: activeSegment === 'pending' || hoveredGaugeSegment === 'pending' ? '#94a3b8' : 'var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer',
                        boxShadow: activeSegment === 'pending' || hoveredGaugeSegment === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title="Click or hover to inspect pending rate"
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 2px, #ffffff 2px, #ffffff 4px)',
                          border: '1px solid #94a3b8'
                        }}
                      />
                      <span style={{ fontWeight: activeSegment === 'pending' || hoveredGaugeSegment === 'pending' ? 700 : 500 }}>
                        Pending {progressData.pendingPct}%
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Project List */}
        <div className="card" style={{ padding: '1.4rem', margin: 0 }}>
          <div className="section-card-header">
            <h3 className="section-card-title">Project</h3>
            <button
              type="button"
              className="btn-micro-pill"
              onClick={() => setIsModalOpen(true)}
            >
              + New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {realProjects.length > 0 ? (
              realProjects.slice(0, 5).map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (onNavigate) onNavigate('projects')
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#ecfdf5',
                      color: '#154234',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    {proj.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {proj.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Created: {new Date(proj.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2.5rem 1rem',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(21, 66, 52, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-forest)',
                    marginBottom: '0.85rem'
                  }}
                >
                  <FolderPlus size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: '0.35rem' }}>
                  No projects yet
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px', marginBottom: '1rem', lineHeight: 1.4 }}>
                  Create your first project to start collecting form submissions.
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(true)}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                >
                  + Add Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Create Project Modal */}
      <CreateProjectInlineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
        token={token}
      />
    </div>
  )
}

export default Dashboard
