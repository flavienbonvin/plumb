import { useCallback, useRef, useState } from 'react'

const COALESCE_MS = 600

export interface Change<T> { from: T; to: T }

/** State with undo / redo. Rapid consecutive changes (dragging, sliders) collapse into one step. */
export function useHistory<T>(initial: T) {
  const [present, setPresent] = useState(initial)
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])
  const last = useRef(0)
  const cur = useRef(initial)
  const [, bump] = useState(0)

  const set = useCallback((next: T | ((p: T) => T)) => {
    const value = typeof next === 'function' ? (next as (p: T) => T)(cur.current) : next
    const now = Date.now()
    if (now - last.current > COALESCE_MS) {
      past.current.push(cur.current)
      if (past.current.length > 100) past.current.shift()
    }
    last.current = now
    future.current = []
    cur.current = value
    setPresent(value)
    bump((n) => n + 1)
  }, [])

  /** Step back. Returns the state before and after, so callers can show what changed. */
  const undo = useCallback((): Change<T> | undefined => {
    const prev = past.current.pop()
    if (prev === undefined) return
    const from = cur.current
    future.current.push(from)
    cur.current = prev
    last.current = 0
    setPresent(prev)
    bump((n) => n + 1)
    return { from, to: prev }
  }, [])

  const redo = useCallback((): Change<T> | undefined => {
    const next = future.current.pop()
    if (next === undefined) return
    const from = cur.current
    past.current.push(from)
    cur.current = next
    last.current = 0
    setPresent(next)
    bump((n) => n + 1)
    return { from, to: next }
  }, [])

  /** Replace the state and wipe history. */
  const reset = useCallback((value: T) => {
    past.current = []
    future.current = []
    cur.current = value
    last.current = 0
    setPresent(value)
    bump((n) => n + 1)
  }, [])

  return { state: present, set, undo, redo, reset, canUndo: past.current.length > 0, canRedo: future.current.length > 0 }
}
