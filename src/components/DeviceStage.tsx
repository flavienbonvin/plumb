import { useEffect, useRef, useState } from 'react'
import { useGradedSource } from '../hooks/useGradedSource'
import { usePanZoom } from '../hooks/usePanZoom'
import { drawWallpaper, get2dP3, layout, srcSize, type DeviceSettings } from '../lib/draw'
import { clockZone, type DeviceModel, type ScreenView } from '../lib/devices'
import { isBright, measureLegibility, type Legibility } from '../lib/legibility'
import { IPhoneHomeOverlay } from './IPhoneHomeOverlay'
import { IPhoneLockOverlay } from './IPhoneLockOverlay'
import { MacDesktopOverlay } from './MacDesktopOverlay'
import { MacLockOverlay } from './MacLockOverlay'

interface Props {
  model: DeviceModel
  image: ImageBitmap
  settings: DeviceSettings
  view: ScreenView
  /** iPhone home screen: blur the wallpaper behind the icons. */
  blur?: boolean
  onChange: (s: DeviceSettings) => void
  onLegibility?: (l: Legibility | null) => void
}

export function DeviceStage({ model, image, settings, view, blur, onChange, onLegibility }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [snap, setSnap] = useState({ x: false, y: false })
  const mac = model.kind === 'mac'
  const [level, setLevel] = useState<Legibility | null>(null)
  const [bright, setBright] = useState(false)
  const report = useRef(onLegibility)
  report.current = onLegibility
  const zone = clockZone(model.kind, model.w, model.h)

  // preview resolution: enough for crisp display, much cheaper than native
  const pw = mac ? 1600 : 720
  const ph = Math.round((pw * model.h) / model.w)
  const graded = useGradedSource(image, settings.finish.look, settings.finish.intensity)
  const { w: iw, h: ih } = srcSize(image)
  const L = layout(image, pw, ph, settings.frame)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const id = requestAnimationFrame(() => {
      const ctx = get2dP3(c)
      // the graded copy already carries the look, so only vignette and grain remain to draw
      drawWallpaper(ctx, graded, pw, ph, { ...settings, finish: { ...settings.finish, look: 'none' } }, model.kind)
      const l = view === 'lock' ? measureLegibility(c, clockZone(model.kind, model.w, model.h)) : null
      if (view === 'alt' && mac) setBright(isBright(c, { x0: 0, x1: 1, y0: 0, y1: 0.03 }))
      setLevel(l)
      report.current?.(l)
    })
    return () => cancelAnimationFrame(id)
  }, [graded, settings, pw, ph, model.kind, model.w, model.h, view, mac])

  usePanZoom(stage, {
    adjust: settings.adjust,
    imgW: iw,
    imgH: ih,
    viewFrac: { w: L.view.w / pw, h: L.view.h / ph, aspect: L.view.w / L.view.h },
    onSnap: (x, y) => setSnap((p) => (p.x === x && p.y === y ? p : { x, y })),
    onChange: (adjust) => onChange({ ...settings, adjust }),
  })

  const label = `${model.label} wallpaper preview. Drag to move, scroll or pinch to zoom, arrow keys to nudge, 0 to reset.`

  const screen = (
    <div
      ref={stage}
      tabIndex={0}
      role="application"
      aria-label={label}
      style={{ aspectRatio: `${model.w} / ${model.h}`, touchAction: 'none' }}
      className={`group relative cursor-grab touch-none overflow-hidden bg-black outline-none select-none active:cursor-grabbing ${
        mac ? 'rounded-[10px] sm:rounded-[14px]' : 'rounded-[13%/6%]'
      }`}
    >
      <canvas ref={canvas} width={pw} height={ph} className="absolute inset-0 h-full w-full" />
      {(snap.x || snap.y) && (
        <div className="pointer-events-none absolute" style={{ left: `${(L.view.x / pw) * 100}%`, top: `${(L.view.y / ph) * 100}%`, width: `${(L.view.w / pw) * 100}%`, height: `${(L.view.h / ph) * 100}%` }}>
          {snap.x && <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-300 shadow-[0_0_4px_rgba(34,211,238,.9)]" />}
          {snap.y && <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-300 shadow-[0_0_4px_rgba(34,211,238,.9)]" />}
        </div>
      )}
      {view === 'lock' && (
        <div
          aria-hidden
          className={`pointer-events-none absolute rounded-lg border border-dashed transition-opacity ${
            level && level !== 'good' ? 'border-amber-300 bg-amber-300/10 opacity-100' : 'border-white/70 opacity-0 group-hover:opacity-100'
          }`}
          style={{ left: `${zone.x0 * 100}%`, right: `${(1 - zone.x1) * 100}%`, top: `${zone.y0 * 100}%`, height: `${(zone.y1 - zone.y0) * 100}%` }}
        />
      )}
      {view === 'lock' && (mac ? <MacLockOverlay notch={!!model.notch} /> : <IPhoneLockOverlay pt={model.pt} island={model.island} notch={model.notchPt} />)}
      {view === 'alt' && !mac && blur && (
        <div className="pointer-events-none absolute inset-0" style={{ containerType: 'inline-size' }} aria-hidden>
          <div className="absolute inset-0 bg-black/10" style={{ backdropFilter: 'blur(5cqw) saturate(1.1)', WebkitBackdropFilter: 'blur(5cqw) saturate(1.1)' }} />
        </div>
      )}
      {view === 'alt' && (mac ? <MacDesktopOverlay notch={!!model.notch} dark={bright} /> : <IPhoneHomeOverlay pt={model.pt} island={model.island} notch={model.notchPt} />)}
    </div>
  )

  const metal = 'bg-gradient-to-b from-stone-300 to-stone-400 dark:from-neutral-600 dark:to-neutral-800'
  const key = `absolute w-[3px] ${metal} ring-1 ring-black/10 dark:ring-white/10`

  return mac ? (
    <div className="w-full max-w-[760px]">
      <div className="rounded-[20px] bg-gradient-to-b from-stone-300 to-stone-400 p-[10px] shadow-2xl shadow-black/25 ring-1 ring-black/10 dark:from-neutral-700 dark:to-neutral-800 dark:ring-white/10 sm:p-[12px]">
        <div className="rounded-[14px] bg-black p-[6px] sm:rounded-[16px]">{screen}</div>
      </div>
      {/* hinge and base */}
      <div className="relative -mx-[3.5%] h-[12px] rounded-b-[18px] rounded-t-[2px] bg-gradient-to-b from-stone-400 via-stone-300 to-stone-400 shadow-[0_18px_30px_-12px_rgba(0,0,0,.35)] ring-1 ring-black/10 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 dark:ring-white/10">
        <span className="absolute top-0 left-1/2 h-[4px] w-[16%] -translate-x-1/2 rounded-b-md bg-black/15" />
      </div>
    </div>
  ) : (
    <div className="relative w-[min(100%,290px)]">
      <span className={`${key} -left-[2px] top-[13%] h-[3%] rounded-l-sm`} />
      <span className={`${key} -left-[2px] top-[19%] h-[6.5%] rounded-l-sm`} />
      <span className={`${key} -left-[2px] top-[27%] h-[6.5%] rounded-l-sm`} />
      <span className={`${key} -right-[2px] top-[23%] h-[10%] rounded-r-sm`} />
      <span className={`${key} -right-[2px] top-[67%] h-[7%] rounded-r-sm`} />
      <div className="rounded-[17%/7.6%] bg-gradient-to-b from-stone-300 to-stone-400 p-[3px] shadow-2xl shadow-black/30 ring-1 ring-black/10 dark:from-neutral-600 dark:to-neutral-800 dark:ring-white/10">
        <div className="rounded-[16.5%/7.3%] bg-black p-[7px]">{screen}</div>
      </div>
    </div>
  )
}
