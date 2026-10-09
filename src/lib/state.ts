import { DEFAULT_ADJUST, DEFAULT_FINISH, DEFAULT_FRAME, type DeviceSettings } from './draw'
import { CUSTOM_ID, DEFAULT_MODEL, MODELS, type CustomSize, type DeviceKind, type ScreenView } from './devices'
import type { Format } from './export'

export interface DeviceState {
  modelId: string
  custom: CustomSize
  settings: DeviceSettings
  view: ScreenView
  /** iPhone home screen only: blur the wallpaper behind the icons, like the iOS setting. */
  homeBlur: boolean
}
export type Devices = Record<DeviceKind, DeviceState>
export type Step = 'place' | 'style' | 'export'

export const initial = (kind: DeviceKind): DeviceState => ({
  modelId: DEFAULT_MODEL[kind],
  custom: kind === 'mac' ? { w: 2560, h: 1440 } : { w: 1170, h: 2532 },
  settings: { adjust: DEFAULT_ADJUST, frame: DEFAULT_FRAME, scrim: 0, finish: DEFAULT_FINISH },
  view: 'lock',
  homeBlur: false,
})
export const initialDevices = (): Devices => ({ mac: initial('mac'), iphone: initial('iphone') })

export const LS = 'plumb:v1'

export interface Saved { kind: DeviceKind; format: Format; devices: Devices }

/** Reads saved settings. Understands the older format, which had `mode` (mac, iphone or both) and `linkLook`. */
export function parseSaved(text: string | null): Partial<Saved> {
  try {
    const raw = JSON.parse(text ?? '{}') as Partial<Saved> & { mode?: string }
    const base = initialDevices()
    const devices = {} as Devices
    for (const k of ['mac', 'iphone'] as DeviceKind[]) {
      const d = raw.devices?.[k]
      const known = d && (d.modelId === CUSTOM_ID || MODELS[k].some((m) => m.id === d.modelId))
      const old = d as unknown as { overlay?: boolean }
      if (d && !d.view) d.view = old.overlay === false ? 'off' : 'lock'
      devices[k] = known ? { ...base[k], ...d, settings: { ...base[k].settings, ...d.settings, frame: { ...DEFAULT_FRAME, ...d.settings?.frame }, finish: { ...DEFAULT_FINISH, ...d.settings?.finish } } } : base[k]
    }
    const kind: DeviceKind | undefined = raw.kind === 'mac' || raw.kind === 'iphone' ? raw.kind : raw.mode === 'mac' ? 'mac' : raw.mode === 'iphone' || raw.mode === 'both' ? 'iphone' : undefined
    return { kind, format: raw.format, devices }
  } catch {
    return {}
  }
}

export const readSaved = () => parseSaved(localStorage.getItem(LS))
