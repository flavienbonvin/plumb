import { radioKeys } from '../lib/a11y'
import type { ThemePref } from '../hooks/useTheme'

const opts: { id: ThemePref; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { id: 'system', label: 'System', icon: 'M3 5h18v11H3zM8 20h8M12 16v4' },
  { id: 'dark', label: 'Dark', icon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z' },
]

export function ThemeToggle({ value, onChange }: { value: ThemePref; onChange: (v: ThemePref) => void }) {
  return (
    <div role="radiogroup" onKeyDown={radioKeys} aria-label="Theme" className="inline-flex rounded-full border border-stone-200 bg-white/70 p-0.5 dark:border-white/10 dark:bg-white/5">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          aria-label={o.label}
          title={o.label}
          onClick={() => onChange(o.id)}
          className={`grid h-8 w-8 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
            value === o.id ? 'bg-stone-200/80 text-stone-900 dark:bg-white/15 dark:text-white' : 'text-stone-500 hover:text-stone-900 dark:text-white/55 dark:hover:text-white'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={o.icon} /></svg>
        </button>
      ))}
    </div>
  )
}
