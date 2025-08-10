import React, { useEffect, useState } from 'react'

export function KioskClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second:'2-digit' }
  return (
    <div style={{textAlign:'center', fontSize: '1.75rem', fontWeight: 600, margin:'10px 0'}}>
      {now.toLocaleTimeString([], opts)} • Asia/Manila
    </div>
  )
}

export function PinKeypad({
  value, onChange, onEnter
}:{ value:string; onChange:(s:string)=>void; onEnter:()=>void }){
  const add = (d:string)=> onChange((value+d).slice(0,6))
  const del = ()=> onChange(value.slice(0,-1))
  const keySize = 'var(--key-size)'

  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(3, minmax(72px, 1fr))',
      gap:'var(--gap)',
      justifyItems:'center'
    }}>
      {[...'123456789'].map(n=>
        <button key={n} onClick={()=>add(n)} style={keyBtnStyle(keySize)} aria-label={`digit ${n}`}>{n}</button>
      )}
      <button onClick={del} style={keyBtnStyle(keySize)} aria-label="delete">⌫</button>
      <button onClick={()=>add('0')} style={keyBtnStyle(keySize)} aria-label="digit 0">0</button>
      <button onClick={onEnter} style={keyBtnStyle(keySize)} aria-label="enter">↵</button>
    </div>
  )
}

const keyBtnStyle = (size:string): React.CSSProperties => ({
  width: size,
  height: size,
  fontSize: 'clamp(18px, 6vw, 24px)',
  borderRadius: 14,
  border: '1px solid var(--border)',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 700
})
