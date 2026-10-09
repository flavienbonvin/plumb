import { useEffect, useRef } from 'react'
import { radioKeys } from '../lib/a11y'
import { LOOKS, applyGrade, findLook, type Finish } from '../lib/looks'

const W = 132
const H = 88

function Thumb({ image, id }: { image: ImageBitmap; id: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    const s = Math.max(W / image.width, H / image.height)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, (W - image.width * s) / 2, (H - image.height * s) / 2, image.width * s, image.height * s)
    applyGrade(ctx, { x: 0, y: 0, w: W, h: H }, { look: id, intensity: 1 })
  }, [image, id])
  return <canvas ref={ref} width={W} height={H} className="block aspect-[3/2] w-full" />
}

interface Props {
  image: ImageBitmap
  finish: Finish
  onChange: (f: Finish) => void
}

/** Grid of film looks with live thumbnails of the user's own image. */
export function LookStrip({ image, finish, onChange }: Props) {
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
                <Thumb image={image} id={l.id} />
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
