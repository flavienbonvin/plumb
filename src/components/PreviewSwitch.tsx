import { radioKeys } from '../lib/a11y'
import type { DeviceKind, ScreenView } from '../lib/devices'

/** Lock screen / desktop or home screen / plain. Changes what you see, not the exported file. */
export function PreviewSwitch({ kind, value, onChange }: { kind: DeviceKind; value: ScreenView; onChange: (v: ScreenView) => void }) {
  const opts: [ScreenView, string][] = [['lock', 'Lock screen'], ['alt', kind === 'mac' ? 'Desktop' : 'Home screen'], ['off', 'Plain']]
  return (
    <div role="radiogroup" onKeyDown={radioKeys} aria-label="Preview" className="inline-grid grid-cols-3 gap-1 rounded-full border border-stone-200 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
      {opts.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
            value === id ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
