import type { DeviceSettings, Finish } from '../lib/draw'
import type { DeviceModel, ScreenView } from '../lib/devices'
import type { Legibility } from '../lib/legibility'
import { ClockStatus } from './ClockStatus'
import { FramePicker } from './FramePicker'
import { Slider, Switch } from './fields'
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
  return (
    <>
      <LookStrip image={image} finish={finish} settings={settings} model={model} onChange={onFinish} />
      <Reveal show={finish.look !== 'none'} space="1.25rem">
        <Slider label="Look strength" value={finish.intensity} min={0} max={1} step={0.05} onChange={(intensity) => set({ intensity })} format={pct} />
      </Reveal>
      <Slider label="Grain" value={finish.grain} min={0} max={1} step={0.05} onChange={(grain) => set({ grain })} format={pct} />
      <Slider label="Vignette" value={finish.vignette} min={0} max={1} step={0.05} onChange={(vignette) => set({ vignette })} format={pct} />

      <div className="border-t border-stone-200 pt-3 dark:border-white/10">
        <FramePicker value={frame} onChange={(f) => onSettings({ ...settings, frame: f })} />
      </div>

      <ClockStatus view={view} level={level} settings={settings} onSettings={onSettings} />
      <Reveal show={showBlur} space="1.25rem">
        <div className="border-t border-stone-200 pt-3 dark:border-white/10">
          <Switch checked={homeBlur} onChange={onHomeBlur} label="Blur wallpaper" />
          <p className="text-xs text-stone-500 dark:text-white/55">Preview of the iOS home screen blur. iOS applies it itself; the file is unchanged.</p>
        </div>
      </Reveal>
    </>
  )
}
