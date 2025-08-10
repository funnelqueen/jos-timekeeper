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
      minHeight: '100vh',
      background: '#f5fdff',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,                 // Poppins Extra Bold
            color: '#023069',
            margin: 0,
            letterSpacing: 0.2
          }}>
            Jo&apos;s Coffee Time Clock
          </h1>
          <p style={{ opacity: .7, margin: '6px 0' }}>{cafeName} • {cafeAddress}</p>
        </div>

        <KioskClock />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 16
        }}>
          <article style={card}>
            <label htmlFor="pin" style={{ position: 'absolute', left: -9999 }}>Employee PIN</label>
            <div
              id="pin"
              ref={pinRef as any}
              tabIndex={0}
              aria-label="PIN entry display"
              aria-live="polite"
              style={{
                height: 56,
                border: '1px solid #cdd6e0',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                letterSpacing: 6,
                background: '#fff',
                color: '#023069',
                fontWeight: 700
              }}
            >
              {pin || 'Enter PIN'}
            </div>
            <div style={{ marginTop: 12 }}>
              <PinKeypad value={pin} onChange={setPin} onEnter={submit} />
            </div>
          </article>

          <article style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setAction('in')} style={actionBtn(action === 'in')}>Time In</button>
              <button onClick={() => setAction('out')} style={actionBtn(action === 'out')}>Time Out</button>
            </div>

            <details>
              <summary style={{ cursor: 'pointer', color: '#023069', fontWeight: 600 }}>Add a note (optional)</summary>
              <div style={{ marginTop: 8 }}>
                <label htmlFor="note" style={{ display: 'block', marginBottom: 6 }}>Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Late due to traffic"
                  style={{
                    width: '100%',
                    minHeight: 100,
                    border: '1px solid #cdd6e0',
                    borderRadius: 10,
                    padding: 10,
                    fontFamily: "'Poppins', sans-serif"
                  }}
                />
              </div>
            </details>

            <button onClick={submit} disabled={busy} style={submitBtn}>
              {busy ? 'Submitting…' : 'Submit'}
            </button>
          </article>
        </div>
      </section>
    </main>
  )
}

const card: React.CSSProperties = {
  position: 'relative',
  border: '1px solid #e5edf6',
  background: '#ffffff',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 2px 8px rgba(2,48,105,0.06)'
}

const actionBtn = (active: boolean): React.CSSProperties => ({
  height: 56,
  fontSize: 20,
  borderRadius: 12,
  border: `2px solid ${active ? '#023069' : '#cdd6e0'}`,
  background: active ? '#023069' : '#ffffff',
  color: active ? '#ffffff' : '#023069',
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: "'Poppins', sans-serif"
})

const submitBtn: React.CSSProperties = {
  height: 64,
  fontSize: 22,
  borderRadius: 14,
  border: 'none',
  background: '#023069',
  color: '#fff',
  cursor: 'pointer',
  marginTop: 'auto',
  fontWeight: 800,
  fontFamily: "'Poppins', sans-serif",
  boxShadow: '0 4px 12px rgba(2,48,105,0.18)'
}
