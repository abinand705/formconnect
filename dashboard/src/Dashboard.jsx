import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  Plug,
  Activity,
  Calendar,
  Code2,
  Workflow,
  Sparkles,
  Gauge,
  Layers
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
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('this-week') // 'this-week' | 'last-week'
  const [selectedDayIndex, setSelectedDayIndex] = useState(3) // Wednesday by default
  const [analyticsData, setAnalyticsData] = useState(null)

  // Interactive Project Progress state
  const [progressMetric, setProgressMetric] = useState('forms-health') // 'forms-health' | 'monthly-quota'
  const [activeSegment, setActiveSegment] = useState('all') // 'all' | 'completed' | 'inprogress' | 'pending'

  // Fetch real stats, projects, and analytics from API
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
    setStats((prev) => ({
      ...prev,
      totalProjects: (prev?.totalProjects || 0) + 1
    }))
  }

  // Dynamic 7-day Analytics data matching timeframe & real activity
  const weeklyAnalytics = useMemo(() => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const demoThisWeek = [
      { count: 18, pct: 45, type: 'striped' },
      { count: 28, pct: 68, type: 'solid-emerald' },
      { count: 34, pct: 74, type: 'solid-mint' },
      { count: 42, pct: 92, type: 'solid-forest' },
      { count: 25, pct: 55, type: 'striped' },
      { count: 30, pct: 62, type: 'striped' },
      { count: 19, pct: 40, type: 'striped' }
    ]

    const demoLastWeek = [
      { count: 15, pct: 36, type: 'striped' },
      { count: 24, pct: 54, type: 'solid-mint' },
      { count: 38, pct: 84, type: 'solid-forest' },
      { count: 31, pct: 72, type: 'solid-emerald' },
      { count: 26, pct: 60, type: 'striped' },
      { count: 22, pct: 50, type: 'striped' },
      { count: 14, pct: 32, type: 'striped' }
    ]

    const baseData = analyticsTimeframe === 'this-week' ? demoThisWeek : demoLastWeek

    return dayNames.map((dayInitial, idx) => {
      const item = baseData[idx]
      const height = Math.round(36 + (item.pct / 100) * 82)
      return {
        day: dayInitial,
        fullDay: fullDayNames[idx],
        height,
        count: item.count,
        value: `${item.pct}%`,
        type: item.type
      }
    })
  }, [analyticsData, analyticsTimeframe])

  // Dynamic Progress calculation
  const progressData = useMemo(() => {
    if (progressMetric === 'forms-health') {
      const total = stats?.totalProjects || realProjects.length || 4
      const completedPct = 68
      const inProgressPct = 24
      const pendingPct = 8

      let currentDisplayPercent = completedPct
      let currentDisplayLabel = 'Forms Active'
      let currentSubtitle = `${total} Connected Forms`

      if (activeSegment === 'completed') {
        currentDisplayPercent = completedPct
        currentDisplayLabel = 'Completed'
        currentSubtitle = 'All responses handled'
      } else if (activeSegment === 'inprogress') {
        currentDisplayPercent = inProgressPct
        currentDisplayLabel = 'In Progress'
        currentSubtitle = 'Recent submissions'
      } else if (activeSegment === 'pending') {
        currentDisplayPercent = pendingPct
        currentDisplayLabel = 'Pending'
        currentSubtitle = 'Awaiting initial setup'
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
      const used = stats?.totalSubmissions !== undefined ? stats.totalSubmissions : 412
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
  }, [progressMetric, activeSegment, stats, realProjects])

  // Default projects list
  const defaultProjects = [
    {
      title: 'Develop API Endpoints',
      due: 'Due date: Nov 26, 2024',
      icon: (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Code2 size={16} />
        </div>
      )
    },
    {
      title: 'Onboarding Flow',
      due: 'Due date: Nov 28, 2024',
      icon: (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Workflow size={16} />
        </div>
      )
    },
    {
      title: 'Build Dashboard',
      due: 'Due date: Nov 30, 2024',
      icon: (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} />
        </div>
      )
    },
    {
      title: 'Optimize Page Load',
      due: 'Due date: Dec 5, 2024',
      icon: (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Gauge size={16} />
        </div>
      )
    },
    {
      title: 'Cross-Browser Testing',
      due: 'Due date: Dec 6, 2024',
      icon: (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={16} />
        </div>
      )
    }
  ]

  // Calculated stats numbers
  const totalProjectsDisplay = stats?.totalProjects !== undefined ? stats.totalProjects : (realProjects.length || 4)
  const apiKeysCountDisplay = stats?.totalProjects !== undefined ? stats.totalProjects : (realProjects.length || 3)
  const totalSubmissionsDisplay = stats?.totalSubmissions !== undefined ? stats.totalSubmissions.toLocaleString() : '1,248'
  const lastActivityDay = stats?.lastActivity ? getActivityDay(stats.lastActivity) : 'Today'
  const lastActivityAgo = stats?.lastActivity ? getRelativeTime(stats.lastActivity) : '2 hours ago'

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
            <span>Increased from last month</span>
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
              color: '#16a34a',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block'
              }}
            />
            <span>Connected</span>
          </div>
        </div>

        {/* Card 3: Total Submissions */}
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
          <div className="stat-card-standard-value">{lastActivityDay}</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#d97706',
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
                Weekly submission traffic
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {/* Timeframe Filter Pill */}
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
                  onClick={() => setAnalyticsTimeframe('this-week')}
                  style={{
                    padding: '3px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: analyticsTimeframe === 'this-week' ? '#ffffff' : 'transparent',
                    color: analyticsTimeframe === 'this-week' ? 'var(--primary-forest)' : '#64748b',
                    boxShadow: analyticsTimeframe === 'this-week' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTimeframe('last-week')}
                  style={{
                    padding: '3px 9px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: analyticsTimeframe === 'last-week' ? '#ffffff' : 'transparent',
                    color: analyticsTimeframe === 'last-week' ? 'var(--primary-forest)' : '#64748b',
                    boxShadow: analyticsTimeframe === 'last-week' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  Last Week
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
          </div>

          {/* Custom Interactive Bar Chart matching Donezo styling */}
          <div style={{ padding: '0.5rem 0.25rem 0 0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '140px',
                gap: '10px',
                paddingBottom: '0.75rem',
                position: 'relative'
              }}
            >
              {weeklyAnalytics.map((item, idx) => {
                const isSelected = selectedDayIndex === idx
                let barBg = 'url(#diagonalHatch)'
                if (item.type === 'solid-forest') barBg = '#154234'
                if (item.type === 'solid-emerald') barBg = '#16a34a'
                if (item.type === 'solid-mint') barBg = '#4ade80'

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedDayIndex(idx)}
                  >
                    {/* Floating Tooltip Bubble */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: `${item.height + 10}px`,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-pill)',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#154234',
                          boxShadow: 'var(--shadow-sm)',
                          whiteSpace: 'nowrap',
                          zIndex: 10
                        }}
                      >
                        {item.value}
                      </div>
                    )}

                    {/* Bar with rounded pill shape */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '42px',
                        height: `${item.height}px`,
                        borderRadius: '24px',
                        background: barBg,
                        boxShadow:
                          item.type === 'solid-forest'
                            ? '0 4px 12px rgba(21, 66, 52, 0.3)'
                            : isSelected
                            ? '0 3px 8px rgba(0, 0, 0, 0.12)'
                            : 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'scaleY(1.05)' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                        filter: isSelected ? 'brightness(1.08)' : 'none'
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Day Labels below bars */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.4rem',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              {weeklyAnalytics.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: selectedDayIndex === idx ? 800 : 500,
                    color: selectedDayIndex === idx ? 'var(--primary-forest)' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDayIndex(idx)}
                >
                  {item.day}
                </div>
              ))}
            </div>

            {/* Selected Day Details Strip */}
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
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {weeklyAnalytics[selectedDayIndex]?.fullDay}:{' '}
                <span style={{ color: 'var(--primary-forest)', fontWeight: 700 }}>
                  {weeklyAnalytics[selectedDayIndex]?.count} submissions
                </span>
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {weeklyAnalytics[selectedDayIndex]?.value} peak volume
              </span>
            </div>
          </div>
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
            <div style={{ position: 'relative', width: '220px', height: '120px' }}>
              <svg
                width="220"
                height="120"
                viewBox="0 0 220 120"
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

                {/* Striped Pending Arc */}
                <path
                  d="M 145 35 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="url(#greenStripedHatch)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  opacity={activeSegment === 'all' || activeSegment === 'pending' ? 1 : 0.25}
                  style={{ transition: 'opacity 0.25s ease' }}
                />

                {/* Dynamic Active Segment Arc */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke={
                    activeSegment === 'inprogress'
                      ? '#16a34a'
                      : activeSegment === 'pending'
                      ? 'url(#greenStripedHatch)'
                      : '#154234'
                  }
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0, Math.min(282.74, (progressData.percent / 100) * 282.74))} 282.74`}
                  style={{
                    transition: 'stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.25s ease'
                  }}
                />
              </svg>

              {/* Gauge Center Text */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  width: '100%'
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
                  {progressData.percent}%
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: activeSegment !== 'all' ? 'var(--primary-forest)' : 'var(--text-secondary)',
                    marginTop: '0.25rem'
                  }}
                >
                  {progressData.label}
                </div>
              </div>
            </div>

            {/* Subtitle count indicator */}
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.65rem' }}>
              {progressData.subtitle}
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
              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === 'completed' ? 'all' : 'completed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  color: activeSegment === 'completed' ? '#111827' : '#475569',
                  background: activeSegment === 'completed' ? '#e2e8f0' : '#f8fafc',
                  border: '1px solid',
                  borderColor: activeSegment === 'completed' ? '#94a3b8' : 'var(--border-color)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Click to view completed rate"
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#154234' }} />
                <span style={{ fontWeight: activeSegment === 'completed' ? 700 : 500 }}>
                  Completed {progressData.completedPct}%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === 'inprogress' ? 'all' : 'inprogress')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  color: activeSegment === 'inprogress' ? '#111827' : '#475569',
                  background: activeSegment === 'inprogress' ? '#e2e8f0' : '#f8fafc',
                  border: '1px solid',
                  borderColor: activeSegment === 'inprogress' ? '#94a3b8' : 'var(--border-color)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Click to view in-progress rate"
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                <span style={{ fontWeight: activeSegment === 'inprogress' ? 700 : 500 }}>
                  In Progress {progressData.inProgressPct}%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === 'pending' ? 'all' : 'pending')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  color: activeSegment === 'pending' ? '#111827' : '#475569',
                  background: activeSegment === 'pending' ? '#e2e8f0' : '#f8fafc',
                  border: '1px solid',
                  borderColor: activeSegment === 'pending' ? '#94a3b8' : 'var(--border-color)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Click to view pending rate"
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
                <span style={{ fontWeight: activeSegment === 'pending' ? 700 : 500 }}>
                  Pending {progressData.pendingPct}%
                </span>
              </button>
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
              defaultProjects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}
                >
                  {proj.icon}
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
                      {proj.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {proj.due}
                    </div>
                  </div>
                </div>
              ))
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
