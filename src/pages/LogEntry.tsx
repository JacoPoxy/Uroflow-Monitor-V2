import { useState } from 'react'
import axios from 'axios'

const URGENCY_OPTIONS = ['None', 'Awareness', 'Urgent', 'Highly Urgent', 'Sudden Onset']
const COLORS = ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Orange', 'Dark Orange']
const COLOR_HEX = ['#fefce8', '#fde047', '#f59e0b', '#f97316', '#9a3412']
const APPEARANCE_OPTIONS = ['Clots', 'Flakes', 'Specks']
const HEMATURIA_OPTIONS = ['None', 'Post Pink', 'Post Drops', 'Visible Blood']
const PAIN_LOCATIONS = ['Spasm', 'Perineum', 'Shaft', 'Tip']
const STREAM_OPTIONS = ['Normal', 'Weak', 'Intermittent', 'Straining', 'Dribbling']
const DRINK_TYPES = [
  { label: 'Neutral', icon: '🥤' },
  { label: 'Caffeine', icon: '☕' },
  { label: 'Fizzy', icon: '⚡' },
  { label: 'Acidic', icon: '🍋' },
  { label: 'Alcohol', icon: '🍷' },
]

const API = 'http://localhost:3001'

export default function LogEntry() {
  const [tab, setTab] = useState<'voiding' | 'fluid'>('voiding')

  // Voiding state
  const [voidedAt, setVoidedAt] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  })
  const [isNocturia, setIsNocturia] = useState(false)
  const [urgency, setUrgency] = useState('None')
  const [volumeHundreds, setVolumeHundreds] = useState(0)
  const [volumeFine, setVolumeFine] = useState(0)
  const [qmax, setQmax] = useState('')
  const [duration, setDuration] = useState('')
  const [urineColor, setUrineColor] = useState('')
  const [cloudy, setCloudy] = useState(false)
  const [appearanceTags, setAppearanceTags] = useState<string[]>([])
  const [hematuria, setHematuria] = useState('None')
  const [painLocations, setPainLocations] = useState<string[]>([])
  const [stream, setStream] = useState('Normal')
  const [notes, setNotes] = useState('')

  // Fluid state
  const [recordedAt, setRecordedAt] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  })
  const [fluidHundreds, setFluidHundreds] = useState(0)
  const [fluidFine, setFluidFine] = useState(0)
  const [drinkTypes, setDrinkTypes] = useState<string[]>(['Neutral'])

  const toggleArr = (arr: string[], val: string, set: (a: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const submitVoiding = async () => {
    await axios.post(`${API}/voidings`, {
      voided_at: voidedAt,
      is_nocturia: isNocturia,
      urgency,
      volume_ml: volumeHundreds + volumeFine,
      qmax: qmax ? Number(qmax) : null,
      duration_seconds: duration ? Number(duration) : null,
      urine_color: urineColor,
      cloudy,
      appearance_tags: JSON.stringify(appearanceTags),
      hematuria,
      pain_locations: JSON.stringify(painLocations),
      pain_types: JSON.stringify([]),
      stream,
      notes,
    })
    alert('Voiding logged!')
  }

  const submitFluid = async () => {
    await axios.post(`${API}/fluid-intake`, {
      recorded_at: recordedAt,
      volume_ml: fluidHundreds + fluidFine,
      drink_types: JSON.stringify(drinkTypes),
    })
    alert('Fluid intake logged!')
  }

  const isFluid = tab === 'fluid'

  return (
    <div className="log-entry">
      <div className="log-header">
        <h1>New Entry</h1>
        <p className="log-subtitle">Log a voiding event or fluid intake.</p>
      </div>

      <div className="log-tabs">
        <button className={!isFluid ? 'active' : ''} onClick={() => setTab('voiding')}>
          💧 Voiding
        </button>
        <button className={isFluid ? 'active fluid' : ''} onClick={() => setTab('fluid')}>
          〰 Fluid Intake
        </button>
      </div>

      {tab === 'voiding' && (
        <>
          <div className="card">
            <div className="card-header">
              <span className="card-icon blue">💧</span>
              <span>Core Metrics</span>
            </div>
            <div className="divider" />

            <div className="field">
              <label>Date & Time <span className="req">*</span></label>
              <input type="datetime-local" value={voidedAt} onChange={e => setVoidedAt(e.target.value)} />
            </div>

            <div className="field">
              <div className="field-row-between">
                <label>Volume (ml) <span className="req">*</span></label>
                <span className="vol-display">{volumeHundreds + volumeFine > 0 ? `${volumeHundreds + volumeFine} ml` : '— ml'}</span>
              </div>
              <div className="step-label">STEP 1 — HUNDREDS</div>
              <div className="vol-grid">
                {[100,200,300,400].map(v => (
                  <button key={v} className={`vol-btn ${volumeHundreds === v ? 'active' : ''}`} onClick={() => setVolumeHundreds(v)}>{v}</button>
                ))}
              </div>
              <div className="step-label">STEP 2 — FINE TUNE (OPTIONAL)</div>
              <div className="vol-grid three">
                {[25,50,75].map(v => (
                  <button key={v} className={`vol-btn ${volumeFine === v ? 'active' : ''}`} onClick={() => setVolumeFine(prev => prev === v ? 0 : v)}>+{v}</button>
                ))}
              </div>
            </div>

            <div className="field row-2">
              <div>
                <label>Qmax (ml/s) — Optional</label>
                <div className="input-suffix">
                  <input type="number" value={qmax} onChange={e => setQmax(e.target.value)} placeholder="e.g. 12.5" />
                  <span>ml/s</span>
                </div>
              </div>
              <div>
                <label>Duration — Optional</label>
                <div className="input-suffix">
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="—" />
                  <span>sec</span>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Nocturia</label>
              <div className="toggle-pill">
                <button className={!isNocturia ? 'active' : ''} onClick={() => setIsNocturia(false)}>☀ Awake</button>
                <button className={isNocturia ? 'active' : ''} onClick={() => setIsNocturia(true)}>🌙 Bedtime</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span>Visual Assessment</span></div>
            <div className="divider" />

            <div className="field">
              <label>Urine Color</label>
              <div className="color-swatches">
                {COLORS.map((c, i) => (
                  <div key={c} className="swatch-wrap" onClick={() => setUrineColor(c)}>
                    <div className={`color-swatch ${urineColor === c ? 'active' : ''}`} style={{background: COLOR_HEX[i]}} />
                    <span className={urineColor === c ? 'swatch-label active' : 'swatch-label'}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Appearance</label>
              <div className="appearance-row">
                <div className="toggle-pill">
                  <button className={!cloudy ? 'active' : ''} onClick={() => setCloudy(false)}>Clear</button>
                  <button className={cloudy ? 'active' : ''} onClick={() => setCloudy(true)}>Cloudy</button>
                </div>
                <div className="pills">
                  {APPEARANCE_OPTIONS.map(a => (
                    <button key={a} className={`pill ${appearanceTags.includes(a) ? 'active' : ''}`} onClick={() => toggleArr(appearanceTags, a, setAppearanceTags)}>{a}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field">
              <label>Blood / Hematuria</label>
              <div className="pills">
                {HEMATURIA_OPTIONS.map(h => (
                  <button key={h} className={`pill ${hematuria === h ? 'active' : ''}`} onClick={() => setHematuria(h)}>{h}</button>
                ))}
              </div>
              {hematuria !== 'None' && <div className="warning">⚠ Hematuria detected — consult your physician if persistent.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span>Symptoms</span></div>
            <div className="divider" />

            <div className="field">
              <label>Urgency</label>
              <div className="pills">
                {URGENCY_OPTIONS.map(u => (
                  <button key={u} className={`pill ${urgency === u ? 'active' : ''}`} onClick={() => setUrgency(u)}>{u}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Pain Location (select all that apply)</label>
              <div className="pills">
                {PAIN_LOCATIONS.map(p => (
                  <button key={p} className={`pill ${painLocations.includes(p) ? 'active' : ''}`} onClick={() => toggleArr(painLocations, p, setPainLocations)}>{p}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Stream Quality</label>
              <select value={stream} onChange={e => setStream(e.target.value)}>
                {STREAM_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="card">
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Any additional observations..." />
          </div>

          <button className="save-btn" onClick={submitVoiding}>Save Void Entry</button>
        </>
      )}

      {tab === 'fluid' && (
        <>
          <div className="card">
            <div className="card-header">
              <span className="card-icon teal">〰</span>
              <span>Fluid Intake</span>
            </div>
            <div className="divider" />

            <div className="field">
              <label>Date & Time <span className="req">*</span></label>
              <input type="datetime-local" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} />
            </div>

            <div className="field">
              <div className="field-row-between">
                <label>Volume (ml) <span className="req">*</span></label>
                <span className="vol-display">{fluidHundreds + fluidFine > 0 ? `${fluidHundreds + fluidFine} ml` : '— ml'}</span>
              </div>
              <div className="step-label">STEP 1 — HUNDREDS</div>
              <div className="vol-grid">
                {[100,200,300,400].map(v => (
                  <button key={v} className={`vol-btn ${fluidHundreds === v ? 'active' : ''}`} onClick={() => setFluidHundreds(v)}>{v}</button>
                ))}
              </div>
              <div className="step-label">STEP 2 — FINE TUNE (OPTIONAL)</div>
              <div className="vol-grid three">
                {[25,50,75].map(v => (
                  <button key={v} className={`vol-btn ${fluidFine === v ? 'active' : ''}`} onClick={() => setFluidFine(prev => prev === v ? 0 : v)}>+{v}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span>Drink Type</span></div>
            <div className="divider" />
            <div className="drink-grid">
              {DRINK_TYPES.map(d => (
                <button key={d.label} className={`drink-btn ${drinkTypes.includes(d.label) ? 'active' : ''}`}
                  onClick={() => toggleArr(drinkTypes, d.label, setDrinkTypes)}>
                  <span className="drink-icon">{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
            <p className="hint">Select all that apply. "Neutral" is the default.</p>
          </div>

          <button className="save-btn teal" onClick={submitFluid}>Save Fluid Intake</button>
        </>
      )}
    </div>
  )
}