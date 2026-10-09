import type { DeviceKind, DeviceModel } from '../lib/devices'
import { filename, type Format } from '../lib/export'
import { select, HowTo } from './fields'
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
  onCreateOther: () => void
}

const primary =
  'w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:outline-white'
const secondary =
  'mt-2 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:border-white/20 dark:hover:bg-white/10 dark:focus-visible:outline-white'

const name = (k: DeviceKind) => (k === 'mac' ? 'Mac' : 'iPhone')

export function ExportStep({ model, format, onFormat, upscale, busy, exported, onDownload, onShare, saved, carriedFrom, onAdjust, onCreateOther }: Props) {
  const kind = model.kind
  const other: DeviceKind = kind === 'mac' ? 'iphone' : 'mac'
  return (
    <>
      {carriedFrom && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200">
          Started from your {name(carriedFrom)} wallpaper: same look, frame and position.{' '}
          <button type="button" onClick={onAdjust} className="font-medium underline underline-offset-2">Adjust position</button>
        </p>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-stone-100/80 p-4 text-sm dark:bg-white/[0.04]">
        <dt className="text-stone-500 dark:text-white/50">Device</dt>
        <dd className="text-right">{model.label}</dd>
        <dt className="text-stone-500 dark:text-white/50">Size</dt>
        <dd className="text-right tabular-nums">{model.w} × {model.h} px</dd>
        <dt className="text-stone-500 dark:text-white/50">Colour</dt>
        <dd className="text-right">Display P3</dd>
        <dt className="text-stone-500 dark:text-white/50">File</dt>
        <dd className="text-right break-all">{filename(kind, format)}</dd>
      </dl>
      <div>
        <label htmlFor="format" className="text-xs font-medium text-stone-500 dark:text-white/50">Format</label>
        <select id="format" name="format" value={format} onChange={(e) => onFormat(e.target.value as Format)} className={`${select} mt-1`}>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>
      <div>
        <button type="button" onClick={onDownload} disabled={busy} className={primary}>
          {busy ? 'Exporting…' : saved ? 'Saved ✓' : `Download ${name(kind)}`}
        </button>
        {onShare && (
          <button type="button" onClick={onShare} disabled={busy} className={secondary}>
            {kind === 'iphone' ? 'Share · AirDrop or Save to Photos' : 'Share · AirDrop'}
          </button>
        )}
        {upscale && upscale > 1.05 && (
          <p role="status" className="mt-2 text-xs text-amber-600 dark:text-amber-400">The image is smaller than this screen and will be upscaled {upscale.toFixed(1)}×. It may look soft.</p>
        )}
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
