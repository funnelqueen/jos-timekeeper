import React, { useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import { KioskClock, PinKeypad } from './components'

const cafeName = 'Jo’s Coffee House'
const cafeAddress = '104 Osmeña Street, Layunan, Binangonan, Rizal'

export default function App() {
  const [pin, setPin] = useState('')
  const [action, setAction] = useState<'in' | 'out' | ''>('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const pinRef = useRef<HTMLInputElement>(null)

  const masked = useMemo(() => (pin.length ? '•'.repeat(pin.length) : ''), [pin])

  const submit = async () => {
    if (busy) return
    if (!pin || pin.length < 4) { alert('Please enter a 4–6 digit PIN.'); return }
    if (!action) { alert('Select Time In or Time Out.'); return }
    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('punch_with_pin', {
        _pin: pin, _action: action, _note: note || null
      })
      if (error) throw error
      if (!data?.ok) { alert(data?.error ?? 'Not recorded'); return }
      alert(`${data.action === 'clock_in' ? 'Time In' : 'Time Out'} recorded for ${data.staff_name}`)
    } catch (e: any) {
      alert(e?.message ?? 'Network error')
    } finally {
      setBusy(false); setPin(''); setAction(''); setNote(''); pinRef.current?.focus()
    }
  }

  return (
    <main style={{
      minHeight:'100vh',
      background:'var(--bg)',
      padding:'var(--container-pad)',
      fontFamily:"'Poppins',sans-serif"
    }}>
      <section style={{maxWidth:1080, margin:'0 auto'}}>
        {/* Header */}
        <div style={{textAlign:'center', marginBottom:12}}>
          <h1 style={{
            fontSize:'var(--h1-size)',
            fontWeight:800,
            color:'var(--brand)',
            margin:'4px 0'
          }}>
            Jo&apos;s Coffee Time Clock
          </h1>
          <p style={{opacity:.8, margin:0, fontSize:'var(--sub-size)'}}>
            {cafeName} • {cafeAddress}
          </p>
        </div>

        <KioskClock />

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:'var(--gap)',
          marginTop:16,
          alignItems:'start'
        }}>
          {/* Left card: PIN + keypad */}
          <article style={card}>
            <div style={{marginBottom:10, textAlign:'center'}}>
              <div
                id="pin"
                ref={pinRef as any}
                tabIndex={0}
                aria-label="PIN entry display"
                aria-live="polite"
                style={{
                  height:64,
                  border:'1px solid var(--border)',
                  borderRadius:'var(--radius)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:'var(--pin-font)',
                  letterSpacing:6,
                  background:'#fff',
                  color:'var(--brand)',
                  fontWeight:700
                }}
              >
                {pin || 'Enter PIN'}
              </div>
            </div>

            <PinKeypad value={pin} onChange={setPin} onEnter={submit} />
          </article>

          {/* Right card: actions + note + submit */}
          <article style={{...card, display:'flex', flexDirection:'column', gap:12}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--gap)'}}>
              <button onClick={()=>setAction('in')} style={actionBtn(action==='in')} aria-pressed={action==='in'}>Time In</button>
              <button onClick={()=>setAction('out')} style={actionBtn(action==='out')} aria-pressed={action==='out'}>Time Out</button>
            </div>

            <details>
              <summary style={{cursor:'pointer', color:'var(--brand)', fontWeight:600, fontSize:'clamp(14px,3.8vw,16px)'}}>
                Add a note (optional)
              </summary>
              <div style={{marginTop:8}}>
                <label htmlFor="note" style={{display:'block', marginBottom:6}}>Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e)=>setNote(e.target.value)}
                  placeholder="e.g. Late due to traffic"
                  style={{
                    width:'100%',
                    minHeight:110,
                    border:'1px solid var(--border)',
                    borderRadius:12,
                    padding:12,
                    fontSize:'clamp(14px,3.8vw,16px)'
                  }}
                />
              </div>
            </details>

            <button onClick={submit} disabled={busy} style={submitBtn}>
              {busy ? 'Submitting…' : 'Submit'}
            </button>
          </article>
        </div>

        {/* Admin */}
        <AdminPanel />
      </section>
    </main>
  )
}

const card: React.CSSProperties = {
  position:'relative',
  border:'1px solid #e7eef6',
  background:'#fff',
  borderRadius:16,
  padding:16,
  boxShadow:'0 6px 18px rgba(2,48,105,.08)'
}

const actionBtn = (active:boolean): React.CSSProperties => ({
  height:64,
  fontSize:'var(--btn-font)',
  borderRadius:14,
  border:`2px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
  background: active ? 'var(--brand)' : '#fff',
  color: active ? '#fff' : 'var(--brand)',
  cursor:'pointer',
  fontWeight:700,
  touchAction:'manipulation'
})

const submitBtn: React.CSSProperties = {
  height:70,
  fontSize:'var(--submit-font)',
  borderRadius:16,
  border:'none',
  background:'var(--brand)',
  color:'#fff',
  cursor:'pointer',
  marginTop:'auto',
  fontWeight:800,
  boxShadow:'0 10px 24px rgba(2,48,105,.18)',
  touchAction:'manipulation'
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
