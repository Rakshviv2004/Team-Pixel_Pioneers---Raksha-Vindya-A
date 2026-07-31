import { useState } from 'react'
import { api } from '../api'
import type { UserInfo } from '../App'

interface Props {
  navigate: (p: import('../App').Page) => void
  onLogin: (user: UserInfo, token: string) => void
}

export default function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', pledge: false })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.login(form.email, form.password)
      onLogin(res.user, res.token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.register(form.name, form.email, form.password)
      onLogin(res.user, res.token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8f5e8' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', border: '2px solid black', borderRadius: 36, overflow: 'hidden', marginBottom: 36, backgroundColor: '#dbd8aa' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{ flex: 1, padding: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: mode === m ? '#190101' : 'transparent', color: mode === m ? 'white' : '#190101', transition: 'all 0.15s' }}>
              {m === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff6f6', border: '2px solid black', borderRadius: 20, padding: 36, boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}>
          {mode === 'login' ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#190101' }}>Welcome back</h1>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 28, lineHeight: 1.55 }}>Log in to track your contributions and get community alerts.</p>

              {error && <p style={{ color: '#721d1d', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: '#ffe0e0', borderRadius: 8 }}>{error}</p>}

              <Field label="Email address" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" />
              <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={f('password')} placeholder="Your password"
                suffix={<button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 12, fontFamily: 'inherit' }}>{showPass ? 'Hide' : 'Show'}</button>} />

              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#bd8c2a', textDecoration: 'underline', padding: '0 0 24px', display: 'block' }}>
                Forgot password?
              </button>

              <button onClick={handleLogin} disabled={loading} className="mend-btn" style={{ width: '100%', padding: '16px', borderRadius: 8, background: loading ? '#999' : '#190101', color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                {loading ? 'Logging in...' : 'Continue →'}
              </button>

              <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
                <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
                <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: '#fff6f6', padding: '0 12px', fontSize: 12, color: '#888' }}>or</span>
              </div>

              <button className="mend-btn" style={{ width: '100%', padding: '14px', borderRadius: 8, background: 'white', color: '#190101', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#190101' }}>Join the network</h1>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 28, lineHeight: 1.55 }}>Create an account to submit resources, track your impact, and volunteer.</p>

              {error && <p style={{ color: '#721d1d', fontSize: 13, marginBottom: 16, padding: '10px 14px', backgroundColor: '#ffe0e0', borderRadius: 8 }}>{error}</p>}

              <Field label="Your name" type="text" value={form.name} onChange={f('name')} placeholder="First name or handle" />
              <Field label="Email address" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" />
              <Field label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={f('password')} placeholder="At least 8 characters"
                suffix={<button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 12, fontFamily: 'inherit' }}>{showPass ? 'Hide' : 'Show'}</button>} />
              <Field label="Confirm password" type="password" value={form.confirm} onChange={f('confirm')} placeholder="Same password again" />

              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 28, padding: '16px', backgroundColor: '#f0efe0', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10 }}>
                <input type="checkbox" checked={form.pledge} onChange={f('pledge')} style={{ width: 18, height: 18, accentColor: '#424c39', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, lineHeight: 1.55, color: '#333' }}>
                  I agree to the Mend community pledge — to submit only accurate information, treat my neighbors with respect, and help this network stay honest and useful.
                </span>
              </label>

              <button onClick={handleSignup} disabled={!form.pledge || loading} className="mend-btn" style={{ width: '100%', padding: '16px', borderRadius: 8, background: form.pledge && !loading ? '#190101' : '#ccc', color: 'white', fontSize: 15, fontWeight: 700, cursor: form.pledge && !loading ? 'pointer' : 'not-allowed' }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, suffix }: {
  label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; suffix?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 7, color: '#190101' }}>{label}</label>
      <div style={{ display: 'flex', border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: 8, overflow: 'hidden', backgroundColor: 'white', transition: 'border-color 0.15s' }}
        onFocus={e => (e.currentTarget.style.borderColor = '#190101')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)')}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ flex: 1, padding: '13px 14px', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 14, background: 'transparent', color: '#190101' }} />
        {suffix && <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>{suffix}</div>}
      </div>
    </div>
  )
}
