import { radioKeys } from '../lib/a11y'
import type { DeviceKind } from '../lib/devices'

const opts: { id: DeviceKind; label: string }[] = [
  { id: 'mac', label: 'Mac' },
  { id: 'iphone', label: 'iPhone' },
]

export function DeviceSwitch({ value, onChange, fill = false }: { value: DeviceKind; onChange: (k: DeviceKind) => void; /** Stretch to the width of the container, like the other switches in the panel. */ fill?: boolean }) {
  return (
    <div role="radiogroup" onKeyDown={radioKeys} aria-label="Device" className={`${fill ? 'grid grid-cols-2' : 'inline-flex'} rounded-full border border-stone-200 bg-white/70 p-0.5 dark:border-white/10 dark:bg-white/5`}>
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-4 py-1.5 text-center text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
            value === o.id ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
