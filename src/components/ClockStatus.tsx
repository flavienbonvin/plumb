import type { DeviceSettings } from '../lib/draw'
import type { ScreenView } from '../lib/devices'
import type { Legibility } from '../lib/legibility'
import { Slider } from './fields'
import { Reveal } from './Reveal'

interface Props {
  view: ScreenView
  level: Legibility | null
  settings: DeviceSettings
  onSettings: (s: DeviceSettings) => void
}

/**
 * Tells you if the clock will be readable on the lock screen. The shade slider is always there,
 * so a vignette or a look that changes the verdict never takes the control away.
 */
export function ClockStatus({ view, level, settings, onSettings }: Props) {
  return (
    <Reveal show={view === 'lock'} space="1.25rem">
      <div className="flex flex-col text-sm [&>*+*]:mt-2">
        {level && (
          <div className="flex items-center gap-2" role="status">
            <span className={`h-2 w-2 rounded-full ${level === 'good' ? 'bg-emerald-500' : level === 'fair' ? 'bg-amber-400' : 'bg-red-500'}`} />
            <span>{level === 'good' ? 'Clock is easy to read' : level === 'fair' ? 'Clock may be hard to read in places' : 'Clock will be hard to read here'}</span>
          </div>
        )}
        <Reveal show={level !== null && level !== 'good' && settings.scrim === 0} space="0.5rem">
          <button type="button" onClick={() => onSettings({ ...settings, scrim: 0.8 })} className="text-xs font-medium underline underline-offset-2">
            Add a soft shade behind the clock
          </button>
        </Reveal>
        <Slider label="Clock shade" value={settings.scrim} min={0} max={1} step={0.05} onChange={(scrim) => onSettings({ ...settings, scrim })} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
    </Reveal>
  )
}
