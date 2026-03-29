import { useEffect, useState } from 'react'

const API = 'http://localhost:3001'

type Voiding = {
  id: number
  voided_at: string
  volume_ml: number | null
  qmax: number | null
  duration_seconds: number | null
  urine_color: string | null
  cloudy: boolean | null
  appearance_tags: string | null
  hematuria: string | null
  urgency: string | null
  pain_locations: string | null
  pain_types: string | null
  is_nocturia: boolean | null
  notes: string | null
}

type FluidIntake = {
  id: number
  recorded_at: string
  volume_ml: number | null
  drink_types: string | null
}

type Entry =
  | { kind: 'voiding'; ts: Date; data: Voiding }
  | { kind: 'fluid'; ts: Date; data: FluidIntake }

const COLOR_HEX: Record<string, string> = {
  'Pale Yellow': '#fefce8',
  'Yellow': '#fde047',
  'Dark Yellow': '#f59e0b',
  'Orange': '#f97316',
  'Dark Orange': '#9a3412',
}

const URGENCY_ALERT = ['Urgent', 'Highly Urgent', 'Sudden Onset']

function dayKey(d: Date) {
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function parseArr(val: string | null): string[] {
  if (!val) return []
  try { return JSON.parse(val) } catch { return [] }
}

export default function History() {
  const [voidings, setVoidings] = useState<Voiding[]>([])
  const [fluids, setFluids] = useState<FluidIntake[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Entry | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/voidings`).then(r => r.json()),
      fetch(`${API}/fluid-intake`).then(r => r.json()),
    ]).then(([v, f]) => {
      setVoidings(v)
      setFluids(f)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="history-loading">Loading…</div>

  const entries: Entry[] = [
    ...voidings.map(v => ({ kind: 'voiding' as const, ts: new Date(v.voided_at), data: v })),
    ...fluids.map(f => ({ kind: 'fluid' as const, ts: new Date(f.recorded_at), data: f })),
  ].sort((a, b) => b.ts.getTime() - a.ts.getTime())

  const grouped: [string, Entry[]][] = []
  for (const entry of entries) {
    const key = dayKey(entry.ts)
    const last = grouped[grouped.length - 1]
    if (last && last[0] === key) last[1].push(entry)
    else grouped.push([key, [entry]])
  }

  return (
    <div className="history-page">
      <h1>History</h1>

      {grouped.length === 0 && <p className="history-empty">No entries logged yet.</p>}

      {grouped.map(([day, dayEntries]) => (
        <div key={day} className="history-day-group">
          <div className="history-day-label">{day}</div>

          {dayEntries.map(entry => {
            if (entry.kind === 'voiding') {
              const v = entry.data
              const time = entry.ts.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
              const urgencyAlert = URGENCY_ALERT.includes(v.urgency ?? '')
              const appearances = parseArr(v.appearance_tags)
              const pains = parseArr(v.pain_locations)
              const colorHex = v.urine_color ? COLOR_HEX[v.urine_color] : null
              const hasTags = appearances.length > 0 || pains.length > 0 || v.hematuria && v.hematuria !== 'None' || v.cloudy

              return (
                <div key={`v-${v.id}`} className="history-entry" onClick={() => setSelected(entry)}>
                  <div className="he-row1">
                    <span className="he-time">{time}</span>
                    {v.is_nocturia && <span className="he-badge nocturia">Nocturia</span>}
                    {urgencyAlert && <span className="he-badge urgent">{v.urgency}</span>}
                    <span className="he-chevron">›</span>
                  </div>
                  <div className="he-row2">
                    {v.volume_ml != null && <span className="he-stat"><strong>{v.volume_ml}</strong> ml</span>}
                    {v.duration_seconds != null && <><span className="he-sep">·</span><span className="he-stat"><strong>{v.duration_seconds}</strong> s</span></>}
                    {v.qmax != null && <><span className="he-sep">·</span><span className="he-stat">Qmax <strong>{v.qmax.toFixed(1)}</strong></span></>}
                    {colorHex && <><span className="he-sep">·</span><span className="he-color-dot" style={{ background: colorHex }} /><span className="he-stat">{v.urine_color}</span></>}
                    {hasTags && (
                      <>
                        {v.cloudy && <><span className="he-sep">·</span><span className="he-tag warn">Cloudy</span></>}
                        {v.hematuria && v.hematuria !== 'None' && <><span className="he-sep">·</span><span className="he-tag danger">{v.hematuria}</span></>}
                        {appearances.map(a => <span key={a} className="he-tag warn">{a}</span>)}
                        {pains.map(p => <span key={p} className="he-tag danger">{p} pain</span>)}
                      </>
                    )}
                  </div>
                </div>
              )
            } else {
              const f = entry.data
              const time = entry.ts.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
              const drinks = parseArr(f.drink_types).join(', ')
              return (
                <div key={`f-${f.id}`} className="history-entry fluid" onClick={() => setSelected(entry)}>
                  <div className="he-row1">
                    <span className="he-time">{time}</span>
                    <span className="he-badge fluid">Fluid intake</span>
                    <span className="he-chevron">›</span>
                  </div>
                  <div className="he-row2">
                    {f.volume_ml != null && <span className="he-stat"><strong>{f.volume_ml}</strong> ml</span>}
                    {drinks && <><span className="he-sep">·</span><span className="he-stat">{drinks}</span></>}
                  </div>
                </div>
              )
            }
          })}
        </div>
      ))}

      {selected && (
        <div className="he-modal-bg" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="he-modal">
            <div className="he-modal-header">
              <span className="he-modal-title">
                {selected.kind === 'voiding' ? 'Voiding entry' : 'Fluid intake'}
                {' — '}
                {selected.ts.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              <button className="he-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            {selected.kind === 'voiding' && (() => {
              const v = selected.data
              const rows: [string, string][] = []
              if (v.volume_ml != null) rows.push(['Volume', `${v.volume_ml} ml`])
              if (v.duration_seconds != null) rows.push(['Duration', `${v.duration_seconds} s`])
              if (v.qmax != null) rows.push(['Qmax', `${v.qmax.toFixed(1)} ml/s`])
              if (v.urine_color) rows.push(['Urine color', v.urine_color])
              if (v.cloudy != null) rows.push(['Appearance', v.cloudy ? 'Cloudy' : 'Clear'])
              const app = parseArr(v.appearance_tags)
              if (app.length) rows.push(['Tags', app.join(', ')])
              if (v.hematuria && v.hematuria !== 'None') rows.push(['Hematuria', v.hematuria])
              if (v.urgency) rows.push(['Urgency', v.urgency])
              const pain = parseArr(v.pain_locations)
              if (pain.length) rows.push(['Pain', pain.join(', ')])
              rows.push(['Nocturia', v.is_nocturia ? 'Yes' : 'No'])
              return (
                <>
                  {rows.map(([k, val]) => (
                    <div key={k} className="he-modal-row">
                      <span className="he-modal-key">{k}</span>
                      <span className="he-modal-val">{val}</span>
                    </div>
                  ))}
                  {v.notes && <p className="he-modal-notes">{v.notes}</p>}
                </>
              )
            })()}

            {selected.kind === 'fluid' && (() => {
              const f = selected.data
              const drinks = parseArr(f.drink_types).join(', ')
              return (
                <>
                  {f.volume_ml != null && (
                    <div className="he-modal-row">
                      <span className="he-modal-key">Volume</span>
                      <span className="he-modal-val">{f.volume_ml} ml</span>
                    </div>
                  )}
                  {drinks && (
                    <div className="he-modal-row">
                      <span className="he-modal-key">Drink type</span>
                      <span className="he-modal-val">{drinks}</span>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}