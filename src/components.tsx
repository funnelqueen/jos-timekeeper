import React, { useEffect, useState } from 'react'

export function KioskClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second:'2-digit' }
  return (
    <div style={{textAlign:'center', fontSize:'clamp(18px,5.5vw,28px)', fontWeight:700, margin:'8px 0'}}>
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
      justifyItems:'center',
      alignItems:'center'
    }}>
      {[...'123456789'].map(n=>
        <button key={n} onClick={()=>add(n)} style={keyBtnStyle(keySize)} aria-label={`digit ${n}`}>{n}</button>
      )}
      <button onClick={del} style={keyBtnStyle(keySize)} aria-label="delete">←</button>
      <button onClick={()=>add('0')} style={keyBtnStyle(keySize)} aria-label="digit 0">0</button>
      <button onClick={onEnter} style={keyBtnStyle(keySize)} aria-label="enter">⏎</button>
    </div>
  )
}

const keyBtnStyle = (size:string): React.CSSProperties => ({
  width:size,
  height:size,
  fontSize:'clamp(20px,6.5vw,26px)',
  borderRadius:14,
  border:'1px solid var(--border)',
  background:'#fff',
  cursor:'pointer',
  fontWeight:700,
  color:'var(--brand)',
  boxShadow:'0 2px 6px rgba(2,48,105,.06)'
})
