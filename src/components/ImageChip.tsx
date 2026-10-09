import { useEffect, useRef } from 'react'
import { btnSecondary, iconProps } from './ui'

interface Props {
  image: ImageBitmap
  width: number
  height: number
  onReplace: (f: File) => void
}

/** One row: a thumbnail of the current image, its size, and a way to swap it for another. */
export function ImageChip({ image, width, height, onReplace }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const s = Math.max(c.width / image.width, c.height / image.height)
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, (c.width - image.width * s) / 2, (c.height - image.height * s) / 2, image.width * s, image.height * s)
  }, [image])

  return (
    <div className="flex items-center gap-3">
      <canvas ref={ref} width={72} height={72} className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-black/10 dark:ring-white/15" aria-hidden />
      <span className="text-sm text-stone-500 tabular-nums dark:text-white/55">{width.toLocaleString()} × {height.toLocaleString()} px</span>
      <label className={`${btnSecondary} ml-auto cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stone-900 dark:focus-within:outline-white`}>
        <svg {...iconProps}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /></svg>
        Replace
        <input type="file" accept="image/*,.heic,.heif" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(f); e.target.value = '' }} />
      </label>
    </div>
  )
}
