import React from 'react'
import logo from '../assets/logo.svg'

export function BrandLogoIcon({ size = 36 }) {
  return (
    <img
      src={logo}
      alt="FormConnect Logo"
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain', flexShrink: 0 }}
    />
  )
}

export function BrandLogo({ size = 36 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', userSelect: 'none' }}>
      <BrandLogoIcon size={size} />
      <span
        style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span style={{ color: '#0E386A' }}>Form</span>
        <span style={{ color: '#09A6D9' }}>Connect</span>
      </span>
    </div>
  )
}

export default BrandLogo
