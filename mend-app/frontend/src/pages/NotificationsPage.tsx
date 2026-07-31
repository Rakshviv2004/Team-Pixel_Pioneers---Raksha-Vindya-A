import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { api, type Notification } from '../api'

interface Props {
  navigate: (p: Page) => void
}

type Filter = 'All' | 'Unread' | 'Mentions'

export default function NotificationsPage({ navigate: _navigate }: Props) {
  const [filter, setFilter] = useState<Filter>('All')
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = () => {
    setLoading(true)
    api.getNotifications(filter === 'All' ? undefined : filter)
      .then(res => setItems(res.notifications))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifs() }, [filter])

  const markAllRead = async () => {
    await api.markAllNotificationsRead()
    setItems(prev => prev.map(n => ({ ...n, read: 1 })))
  }

  const markRead = async (id: number) => {
    await api.markNotificationRead(id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n))
  }

  const unreadCount = items.filter(n => !n.read).length

  const typeIcon = (type: string) => {
    const icons: Record<string, { icon: string; bg: string }> = {
      approval: { icon: '✓', bg: '#57e57f' },
      event: { icon: '◉', bg: '#1acbae' },
      volunteer: { icon: '♥', bg: '#383677' },
      feedback: { icon: '✎', bg: '#bd8c2a' },
      search: { icon: '⌕', bg: '#185acb' },
    }
    return icons[type] || { icon: '◎', bg: '#999' }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading notifications...</div>
  }

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: '#190101', marginBottom: 4 }}>Alerts</h1>
            {unreadCount > 0 && <span style={{ fontSize: 13, color: '#666' }}>{unreadCount} unread</span>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="mend-btn" style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', color: '#190101', fontSize: 12 }}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 0, border: '2px solid black', borderRadius: 36, overflow: 'hidden', marginBottom: 24, width: 'fit-content', backgroundColor: '#f8f5e8' }}>
          {(['Unread', 'All', 'Mentions'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === f ? '#190101' : 'transparent', color: filter === f ? 'white' : '#190101', transition: 'all 0.15s', position: 'relative' }}>
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#721d1d' }} />
              )}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
            <p style={{ fontSize: 15 }}>No notifications here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(n => {
              const { icon, bg } = typeIcon(n.type)
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{ backgroundColor: n.read ? '#fff6f6' : '#fffbe6', border: `1.5px solid ${n.read ? 'black' : '#bd8c2a'}`, borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer', transition: 'transform 0.1s', position: 'relative' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = '')}
                >
                  {!n.read && (
                    <div style={{ position: 'absolute', top: 14, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#721d1d' }} />
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: bg, color: bg === '#383677' ? 'white' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, fontWeight: 700, border: '1px solid rgba(0,0,0,0.12)' }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#190101' }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.55, margin: 0 }}>{n.body}</p>
                    {!!n.mention && (
                      <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#dbd8aa', color: '#555', fontWeight: 700 }}>Mention</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
