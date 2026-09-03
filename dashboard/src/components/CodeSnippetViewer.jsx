import { useState } from 'react'
import { SUPPORTED_LANGUAGES, getCodeSnippet, getAgentPrompt, getEnvSnippet } from '../utils/codeSnippets'

export default function CodeSnippetViewer({ apiKey, projectName = 'My Project' }) {
  const [activeTab, setActiveTab] = useState('code') // 'code' | 'agent' | 'env'
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [copied, setCopied] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'https://formconnect.onrender.com'

  let contentToDisplay = ''
  if (activeTab === 'code') {
    contentToDisplay = getCodeSnippet(selectedLang, apiKey, apiUrl)
  } else if (activeTab === 'agent') {
    contentToDisplay = getAgentPrompt(selectedLang, apiKey, projectName, apiUrl)
  } else if (activeTab === 'env') {
    contentToDisplay = getEnvSnippet(apiKey, apiUrl)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#141414' }}>
      {/* Top Header / Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        backgroundColor: '#1f1f1f',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              fontSize: '0.8rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'code' ? 'var(--accent-color)' : 'transparent',
              color: activeTab === 'code' ? '#fff' : '#aaa',
              border: activeTab === 'code' ? '1px solid var(--accent-color)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            💻 Code Snippet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            style={{
              fontSize: '0.8rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'agent' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'agent' ? '#fff' : '#aaa',
              border: activeTab === 'agent' ? '1px solid #8b5cf6' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'agent' ? '600' : 'normal'
            }}
          >
            🤖 AI Agent Prompt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            style={{
              fontSize: '0.8rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'env' ? '#059669' : 'transparent',
              color: activeTab === 'env' ? '#fff' : '#aaa',
              border: activeTab === 'env' ? '1px solid #059669' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            🔒 .env
          </button>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: copied ? '#10b981' : '#333',
            color: '#fff',
            border: '1px solid #555',
            cursor: 'pointer'
          }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* Language Selector Sub-Bar (for Code Snippet & Agent Prompt) */}
      {activeTab !== 'env' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: '#181818',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          overflowX: 'auto'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap' }}>Language / Framework:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              backgroundColor: '#262626',
              color: '#eee',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '0.8rem',
              padding: '0.25rem 0.5rem',
              outline: 'none',
              cursor: 'pointer',
              marginBottom: 0,
              width: 'auto'
            }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Snippet / Code Content View */}
      <div style={{ position: 'relative' }}>
        <pre style={{
          backgroundColor: '#0d0d0d',
          padding: '1rem',
          margin: 0,
          overflowX: 'auto',
          fontSize: '0.82rem',
          lineHeight: '1.45',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: '#e0e0e0',
          maxHeight: '320px'
        }}>
          <code>{contentToDisplay}</code>
        </pre>
      </div>

      {activeTab === 'agent' && (
        <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#18181b', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#9ca3af' }}>
          💡 <strong>Tip:</strong> Copy and paste this prompt directly into your AI assistant (Cursor, Copilot, Antigravity, ChatGPT, Claude) to let it wire up FormConnect automatically.
        </div>
      )}
    </div>
  )
}
