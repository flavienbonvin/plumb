import { useEffect, useRef, useState } from 'react'
import { usePanZoom } from '../hooks/usePanZoom'
import { drawWallpaper, get2dP3, layout, srcSize, type DeviceSettings } from '../lib/draw'
import type { DeviceModel } from '../lib/devices'
import { IPhoneLockOverlay } from './IPhoneLockOverlay'
import { MacLockOverlay } from './MacLockOverlay'

interface Props {
  model: DeviceModel
  image: ImageBitmap
  settings: DeviceSettings
  overlay: boolean
  onChange: (s: DeviceSettings) => void
}

export function DeviceStage({ model, image, settings, overlay, onChange }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [snap, setSnap] = useState({ x: false, y: false })
  const mac = model.kind === 'mac'

  // preview resolution: enough for crisp display, much cheaper than native
  const pw = mac ? 1600 : 720
  const ph = Math.round((pw * model.h) / model.w)
  const { w: iw, h: ih } = srcSize(image)
  const L = layout(image, pw, ph, settings.frame)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const id = requestAnimationFrame(() => {
      const ctx = get2dP3(c)
      drawWallpaper(ctx, image, pw, ph, settings)
    })
    return () => cancelAnimationFrame(id)
  }, [image, settings, pw, ph])

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
      className={`relative cursor-grab touch-none overflow-hidden bg-black outline-none select-none active:cursor-grabbing ${
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
      {overlay && (mac ? <MacLockOverlay notch={!!model.notch} /> : <IPhoneLockOverlay />)}
    </div>
  )

  return mac ? (
    <div className="w-full max-w-[760px] rounded-[20px] bg-gradient-to-b from-stone-300 to-stone-400 p-[10px] shadow-2xl shadow-black/25 ring-1 ring-black/10 dark:from-neutral-700 dark:to-neutral-800 dark:ring-white/10 sm:p-[12px]">
      <div className="rounded-[14px] bg-black p-[6px] sm:rounded-[16px]">{screen}</div>
    </div>
  ) : (
    <div className="w-[min(100%,290px)] rounded-[17%/7.6%] bg-gradient-to-b from-stone-300 to-stone-400 p-[3px] shadow-2xl shadow-black/30 ring-1 ring-black/10 dark:from-neutral-600 dark:to-neutral-800 dark:ring-white/10">
      <div className="rounded-[16.5%/7.3%] bg-black p-[7px]">{screen}</div>
    </div>
  )
}
