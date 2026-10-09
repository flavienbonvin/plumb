import { useEffect, useState } from 'react'
import type { DeviceKind } from '../lib/devices'

export const field = 'text-xs font-medium text-stone-500 dark:text-white/50'
export const select =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white"
    >
      <span>{label}</span>
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition ${checked ? 'bg-stone-900 dark:bg-white' : 'bg-stone-300 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition dark:bg-neutral-900 ${checked ? 'translate-x-4 dark:bg-neutral-900' : 'dark:bg-white'}`} />
      </span>
    </button>
  )
}

export function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between">
        <span className={field}>{label}</span>
        <span className="text-xs tabular-nums text-stone-400 dark:text-white/40">{format(value)}</span>
      </span>
      <input type="range" name={label.toLowerCase().replace(/\s+/g, "-")} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-0.5 h-6 w-full" />
    </label>
  )
}

export function HowTo({ kind, exported, shared }: { kind: DeviceKind; exported: boolean; shared: boolean }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (exported) setOpen(true) }, [exported])
  const steps =
    kind === 'iphone'
      ? [
          shared ? 'In the share sheet, choose Save Image (or AirDrop it to your phone).' : 'Get the file onto your iPhone: AirDrop it, or save it to iCloud Drive.',
          'Open Photos and select the image.',
          'Tap Share, then Use as Wallpaper, and pick Lock Screen.',
        ]
      : [
          'Open System Settings, then Wallpaper.',
          'Choose Add Photo… and select the file. Or right-click it in Finder and pick Set Desktop Picture.',
          'The Mac lock screen shows your desktop picture, so it is set for both.',
        ]
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group mt-4 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition group-open:rotate-90" aria-hidden><path d="m3 1.5 3.5 3.5L3 8.5" /></svg>
        How to set it as your wallpaper
      </summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-600 dark:text-white/60">
        {steps.map((t) => <li key={t}>{t}</li>)}
      </ol>
    </details>
  )
}
