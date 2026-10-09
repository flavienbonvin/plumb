import { DEFAULT_ADJUST, FRAME_COLORS, MAT_COLORS, MAX_ZOOM, type DeviceSettings, type FrameSettings } from '../lib/draw'
import { CUSTOM_ID, groupModels, type CustomSize, type DeviceKind, type ScreenView } from '../lib/devices'
import type { Legibility } from '../lib/legibility'
import { ClockStatus } from './ClockStatus'
import { DeviceSwitch } from './DeviceSwitch'
import { field, select, Slider, Swatches, Switch } from './fields'
import { ImageChip } from './ImageChip'
import { QualityNote } from './QualityNote'

interface Props {
  kind: DeviceKind
  onKind: (k: DeviceKind) => void
  image: ImageBitmap
  width: number
  height: number
  onReplace: (f: File) => void
  onRemove: () => void
  modelId: string
  onModel: (id: string) => void
  custom: CustomSize
  onCustom: (c: CustomSize) => void
  settings: DeviceSettings
  onSettings: (s: DeviceSettings) => void
  view: ScreenView
  level: Legibility | null
  upscale: number | null
}

export function PlaceStep({ kind, onKind, image, width, height, onReplace, onRemove, modelId, onModel, custom, onCustom, settings, onSettings, view, level, upscale }: Props) {
  const { adjust, frame } = settings
  const setFrame = (p: Partial<FrameSettings>) => onSettings({ ...settings, frame: { ...frame, ...p } })
  return (
    <>
      <DeviceSwitch value={kind} onChange={onKind} />
      <ImageChip image={image} width={width} height={height} onReplace={onReplace} onRemove={onRemove} />

      <div>
        <label className={field} htmlFor="model">{kind === 'mac' ? 'Mac' : 'iPhone'} model</label>
        <select id="model" className={`${select} mt-1`} value={modelId} onChange={(e) => onModel(e.target.value)}>
          {groupModels(kind).map(([g, list]) => (
            <optgroup key={g} label={g}>
              {list.map((m) => <option key={m.id} value={m.id}>{m.label} · {m.w}×{m.h}</option>)}
            </optgroup>
          ))}
          <option value={CUSTOM_ID}>Custom size…</option>
        </select>
        {modelId === CUSTOM_ID && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <input aria-label="Width in pixels" name="custom-width" type="number" inputMode="numeric" min={64} max={8192} value={custom.w || ''} onChange={(e) => onCustom({ ...custom, w: Number(e.target.value) })} className={`${select} tabular-nums`} />
            <span className="text-stone-400">×</span>
            <input aria-label="Height in pixels" name="custom-height" type="number" inputMode="numeric" min={64} max={8192} value={custom.h || ''} onChange={(e) => onCustom({ ...custom, h: Number(e.target.value) })} className={`${select} tabular-nums`} />
            <span className="text-xs text-stone-400">px</span>
          </div>
        )}
        <details className="group mt-2 text-xs">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 font-medium text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition group-open:rotate-90" aria-hidden><path d="m3 1.5 3.5 3.5L3 8.5" /></svg>
            Not sure which model?
          </summary>
          <p className="mt-1.5 text-stone-500 dark:text-white/50">
            {kind === 'iphone'
              ? 'On your iPhone, open Settings, then General, then About, and read Model Name. Models that share a screen are listed together. Another size? Choose Custom size.'
              : 'On your Mac, open the Apple menu and choose About This Mac. Pick the same model and screen size. For an external display, check its resolution in Displays settings, or choose Custom size.'}
          </p>
        </details>
      </div>

      <div className="space-y-3">
        <Slider label="Zoom" value={adjust.zoom} min={1} max={MAX_ZOOM} step={0.01} onChange={(zoom) => onSettings({ ...settings, adjust: { ...adjust, zoom } })} format={(v) => `${Math.round(v * 100)}%`} />
        <QualityNote upscale={upscale} />
        <p className="text-xs text-stone-400 dark:text-white/40">Drag the preview to move the image. It snaps to the centre.</p>
        <button type="button" onClick={() => onSettings({ ...settings, adjust: DEFAULT_ADJUST })} className="justify-self-start py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
          Reset position
        </button>
      </div>

      <ClockStatus view={view} level={level} settings={settings} onSettings={onSettings} />

      <div className="border-t border-stone-200 pt-3 dark:border-white/10">
        <Switch checked={frame.enabled} onChange={(enabled) => setFrame({ enabled })} label="Frame it" />
        {frame.enabled && (
          <div className="mt-3 space-y-4 rounded-xl bg-stone-100/80 p-4 dark:bg-white/[0.04]">
            <Swatches label="Frame" list={FRAME_COLORS} value={frame.frameColor} onChange={(frameColor) => setFrame({ frameColor })} />
            <Swatches label="Paper mat" list={MAT_COLORS} value={frame.matColor} onChange={(matColor) => setFrame({ matColor })} />
            <Slider label="Frame width" value={frame.frameWidth} min={0.4} max={4} step={0.1} onChange={(frameWidth) => setFrame({ frameWidth })} format={(v) => v.toFixed(1)} />
            <Slider label="Mat width" value={frame.matWidth} min={0} max={16} step={0.5} onChange={(matWidth) => setFrame({ matWidth })} format={(v) => v.toFixed(1)} />
          </div>
        )}
      </div>
    </>
  )
}
