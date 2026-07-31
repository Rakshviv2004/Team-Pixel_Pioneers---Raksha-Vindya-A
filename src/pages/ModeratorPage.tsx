import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { api, type Resource } from '../api'

interface Props {
  navigate: (p: Page) => void
}

const catColors: Record<string, { bg: string; color: string }> = {
  Repair: { bg: '#57e57f', color: '#111' }, Reuse: { bg: '#1acbae', color: '#111' },
  Refuse: { bg: '#2be2e2', color: '#111' }, Donate: { bg: '#1fdede', color: '#111' },
  Borrow: { bg: '#383677', color: 'white' }, Exchange: { bg: '#185acb', color: 'white' },
}

export default function ModeratorPage({ navigate: _navigate }: Props) {
  const [items, setItems] = useState<Resource[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editing, setEditing] = useState<number | null>(null)

  const fetchSubmissions = () => {
    setLoading(true)
    api.getSubmissions({ status: statusFilter, search: search || undefined })
      .then(res => {
        setItems(res.submissions)
        setStats(res.stats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSubmissions() }, [statusFilter])

  const updateStatus = async (id: number, status: string) => {
    try {
      if (status === 'approved') {
        await api.approveSubmission(id)
      } else if (status === 'rejected') {
        await api.rejectSubmission(id)
      }
      setItems(prev => prev.map(s => s.id === id ? { ...s, status } as Resource : s))
      setEditing(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handleSearch = () => {
    fetchSubmissions()
  }

  const filtered = items
  const statsEntries = [
    { label: 'Pending review', value: (stats.pending_count as number) || 0, color: '#bd8c2a' },
    { label: 'Approved this week', value: (stats.approved_count as number) || 0, color: '#57e57f' },
    { label: 'Rejected this week', value: (stats.rejected_count as number) || 0, color: '#721d1d' },
    { label: 'Community reports', value: (stats.flagged_count as number) || 0, color: '#185acb' },
  ]

  const statusColor = (status: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      pending: { bg: '#ffe8a0', c: '#664400' },
      approved: { bg: '#57e57f', c: '#111' },
      rejected: { bg: '#ffdde0', c: '#721d1d' },
      flagged: { bg: '#ffd5a0', c: '#884400' },
    }
    return map[status] || { bg: '#eee', c: '#333' }
  }

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#190101', marginBottom: 4 }}>Moderator panel</h1>
          <p style={{ fontSize: 14, color: '#666' }}>Review, approve, and manage community submissions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 36 }}>
          {statsEntries.map(s => (
            <div key={s.label} className="mend-card" style={{ padding: '18px 16px' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1.5px solid rgba(0,0,0,0.3)', borderRadius: 8, overflow: 'hidden', flex: 1, minWidth: 200, maxWidth: 360, backgroundColor: 'white' }}>
            <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: '#888', fontSize: 16 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search submissions…" style={{ flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: 'transparent' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'pending', 'flagged', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className="mend-btn" style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, background: statusFilter === s ? '#190101' : 'transparent', color: statusFilter === s ? 'white' : '#190101', textTransform: 'capitalize' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading submissions...</div>
          ) : filtered.map(sub => {
            const sc = statusColor(sub.status)
            const cc = catColors[sub.category] || { bg: '#999', color: '#111' }
            const isEditing = editing === sub.id
            return (
              <div key={sub.id} style={{ backgroundColor: '#fff6f6', border: `1.5px solid ${sub.status === 'flagged' ? '#cc8800' : 'black'}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ ...cc, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sub.category}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#190101' }}>{sub.name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.5, marginBottom: 8 }}>{sub.description}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#666' }}>📍 {sub.neighborhood}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>👤 {sub.submitter_name}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>📅 {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ''}</span>
                      {sub.contact && <span style={{ fontSize: 12, color: '#666' }}>✉ {sub.contact}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: sc.bg, color: sc.c, fontWeight: 700, textTransform: 'capitalize' }}>
                      {sub.status}
                    </span>
                    {(sub.status === 'pending' || sub.status === 'flagged') && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => updateStatus(sub.id, 'approved')} className="mend-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, background: '#57e57f', color: '#111' }}>Approve</button>
                        <button onClick={() => updateStatus(sub.id, 'rejected')} className="mend-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, background: '#ffdde0', color: '#721d1d' }}>Reject</button>
                        <button onClick={() => setEditing(isEditing ? null : sub.id)} className="mend-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, background: isEditing ? '#dbd8aa' : 'transparent', color: '#190101' }}>Edit</button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#f4f0e0', padding: '18px 20px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#190101' }}>Edit before approving</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, color: '#555' }}>Resource name</label>
                        <input defaultValue={sub.name} onKeyDown={e => { if (e.key === 'Enter') updateStatus(sub.id, 'approved') }} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, color: '#555' }}>Neighborhood</label>
                        <input defaultValue={sub.neighborhood} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: 'white' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 6, color: '#555' }}>Description</label>
                      <textarea defaultValue={sub.description} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, minHeight: 80, resize: 'vertical', background: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => updateStatus(sub.id, 'approved')} className="mend-btn" style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, background: '#57e57f', color: '#111', fontWeight: 700 }}>Save & Approve</button>
                      <button onClick={() => setEditing(null)} className="mend-btn" style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, background: 'transparent', color: '#666' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
