import { useState, useEffect } from 'react'
import type { Page } from '../App'
import { api, type Event as EventType } from '../api'

interface Props {
  navigate: (p: Page) => void
}

type EventCategory = 'Workshop' | 'Tool Share' | 'Donation Drive' | 'Volunteer'

const typeColors: Record<string, { bg: string; color: string }> = {
  'Workshop': { bg: '#57e57f', color: '#111' },
  'Tool Share': { bg: '#383677', color: 'white' },
  'Donation Drive': { bg: '#1fdede', color: '#111' },
  'Volunteer': { bg: '#bd8c2a', color: 'white' },
}

const months = ['Jul', 'Aug', 'Sep', 'Oct']
const calDays = Array.from({ length: 31 }, (_, i) => i + 1)

export default function EventsPage({ navigate: _navigate }: Props) {
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'cards' | 'calendar'>('cards')
  const [filter, setFilter] = useState<EventCategory | 'All'>('All')
  const [month] = useState('Aug')
  const [registered, setRegistered] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.getEvents().then(res => {
      setEvents(res.events)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggle = async (id: number) => {
    try {
      const res = await api.toggleEventRegistration(id)
      if (res.registered) {
        setRegistered(prev => new Set(prev).add(id))
        setEvents(prev => prev.map(e => e.id === id ? { ...e, participants: e.participants + 1 } : e))
      } else {
        setRegistered(prev => { const next = new Set(prev); next.delete(id); return next })
        setEvents(prev => prev.map(e => e.id === id ? { ...e, participants: Math.max(0, e.participants - 1) } : e))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to register')
    }
  }

  const filtered = events.filter(e => filter === 'All' || e.type === filter)
  const eventDates = new Set(events.map(e => parseInt(e.date.split(' ')[1])))

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading events...</div>
  }

  return (
    <div style={{ backgroundColor: '#f8f5e8', minHeight: '80vh', padding: '40px 24px 60px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#190101', marginBottom: 4 }}>Community events</h1>
          <p style={{ fontSize: 14, color: '#666' }}>Repair workshops, tool-sharing meetups, donation drives, and volunteer sessions near you.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={() => setFilter('All')} className="mend-btn" style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12, background: filter === 'All' ? '#190101' : 'transparent', color: filter === 'All' ? 'white' : '#190101' }}>All</button>
            {(Object.keys(typeColors) as EventCategory[]).map(t => (
              <button key={t} onClick={() => setFilter(t)} className="mend-btn" style={{ padding: '8px 16px', borderRadius: 20, fontSize: 12, background: filter === t ? typeColors[t].bg : 'transparent', color: filter === t ? typeColors[t].color : '#190101' }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 0, border: '2px solid black', borderRadius: 28, overflow: 'hidden', backgroundColor: '#f8f5e8' }}>
            {(['cards', 'calendar'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '8px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: view === v ? '#190101' : 'transparent', color: view === v ? 'white' : '#190101' }}>
                {v === 'cards' ? '⊞ Cards' : '⊟ Calendar'}
              </button>
            ))}
          </div>
        </div>

        {view === 'calendar' && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <button className="mend-btn" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, background: 'transparent' }}>←</button>
              {months.map(m => (
                <button key={m} className="mend-btn" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, background: m === month ? '#190101' : 'transparent', color: m === month ? 'white' : '#190101' }}>{m}</button>
              ))}
              <button className="mend-btn" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, background: 'transparent' }}>→</button>
            </div>
            <div style={{ backgroundColor: '#fff6f6', border: '1px solid black', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#888', padding: '4px 0', marginBottom: 4 }}>{d}</div>
                ))}
                {Array.from({ length: 3 }).map((_, i) => <div key={'empty-' + i} />)}
                {calDays.map(d => (
                  <div key={d} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: eventDates.has(d) ? 'pointer' : 'default', backgroundColor: eventDates.has(d) ? '#dbd8aa' : 'transparent', border: eventDates.has(d) ? '1px solid black' : '1px solid transparent', fontSize: 13, fontWeight: eventDates.has(d) ? 700 : 400, color: '#190101', position: 'relative' }}>
                    {d}
                    {eventDates.has(d) && <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#bd8c2a' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(ev => {
            const isReg = registered.has(ev.id)
            const { bg, color } = typeColors[ev.type] || { bg: '#999', color: '#111' }
            const spotsLeft = ev.capacity - ev.participants
            return (
              <div key={ev.id} className="mend-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ background: bg, color, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{ev.type}</span>
                  <span style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>{ev.date}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#190101', marginBottom: 6, lineHeight: 1.25 }}>{ev.name}</h3>
                <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{ev.description}</p>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>🕐 {ev.time}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📍 {ev.location}</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>👤 Organised by {ev.organizer}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: spotsLeft < 5 ? '#cc6600' : '#57a857', fontWeight: 700 }}>
                    {ev.participants}/{ev.capacity} participants · {spotsLeft} left
                  </span>
                  <button onClick={() => toggle(ev.id)} className="mend-btn" style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, background: isReg ? '#57e57f' : '#424c39', color: isReg ? '#111' : 'white' }}>
                    {isReg ? '✓ Registered' : 'Register'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
