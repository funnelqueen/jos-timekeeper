
import React, { useEffect, useState } from 'react'

export function KioskClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second:'2-digit' }
  return (
    <div style={{textAlign:'center', fontSize: '2.25rem', fontWeight: 600, margin:'10px 0'}}>
      {now.toLocaleTimeString([], opts)} • Asia/Manila
    </div>
  )
}

export function PinKeypad({ value, onChange, onEnter }:{value:string,onChange:(s:string)=>void,onEnter:()=>void}){
  const add = (d:string)=> onChange((value+d).slice(0,6))
  const del = ()=> onChange(value.slice(0,-1))
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3,80px)', gap:10, justifyContent:'center'}}>
      {[...'123456789'].map(n=>
        <button key={n} onClick={()=>add(n)} style={btn}>{n}</button>
      )}
      <button onClick={del} style={btn}>⌫</button>
      <button onClick={()=>add('0')} style={btn}>0</button>
      <button onClick={onEnter} style={btn}>↵</button>
    </div>
  )
}

const btn: React.CSSProperties = {
  height: 64, fontSize: 24, borderRadius: 12, border:'1px solid #ccc', background:'#fff', cursor:'pointer'
}
