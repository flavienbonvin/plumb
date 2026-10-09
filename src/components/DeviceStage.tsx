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
    <div className="relative w-full max-w-[760px] pb-5">
      {/* lid: a hairline of brushed aluminium around a black glass bezel */}
      <div
        className="relative rounded-[16px] p-[1.5px] shadow-[0_1px_0_rgba(255,255,255,.6)_inset] ring-1 ring-black/25 dark:ring-black/60"
        style={{ background: 'linear-gradient(180deg,#e9e9ec 0%,#c5c6cb 35%,#a9aab0 100%)' }}
      >
        <div className="relative rounded-[14.5px] bg-[#0a0a0b] p-[7px] sm:p-[10px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.07), inset 0 0 14px rgba(0,0,0,.9)' }}>
          {/* camera */}
          <span aria-hidden className="absolute top-[2.5px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#1d2330] ring-1 ring-white/10 sm:top-[3.5px]" />
          {screen}
          {/* glass reflection */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[7px] rounded-[10px] sm:inset-[10px] sm:rounded-[14px]"
            style={{ background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 62%, rgba(255,255,255,.04) 100%)' }}
          />
        </div>
      </div>
      {/* base seen from the front: wider than the lid, with the thumb notch and a rounded lip */}
      <div
        className="relative -mx-[5%] h-[13px] sm:h-[15px]"
        style={{
          background: 'linear-gradient(180deg,#8d8e94 0%,#d6d7db 18%,#c4c5ca 55%,#9a9ba1 100%)',
          borderRadius: '0 0 22px 22px / 0 0 12px 12px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 0 rgba(0,0,0,.25), 0 1px 0 rgba(0,0,0,.2)',
        }}
      >
        <span
          aria-hidden
          className="absolute top-0 left-1/2 h-[5px] w-[15%] -translate-x-1/2 rounded-b-[10px]"
          style={{ background: 'linear-gradient(180deg,#6f7076 0%,#a9aaaf 100%)', boxShadow: 'inset 0 1px 1px rgba(0,0,0,.35)' }}
        />
      </div>
      {/* soft contact shadow on the surface below */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[-4%] bottom-[8px] h-[18px] rounded-[50%] bg-black/35 blur-xl dark:bg-black/70" />
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
