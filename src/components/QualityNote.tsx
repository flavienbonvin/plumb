/** Warns when the image has to be stretched to fill the screen. Shown wherever zoom or size can change. */
export function QualityNote({ upscale }: { upscale: number | null }) {
  if (!upscale || upscale <= 1.05) return null
  return (
    <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
      {upscale >= 2 ? 'This image is much smaller than the screen' : 'This image is smaller than the screen'} and is stretched {upscale.toFixed(1)}×. It may look soft. A larger photo will look sharper.
    </p>
  )
}
