import { useEffect, useRef } from 'react'
import { radioKeys } from '../lib/a11y'
import type { DeviceModel } from '../lib/devices'
import { drawWallpaper, get2dP3, type DeviceSettings } from '../lib/draw'
import { LOOKS, findLook, type Finish } from '../lib/looks'

const W = 168

/** The device's own view of the image (same crop, zoom and frame) with this look applied. */
function Thumb({ image, id, settings, model }: { image: ImageBitmap; id: string; settings: DeviceSettings; model: DeviceModel }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const h = Math.round((W * model.h) / model.w)
  const { adjust, frame, finish } = settings
  useEffect(() => {
    const c = ref.current
    if (!c) return
    drawWallpaper(get2dP3(c), image, W, h, { adjust, frame, scrim: 0, finish: { look: id, intensity: finish.intensity, grain: 0, vignette: 0 } }, model.kind)
  }, [image, id, adjust, frame, finish.intensity, h, model.kind])
  return <canvas ref={ref} width={W} height={h} style={{ aspectRatio: `${model.w} / ${model.h}` }} className="block w-full" />
}

interface Props {
  image: ImageBitmap
  finish: Finish
  settings: DeviceSettings
  model: DeviceModel
  onChange: (f: Finish) => void
}

/** Grid of film looks with live thumbnails of the user's own image. */
export function LookStrip({ image, finish, settings, model, onChange }: Props) {
  const current = findLook(finish.look)
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Look</h3>
        <span className="text-xs text-stone-400 dark:text-white/40">Fujifilm-inspired</span>
      </div>
      <div role="radiogroup" onKeyDown={radioKeys} aria-label="Look" className="mt-2 grid grid-cols-4 gap-2">
        {LOOKS.map((l) => {
          const on = finish.look === l.id
          return (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={on}
              title={l.note}
              onClick={() => onChange({ ...finish, look: l.id, grain: l.grain, vignette: l.vignette })}
              className="group text-left focus-visible:outline-none"
            >
              <span className={`block overflow-hidden rounded-lg ring-1 transition group-focus-visible:ring-2 group-focus-visible:ring-stone-900 dark:group-focus-visible:ring-white ${on ? 'ring-2 ring-stone-900 dark:ring-white' : 'ring-black/10 group-hover:ring-black/30 dark:ring-white/10 dark:group-hover:ring-white/30'}`}>
                <Thumb image={image} id={l.id} settings={settings} model={model} />
              </span>
              <span className={`mt-1 block text-center text-[11px] leading-tight whitespace-nowrap tracking-tight ${on ? 'font-semibold' : 'text-stone-500 dark:text-white/50'}`}>{l.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 min-h-8 text-xs text-stone-500 dark:text-white/50">{current.note}</p>
    </div>
  )
}
