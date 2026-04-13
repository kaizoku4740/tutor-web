import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import SignupPage from './SignupPage'
import TADashboard from './TADashboard'
import './App.css'

const CONTACT_ENDPOINT = 'https://formsubmit.co/kaizoku4740@gmail.com'
const ADMIN_PASSWORD = 'password'

function formatDate(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function stars(rating) {
  const count = Number(rating || 0)
  return count > 0 ? '*'.repeat(count) : ''
}

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const clickCount = useRef(0)
  const clickTimer = useRef(null)
  const taClickCount = useRef(0)
  const taClickTimer = useRef(null)

  function handleAdminTrigger() {
    clickCount.current += 1

    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
    }

    if (clickCount.current >= 3) {
      clickCount.current = 0
      navigate('/admin')
      return
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, 1000)
  }

  function handleTADashboardTrigger() {
    taClickCount.current += 1

    if (taClickTimer.current) {
      clearTimeout(taClickTimer.current)
    }

    if (taClickCount.current >= 5) {
      taClickCount.current = 0
      navigate('/ta-dashboard')
      return
    }

    taClickTimer.current = setTimeout(() => {
      taClickCount.current = 0
    }, 1000)
  }

  return (
    <div className="app-shell">
      <header className="site-header panel">
        <div className="nav-wrap">
          <Link to="/" className="brand-link">
            Math Academy by Mrs Garg
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/tas">TAs</NavLink>
            <NavLink to="/signup">Signup</NavLink>
            <NavLink to="/reviews">Reviews</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
        </div>
      </header>

      <main className="route-frame">
        <div key={location.pathname} className="route-shell">
          {children}
        </div>
      </main>

      <footer className="site-footer panel">
        <small 
          id="admin-trigger" 
          onClick={() => {
            handleAdminTrigger()
            handleTADashboardTrigger()
          }}
        >
          &copy; {new Date().getFullYear()} Math Academy by Mrs Garg
        </small>
      </footer>
    </div>
  )
}

function HomePage({ tas }) {
  const [selectedTa, setSelectedTa] = useState('teacher')
  const [reviews, setReviews] = useState([])

  const selectedTaMeta = useMemo(
    () => tas.find((ta) => ta.id === selectedTa) || null,
    [tas, selectedTa],
  )

  useEffect(() => {
    if (tas.length && !tas.some((ta) => ta.id === selectedTa)) {
      setSelectedTa(tas[0].id)
    }
  }, [tas, selectedTa])

  useEffect(() => {
    if (!selectedTa) return
    let cancelled = false

    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews/${selectedTa}`)
        if (!res.ok) throw new Error('reviews failed')
        const data = await res.json()
        if (!cancelled) {
          const recent = Array.isArray(data)
            ? data.slice().sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0)).slice(0, 3)
            : []
          setReviews(recent)
        }
      } catch {
        if (!cancelled) setReviews([])
      }
    }

    loadReviews()
    return () => {
      cancelled = true
    }
  }, [selectedTa])

  return (
    <div className="page-shell">
      <header className="hero panel">
        <p className="eyebrow">Mrs Garg Math Academy</p>
        <h1>
          Clearer learning.
          <br />
          Modern tutoring experience.
        </h1>
        <p className="hero-copy">
          personalized math support with trusted tutors
        </p>
        <div className="hero-highlights">
          <article className="hero-highlight-card">
            <h3>1:1 Guidance</h3>
            <p>Focused tutoring sessions tailored to each student.</p>
          </article>
          <article className="hero-highlight-card">
            <h3>Fast Feedback</h3>
            <p>Regular check-ins to keep progress clear for families.</p>
          </article>
          <article className="hero-highlight-card">
            <h3>Strong Results</h3>
            <p>Concept-first teaching that builds long-term confidence.</p>
          </article>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-ghost" to="/contact">
            Contact Us
          </Link>
        </div>
      </header>

      <section className="panel info-strip">
        <div className="panel-head">
          <h2>What This Site Is For</h2>
        </div>
        <div className="info-grid">
          <article className="info-card">
            <h3>Find the right tutor</h3>
            <p>
              Browse tutor profiles, check their focus areas, and choose who best matches your
              student&apos;s learning style.
            </p>
          </article>
          <article className="info-card">
            <h3>Read real parent feedback</h3>
            <p>
              Reviews are organized by tutor so you can quickly understand strengths, teaching
              style, and outcomes.
            </p>
          </article>
          <article className="info-card">
            <h3>Take action quickly</h3>
            <p>
              Jump from discovery to contact in one flow without hunting through separate pages.
            </p>
          </article>
        </div>
      </section>

      <section className="panel" id="home-sections">
        <div className="panel-head">
          <h2>Select an Instructor</h2>
          <select value={selectedTa} onChange={(e) => setSelectedTa(e.target.value)}>
            {tas.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ta-card">
          <h3>{selectedTaMeta?.name || 'Tutor'}</h3>
          <p className="ta-title">{selectedTaMeta?.title || 'Instructor'}</p>
          <p>{selectedTaMeta?.bio || 'Profile details coming soon.'}</p>
          <p className="chips-wrap">
            {(selectedTaMeta?.subjects || []).map((subject) => (
              <span className="chip" key={subject}>
                {subject}
              </span>
            ))}
          </p>
          <div className="spacer-top-sm">
            <Link className="inline-link" to={`/reviews/${selectedTa}`}>
              Open full review page
            </Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Recent Family Reviews</h2>
          <Link to="/reviews" className="inline-link">
            View all reviews
          </Link>
        </div>

        <div className="review-grid">
          {reviews.length === 0 && <p>No reviews yet for this tutor.</p>}
          {reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-meta">
                <strong>{review.name}</strong>
                <span>{formatDate(review.ts)}</span>
              </div>
              <p className="stars">{stars(review.rating)}</p>
              <p>{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function AboutPage() {
  return (
    <section className="panel about-layout">
      <h1>About</h1>
      <p>
        Math Academy by Mrs Garg helps students build confidence and strong foundations in
        math through focused tutoring and consistent guidance.
      </p>
      <div className="about-grid">
        <article className="feature-card">
          <h3>Personalized Sessions</h3>
          <p>Each student gets support based on their learning level and goals.</p>
        </article>
        <article className="feature-card">
          <h3>Clear Explanations</h3>
          <p>Concepts are broken down step-by-step with practical examples.</p>
        </article>
        <article className="feature-card">
          <h3>Reliable Progress</h3>
          <p>Families receive consistent updates and feedback over time.</p>
        </article>
      </div>
    </section>
  )
}

function TAsPage({ tas }) {
  return (
    <section className="panel">
      <h1>Our Team</h1>
      <p>Meet the expert tutors at Math Academy by Mrs Garg.</p>
      <div className="ta-grid">
        {tas.map((ta) => (
          <article key={ta.id} className="ta-grid-card">
            <h3>{ta.name}</h3>
            <p className="ta-title">{ta.title}</p>
            <p>{ta.bio}</p>
            <div className="spacer-top-sm">
              <Link className="btn btn-small" to={`/reviews/${ta.id}`}>
                View reviews
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ContactPage() {
  const [status, setStatus] = useState('Submit and we will get back to you as soon as possible.')

  return (
    <section className="panel contact-layout">
      <h1>Contact</h1>
      <p>Send us a message.</p>
      <form className="contact-form" action={CONTACT_ENDPOINT} method="POST" onSubmit={() => setStatus('Sending...')}>
        <input type="hidden" name="_subject" value="New Math Academy contact form message" />
        <input type="hidden" name="_template" value="table" />
        <input type="text" name="_honey" className="hidden-honey" tabIndex="-1" autoComplete="off" />
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Message
          <textarea name="message" rows="5" required />
        </label>
        <div className="actions">
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
        <p className="form-status">{status}</p>
      </form>
    </section>
  )
}

function ReviewsPage({ tas }) {
  const [filterTa, setFilterTa] = useState('')
  const [sortMode, setSortMode] = useState('newest')
  const [allReviews, setAllReviews] = useState({})

  useEffect(() => {
    if (!tas.length) return
    let cancelled = false

    async function load() {
      try {
        const entries = await Promise.all(
          tas.map(async (ta) => {
            const res = await fetch(`/api/reviews/${ta.id}`)
            if (!res.ok) throw new Error('reviews failed')
            const data = await res.json()
            return [ta.id, Array.isArray(data) ? data : []]
          }),
        )
        if (!cancelled) setAllReviews(Object.fromEntries(entries))
      } catch {
        if (!cancelled) setAllReviews({})
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tas])

  const visible = useMemo(() => {
    const source = filterTa
      ? (allReviews[filterTa] || []).map((r) => ({ ...r, taId: filterTa }))
      : Object.entries(allReviews).flatMap(([taId, items]) =>
          (items || []).map((r) => ({ ...r, taId })),
        )
    return source.slice().sort((a, b) => {
      if (sortMode === 'highest') return Number(b.rating || 0) - Number(a.rating || 0)
      return Number(b.ts || 0) - Number(a.ts || 0)
    })
  }, [allReviews, filterTa, sortMode])

  const avg =
    visible.length > 0
      ? (visible.reduce((sum, r) => sum + Number(r.rating || 0), 0) / visible.length).toFixed(1)
      : '0.0'

  return (
    <section className="panel">
      <h1>All Reviews</h1>
      <div className="filter-row">
        <label>
          Filter by tutor
          <select value={filterTa} onChange={(e) => setFilterTa(e.target.value)}>
            <option value="">All Tutors</option>
            {tas.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
          </select>
        </label>
      </div>

      <div className="stats-bar">
        <strong>{visible.length}</strong> review{visible.length === 1 ? '' : 's'} and{' '}
        <strong>{avg}</strong> average rating
      </div>

      <div className="review-list-stack">
        {visible.length === 0 && <p>No reviews yet.</p>}
        {visible.map((review) => (
          <article className="review-card" key={`${review.taId}-${review.id}`}>
            <div className="review-meta">
              <div>
                <strong>{review.name}</strong>
                <div className="ta-title">{formatDate(review.ts)}</div>
              </div>
              <Link to={`/reviews/${review.taId}`} className="chip">
                {tas.find((ta) => ta.id === review.taId)?.name || review.taId}
              </Link>
            </div>
            <p className="stars">{stars(review.rating)}</p>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function TAReviewPage({ tas }) {
  const { taId } = useParams()
  const [reviews, setReviews] = useState([])
  const [sortMode, setSortMode] = useState('newest')
  const [formState, setFormState] = useState({ name: '', rating: '5', text: '' })
  const ta = tas.find((item) => item.id === taId)

  async function loadReviews() {
    try {
      const res = await fetch(`/api/reviews/${taId}`)
      if (!res.ok) throw new Error('reviews failed')
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      setReviews([])
    }
  }

  useEffect(() => {
    loadReviews()
  }, [taId])

  async function onSubmit(e) {
    e.preventDefault()
    const payload = {
      name: formState.name.trim(),
      rating: Number(formState.rating),
      text: formState.text.trim(),
    }
    if (!payload.name || !payload.text) return
    try {
      const res = await fetch(`/api/reviews/${taId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('submit failed')
      setFormState({ name: '', rating: '5', text: '' })
      await loadReviews()
    } catch {
      // Keep silent to avoid disrupting UX.
    }
  }

  const visible = reviews.slice().sort((a, b) => {
    if (sortMode === 'highest') return Number(b.rating || 0) - Number(a.rating || 0)
    return Number(b.ts || 0) - Number(a.ts || 0)
  })

  if (!ta) {
    return (
      <section className="panel">
        <h1>Review Page</h1>
        <p>Could not find that tutor.</p>
      </section>
    )
  }

  return (
    <section className="panel review-page-layout">
      <div className="panel-head">
        <h1>Reviews for {ta.name}</h1>
        <Link to="/reviews" className="inline-link">
          Back to all reviews
        </Link>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            value={formState.name}
            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
            required
          />
        </label>
        <label>
          Rating
          <select
            value={formState.rating}
            onChange={(e) => setFormState((s) => ({ ...s, rating: e.target.value }))}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Okay</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </label>
        <label>
          Review
          <textarea
            rows="4"
            value={formState.text}
            onChange={(e) => setFormState((s) => ({ ...s, text: e.target.value }))}
            required
          />
        </label>
        <div className="actions">
          <button className="btn btn-primary" type="submit">
            Submit review
          </button>
        </div>
      </form>

      <div className="panel-head top-gap">
        <h2>All reviews</h2>
        <label>
          Sort
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="highest">Highest</option>
          </select>
        </label>
      </div>
      <div className="review-list-stack">
        {visible.length === 0 && <p>No reviews yet.</p>}
        {visible.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-meta">
              <strong>{review.name}</strong>
              <span>{formatDate(review.ts)}</span>
            </div>
            <p className="stars">{stars(review.rating)}</p>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AdminPage({ tas }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [activeTab, setActiveTab] = useState('reviews') // 'reviews', 'messages'
  const [filterTa, setFilterTa] = useState('')
  const [allReviews, setAllReviews] = useState({})
  const [messages, setMessages] = useState([])

  async function loadAllReviews() {
    try {
      const entries = await Promise.all(
        tas.map(async (ta) => {
          const res = await fetch(`/api/reviews/${ta.id}`)
          if (!res.ok) return [ta.id, []]
          const data = await res.json()
          return [ta.id, Array.isArray(data) ? data : []]
        }),
      )
      setAllReviews(Object.fromEntries(entries))
    } catch {
      setAllReviews({})
    }
  }

  async function loadMessages() {
    try {
      const res = await fetch('/api/contact-messages', {
        headers: { 'X-Admin-Key': ADMIN_PASSWORD },
      })
      if (!res.ok) {
        setMessages([])
        return
      }
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch {
      setMessages([])
    }
  }

  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      setLoginStatus('')
      setPasswordInput('')
      loadAllReviews()
      loadMessages()
      return
    }
    setLoginStatus('Wrong password. Try again.')
  }

  async function deleteReview(taId, reviewId) {
    try {
      const res = await fetch(`/api/reviews/${taId}/${reviewId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': ADMIN_PASSWORD },
      })
      if (!res.ok) return
      setAllReviews((prev) => ({
        ...prev,
        [taId]: (prev[taId] || []).filter((r) => r.id !== reviewId),
      }))
    } catch {
      // Ignore failed deletion attempt.
    }
  }

  async function clearMessages() {
    try {
      const res = await fetch('/api/contact-messages', {
        method: 'DELETE',
        headers: { 'X-Admin-Key': ADMIN_PASSWORD },
      })
      if (!res.ok) return
      setMessages([])
    } catch {
      // Ignore failed clear attempt.
    }
  }

  const visibleEntries = filterTa
    ? [[filterTa, allReviews[filterTa] || []]]
    : tas.map((ta) => [ta.id, allReviews[ta.id] || []])

  return (
    <section className="panel admin-layout">
      <h1>Admin Panel</h1>
      {!isLoggedIn ? (
        <div className="admin-login">
          <label>
            Admin password
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={handleLogin}>
              Login
            </button>
          </div>
          {loginStatus && <p className="error-msg">{loginStatus}</p>}
        </div>
      ) : (
        <>
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <Link to="/ta-dashboard" className="btn btn-small" style={{ marginLeft: 'auto' }}>
              TA Dashboard
            </Link>
            <button className="btn btn-small logout-btn" type="button" onClick={() => setIsLoggedIn(false)}>
              Logout
            </button>
          </div>

          {activeTab === 'reviews' && (
            <>
              <label>
                Filter by tutor
                <select value={filterTa} onChange={(e) => setFilterTa(e.target.value)}>
                  <option value="">All TAs</option>
                  {tas.map((ta) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="review-list-stack">
                {visibleEntries.map(([taId, reviews]) => (
                  <div key={taId}>
                    <h3>{tas.find((ta) => ta.id === taId)?.name || taId}</h3>
                    {(reviews || []).length === 0 && <p className="ta-title">No reviews yet.</p>}
                    {(reviews || []).map((r) => (
                      <article className="review-card" key={`${taId}-${r.id}`}>
                        <div className="review-meta">
                          <div>
                            <strong>{r.name}</strong>
                            <div className="ta-title">{formatDate(r.ts)}</div>
                          </div>
                          <button
                            className="btn btn-small"
                            type="button"
                            onClick={() => deleteReview(taId, r.id)}
                          >
                            Delete
                          </button>
                        </div>
                        <p className="stars">{stars(r.rating)}</p>
                        <p>{r.text}</p>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="panel-head">
                <h2>Contact Messages</h2>
                <button className="btn btn-small" type="button" onClick={clearMessages}>
                  Clear all
                </button>
              </div>
              <div className="review-list-stack">
                {messages.length === 0 && (
                  <p className="ta-title">No contact messages yet.</p>
                )}
                {messages.map((msg) => (
                  <article className="review-card" key={msg.id}>
                    <div className="review-meta">
                      <div>
                        <strong>{msg.name || 'Unknown'}</strong>
                        <div className="ta-title">{formatDate(msg.ts)}</div>
                      </div>
                      <span>{msg.email || 'No email'}</span>
                    </div>
                    <p>{msg.message || ''}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

function App() {
  const [tas, setTas] = useState([])

  useEffect(() => {
    let cancelled = false
    async function loadTas() {
      try {
        const res = await fetch('/data/tas.json')
        if (!res.ok) throw new Error('ta data failed')
        const data = await res.json()
        if (!cancelled) setTas(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setTas([])
      }
    }
    loadTas()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage tas={tas} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tas" element={<TAsPage tas={tas} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reviews" element={<ReviewsPage tas={tas} />} />
          <Route path="/reviews/:taId" element={<TAReviewPage tas={tas} />} />
          <Route path="/admin" element={<AdminPage tas={tas} />} />
          <Route path="/ta-dashboard" element={<TADashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
