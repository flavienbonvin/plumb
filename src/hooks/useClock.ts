import { useEffect, useState } from 'react'

export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let t: number
    const tick = () => {
      setNow(new Date())
      t = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    }
    t = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    return () => clearTimeout(t)
  }, [])
  return now
}
