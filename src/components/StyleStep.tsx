import { DEFAULT_FINISH, FRAME_COLORS, MAT_COLORS, hasFinish, type DeviceSettings, type Finish, type FrameSettings } from '../lib/draw'
import type { DeviceModel, ScreenView } from '../lib/devices'
import type { Legibility } from '../lib/legibility'
import { ClockStatus } from './ClockStatus'
import { Slider, Swatches, Switch } from './fields'
import { LookStrip } from './LookStrip'
import { Reveal } from './Reveal'

interface Props {
  image: ImageBitmap
  model: DeviceModel
  settings: DeviceSettings
  onSettings: (s: DeviceSettings) => void
  onFinish: (f: Finish) => void
  view: ScreenView
  level: Legibility | null
  /** iPhone home screen only. */
  showBlur: boolean
  homeBlur: boolean
  onHomeBlur: (v: boolean) => void
}

const pct = (v: number) => `${Math.round(v * 100)}%`

export function StyleStep({ image, model, settings, onSettings, onFinish, view, level, showBlur, homeBlur, onHomeBlur }: Props) {
  const { finish, frame } = settings
  const set = (p: Partial<Finish>) => onFinish({ ...finish, ...p })
  const setFrame = (p: Partial<FrameSettings>) => onSettings({ ...settings, frame: { ...frame, ...p } })
  return (
    <>
      <LookStrip image={image} finish={finish} settings={settings} model={model} onChange={onFinish} />
      <Reveal show={finish.look !== 'none'} gap="1.25rem">
        <Slider label="Look strength" value={finish.intensity} min={0} max={1} step={0.05} onChange={(intensity) => set({ intensity })} format={pct} />
      </Reveal>
      <Slider label="Grain" value={finish.grain} min={0} max={1} step={0.05} onChange={(grain) => set({ grain })} format={pct} />
      <Slider label="Vignette" value={finish.vignette} min={0} max={1} step={0.05} onChange={(vignette) => set({ vignette })} format={pct} />
      <Reveal show={hasFinish(finish)} gap="1.25rem">
        <button type="button" onClick={() => onFinish(DEFAULT_FINISH)} className="py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
          Remove look
        </button>
      </Reveal>

      <div className="border-t border-stone-200 pt-3 dark:border-white/10">
        <Switch checked={frame.enabled} onChange={(enabled) => setFrame({ enabled })} label="Frame it" />
        <Reveal show={frame.enabled} space="0.5rem">
          <div className="grid gap-3 rounded-xl bg-stone-100/80 p-3 dark:bg-white/[0.04]">
            <Swatches label="Frame" list={FRAME_COLORS} value={frame.frameColor} onChange={(frameColor) => setFrame({ frameColor })} />
            <Swatches label="Mat" list={MAT_COLORS} value={frame.matColor} onChange={(matColor) => setFrame({ matColor })} />
            <div className="grid grid-cols-2 gap-4">
              <Slider label="Frame width" value={frame.frameWidth} min={0.4} max={4} step={0.1} onChange={(frameWidth) => setFrame({ frameWidth })} format={(v) => v.toFixed(1)} />
              <Slider label="Mat width" value={frame.matWidth} min={0} max={16} step={0.5} onChange={(matWidth) => setFrame({ matWidth })} format={(v) => v.toFixed(1)} />
            </div>
          </div>
        </Reveal>
      </div>

      <ClockStatus view={view} level={level} settings={settings} onSettings={onSettings} />
      <Reveal show={showBlur} gap="1.25rem">
        <div className="border-t border-stone-200 pt-3 dark:border-white/10">
          <Switch checked={homeBlur} onChange={onHomeBlur} label="Blur wallpaper" />
          <p className="text-xs text-stone-400 dark:text-white/40">Preview of the iOS home screen blur. iOS applies it itself; the file is unchanged.</p>
        </div>
      </Reveal>
    </>
  )
}
