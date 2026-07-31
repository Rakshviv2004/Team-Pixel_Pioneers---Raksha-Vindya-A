import { useState, useEffect } from 'react'
import type { Page, UserInfo } from '../App'
import { api, type UserStats, type Resource } from '../api'

interface Props {
  navigate: (p: Page) => void
  user: UserInfo
  onLogout: () => void
}

export default function ProfilePage({ navigate, user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'contributions' | 'badges' | 'bookmarks'>('contributions')
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Array<Record<string, unknown> & { earned: boolean }>>([])
  const [bookmarks, setBookmarks] = useState<Resource[]>([])
  const [activities, setActivities] = useState<Array<{ id: number; type: string; description: string; created_at: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getBadges(),
      api.getSavedResources(),
      api.getContributions(),
    ]).then(([s, b, sv, c]) => {
      if (s) setStats(s.stats)
      if (b) setBadges(b.badges)
      if (sv) setBookmarks(sv.resources)
      if (c) setActivities((c.activities || []) as Array<{ id: number; type: string; description: string; created_at: string }>)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading profile...</div>
  }

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#dbd8aa', border: '2px solid black', borderRadius: 20, padding: '36px 32px', marginBottom: 32, display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', backgroundColor: '#424c39', border: '3px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontWeight: 800, flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#190101', marginBottom: 4 }}>{user.name}</h1>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              {user.email} · Member since June 2025
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { num: stats?.resources_added || 0, label: 'Resources' },
                { num: stats?.items_repaired || 0, label: 'Items helped repair' },
                { num: stats?.badges_earned || 0, label: 'Badges' },
                { num: stats?.events_attended || 0, label: 'Events attended' },
              ].map(s => (
                <div key={s.label}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#190101', display: 'block', lineHeight: 1 }}>{s.num}</span>
                  <span style={{ fontSize: 11, color: '#666' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
            <button onClick={() => navigate('settings')} className="mend-btn" style={{ padding: '10px 20px', borderRadius: 8, background: '#190101', color: 'white', fontSize: 13 }}>Settings</button>
            <button onClick={onLogout} className="mend-btn" style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', color: '#721d1d', fontSize: 13 }}>Log out</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, border: '2px solid black', borderRadius: 36, overflow: 'hidden', marginBottom: 28, width: 'fit-content', backgroundColor: '#f8f5e8' }}>
          {([['contributions', 'Contributions'], ['badges', 'Badges'], ['bookmarks', 'Bookmarks']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 22px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: activeTab === id ? '#190101' : 'transparent', color: activeTab === id ? 'white' : '#190101', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'contributions' && (
          <div>
            <div style={{ backgroundColor: '#fff6f6', border: '1px solid black', borderRadius: 16, overflow: 'hidden' }}>
              {activities.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>No contributions yet</div>
              ) : (
                activities.map((a, i) => (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, padding: '18px 20px', borderBottom: i < activities.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: a.type === 'submission' || a.type === 'verification' ? '#f0ede0' : a.type === 'volunteer' ? '#424c39' : '#dbd8aa', color: a.type === 'volunteer' ? 'white' : '#555', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {a.type === 'verification' ? 'Verified' : a.type === 'submission' ? 'Submitted' : a.type === 'volunteer' ? 'Volunteered' : a.type === 'save' ? 'Saved' : 'Activity'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#190101' }}>{a.description}</span>
                    <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {badges.map(b => (
              <div key={b.id as number} className="mend-card" style={{ padding: 20, opacity: b.earned ? 1 : 0.45 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{b.icon as string}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: '#190101' }}>{b.name as string}</div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{b.description as string}</div>
                {b.earned && (
                  <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: '#57e57f', fontSize: 11, fontWeight: 700 }}>Earned ✓</div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {bookmarks.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#999' }}>No bookmarked resources</div>
            ) : (
              bookmarks.map(r => {
                const catColors: Record<string, { bg: string; color: string }> = {
                  Repair: { bg: '#57e57f', color: '#111' }, Reuse: { bg: '#1acbae', color: '#111' },
                  Donate: { bg: '#1fdede', color: '#111' }, Borrow: { bg: '#383677', color: 'white' },
                  Refuse: { bg: '#2be2e2', color: '#111' }, Exchange: { bg: '#185acb', color: 'white' },
                }
                const cat = catColors[r.category] || { bg: '#999', color: '#111' }
                return (
                  <div key={r.id} className="mend-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ ...cat, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{r.category}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#190101', marginBottom: 4 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>📍 {r.neighborhood}</div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
