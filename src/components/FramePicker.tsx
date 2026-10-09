import { radioKeys } from '../lib/a11y'
import { DEFAULT_FRAME, FRAME_PRESETS, type FrameSettings } from '../lib/draw'
import { field } from './fields'

/** One row: no frame, or a gallery frame with a paper mat. */
export function FramePicker({ value, onChange }: { value: FrameSettings; onChange: (f: FrameSettings) => void }) {
  const current = value.enabled ? FRAME_PRESETS.find((p) => p.frameColor === value.frameColor)?.id ?? 'none' : 'none'
  const chip = (on: boolean) =>
    `flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
      on ? 'bg-stone-900 font-medium text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
    }`
  return (
    <div>
      <div className={field}>Frame</div>
      <div role="radiogroup" onKeyDown={radioKeys} aria-label="Frame" className="mt-1.5 grid grid-cols-4 gap-1 rounded-full border border-stone-200 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
        <button type="button" role="radio" aria-checked={current === 'none'} onClick={() => onChange({ ...value, enabled: false })} className={chip(current === 'none')}>
          None
        </button>
        {FRAME_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={current === p.id}
            onClick={() => onChange({ ...DEFAULT_FRAME, enabled: true, frameColor: p.frameColor, matColor: p.matColor })}
            className={chip(current === p.id)}
          >
            <span aria-hidden className="h-3 w-3 rounded-full ring-1 ring-black/20 dark:ring-white/30" style={{ background: p.swatch }} />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
