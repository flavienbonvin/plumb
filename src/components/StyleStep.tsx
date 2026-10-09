import { DEFAULT_FINISH, hasFinish, type DeviceSettings, type Finish } from '../lib/draw'
import type { ScreenView } from '../lib/devices'
import type { Legibility } from '../lib/legibility'
import { ClockStatus } from './ClockStatus'
import { Slider, Switch } from './fields'
import { LookStrip } from './LookStrip'

interface Props {
  image: ImageBitmap
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

export function StyleStep({ image, settings, onSettings, onFinish, view, level, showBlur, homeBlur, onHomeBlur }: Props) {
  const { finish } = settings
  const set = (p: Partial<Finish>) => onFinish({ ...finish, ...p })
  return (
    <>
      <LookStrip image={image} finish={finish} onChange={onFinish} />
      {finish.look !== 'none' && <Slider label="Look strength" value={finish.intensity} min={0} max={1} step={0.05} onChange={(intensity) => set({ intensity })} format={pct} />}
      <Slider label="Grain" value={finish.grain} min={0} max={1} step={0.05} onChange={(grain) => set({ grain })} format={pct} />
      <Slider label="Vignette" value={finish.vignette} min={0} max={1} step={0.05} onChange={(vignette) => set({ vignette })} format={pct} />
      {hasFinish(finish) && (
        <button type="button" onClick={() => onFinish(DEFAULT_FINISH)} className="justify-self-start py-1.5 text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-white/50">
          Remove look
        </button>
      )}
      <ClockStatus view={view} level={level} settings={settings} onSettings={onSettings} />
      {showBlur && (
        <div className="border-t border-stone-200 pt-3 dark:border-white/10">
          <Switch checked={homeBlur} onChange={onHomeBlur} label="Blur wallpaper" />
          <p className="text-xs text-stone-400 dark:text-white/40">Preview of the iOS home screen blur. iOS applies it itself; the file is unchanged.</p>
        </div>
      )}
    </>
  )
}
