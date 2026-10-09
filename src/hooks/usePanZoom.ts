import { useEffect, useRef } from 'react'
import { MAX_ZOOM, clampAdjust, type Adjust } from '../lib/draw'

interface Opts {
  adjust: Adjust
  /** Natural image size and the viewport (as fraction of the stage) for clamping. */
  imgW: number
  imgH: number
  /** Viewport aspect (w/h) in any unit and its share of the element size. */
  viewFrac: { w: number; h: number; aspect: number }
  onChange: (a: Adjust) => void
  /** Reports which axes the centre magnet is currently holding. */
  onSnap?: (x: boolean, y: boolean) => void
}

/** Screen px within which a drag sticks to the centre. */
const SNAP_PX = 10

/** Pointer drag, wheel / trackpad pinch, two-finger pinch, keyboard and double-click reset. */
export function usePanZoom(ref: React.RefObject<HTMLElement | null>, opts: Opts) {
  const o = useRef(opts)
  o.current = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pts = new Map<number, { x: number; y: number }>()
    let lastDist = 0
    let raw = { px: 0, py: 0 }

    const apply = (a: Adjust) => {
      const { imgW, imgH, viewFrac } = o.current
      // viewport in arbitrary units with the right aspect
      o.current.onChange(clampAdjust(a, imgW, imgH, viewFrac.aspect, 1))
    }
    const size = () => {
      const r = el.getBoundingClientRect()
      const { viewFrac } = o.current
      return { w: Math.max(1, r.width * viewFrac.w), h: Math.max(1, r.height * viewFrac.h) }
    }
    const zoomBy = (f: number) => {
      const a = o.current.adjust
      apply({ ...a, zoom: Math.min(MAX_ZOOM, Math.max(1, a.zoom * f)) })
    }

    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      lastDist = 0
      raw = { px: o.current.adjust.px, py: o.current.adjust.py }
    }
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId)
      if (!p) return
      const prev = { ...p }
      p.x = e.clientX
      p.y = e.clientY
      if (pts.size === 1) {
        const s = size()
        const a = o.current.adjust
        const { imgW, imgH, viewFrac } = o.current
        // unsnapped position keeps accumulating so you can pull out of the magnet
        const r = clampAdjust(
          { ...a, px: raw.px + (e.clientX - prev.x) / s.w, py: raw.py + (e.clientY - prev.y) / s.h },
          imgW, imgH, viewFrac.aspect, 1,
        )
        raw = { px: r.px, py: r.py }
        const sx = Math.abs(r.px * s.w) < SNAP_PX
        const sy = Math.abs(r.py * s.h) < SNAP_PX
        o.current.onSnap?.(sx && r.px !== 0, sy && r.py !== 0)
        apply({ ...a, px: sx ? 0 : r.px, py: sy ? 0 : r.py })
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (lastDist) zoomBy(d / lastDist)
        lastDist = d
      }
    }
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId)
      lastDist = 0
      raw = { px: o.current.adjust.px, py: o.current.adjust.py }
      o.current.onSnap?.(false, false)
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const k = e.ctrlKey ? 0.01 : 0.0018
      zoomBy(Math.exp(-e.deltaY * k))
    }
    const dbl = () => apply({ zoom: 1, px: 0, py: 0 })
    const key = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.02 : 0.005
      const a = o.current.adjust
      switch (e.key) {
        case 'ArrowLeft': apply({ ...a, px: a.px - step }); break
        case 'ArrowRight': apply({ ...a, px: a.px + step }); break
        case 'ArrowUp': apply({ ...a, py: a.py - step }); break
        case 'ArrowDown': apply({ ...a, py: a.py + step }); break
        case '+': case '=': zoomBy(1.05); break
        case '-': case '_': zoomBy(1 / 1.05); break
        case '0': dbl(); break
        default: return
      }
      e.preventDefault()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('dblclick', dbl)
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('dblclick', dbl)
      el.removeEventListener('keydown', key)
    }
  }, [ref])
}
