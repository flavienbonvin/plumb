import { LookStrip } from './LookStrip'
import { DEFAULT_ADJUST, DEFAULT_FINISH, hasFinish, type Finish, FRAME_COLORS, MAT_COLORS, MAX_ZOOM, type DeviceSettings, type FrameSettings, type Swatch } from '../lib/draw'
import { useEffect, useState } from 'react'
import type { Legibility } from '../lib/legibility'
import { CUSTOM_ID, groupModels, type CustomSize, type DeviceKind, type DeviceModel } from '../lib/devices'

interface Props {
  kind: DeviceKind
  image: ImageBitmap
  modelId: string
  model: DeviceModel
  custom: CustomSize
  onCustom: (c: CustomSize) => void
  settings: DeviceSettings
  overlay: boolean
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
  onOverlay: (v: boolean) => void
  onDownload: () => void
  /** Present only when the browser can open the system share sheet. */
  onShare?: () => void
  exported: boolean
}

const field = 'text-xs font-medium text-stone-500 dark:text-white/50'
const select =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white'

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
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

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between">
        <span className={field}>{label}</span>
        <span className="text-xs tabular-nums text-stone-400 dark:text-white/40">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
    </label>
  )
}

function Swatches({ label, list, value, onChange, autoPreview }: { label: string; list: Swatch[]; value: string; onChange: (id: string) => void; autoPreview?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <div className={field}>{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {list.map((s) => {
          const auto = s.color === 'auto'
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={value === s.id}
              aria-label={s.label}
              title={s.label}
              onClick={() => onChange(s.id)}
              style={auto ? undefined : { background: s.color }}
              className={`h-7 w-7 rounded-full ring-1 ring-black/15 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:ring-white/20 dark:focus-visible:outline-white ${
                auto ? 'grid place-items-center bg-gradient-to-br from-amber-200 via-stone-400 to-slate-700 text-[9px] font-bold text-white' : ''
              } ${value === s.id ? 'ring-2 ring-offset-2 ring-stone-900 ring-offset-white dark:ring-white dark:ring-offset-neutral-900' : ''}`}
            >
              {auto && autoPreview !== false ? 'A' : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function HowTo({ kind, exported, shared }: { kind: DeviceKind; exported: boolean; shared: boolean }) {
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

export function Controls({ kind, image, modelId, model, custom, onCustom, settings, overlay, busy, upscale, legibility, onModel, onSettings, onFinish, lookLinked, onLookLinked, onOverlay, onDownload, onShare, exported }: Props) {
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
            <input aria-label="Width in pixels" type="number" inputMode="numeric" min={64} max={8192} value={custom.w || ''} onChange={(e) => onCustom({ ...custom, w: Number(e.target.value) })} className={`${select} tabular-nums`} />
            <span className="text-stone-400">×</span>
            <input aria-label="Height in pixels" type="number" inputMode="numeric" min={64} max={8192} value={custom.h || ''} onChange={(e) => onCustom({ ...custom, h: Number(e.target.value) })} className={`${select} tabular-nums`} />
            <span className="text-xs text-stone-400">px</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Slider label="Zoom" value={adjust.zoom} min={1} max={MAX_ZOOM} step={0.01} onChange={(zoom) => onSettings({ ...settings, adjust: { ...adjust, zoom } })} format={(v) => `${Math.round(v * 100)}%`} />
        <button type="button" onClick={() => onSettings({ ...settings, adjust: DEFAULT_ADJUST })} className="text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
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
          <button type="button" onClick={() => onFinish(DEFAULT_FINISH)} className="text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
            Remove look
          </button>
        )}
      </div>

      <div className="divide-y divide-stone-200 dark:divide-white/10">
        <Switch checked={overlay} onChange={onOverlay} label="Lock screen preview" />
        {overlay && (legibility || settings.scrim > 0) && (
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
