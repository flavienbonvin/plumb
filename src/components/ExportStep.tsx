import type { DeviceKind, DeviceModel } from '../lib/devices'
import { filename, type Format } from '../lib/export'
import { radioKeys } from '../lib/a11y'
import { HowTo } from './fields'
import type { Legibility } from '../lib/legibility'
import type { ScreenView } from '../lib/devices'
import { QualityNote } from './QualityNote'
import { Reveal } from './Reveal'
import { iconProps } from './ui'

interface Props {
  model: DeviceModel
  format: Format
  onFormat: (f: Format) => void
  upscale: number | null
  busy: boolean
  exported: boolean
  onDownload: () => void
  /** Present only when the browser can open the system share sheet. */
  onShare?: () => void
  /** Briefly true after a successful save. */
  saved: boolean
  /** Set when this device was just started from the other one. */
  carriedFrom: DeviceKind | null
  onAdjust: () => void
  view: ScreenView
  level: Legibility | null
  /** Clock shade, 0 when none. */
  scrim: number
  onFixClock: () => void
  onCreateOther: () => void
}

const primary =
  'w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:outline-white'
const secondary =
  'mt-2 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:border-white/20 dark:hover:bg-white/10 dark:focus-visible:outline-white'

const name = (k: DeviceKind) => (k === 'mac' ? 'Mac' : 'iPhone')
/** Model names such as "18 Pro" read better with the product name in front. */
const deviceLabel = (m: DeviceModel) => (m.kind === 'iphone' && !/^iPhone/.test(m.label) && m.group !== 'Custom' ? `iPhone ${m.label}` : m.label)

function FormatToggle({ value, onChange }: { value: Format; onChange: (f: Format) => void }) {
  return (
    <div role="radiogroup" onKeyDown={radioKeys} aria-label="Format" className="inline-flex rounded-full border border-stone-200 bg-white/70 p-0.5 dark:border-white/10 dark:bg-white/5">
      {(['png', 'jpeg'] as Format[]).map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={value === f}
          onClick={() => onChange(f)}
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
            value === f ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/55 dark:hover:text-white'
          }`}
        >
          {f === 'png' ? 'PNG' : 'JPEG'}
        </button>
      ))}
    </div>
  )
}

export function ExportStep({ model, format, onFormat, upscale, busy, exported, onDownload, onShare, saved, carriedFrom, onAdjust, view, level, scrim, onFixClock, onCreateOther }: Props) {
  const kind = model.kind
  const other: DeviceKind = kind === 'mac' ? 'iphone' : 'mac'
  return (
    <>
      <Reveal show={!!carriedFrom} space="1.25rem">
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200">
          Started from your {carriedFrom ? name(carriedFrom) : ''} wallpaper: same look, frame and position.{' '}
          <button type="button" onClick={onAdjust} className="font-medium underline underline-offset-2">Adjust position</button>
        </p>
      </Reveal>
      <Reveal show={view === 'lock' && !!level && level !== 'good' && scrim === 0} space="1.25rem">
        <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
          The clock may be hard to read on this photo.{' '}
          <button type="button" onClick={onFixClock} className="font-medium underline underline-offset-2">Add a shade in Style</button>
        </p>
      </Reveal>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 rounded-xl bg-stone-100/80 p-4 text-sm dark:bg-white/[0.04]">
        <dt className="text-stone-500 dark:text-white/55">Device</dt>
        <dd className="text-right">{deviceLabel(model)}</dd>
        <dt className="text-stone-500 dark:text-white/55">Size</dt>
        <dd className="text-right tabular-nums">{model.w} × {model.h} px <span className="text-stone-500 dark:text-white/55">· Display P3</span></dd>
        <dt className="text-stone-500 dark:text-white/55">Format</dt>
        <dd className="flex justify-end"><FormatToggle value={format} onChange={onFormat} /></dd>
      </dl>
      <div>
        <button type="button" onClick={onDownload} disabled={busy} className={primary}>
          {busy ? 'Exporting…' : saved ? 'Saved ✓' : `Download for ${name(kind)}`}
        </button>
        {onShare && (
          <button type="button" onClick={onShare} disabled={busy} className={secondary}>
            {kind === 'iphone' ? 'Share · AirDrop or Save to Photos' : 'Share · AirDrop'}
          </button>
        )}
        <p className="mt-2 text-center text-xs text-stone-500 dark:text-white/55">Saved as {filename(kind, format)}</p>
        <QualityNote upscale={upscale} space="0.5rem" />
        <HowTo kind={kind} exported={exported} shared={!!onShare} />
      </div>
      <button
        type="button"
        onClick={onCreateOther}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm font-medium transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:border-white/20 dark:hover:bg-white/5 dark:focus-visible:outline-white"
      >
        <svg {...iconProps}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        Also create for {name(other)}
      </button>
    </>
  )
}
