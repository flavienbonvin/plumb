import type { DeviceModel } from '../lib/devices'
import { filename, type Format } from '../lib/export'
import { select, HowTo } from './fields'

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
}

const primary =
  'w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:outline-white'
const secondary =
  'mt-2 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:border-white/20 dark:hover:bg-white/10 dark:focus-visible:outline-white'

export function ExportStep({ model, format, onFormat, upscale, busy, exported, onDownload, onShare }: Props) {
  const kind = model.kind
  return (
    <>
      <div>
        <label htmlFor="format" className="text-xs font-medium text-stone-500 dark:text-white/50">Format</label>
        <select id="format" name="format" value={format} onChange={(e) => onFormat(e.target.value as Format)} className={`${select} mt-1`}>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>
      <div>
        <button type="button" onClick={onDownload} disabled={busy} className={primary}>
          {busy ? 'Exporting…' : `Download ${kind === 'mac' ? 'Mac' : 'iPhone'} · ${model.w}×${model.h}`}
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
      <span className="sr-only">{filename(kind, format)}</span>
    </>
  )
}
