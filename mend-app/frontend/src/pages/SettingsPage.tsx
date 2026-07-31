import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { api } from '../api'

interface Props {
  navigate: (p: Page) => void
}

export default function SettingsPage({ navigate: _navigate }: Props) {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
  const [lang, setLang] = useState('English')
  const [notifs, setNotifs] = useState({ newNearby: true, approvals: true, events: true, volunteers: false, moderator: true })
  const [privacy, setPrivacy] = useState({ showProfile: true, showContributions: true, showLocation: false })
  const [location, setLocation] = useState<'denied' | 'approximate' | 'precise'>('approximate')
  const [accessibility, setAccessibility] = useState({ reducedMotion: false, largeText: false, highContrast: false })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.getProfile()
      .then(res => {
        const u = res.user as unknown as Record<string, unknown>
        if (u.theme) setTheme(u.theme as 'system' | 'light' | 'dark')
        if (u.language) setLang(u.language as string)
        if (u.location_permission) setLocation(u.location_permission as 'denied' | 'approximate' | 'precise')
        setNotifs({
          newNearby: !!(u.notif_new_nearby),
          approvals: !!(u.notif_approvals),
          events: !!(u.notif_events),
          volunteers: !!(u.notif_volunteers),
          moderator: !!(u.notif_moderator),
        })
        setPrivacy({
          showProfile: !!(u.show_profile),
          showContributions: !!(u.show_contributions),
          showLocation: !!(u.show_location),
        })
        setAccessibility({
          reducedMotion: !!(u.reduced_motion),
          largeText: !!(u.large_text),
          highContrast: !!(u.high_contrast),
        })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => setSaved(false), 2000)

    const data: Record<string, unknown> = {
      theme,
      language: lang,
      location_permission: location,
      notif_new_nearby: notifs.newNearby ? 1 : 0,
      notif_approvals: notifs.approvals ? 1 : 0,
      notif_events: notifs.events ? 1 : 0,
      notif_volunteers: notifs.volunteers ? 1 : 0,
      notif_moderator: notifs.moderator ? 1 : 0,
      show_profile: privacy.showProfile ? 1 : 0,
      show_contributions: privacy.showContributions ? 1 : 0,
      show_location: privacy.showLocation ? 1 : 0,
      reduced_motion: accessibility.reducedMotion ? 1 : 0,
      large_text: accessibility.largeText ? 1 : 0,
      high_contrast: accessibility.highContrast ? 1 : 0,
    }

    api.updateProfile(data).then(() => setSaved(true)).catch(() => {})

    return () => clearTimeout(timer)
  }, [theme, lang, notifs, privacy, location, accessibility])

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#190101', margin: 0 }}>Settings</h1>
          {saved && <span style={{ fontSize: 12, color: '#57a857', fontWeight: 700 }}>Saved ✓</span>}
        </div>

        <Section title="Theme">
          <div style={{ display: 'flex', gap: 10 }}>
            {(['system', 'light', 'dark'] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)} className="mend-btn" style={{ padding: '10px 20px', borderRadius: 20, fontSize: 13, background: theme === t ? '#190101' : 'transparent', color: theme === t ? 'white' : '#190101', textTransform: 'capitalize' }}>
                {t === 'system' ? '⊙ System' : t === 'light' ? '☀ Light' : '◑ Dark'}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Language">
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: '11px 16px', border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: 'white', color: '#190101' }}>
            {['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu'].map(l => <option key={l}>{l}</option>)}
          </select>
        </Section>

        <Section title="Notifications">
          {([
            ['newNearby', 'New resources nearby'],
            ['approvals', 'Submission approvals'],
            ['events', 'Upcoming events'],
            ['volunteers', 'Volunteer requests'],
            ['moderator', 'Moderator feedback'],
          ] as [keyof typeof notifs, string][]).map(([key, label]) => (
            <Toggle key={key} label={label} value={notifs[key]} onChange={v => setNotifs(prev => ({ ...prev, [key]: v }))} />
          ))}
        </Section>

        <Section title="Privacy">
          {([
            ['showProfile', 'Make my profile visible to others'],
            ['showContributions', 'Show my contributions publicly'],
            ['showLocation', 'Show my neighborhood in my profile'],
          ] as [keyof typeof privacy, string][]).map(([key, label]) => (
            <Toggle key={key} label={label} value={privacy[key]} onChange={v => setPrivacy(prev => ({ ...prev, [key]: v }))} />
          ))}
        </Section>

        <Section title="Location permissions">
          <p style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.55 }}>Location is used to show resources near you. Your precise location is never stored or shared.</p>
          {([
            ['denied', 'Off — use manual search only'],
            ['approximate', 'Approximate — show my general area'],
            ['precise', 'Precise — best results, only while app is open'],
          ] as [typeof location, string][]).map(([val, label]) => (
            <label key={val} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <input type="radio" checked={location === val} onChange={() => setLocation(val)} style={{ accentColor: '#424c39', width: 17, height: 17 }} />
              <span style={{ fontSize: 13, color: '#190101' }}>{label}</span>
            </label>
          ))}
        </Section>

        <Section title="Accessibility">
          {([
            ['reducedMotion', 'Reduce motion and animations'],
            ['largeText', 'Larger text size'],
            ['highContrast', 'High contrast mode'],
          ] as [keyof typeof accessibility, string][]).map(([key, label]) => (
            <Toggle key={key} label={label} value={accessibility[key]} onChange={v => setAccessibility(prev => ({ ...prev, [key]: v }))} />
          ))}
        </Section>

        <Section title="About">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['Version', '1.0.0-prototype'],
              ['Network', 'Mend Indore'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 13 }}>
                <span style={{ color: '#666' }}>{k}</span>
                <span style={{ color: '#190101', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Help & Feedback">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Help Center', 'Send feedback', 'Report a bug', 'Privacy policy'].map(item => (
              <button key={item} className="mend-btn" style={{ padding: '12px 16px', borderRadius: 8, background: 'transparent', color: '#190101', fontSize: 13, textAlign: 'left', border: '1px solid rgba(0,0,0,0.12)' }}>
                {item} →
              </button>
            ))}
          </div>
        </Section>

        <div style={{ marginTop: 8 }}>
          <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className="mend-btn" style={{ padding: '12px 20px', borderRadius: 8, background: 'transparent', color: '#721d1d', fontSize: 13, border: '1.5px solid #721d1d' }}>
            Delete account
          </button>
          {showDeleteConfirm && (
            <div style={{ marginTop: 14, backgroundColor: '#fff0f0', border: '1.5px solid #721d1d', borderRadius: 12, padding: '18px 20px' }}>
              <p style={{ fontSize: 14, color: '#721d1d', fontWeight: 700, marginBottom: 8 }}>Are you sure?</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, marginBottom: 16 }}>This will permanently delete your account and all your submissions. Verified community resources you added will remain, attributed to "anonymous contributor."</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="mend-btn" style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, background: '#721d1d', color: 'white', fontWeight: 700 }}>Yes, delete my account</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="mend-btn" style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, background: 'transparent', color: '#555' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: 13, color: '#190101' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, border: '1.5px solid black', cursor: 'pointer', backgroundColor: value ? '#424c39' : '#ddd', transition: 'background 0.15s', position: 'relative', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s', border: '1px solid rgba(0,0,0,0.2)', display: 'block' }} />
      </button>
    </div>
  )
}
