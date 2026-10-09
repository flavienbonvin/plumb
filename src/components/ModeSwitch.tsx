import { radioKeys } from '../lib/a11y'
export type Mode = 'mac' | 'iphone' | 'both'

const opts: { id: Mode; label: string }[] = [
  { id: 'mac', label: 'Mac' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'both', label: 'Both' },
]

export function ModeSwitch({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="radiogroup" onKeyDown={radioKeys} aria-label="Device" className="inline-flex rounded-full border border-stone-200 bg-white/70 p-0.5 dark:border-white/10 dark:bg-white/5">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
            value === o.id ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
