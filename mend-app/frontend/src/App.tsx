import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import EventsPage from './pages/EventsPage'
import ModeratorPage from './pages/ModeratorPage'
import SettingsPage from './pages/SettingsPage'
import { api } from './api'

export type Page = 'home' | 'auth' | 'dashboard' | 'profile' | 'notifications' | 'events' | 'moderator' | 'settings'

export interface UserInfo {
  id: number
  name: string
  email: string
  role: string
}

function MendLogo({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <ellipse cx="22" cy="22" rx="15" ry="15" stroke="black" strokeWidth="1.5" />
        <line x1="22" y1="3" x2="22" y2="7" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-24 22 22)" />
        <line x1="22" y1="3" x2="22" y2="7" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(24 22 22)" />
        <line x1="22" y1="3" x2="22" y2="6" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(81 22 22)" />
        <line x1="22" y1="3" x2="22" y2="6" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-144 22 22)" />
        <line x1="22" y1="3" x2="22" y2="5" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-78 22 22)" />
        <line x1="22" y1="3" x2="22" y2="5" stroke="black" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-114 22 22)" />
      </svg>
      <span style={{ fontFamily: "'Kablammo', cursive", fontVariationSettings: '"MORF" 40', fontSize: '28px', lineHeight: 1, letterSpacing: '-0.5px' }}>
        Mend
      </span>
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('mend_token')
    if (token) {
      api.getMe()
        .then(res => setUser(res.user))
        .catch(() => localStorage.removeItem('mend_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loggedIn = !!user

  const handleLogin = (u: UserInfo, t: string) => {
    localStorage.setItem('mend_token', t)
    setUser(u)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('mend_token')
    setUser(null)
    setPage('home')
  }

  const navLinks: { id: Page; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'events', label: 'Events' },
    { id: 'notifications', label: 'Alerts' },
    ...(user?.role === 'moderator' || user?.role === 'admin' ? [{ id: 'moderator' as Page, label: 'Moderate' }] : []),
  ]

  const navigate = (p: Page) => {
    setPage(p)
    setMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }

  if (loading) {
    return null
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", minHeight: '100vh', backgroundColor: '#f8f5e8' }}>
      <header style={{ backgroundColor: '#dbd8aa', borderBottom: '1px solid black', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <MendLogo onClick={() => navigate('home')} />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => navigate(link.id)}
                className="mend-btn"
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  background: page === link.id ? '#190101' : 'transparent',
                  color: page === link.id ? 'white' : '#190101',
                  border: page === link.id ? '1px solid #190101' : '1px solid transparent',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {loggedIn ? (
              <button
                onClick={() => navigate('profile')}
                style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#424c39', color: 'white', border: '2px solid black', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}
              >
                {user!.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="mend-btn"
                style={{ padding: '8px 16px', borderRadius: 4, fontSize: 13, background: 'transparent', color: '#190101' }}
              >
                Sign in
              </button>
            )}
            <button
              onClick={() => setShowReport(true)}
              className="mend-btn"
              style={{ padding: '8px 18px', borderRadius: 4, fontSize: 13, background: '#721d1d', color: 'white' }}
            >
              Report a resource
            </button>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4 }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{ backgroundColor: '#dbd8aa', borderTop: '1px solid black', padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }} className="md:hidden">
            {[...navLinks, { id: 'profile' as Page, label: 'Profile' }, { id: 'settings' as Page, label: 'Settings' }].map(link => (
              <button
                key={link.id}
                onClick={() => navigate(link.id)}
                style={{ textAlign: 'left', background: 'none', border: 'none', padding: '8px 4px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.1)', color: '#190101' }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main style={{ paddingBottom: 72 }} className="page-enter">
        {page === 'home' && <HomePage navigate={navigate} onReport={() => setShowReport(true)} />}
        {page === 'auth' && <AuthPage navigate={navigate} onLogin={handleLogin} />}
        {page === 'dashboard' && <DashboardPage navigate={navigate} />}
        {page === 'profile' && <ProfilePage navigate={navigate} user={user!} onLogout={handleLogout} />}
        {page === 'notifications' && <NotificationsPage navigate={navigate} />}
        {page === 'events' && <EventsPage navigate={navigate} />}
        {page === 'moderator' && <ModeratorPage navigate={navigate} />}
        {page === 'settings' && <SettingsPage navigate={navigate} />}
      </main>

      <nav
        className="md:hidden"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#190101', display: 'flex', justifyContent: 'space-around', padding: '10px 0 18px', borderTop: '2px solid black' }}
      >
        {[
          { id: 'home' as Page, icon: '⌂', label: 'Home' },
          { id: 'events' as Page, icon: '◉', label: 'Map' },
          { id: 'notifications' as Page, icon: '🔔', label: 'Alerts' },
          { id: 'dashboard' as Page, icon: '⊞', label: 'Saved' },
          { id: 'profile' as Page, icon: '◎', label: 'Profile' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: page === item.id ? '#bd8c2a' : 'rgba(255,255,255,0.55)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700 }}
          >
            <span style={{ fontSize: 19 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}

function ReportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'notes' | 'agree' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', category: 'Repair', description: '', neighborhood: '', contact: '' })
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.createResource(form)
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ backgroundColor: '#424c39', border: '2px solid rgba(0,0,0,0.89)', borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 40 }}>
        {step === 'form' && (
          <>
            <h2 style={{ color: '#f6f6f6', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Know a resource we&apos;re missing?</h2>
            <p style={{ color: 'rgba(246,246,246,0.7)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
              Submissions go to a moderation queue and appear as &ldquo;pending review&rdquo; until a community moderator confirms the details.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: 'white', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Resource name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g Fix-it Table" style={{ width: '100%', backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 24, padding: '16px 20px', color: 'white', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ color: 'white', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 24, padding: '16px 20px', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                  {['Repair', 'Reuse', 'Donate', 'Borrow', 'Refuse', 'Exchange'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: 'white', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>What can people do here?</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g - Volunteers fix every small appliances every second saturday." style={{ width: '100%', backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 20, padding: '20px', color: 'white', fontSize: 14, minHeight: 120, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div>
                <label style={{ color: 'white', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Neighborhood / area</label>
                <input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} placeholder="e.g - Palasia" style={{ width: '100%', backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 24, padding: '16px 20px', color: 'white', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ color: 'white', fontSize: 14, fontWeight: 700, display: 'block', marginBottom: 8 }}>Your contact (optional)</label>
                <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Email or phone, for follow up" style={{ width: '100%', backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 24, padding: '16px 20px', color: 'white', fontSize: 14 }} />
              </div>
            </div>
            {error && <p style={{ color: '#ff6666', fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onClose} className="mend-btn" style={{ flex: 1, padding: '16px', borderRadius: 24, background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Cancel</button>
              <button onClick={() => setStep('notes')} className="mend-btn" style={{ flex: 2, padding: '16px', borderRadius: 24, background: '#ceb423', color: 'black', fontSize: 14, fontWeight: 700 }}>Continue →</button>
            </div>
          </>
        )}

        {step === 'notes' && (
          <>
            <h2 style={{ color: '#f6f6f6', fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Community guidelines</h2>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
              {[
                'Only submit resources you know exist — verified places your neighbors can actually visit.',
                'Include enough detail for someone to find and use the resource without contacting you.',
                'Do not submit commercial businesses unless they offer genuinely free services.',
                'Duplicate submissions will be merged by moderators — no problem to submit and let us sort it.',
                'Your contact info (if provided) is used only to follow up on this submission.',
              ].map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 4 ? 14 : 0 }}>
                  <span style={{ color: '#ceb423', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{'0' + (i + 1)}.</span>
                  <p style={{ color: 'rgba(246,246,246,0.85)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{note}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('form')} className="mend-btn" style={{ flex: 1, padding: '14px', borderRadius: 24, background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>← Back</button>
              <button onClick={() => setStep('agree')} className="mend-btn" style={{ flex: 2, padding: '14px', borderRadius: 24, background: '#ceb423', color: 'black', fontSize: 14, fontWeight: 700 }}>I understand →</button>
            </div>
          </>
        )}

        {step === 'agree' && (
          <>
            <h2 style={{ color: '#f6f6f6', fontSize: 24, fontWeight: 800, marginBottom: 20 }}>One last step</h2>
            <p style={{ color: 'rgba(246,246,246,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              By submitting, you confirm this information is accurate to the best of your knowledge and agree to Mend&apos;s community standards.
            </p>
            <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 32 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 22, height: 22, accentColor: '#ceb423', flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: 'rgba(246,246,246,0.85)', fontSize: 14, lineHeight: 1.6 }}>
                I confirm that the information I&apos;m submitting is accurate and that I&apos;ve read and agree to the Mend community guidelines.
              </span>
            </label>
            {error && <p style={{ color: '#ff6666', fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('notes')} className="mend-btn" style={{ flex: 1, padding: '14px', borderRadius: 24, background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>← Back</button>
              <button
                disabled={!agreed || submitting}
                onClick={handleSubmit}
                className="mend-btn"
                style={{ flex: 2, padding: '16px', borderRadius: 24, background: agreed && !submitting ? '#ceb423' : 'rgba(206,180,35,0.35)', color: agreed && !submitting ? 'black' : 'rgba(0,0,0,0.4)', fontSize: 15, fontWeight: 800, cursor: agreed && !submitting ? 'pointer' : 'not-allowed', letterSpacing: '-0.3px' }}
              >
                {submitting ? 'Submitting...' : 'Submit For Review'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✓</div>
            <h2 style={{ color: '#ceb423', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Submitted!</h2>
            <p style={{ color: 'rgba(246,246,246,0.8)', fontSize: 15, lineHeight: 1.65, maxWidth: 380, margin: '0 auto 32px' }}>
              Your submission is now in the moderation queue. A community moderator will review and confirm the details — usually within 48 hours.
            </p>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '18px 24px', marginBottom: 32, textAlign: 'left' }}>
              <p style={{ color: 'rgba(246,246,246,0.5)', fontSize: 12, marginBottom: 4 }}>Submitted resource</p>
              <p style={{ color: '#f6f6f6', fontSize: 16, fontWeight: 700 }}>{form.name || 'Community Resource'}</p>
              <p style={{ color: 'rgba(246,246,246,0.6)', fontSize: 13 }}>{form.neighborhood} · {form.category}</p>
            </div>
            <button onClick={onClose} className="mend-btn" style={{ padding: '14px 40px', borderRadius: 24, background: '#ceb423', color: 'black', fontSize: 14, fontWeight: 700 }}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
