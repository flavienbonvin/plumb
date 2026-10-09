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

  // Device colours stay the same in light and dark mode, like the real thing.
  const titanium = 'linear-gradient(90deg,#6d6d72 0%,#c9c9ce 6%,#f4f4f6 12%,#b3b3b8 30%,#a0a0a6 70%,#e6e6e9 90%,#8a8a90 100%)'
  const buttonStyle = { background: 'linear-gradient(90deg,#8d8d93,#d9d9dd 50%,#8d8d93)' }

  return mac ? (
    <div className="relative w-full max-w-[760px] pb-6">
      {/* lid: anodised aluminium with a lit top edge, shading to the sides */}
      <div
        className="relative rounded-[20px] p-[4px] sm:p-[5px]"
        style={{
          background: 'linear-gradient(90deg,rgba(0,0,0,.22),rgba(255,255,255,0) 6%,rgba(255,255,255,0) 94%,rgba(0,0,0,.22)), linear-gradient(180deg,#f6f6f8 0%,#d8d9dd 8%,#bfc0c5 55%,#a4a5ab 100%)',
          boxShadow: '0 0 0 1px rgba(0,0,0,.4), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,.25)',
        }}
      >
        <div className="relative rounded-[16px] bg-black p-[6px] sm:p-[9px]" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.06)' }}>
          <span aria-hidden className="absolute top-[2px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#1b2230] ring-1 ring-white/20 sm:top-[3px]" />
          {screen}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[6px] rounded-[10px] sm:inset-[9px] sm:rounded-[14px]"
            style={{ background: 'linear-gradient(115deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 68%,rgba(255,255,255,.04) 100%)' }}
          />
        </div>
      </div>
      {/* hinge shadow where the lid meets the base */}
      <div aria-hidden className="relative z-10 mx-[2%] -mt-px h-[3px]" style={{ background: 'linear-gradient(180deg,#3b3c40,#7a7b80)', borderRadius: '0 0 4px 4px' }} />
      {/* base seen from the front: slightly wider, thick enough to show a lit front lip */}
      <div
        className="relative -mx-[5%] -mt-px h-[16px] sm:h-[20px]"
        style={{
          background: 'linear-gradient(90deg,rgba(0,0,0,.18),rgba(255,255,255,0) 8%,rgba(255,255,255,0) 92%,rgba(0,0,0,.18)), linear-gradient(180deg,#dcdde1 0%,#e9e9ec 20%,#c9cace 62%,#9fa0a6 100%)',
          borderRadius: '0 0 28px 28px / 0 0 16px 16px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.3), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,.25)',
        }}
      >
        <span aria-hidden className="absolute top-0 left-1/2 h-[7px] w-[16%] -translate-x-1/2 rounded-b-[14px]" style={{ background: 'linear-gradient(180deg,#686970,#b9babf)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.45)' }} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-[-2%] bottom-[8px] h-[18px] rounded-[50%] bg-black/35 blur-xl" />
    </div>
  ) : (
    <div className="relative w-[min(100%,290px)]">
      {/* side buttons sit just outside the rail */}
      <span className="absolute -left-[3px] top-[13%] h-[3%] w-[4px] rounded-l-[2px]" style={buttonStyle} />
      <span className="absolute -left-[3px] top-[19%] h-[6.5%] w-[4px] rounded-l-[2px]" style={buttonStyle} />
      <span className="absolute -left-[3px] top-[27%] h-[6.5%] w-[4px] rounded-l-[2px]" style={buttonStyle} />
      <span className="absolute -right-[3px] top-[23%] h-[10%] w-[4px] rounded-r-[2px]" style={buttonStyle} />
      <span className="absolute -right-[3px] top-[67%] h-[7%] w-[4px] rounded-r-[2px]" style={buttonStyle} />
      {/* titanium rail */}
      <div className="rounded-[17%/7.6%] p-[4px] shadow-2xl shadow-black/35" style={{ background: titanium, boxShadow: '0 0 0 1px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.5), 0 30px 50px -20px rgba(0,0,0,.5)' }}>
        {/* black bezel */}
        <div className="rounded-[16.2%/7.2%] bg-black p-[6px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>{screen}</div>
      </div>
    </div>
  )
}
