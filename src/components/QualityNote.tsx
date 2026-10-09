import { Reveal } from './Reveal'

/** Warns when the image has to be stretched to fill the screen. Shown wherever zoom or size can change. */
export function QualityNote({ upscale, gap, space }: { upscale: number | null; gap?: string; space?: string }) {
  const show = !!upscale && upscale > 1.05
  return (
    <Reveal show={show} gap={gap} space={space}>
      <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
        {(upscale ?? 0) >= 2 ? 'This image is much smaller than the screen' : 'This image is smaller than the screen'} and is stretched {(upscale ?? 0).toFixed(1)}×. It may look soft. A larger photo will look sharper.
      </p>
    </Reveal>
  )
}
