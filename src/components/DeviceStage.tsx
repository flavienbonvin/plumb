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
  /** Small screens: the preview may be at most this tall, in % of the viewport height. */
  maxVh?: number
}

export function DeviceStage({ model, image, settings, view, blur, onChange, onLegibility, maxVh }: Props) {
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

  // Frame proportions in % of the laptop's width, so they scale with it.
  const shape = macShape(model.group)
  const screen = (
    <div
      ref={stage}
      tabIndex={0}
      role="application"
      aria-label={label}
      style={{ aspectRatio: `${model.w} / ${model.h}`, touchAction: 'none', ...(mac ? { borderRadius: `${shape.screenR}cqw` } : {}) }}
      className={`group relative cursor-grab touch-none overflow-hidden bg-black outline-none select-none active:cursor-grabbing ${
        mac ? '' : 'rounded-[13%/6%]'
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

  // On small screens, limit the width so the whole device fits in maxVh of the viewport height.
  const ratio = model.h / model.w
  const capW = maxVh
    ? mac
      ? `calc(${maxVh}svh / ${(0.968 * ratio + 0.112).toFixed(3)})`
      : `calc((${maxVh}svh - 20px) / ${ratio.toFixed(3)} + 20px)`
    : undefined
  const cap = capW ? ({ '--cap': capW } as React.CSSProperties) : undefined

  return mac ? (
    <div className="relative mx-auto w-full max-w-[760px] max-lg:max-w-(--cap)" style={{ ...cap, containerType: 'inline-size', paddingBottom: shape.stand ? 0 : '3cqw' }}>
      {/* lid: anodised aluminium with a lit top edge, shading to the sides */}
      <div
        className="relative"
        style={{
          padding: `${shape.rim}cqw`,
          borderRadius: `${shape.lidR}cqw`,
          background: 'linear-gradient(90deg,rgba(0,0,0,.2),rgba(255,255,255,0) 5%,rgba(255,255,255,0) 95%,rgba(0,0,0,.2)), linear-gradient(180deg,#f6f6f8 0%,#d8d9dd 8%,#bfc0c5 55%,#a4a5ab 100%)',
          boxShadow: '0 0 0 1px rgba(0,0,0,.4), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,.25)',
        }}
      >
        <div
          className="relative bg-black"
          style={{
            padding: `${shape.bezel}cqw`,
            paddingBottom: `${shape.chin}cqw`,
            borderRadius: `${shape.lidR - shape.rim}cqw`,
            boxShadow: '0 0 0 1px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.06)',
          }}
        >
          {(!model.notch || view === 'off') && <span aria-hidden className="absolute left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#1b2230] ring-1 ring-white/20" style={{ top: `${shape.bezel / 2 - 0.2}cqw` }} />}
          {screen}
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{ inset: `${shape.bezel}cqw ${shape.bezel}cqw ${shape.chin}cqw`, borderRadius: `${shape.screenR}cqw`, background: 'linear-gradient(115deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 68%,rgba(255,255,255,.04) 100%)' }}
          />
        </div>
      </div>
      {shape.stand ? (
        // external display: neck and foot instead of a keyboard base
        <div aria-hidden className="relative mx-auto" style={{ width: '14cqw' }}>
          <div style={{ height: '9cqw', background: 'linear-gradient(90deg,#8e8f95,#e4e4e8 35%,#c3c4c9 65%,#85868c)', clipPath: 'polygon(14% 0,86% 0,100% 100%,0 100%)' }} />
          <div style={{ height: '1cqw', width: '22cqw', marginLeft: '-4cqw', background: 'linear-gradient(180deg,#e9e9ec,#b0b1b6)', borderRadius: '0.6cqw', boxShadow: '0 0 0 1px rgba(0,0,0,.3), 0 1.2cqw 2cqw rgba(0,0,0,.3)' }} />
        </div>
      ) : (
        <>
          {/* hinge shadow where the lid meets the base */}
          <div aria-hidden className="relative z-10 -mt-px h-[3px]" style={{ margin: `0 ${shape.lidR}cqw`, background: 'linear-gradient(180deg,#3b3c40,#7a7b80)', borderRadius: '0 0 4px 4px' }} />
          {/* base: same width as the lid, with a thumb notch */}
          <div
            className="relative -mt-px"
            style={{
              height: `${shape.baseH}cqw`,
              borderRadius: shape.baseRadius,
              background: 'linear-gradient(90deg,rgba(0,0,0,.16),rgba(255,255,255,0) 6%,rgba(255,255,255,0) 94%,rgba(0,0,0,.16)), linear-gradient(180deg,#dcdde1 0%,#e9e9ec 20%,#c9cace 62%,#9fa0a6 100%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,.3), inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,.25)',
            }}
          >
            <span aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: '15cqw', height: `${shape.baseH * 0.35}cqw`, borderRadius: '0 0 1.6cqw 1.6cqw', background: 'linear-gradient(180deg,#686970,#b9babf)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.45)' }} />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-[-1%] bottom-[2cqw] h-[2.4cqw] rounded-[50%] bg-black/35 blur-xl" />
        </>
      )}
    </div>
  ) : (
    <div className="relative mx-auto w-[min(100%,290px)] max-lg:max-w-(--cap) lg:w-[min(100%,330px)]" style={cap}>
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

interface MacShape { rim: number; bezel: number; chin: number; lidR: number; screenR: number; baseH: number; baseRadius: string; stand?: boolean }

/** Frame proportions in % of width. Air is soft and tapered, Pro is squarer and thicker, displays get a stand. */
function macShape(group: string): MacShape {
  switch (group) {
    case 'MacBook Pro':
      return { rim: 0.5, bezel: 1.0, chin: 1.0, lidR: 1.5, screenR: 0.6, baseH: 2.5, baseRadius: '0 0 1.1cqw 1.1cqw / 0 0 1cqw 1cqw' }
    case 'MacBook Neo':
      return { rim: 0.6, bezel: 1.5, chin: 1.5, lidR: 2.4, screenR: 1.0, baseH: 2.0, baseRadius: '0 0 3.4cqw 3.4cqw / 0 0 1.5cqw 1.5cqw' }
    case 'External display':
      return { rim: 0.35, bezel: 0.9, chin: 0.9, lidR: 1.2, screenR: 0.3, baseH: 0, baseRadius: '0', stand: true }
    default:
      return { rim: 0.5, bezel: 1.1, chin: 1.1, lidR: 2.3, screenR: 1.0, baseH: 2.0, baseRadius: '0 0 3.4cqw 3.4cqw / 0 0 1.5cqw 1.5cqw' }
  }
}
