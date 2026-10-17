import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import { PinKeypad } from './components'
import './timekeeper-hybrid.css'

const cafeName = 'Jo’s Coffee House'
const cafeAddress = 'Layunan, Binangonan, Rizal'

function ManilaClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const time = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(now)
  const date = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now)
  return <div className="jk-clock" aria-label="Current Philippine time"><span className="jk-clock-caption">PHILIPPINE STANDARD TIME</span><strong>{time}</strong><span className="jk-clock-date">{date}</span></div>
}

export default function App() {
  const [pin, setPin] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ok:boolean; title:string; detail:string} | null>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  const submit = async (chosenAction: 'in' | 'out') => {
    if (busy) return
    setFeedback(null)
    if (!/^[0-9]{4,6}$/.test(pin)) { setFeedback({ok:false,title:'Check your PIN',detail:'Enter your personal 4–6 digit PIN.'}); return }
    setBusy(true)
    try {
      // Keep the existing attendance RPC and its argument names unchanged.
      const { data, error } = await supabase.rpc('punch_with_pin', { _pin: pin, _action: chosenAction, _note: note || null })
      if (error) throw error
      if (!data?.ok) { setFeedback({ok:false,title:'Not recorded',detail:data?.error ?? 'Please try again.'}); return }
      setFeedback({ok:true,title:data.action === 'clock_in' ? 'Time In recorded' : 'Time Out recorded',detail:`${data.staff_name} — your attendance was saved.`})
    } catch (e: any) {
      setFeedback({ok:false,title:'Could not save attendance',detail:e?.message ?? 'Network error. Please try again.'})
    } finally {
      setBusy(false)
      setPin('')
      setNote('')
      pinRef.current?.focus()
    }
  }

  return <main className="jk-app">
    <div className="jk-shell">
      <header className="jk-header">
        <div className="jk-brand"><img className="jk-brand-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAYAAADnRuK4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAxIDc5LjE0NjI4OTk3NzcsIDIwMjMvMDYvMjUtMjM6NTc6MTQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyNS4yIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MjBBOENCREYyN0ExMUYwQkI4MENEQTJEN0E2RDUxMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3MjBBOENCRUYyN0ExMUYwQkI4MENEQTJEN0E2RDUxMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcyMEE4Q0JCRjI3QTExRjBCQjgwQ0RBMkQ3QTZENTExIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjcyMEE4Q0JDRjI3QTExRjBCQjgwQ0RBMkQ3QTZENTExIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+IZPEQwAAOrBJREFUeNrs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" alt="Jo’s Coffee logo" /></div>
        <span className="jk-header-location">{cafeName} · {cafeAddress}</span>
      </header>
      <div className="jk-layout">
        <section className="jk-intro">
          <div className="jk-eyebrow">YOUR SHIFT STARTS HERE</div>
          <h1>Hey, welcome<br/>to Jo’s<span className="jk-dot">.</span></h1>
          <p>Clock in, clock out, and get on with your day.</p>
          <ManilaClock />
          <div className="jk-intro-footer"><span className="jk-status-dot"/> Attendance connected to Jo’s Timekeeper</div>
        </section>
        <section className="jk-card" aria-label="Time in and time out">
          <div className="jk-card-head"><div><div className="jk-step">TIME & ATTENDANCE</div><h2>Ready for your shift?</h2></div><span className="jk-shift-tag">SHIFT LOG</span></div>
          <div className="jk-actions">
            <button type="button" disabled={busy} className="jk-action jk-action-in" onClick={() => submit('in')}><span className="jk-action-icon">↗</span><strong>TIME IN</strong><small>Start your shift</small></button>
            <button type="button" disabled={busy} className="jk-action jk-action-out" onClick={() => submit('out')}><span className="jk-action-icon">↙</span><strong>TIME OUT</strong><small>End your shift</small></button>
          </div>
          <div className="jk-step jk-pin-label">ENTER YOUR PIN · THEN TAP TIME IN OR TIME OUT</div>
          <div className="jk-pin" ref={pinRef} tabIndex={-1} role="status" aria-label={`${pin.length} PIN digits entered`}><span>{pin ? '●'.repeat(pin.length) : 'Your personal PIN'}</span><small>{pin.length}/6</small></div>
          <div className="jk-keypad"><PinKeypad value={pin} onChange={(value: string) => setPin(value.replace(/\D/g,'').slice(0,6))} onEnter={() => setFeedback({ok:false,title:'Choose Time In or Time Out',detail:'Tap the blue or orange button to record your attendance.'})}/></div>
          <div className="jk-notes"><label htmlFor="jk-note">Add a note <span>Optional</span></label><textarea id="jk-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Late due to traffic, shift handover details…" rows={2}/></div>
          {feedback && <div className={`jk-feedback ${feedback.ok?'is-ok':'is-error'}`} role="alert"><strong>{feedback.title}</strong><span>{feedback.detail}</span></div>}
          <p className="jk-privacy">Enter your PIN first, then tap the blue or orange button. No confirmation needed.</p><p className="jk-privacy">Your PIN is private. Never share it with another staff member.</p>
        </section>
      </div>
      <footer className="jk-footer"><span>JO’S COFFEE · TEAM OPERATIONS</span><AdminPanel /></footer>
    </div>
  </main>
}

/* ----------------------- Admin Panel ----------------------- */
function AdminPanel() {
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState<string>(() => localStorage.getItem('admin_pass') || '')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Array<{id:string; full_name:string; pin_code:string; active:boolean}>>([])
  const [err, setErr] = useState<string>('')

  async function load() {
    setLoading(true); setErr('')
    try {
      const res = await fetch('/api/admin/list-staff', {
        headers: { 'x-admin-pass': pass }
      })
      const out = await res.json()
      if (!res.ok || !out.ok) throw new Error(out.error || 'Failed to load')
      setRows(out.staff || [])
    } catch (e:any) {
      setErr(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  function openPanel() {
    if (!pass) {
      const p = prompt('Enter admin password')
      if (!p) return
      setPass(p)
      localStorage.setItem('admin_pass', p)
    }
    setOpen(true)
    setTimeout(load, 0)
  }

  async function saveRow(r: any, idx: number) {
    setLoading(true); setErr('')
    try {
      const res = await fetch('/api/admin/update-pin', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'x-admin-pass': pass },
        body: JSON.stringify({ id: r.id, pin_code: r.pin_code, active: r.active })
      })
      const out = await res.json()
      if (!res.ok || !out.ok) throw new Error(out.error || 'Save failed')
      const clone = rows.slice()
      clone[idx] = out.staff
      setRows(clone)
      alert(`Saved for ${out.staff.full_name}`)
    } catch (e:any) {
      setErr(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{marginTop: 18}}>
      <button
        onClick={openPanel}
        style={{
          border: '1px solid var(--border)',
          background: '#fff', color: 'var(--brand)',
          borderRadius: 12, padding: '10px 14px',
          fontWeight: 700, cursor: 'pointer'
        }}
      >
        Admin
      </button>

      {open && (
        <div style={{
          marginTop: 12, background:'#fff', border:'1px solid #e7eef6',
          borderRadius: 16, padding: 12, boxShadow:'0 8px 20px rgba(2,48,105,.08)'
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
            <strong style={{color:'var(--brand)'}}>Staff & PINs</strong>
            <button onClick={load} disabled={loading} style={miniBtn}>Reload</button>
            <button
              onClick={()=>{localStorage.removeItem('admin_pass'); setPass(''); alert('Password cleared for this device.')}} 
              style={miniBtnOutline}
            >
              Forget password
            </button>
          </div>

          {err && <div style={{color:'#b00020', marginBottom:8}}>{err}</div>}

          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>PIN (4–6 digits)</th>
                  <th style={th}>Active</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={td}>{r.full_name}</td>
                    <td style={td}>
                      <input
                        value={r.pin_code || ''}
                        onChange={(e)=> {
                          const v = e.target.value.replace(/[^\d]/g,'').slice(0,6)
                          const clone = rows.slice(); clone[i] = {...r, pin_code: v}; setRows(clone)
                        }}
                        style={{width:120, padding:8, border:'1px solid var(--border)', borderRadius:8}}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={!!r.active}
                        onChange={(e)=>{ const clone = rows.slice(); clone[i] = {...r, active: e.target.checked}; setRows(clone) }}
                      />
                    </td>
                    <td style={td}>
                      <button onClick={()=>saveRow(r, i)} disabled={loading} style={miniBtn}>Save</button>
                    </td>
                  </tr>
                ))}
                {!rows.length && !loading && (
                  <tr><td colSpan={4} style={{...td, opacity:.7}}>No staff yet. Add in Supabase or via SQL.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign:'left', padding:'10px 8px', borderBottom:'1px solid #eef3f8', fontWeight:800, color:'var(--brand)', fontSize:'14px' }
const td: React.CSSProperties = { padding:'10px 8px', borderBottom:'1px solid #f2f6fa', fontSize:'14px' }
const miniBtn: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'none', background:'var(--brand)', color:'#fff', fontWeight:700, cursor:'pointer' }
const miniBtnOutline: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', background:'#fff', color:'var(--brand)', fontWeight:700, cursor:'pointer' }
