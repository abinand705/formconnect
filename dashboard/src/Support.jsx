import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Send } from 'lucide-react'

const faqs = [
  {
    q: "How do I connect a project to my website?",
    a: "Create a project, copy its API key, and use it in the fetch snippet shown after creation (or view it again anytime from the Projects tab's Details view)."
  },
  {
    q: "What happens if I regenerate an API key?",
    a: "The old key stops working immediately. Update it wherever it's connected (your website's contact form) right after regenerating."
  },
  {
    q: "Can I control which submitted fields appear in my email notifications?",
    a: "Yes — set this per-project when creating it, or from the project's settings."
  },
  {
    q: "Is my data private?",
    a: "Yes, each account only sees its own projects and submissions."
  }
]

function FAQItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="card" style={{ marginBottom: '0.75rem', padding: '1.25rem', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontWeight: 500 }}>{q}</h4>
        {isOpen ? <ChevronUp size={20} color="#8b92a5" /> : <ChevronDown size={20} color="#8b92a5" />}
      </div>
      {isOpen && (
        <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.95rem', lineHeight: 1.5, borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          {a}
        </div>
      )}
    </div>
  )
}

function Support() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: import.meta.env.VITE_SUPPORT_API_KEY,
          data: { name, email, message }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again.')
      }

      setSuccessMsg("Message sent — I'll get back to you soon.")
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem', marginTop: 0 }}>Support & FAQ</h2>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#8b92a5' }}>Frequently Asked Questions</h3>
        {faqs.map((faq, index) => (
          <FAQItem key={index} q={faq.q} a={faq.a} />
        ))}
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#8b92a5' }}>Quick Links</h3>
        <a
          href="https://github.com/abinand705/formconnect"
          target="_blank"
          rel="noopener noreferrer"
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', transition: 'border-color 0.2s', width: 'fit-content' }}
        >
          <ExternalLink size={24} color="var(--accent-color)" />
          <div>
            <div style={{ color: 'white', fontWeight: 500, marginBottom: '0.25rem' }}>GitHub Repository</div>
            <div style={{ color: '#aaa', fontSize: '0.85rem' }}>View source code or report issues</div>
          </div>
        </a>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: '#8b92a5' }}>Still need help or facing any issues? Send a message</h3>
        <div className="card">
          {successMsg && <div style={{ color: '#4caf50', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>{successMsg}</div>}
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <form onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                style={{
                  width: '100%',
                  minHeight: '120px',
                  backgroundColor: '#242424',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6em 1.2em',
                  color: 'white',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Support
