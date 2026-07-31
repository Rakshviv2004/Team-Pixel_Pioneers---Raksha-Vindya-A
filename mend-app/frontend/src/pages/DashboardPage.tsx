import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { api, type Resource, type Event } from '../api'

interface Props {
  navigate: (p: Page) => void
}

export default function DashboardPage({ navigate }: Props) {
  const [stats, setStats] = useState({ resources_added: 0, items_repaired: 0, waste_diverted_kg: 0, carbon_saved_kg: 0, events_attended: 0, badges_earned: 0 })
  const [activities, setActivities] = useState<Array<{ id: number; type: string; description: string; created_at: string }>>([])
  const [saved, setSaved] = useState<Resource[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getStats().catch(() => null),
      api.getContributions().catch(() => null),
      api.getSavedResources().catch(() => null),
      api.getEvents().catch(() => null),
    ]).then(([s, c, sv, ev]) => {
      if (s) setStats(s.stats)
      if (c) setActivities((c.activities || []) as Array<{ id: number; type: string; description: string; created_at: string }>)
      if (sv) setSaved(sv.resources)
      if (ev) setEvents(ev.events)
    }).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Resources added', value: String(stats.resources_added), unit: 'by you', color: '#57e57f', icon: '＋' },
    { label: 'Items repaired', value: String(stats.items_repaired), unit: 'community total', color: '#1acbae', icon: '🔧' },
    { label: 'Waste diverted', value: `${stats.waste_diverted_kg}kg`, unit: 'estimated', color: '#bd8c2a', icon: '♻' },
    { label: 'Carbon saved', value: `${stats.carbon_saved_kg}kg`, unit: 'CO₂ equiv.', color: '#185acb', icon: '🌱' },
  ]

  const savedResources = saved.slice(0, 3)
  const volunteerEvents = events.filter(e => e.type === 'Volunteer' || e.type === 'Workshop').slice(0, 2)

  const categoryBadge = (cat: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      Repair: { bg: '#57e57f', color: '#111' }, Reuse: { bg: '#1acbae', color: '#111' },
      Donate: { bg: '#1fdede', color: '#111' }, Borrow: { bg: '#383677', color: 'white' },
      Refuse: { bg: '#2be2e2', color: '#111' }, Exchange: { bg: '#185acb', color: 'white' },
    }
    return map[cat] || { bg: '#999', color: '#111' }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading dashboard...</div>
  }

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: '#190101', marginBottom: 6 }}>Your dashboard</h1>
            <p style={{ fontSize: 14, color: '#666' }}>Indore · Updated just now</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('events')} className="mend-btn" style={{ padding: '10px 18px', borderRadius: 8, background: '#424c39', color: 'white', fontSize: 13 }}>
              Browse events
            </button>
            <button onClick={() => navigate('notifications')} className="mend-btn" style={{ padding: '10px 18px', borderRadius: 8, background: 'transparent', color: '#190101', fontSize: 13 }}>
              Alerts
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Community impact</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {statCards.map(stat => (
              <div key={stat.label} className="mend-card" style={{ padding: '24px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#190101', lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#190101', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{stat.unit}</div>
                <div style={{ height: 4, borderRadius: 2, background: stat.color, marginTop: 14 }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activity timeline</h2>
            <div style={{ backgroundColor: '#fff6f6', border: '1px solid black', borderRadius: 16, overflow: 'hidden' }}>
              {activities.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 14 }}>No recent activity</div>
              ) : (
                activities.slice(0, 5).map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: 16, padding: '18px 20px', borderBottom: i < Math.min(activities.length, 5) - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', backgroundColor: item.type === 'verification' ? '#57e57f' : item.type === 'event' ? '#1acbae' : item.type === 'volunteer' ? '#383677' : '#f0ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '1px solid rgba(0,0,0,0.1)' }}>
                      {item.type === 'verification' ? '✓' : item.type === 'event' ? '◉' : item.type === 'volunteer' ? '♥' : item.type === 'mod_feedback' ? '✎' : '⊙'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, color: '#190101', lineHeight: 1.45, marginBottom: 4 }}>{item.description}</p>
                      <span style={{ fontSize: 11, color: '#999' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, marginTop: 32, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nearby alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { text: 'New repair café opening in Sapna Sangeeta on Aug 12', badge: 'New', color: '#57e57f' },
                { text: 'E-waste collection drive this weekend — Sudama Nagar Park', badge: 'Event', color: '#1fdede' },
                { text: '"Rajwada Furniture Exchange" needs a new volunteer coordinator', badge: 'Help needed', color: '#383677' },
              ].map((alert, i) => (
                <div key={i} style={{ backgroundColor: '#fff6f6', border: '1px solid black', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ background: alert.color, color: alert.color === '#383677' ? 'white' : '#111', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {alert.badge}
                  </span>
                  <p style={{ fontSize: 13, color: '#190101', lineHeight: 1.45 }}>{alert.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending submissions</h2>
            <div style={{ backgroundColor: '#fff6f6', border: '1px solid black', borderRadius: 14, padding: 16, marginBottom: 24 }}>
              {saved.filter(r => r.status === 'pending' || r.status === 'flagged').slice(0, 2).length === 0 ? (
                <div style={{ padding: 12, textAlign: 'center', color: '#999', fontSize: 13 }}>No pending submissions</div>
              ) : (
                saved.filter(r => r.status === 'pending' || r.status === 'flagged').slice(0, 2).map((r, i, arr) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#190101' }}>{r.name}</span>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: r.status === 'flagged' ? '#ffe0e0' : '#f0ede0', color: r.status === 'flagged' ? '#cc2222' : '#666', fontWeight: 700 }}>
                      {r.status === 'flagged' ? 'Flagged' : 'In review'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saved resources</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {savedResources.map(r => (
                <div key={r.id} className="mend-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#190101', marginBottom: 4 }}>{r.name}</div>
                    <span style={{ ...categoryBadge(r.category), padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.category}</span>
                  </div>
                </div>
              ))}
              {savedResources.length === 0 && <div style={{ padding: 12, textAlign: 'center', color: '#999', fontSize: 13 }}>No saved resources</div>}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Volunteer events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {volunteerEvents.map(ev => (
                <div key={ev.id} className="mend-card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{ev.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{ev.date} · {ev.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#57a857', fontWeight: 700 }}>{ev.capacity - ev.participants} spots left</span>
                    <button className="mend-btn" style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: '#424c39', color: 'white' }}>Register</button>
                  </div>
                </div>
              ))}
              {volunteerEvents.length === 0 && <div style={{ padding: 12, textAlign: 'center', color: '#999', fontSize: 13 }}>No upcoming volunteer events</div>}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Report a new resource', color: '#ceb423', textColor: '#111', action: 'report' as const },
                { label: 'Browse nearby events', color: '#424c39', textColor: 'white', action: 'events' as const },
                { label: 'View moderation queue', color: 'transparent', textColor: '#190101', action: 'moderator' as const },
              ].map((action, i) => (
                <button key={i} onClick={() => action.action === 'report' ? null : navigate(action.action as Page)} className="mend-btn" style={{ padding: '13px 18px', borderRadius: 10, fontSize: 13, background: action.color, color: action.textColor, textAlign: 'left' }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
