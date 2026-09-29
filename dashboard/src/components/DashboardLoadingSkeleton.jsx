import React from 'react'
import { BrandLogoIcon } from './BrandLogo'
import { Loader2, Zap, ArrowUpRight, Activity, Plug, Calendar } from 'lucide-react'

export default function DashboardLoadingSkeleton({ loadingMessage }) {
  const isWakingUp = loadingMessage && loadingMessage.toLowerCase().includes('waking up')

  return (
    <div className="dashboard-loading-view" aria-busy="true" aria-live="polite">
      {/* ==================== LIVE BACKEND STATUS BANNER ==================== */}
      <div className={`dashboard-loading-hero ${isWakingUp ? 'is-waking' : ''}`}>
        {/* Animated glowing indeterminate progress line */}
        <div className="dashboard-loading-progress-line" />

        <div className="dashboard-loading-hero-content">
          <div className="dashboard-loading-brand-group">
            <div className="dashboard-loading-icon-wrapper">
              <span className="dashboard-loading-pulse-ring" />
              <span className="dashboard-loading-pulse-ring delay" />
              <BrandLogoIcon size={34} />
            </div>

            <div className="dashboard-loading-text-group">
              <div className="dashboard-loading-title-row">
                <span className="dashboard-loading-title">Connecting to FormConnect Backend</span>
                <span className={`dashboard-loading-badge ${isWakingUp ? 'waking' : 'connecting'}`}>
                  {isWakingUp ? (
                    <>
                      <Zap size={12} className="fc-pulse-fast" />
                      <span>Waking Server</span>
                    </>
                  ) : (
                    <>
                      <span className="fc-dot-pulse" />
                      <span>Live Syncing</span>
                    </>
                  )}
                </span>
              </div>

              <p className="dashboard-loading-subtitle">
                {isWakingUp
                  ? 'Cloud backend is spinning up after inactivity. Your forms & analytics will appear momentarily...'
                  : 'Initializing services and retrieving real-time projects, submissions, and telemetry...'}
              </p>
            </div>
          </div>

          <div className="dashboard-loading-spinner-group">
            <Loader2 size={20} className="dashboard-spin-icon" />
            <span className="dashboard-loading-time-hint">
              {isWakingUp ? 'Warming up...' : 'Loading data...'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== SKELETON HEADER ==================== */}
      <div className="dashboard-header-row" style={{ marginBottom: '1.5rem' }}>
        <div className="dashboard-title-group">
          <div className="skeleton-shimmer" style={{ width: '160px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton-shimmer" style={{ width: '310px', height: '14px', borderRadius: '6px', marginTop: '8px' }} />
        </div>

        <div className="dashboard-actions-group">
          <div
            className="skeleton-shimmer"
            style={{ width: '135px', height: '40px', borderRadius: 'var(--radius-pill)' }}
          />
        </div>
      </div>

      {/* ==================== 4 STAT CARDS SKELETON ROW ==================== */}
      <div className="stat-cards-grid">
        {/* Card 1: Featured Dark Forest Card Skeleton */}
        <div className="stat-card-featured skeleton-featured-wrapper">
          <div className="stat-card-featured-top">
            <div className="skeleton-shimmer-dark" style={{ width: '90px', height: '15px', borderRadius: '4px' }} />
            <div className="stat-card-featured-arrow" style={{ opacity: 0.6 }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="skeleton-shimmer-dark" style={{ width: '75px', height: '46px', borderRadius: '8px', margin: '0.6rem 0' }} />
          <div className="skeleton-shimmer-dark" style={{ width: '120px', height: '22px', borderRadius: 'var(--radius-pill)' }} />
        </div>

        {/* Card 2: API Keys Card Skeleton */}
        <div className="stat-card-standard">
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a'
                }}
              >
                <Plug size={18} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '75px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div className="stat-card-standard-arrow" style={{ opacity: 0.5 }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '60px', height: '44px', borderRadius: '8px', margin: '0.6rem 0' }} />
          <div className="skeleton-shimmer" style={{ width: '90px', height: '20px', borderRadius: 'var(--radius-pill)' }} />
        </div>

        {/* Card 3: Total Submissions Card Skeleton */}
        <div className="stat-card-standard">
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}
              >
                <Activity size={18} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '110px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div className="stat-card-standard-arrow" style={{ opacity: 0.5 }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '70px', height: '44px', borderRadius: '8px', margin: '0.6rem 0' }} />
          <div className="skeleton-shimmer" style={{ width: '75px', height: '20px', borderRadius: 'var(--radius-pill)' }} />
        </div>

        {/* Card 4: Last Activity Card Skeleton */}
        <div className="stat-card-standard">
          <div className="stat-card-standard-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706'
                }}
              >
                <Calendar size={18} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '85px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div className="stat-card-standard-arrow" style={{ opacity: 0.5 }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="skeleton-shimmer" style={{ width: '65px', height: '44px', borderRadius: '8px', margin: '0.6rem 0' }} />
          <div className="skeleton-shimmer" style={{ width: '100px', height: '20px', borderRadius: 'var(--radius-pill)' }} />
        </div>
      </div>

      {/* ==================== MAIN 3-COLUMN SKELETON GRID ==================== */}
      <div className="dashboard-main-grid">
        {/* Card 1: Project Analytics Chart Skeleton */}
        <div className="card" style={{ padding: '1.4rem', margin: 0 }}>
          <div className="section-card-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="skeleton-shimmer" style={{ width: '130px', height: '18px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ width: '100px', height: '12px', borderRadius: '4px', marginTop: '6px' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="skeleton-shimmer" style={{ width: '140px', height: '26px', borderRadius: 'var(--radius-pill)' }} />
              <div className="skeleton-shimmer" style={{ width: '75px', height: '26px', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>

          {/* Shimmer Bar Chart Preview */}
          <div className="skeleton-chart-container">
            {/* Guide lines */}
            <div className="skeleton-grid-lines">
              <div className="skeleton-grid-line" />
              <div className="skeleton-grid-line" />
              <div className="skeleton-grid-line" />
              <div className="skeleton-grid-line" />
            </div>

            {/* Vertical Bar Columns */}
            <div className="skeleton-bars-row">
              {[
                { height: '45%', delay: '0.05s' },
                { height: '80%', delay: '0.15s' },
                { height: '60%', delay: '0.25s' },
                { height: '95%', delay: '0.35s' },
                { height: '50%', delay: '0.45s' },
                { height: '70%', delay: '0.55s' }
              ].map((bar, i) => (
                <div key={i} className="skeleton-bar-column">
                  <div
                    className="skeleton-bar-pillar skeleton-shimmer"
                    style={{
                      height: bar.height,
                      animationDelay: bar.delay
                    }}
                  />
                  <div
                    className="skeleton-shimmer"
                    style={{ width: '32px', height: '10px', borderRadius: '3px', marginTop: '8px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Project Progress Gauge Skeleton */}
        <div className="card" style={{ padding: '1.4rem', margin: 0 }}>
          <div className="section-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '110px', height: '26px', borderRadius: 'var(--radius-pill)' }} />
          </div>

          <div className="skeleton-gauge-container">
            {/* Pulsing Arc SVG */}
            <div className="skeleton-gauge-svg-wrap">
              <svg width="220" height="124" viewBox="0 0 220 124">
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 110 A 90 90 0 0 1 145 32"
                  fill="none"
                  stroke="url(#skeletonGreenGrad)"
                  strokeWidth="24"
                  strokeLinecap="round"
                  className="skeleton-gauge-pulse-path"
                />
                <defs>
                  <linearGradient id="skeletonGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#154234" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Gauge Center Placeholder */}
              <div className="skeleton-gauge-center">
                <div className="skeleton-shimmer" style={{ width: '70px', height: '36px', borderRadius: '6px', margin: '0 auto' }} />
                <div className="skeleton-shimmer" style={{ width: '80px', height: '12px', borderRadius: '4px', marginTop: '6px' }} />
              </div>
            </div>

            <div className="skeleton-shimmer" style={{ width: '130px', height: '12px', borderRadius: '4px', margin: '0.85rem auto 1rem' }} />

            {/* Gauge Legend Pills Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="skeleton-shimmer" style={{ width: '85px', height: '24px', borderRadius: 'var(--radius-pill)' }} />
              <div className="skeleton-shimmer" style={{ width: '110px', height: '24px', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Project List Skeleton */}
        <div className="card" style={{ padding: '1.4rem', margin: 0 }}>
          <div className="section-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '60px', height: '26px', borderRadius: 'var(--radius-pill)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  className="skeleton-shimmer"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: `${item % 2 === 0 ? '70%' : '55%'}`, height: '14px', borderRadius: '4px' }}
                  />
                  <div
                    className="skeleton-shimmer"
                    style={{ width: '35%', height: '11px', borderRadius: '3px', marginTop: '5px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
