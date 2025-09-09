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
        {/* Header (only one now) */}
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


