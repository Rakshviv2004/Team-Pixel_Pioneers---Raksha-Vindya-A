import { useState, useEffect } from 'react'
import { api, type Resource } from '../api'
import type { Page } from '../App'

interface Props {
  navigate: (p: Page) => void
  onReport: () => void
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  Repair: { bg: '#57e57f', color: '#111' },
  Reuse: { bg: '#1acbae', color: '#111' },
  Refuse: { bg: '#2be2e2', color: '#111' },
  Donate: { bg: '#1fdede', color: '#111' },
  Borrow: { bg: '#383677', color: 'white' },
  Exchange: { bg: '#185acb', color: 'white' },
}

const filterCategories = ['All resources', 'Repair', 'Reuse', 'Donate', 'Borrow']

export default function HomePage({ onReport }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All resources')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getResources({
      search: search || undefined,
      category: filter,
      status: 'approved',
    }).then(res => {
      setResources(res.resources)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [search, filter])

  return (
    <div>
      <section style={{ backgroundColor: '#dbd8aa', padding: '60px 24px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(13px, 1.8vw, 18px)', marginBottom: 18, opacity: 0.55, letterSpacing: '-0.3px' }}>
            Community Repair &amp; Reuse Network — Prototype
          </p>
          <h1 style={{ fontFamily: "'Edu AU VIC WA NT Dots', sans-serif", fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 1.1, marginBottom: 28, maxWidth: 700 }}>
            <span style={{ color: '#bd8c2a', fontWeight: 700 }}>Nothing here is broken enough </span>
            <span style={{ color: '#080500' }}>to throw away.</span>
          </h1>
          <p style={{ fontFamily: "'42dot Sans', sans-serif", fontSize: 'clamp(15px, 2vw, 20px)', lineHeight: 1.65, maxWidth: 540, marginBottom: 40, color: '#111' }}>
            Find nearby repair shops, reuse exchanges, donation points, and borrowing libraries — and tell your neighbors about the ones we&apos;re missing.
          </p>

          <div style={{ display: 'flex', gap: 0, border: '1px solid #190101', borderRadius: 4, overflow: 'hidden', backgroundColor: '#fff2f2', maxWidth: 720, marginBottom: 20 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by item, service or neighborhood - try 'Sewing Machine'"
              style={{ flex: 1, padding: '18px 20px', background: 'transparent', border: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(12px, 1.5vw, 16px)', color: 'rgba(0,0,0,0.6)' }}
            />
            <button
              className="mend-btn"
              style={{ padding: '16px 28px', background: '#bd8c2a', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', borderLeft: '1px solid #190101' }}
            >
              Search
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 40 }}>
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="mend-btn"
                style={{
                  padding: '10px 20px',
                  borderRadius: 36,
                  fontSize: 14,
                  background: filter === cat ? '#190101' : 'white',
                  color: filter === cat ? 'white' : 'rgba(0,0,0,0.55)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <svg style={{ display: 'block', width: '100%', height: 52, marginBottom: -1 }} viewBox="0 0 1200 52" preserveAspectRatio="none" fill="none">
          <path d="M0 44 Q100 20 240 38 Q380 50 500 26 Q620 8 720 32 Q840 48 960 22 Q1080 4 1200 30 L1200 52 L0 52Z" fill="#f1efe8" />
        </svg>
      </section>

      <section style={{ backgroundColor: '#f1efe8', padding: '0 24px 48px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid black', borderTop: '1px solid black' }}>
            {[
              { num: resources.filter(r => r.verified).length.toString() || '6', label: 'Verified spots nearby' },
              { num: '14', label: 'Reported this week' },
              { num: [...new Set(resources.map(r => r.neighborhood))].length.toString() || '6', label: 'Neighborhoods covered' },
              { num: resources.filter(r => r.status === 'pending').length.toString() || '3', label: 'Awaiting moderation' },
            ].map((stat, i) => (
              <div key={i} style={{ borderRight: '1px solid black', borderBottom: '1px solid black', padding: '24px 20px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 400, lineHeight: 1, color: '#111', marginBottom: 6 }}>{stat.num}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#444' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#f8f5e8', padding: '48px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(28px, 4vw, 52px)', marginBottom: 28, color: '#111' }}>Nearby resources</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888', fontSize: 15 }}>Loading resources...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {resources.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
          {!loading && resources.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888', fontSize: 15 }}>
              No resources found for &ldquo;{search}&rdquo; in &ldquo;{filter}&rdquo;
            </div>
          )}
        </div>
      </section>

      <section style={{ backgroundColor: '#e0d170', padding: '4px' }}>
        <div style={{ backgroundColor: '#424c39', margin: '24px', borderRadius: 20, padding: 'clamp(32px, 5vw, 56px)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 'clamp(22px, 3.5vw, 44px)', color: '#f6f6f6', marginBottom: 12, lineHeight: 1.2 }}>
              Know a resource we&apos;re missing?
            </h2>
            <p style={{ color: 'rgba(246,246,246,0.7)', fontSize: 'clamp(13px, 1.5vw, 16px)', lineHeight: 1.65, maxWidth: 560, marginBottom: 40 }}>
              Submissions go to a moderation queue and appear as &ldquo;pending review&rdquo; until a community moderator confirms the details.
            </p>
            <InlineSubmitForm onOpen={onReport} />
          </div>
        </div>
      </section>
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const cat = categoryColors[resource.category] || { bg: '#999', color: '#111' }
  return (
    <div className="mend-card" style={{ padding: 20, transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 6px 0 rgba(0,0,0,0.14)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '3px 3px 0 rgba(0,0,0,0.12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ ...cat, padding: '6px 14px', borderRadius: 36, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
          {resource.category}
        </span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#250a0a', marginBottom: 8, lineHeight: 1.35 }}>{resource.name}</h3>
      <p style={{ fontSize: 13, color: '#333', lineHeight: 1.55, marginBottom: 16 }}>{resource.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>📍 {resource.neighborhood}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: resource.verified ? '#2a7a2a' : '#996600' }}>
          {resource.verified ? '✓ Verified' : '◷ Pending review'}
        </span>
      </div>
    </div>
  )
}

function InlineSubmitForm({ onOpen }: { onOpen: () => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      <div>
        <label style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Resource name</label>
        <div style={{ backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 28, padding: '16px 20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>e.g Fix-it Table</span>
        </div>
      </div>
      <div>
        <label style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Category</label>
        <div style={{ backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 28, padding: '16px 20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Repair</span>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>What can people do here?</label>
        <div style={{ backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 20, padding: '20px', minHeight: 90 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>e.g - Volunteers fix every small appliances every second saturday.</span>
        </div>
      </div>
      <div>
        <label style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Neighborhood / area</label>
        <div style={{ backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 28, padding: '16px 20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>e.g - Palasia</span>
        </div>
      </div>
      <div>
        <label style={{ color: 'white', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>Your contact (optional)</label>
        <div style={{ backgroundColor: '#424c39', border: '3px solid rgba(0,0,0,0.89)', borderRadius: 28, padding: '16px 20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Email or phone, for follow up</span>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
        <button onClick={onOpen} className="mend-btn" style={{ padding: '18px 40px', borderRadius: 28, background: '#ceb423', color: 'black', fontSize: 15, fontWeight: 800 }}>
          Submit For Review
        </button>
      </div>
    </div>
  )
}
