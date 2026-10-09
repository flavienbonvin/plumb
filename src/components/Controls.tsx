import { radioKeys } from '../lib/a11y'
import { field, select, Switch, Slider, Swatches, HowTo } from './fields'
import { LookStrip } from './LookStrip'
import { DEFAULT_ADJUST, DEFAULT_FINISH, hasFinish, type Finish, FRAME_COLORS, MAT_COLORS, MAX_ZOOM, type DeviceSettings, type FrameSettings } from '../lib/draw'
import type { Legibility } from '../lib/legibility'
import { CUSTOM_ID, groupModels, type CustomSize, type DeviceKind, type DeviceModel, type ScreenView } from '../lib/devices'

interface Props {
  kind: DeviceKind
  image: ImageBitmap
  modelId: string
  model: DeviceModel
  custom: CustomSize
  onCustom: (c: CustomSize) => void
  settings: DeviceSettings
  view: ScreenView
  busy: boolean
  upscale: number | null
  legibility: Legibility | null
  onModel: (id: string) => void
  onSettings: (s: DeviceSettings) => void
  /** Look changes go through here so the app can mirror them to the other device. */
  onFinish: (f: Finish) => void
  /** Undefined when only one device is shown. */
  lookLinked?: boolean
  onLookLinked: (on: boolean) => void
  onView: (v: ScreenView) => void
  homeBlur: boolean
  onHomeBlur: (v: boolean) => void
  onDownload: () => void
  /** Present only when the browser can open the system share sheet. */
  onShare?: () => void
  exported: boolean
}

export function Controls({ kind, image, modelId, model, custom, onCustom, settings, view, busy, upscale, legibility, onModel, onSettings, onFinish, lookLinked, onLookLinked, onView, homeBlur, onHomeBlur, onDownload, onShare, exported }: Props) {
  const { adjust, frame } = settings
  const setFinish = (p: Partial<Finish>) => onFinish({ ...settings.finish, ...p })
  const pct = (v: number) => `${Math.round(v * 100)}%`
  const setFrame = (p: Partial<FrameSettings>) => onSettings({ ...settings, frame: { ...frame, ...p } })

  return (
    <div className="w-full space-y-5 rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div>
        <label className={field} htmlFor={`model-${kind}`}>{kind === 'mac' ? 'Mac' : 'iPhone'} model</label>
        <select id={`model-${kind}`} className={`${select} mt-1`} value={modelId} onChange={(e) => onModel(e.target.value)}>
          {groupModels(kind).map(([g, list]) => (
            <optgroup key={g} label={g}>
              {list.map((m) => (
                <option key={m.id} value={m.id}>{m.label} · {m.w}×{m.h}</option>
              ))}
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
      </div>

      <div className="space-y-3">
        <Slider label="Zoom" value={adjust.zoom} min={1} max={MAX_ZOOM} step={0.01} onChange={(zoom) => onSettings({ ...settings, adjust: { ...adjust, zoom } })} format={(v) => `${Math.round(v * 100)}%`} />
        <button type="button" onClick={() => onSettings({ ...settings, adjust: DEFAULT_ADJUST })} className="-my-1 py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
          Reset position
        </button>
      </div>

      <div className="space-y-4 border-y border-stone-200 py-5 dark:border-white/10">
        <LookStrip image={image} finish={settings.finish} onChange={onFinish} />
        {lookLinked !== undefined && <Switch checked={lookLinked} onChange={onLookLinked} label="Same look on Mac and iPhone" />}
        {settings.finish.look !== 'none' && (
          <Slider label="Look strength" value={settings.finish.intensity} min={0} max={1} step={0.05} onChange={(intensity) => setFinish({ intensity })} format={pct} />
        )}
        <Slider label="Grain" value={settings.finish.grain} min={0} max={1} step={0.05} onChange={(grain) => setFinish({ grain })} format={pct} />
        <Slider label="Vignette" value={settings.finish.vignette} min={0} max={1} step={0.05} onChange={(vignette) => setFinish({ vignette })} format={pct} />
        {hasFinish(settings.finish) && (
          <button type="button" onClick={() => onFinish(DEFAULT_FINISH)} className="-my-1 py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
            Remove look
          </button>
        )}
      </div>

      <div className="divide-y divide-stone-200 dark:divide-white/10">
        <div className="py-3">
          <div className={field}>Preview</div>
          <div role="radiogroup" onKeyDown={radioKeys} aria-label="Preview" className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-white/[0.06]">
            {([['lock', 'Lock screen'], ['alt', kind === 'mac' ? 'Desktop' : 'Home screen'], ['off', 'Plain']] as [ScreenView, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={view === id}
                onClick={() => onView(id)}
                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
                  view === id ? 'bg-white text-stone-900 shadow-sm dark:bg-white/15 dark:text-white' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {kind === 'iphone' && view === 'alt' && (
          <div className="py-2">
            <Switch checked={homeBlur} onChange={onHomeBlur} label="Blur wallpaper" />
            <p className="text-xs text-stone-400 dark:text-white/40">Preview of the iOS home screen blur. iOS applies it itself; the file is unchanged.</p>
          </div>
        )}
        {view === 'lock' && (legibility || settings.scrim > 0) && (
          <div className="space-y-2 py-3 text-sm">
            <div className="flex items-center gap-2" role="status">
              <span className={`h-2 w-2 rounded-full ${legibility === 'good' ? 'bg-emerald-500' : legibility === 'fair' ? 'bg-amber-400' : 'bg-red-500'}`} />
              <span>
                {legibility === 'good' ? 'Clock is easy to read' : legibility === 'fair' ? 'Clock may be hard to read in places' : 'Clock will be hard to read here'}
              </span>
            </div>
            {legibility !== 'good' && settings.scrim === 0 && (
              <button type="button" onClick={() => onSettings({ ...settings, scrim: 0.8 })} className="text-xs font-medium underline underline-offset-2">
                Add a soft shade behind the clock
              </button>
            )}
            {settings.scrim > 0 && (
              <Slider label="Clock shade" value={settings.scrim} min={0} max={1} step={0.05} onChange={(scrim) => onSettings({ ...settings, scrim })} format={(v) => `${Math.round(v * 100)}%`} />
            )}
          </div>
        )}
        <div className="pt-2">
          <Switch checked={frame.enabled} onChange={(enabled) => setFrame({ enabled })} label="Frame it" />
        </div>
      </div>

      {frame.enabled && (
        <div className="space-y-4 rounded-xl bg-stone-100/80 p-4 dark:bg-white/[0.04]">
          <Swatches label="Frame" list={FRAME_COLORS} value={frame.frameColor} onChange={(frameColor) => setFrame({ frameColor })} />
          <Swatches label="Paper mat" list={MAT_COLORS} value={frame.matColor} onChange={(matColor) => setFrame({ matColor })} />
          <Slider label="Frame width" value={frame.frameWidth} min={0.4} max={4} step={0.1} onChange={(frameWidth) => setFrame({ frameWidth })} format={(v) => v.toFixed(1)} />
          <Slider label="Mat width" value={frame.matWidth} min={0} max={16} step={0.5} onChange={(matWidth) => setFrame({ matWidth })} format={(v) => v.toFixed(1)} />
        </div>
      )}


      <div>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 dark:focus-visible:outline-white"
        >
          {busy ? 'Exporting…' : `Download ${kind === 'mac' ? 'Mac' : 'iPhone'} · ${model.w}×${model.h}`}
        </button>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            disabled={busy}
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:border-white/20 dark:hover:bg-white/10 dark:focus-visible:outline-white"
          >
            {kind === 'iphone' ? 'Share · AirDrop or Save to Photos' : 'Share · AirDrop'}
          </button>
        )}
        {upscale && upscale > 1.05 && (
          <p role="status" className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            The image is smaller than this screen and will be upscaled {upscale.toFixed(1)}×. It may look soft.
          </p>
        )}
        <HowTo kind={kind} exported={exported} shared={!!onShare} />
      </div>
    </div>
  )
}
