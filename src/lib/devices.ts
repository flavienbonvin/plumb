export type DeviceKind = 'mac' | 'iphone'

export interface DeviceModel {
  id: string
  kind: DeviceKind
  label: string
  group: string
  /** Native wallpaper resolution in px. */
  w: number
  h: number
  /** Hint used by the lock screen overlay. */
  notch?: boolean
}

// Resolutions are the native panel sizes. Models sharing a panel share a size.
export const MACS: DeviceModel[] = [
  { id: 'mbn', kind: 'mac', group: 'MacBook Neo', label: 'MacBook Neo', w: 2408, h: 1506, notch: true },
  { id: 'mba13', kind: 'mac', group: 'MacBook Air', label: 'MacBook Air 13″', w: 2560, h: 1664, notch: true },
  { id: 'mba15', kind: 'mac', group: 'MacBook Air', label: 'MacBook Air 15″', w: 2880, h: 1864, notch: true },
  { id: 'mbp14', kind: 'mac', group: 'MacBook Pro', label: 'MacBook Pro 14″', w: 3024, h: 1964, notch: true },
  { id: 'mbp16', kind: 'mac', group: 'MacBook Pro', label: 'MacBook Pro 16″', w: 3456, h: 2234, notch: true },
  { id: 'disp4k', kind: 'mac', group: 'External display', label: '4K display', w: 3840, h: 2160 },
  { id: 'disp5k', kind: 'mac', group: 'External display', label: '5K display', w: 5120, h: 2880 },
]

// Panel sizes confirmed against Apple's spec pages / Wikipedia (Oct 2026).
export const IPHONES: DeviceModel[] = [
  { id: 'ip18pm', kind: 'iphone', group: 'iPhone 18', label: '18 Pro Max', w: 1320, h: 2868 },
  { id: 'ip18p', kind: 'iphone', group: 'iPhone 18', label: '18 Pro', w: 1206, h: 2622 },
  { id: 'ip17pm', kind: 'iphone', group: 'iPhone 17', label: '17 Pro Max', w: 1320, h: 2868 },
  { id: 'ip17p', kind: 'iphone', group: 'iPhone 17', label: '17 · 17 Pro', w: 1206, h: 2622 },
  { id: 'ip17air', kind: 'iphone', group: 'iPhone 17', label: '17 Air', w: 1260, h: 2736 },
  { id: 'ip16pm', kind: 'iphone', group: 'iPhone 16', label: '16 Pro Max', w: 1320, h: 2868 },
  { id: 'ip16p', kind: 'iphone', group: 'iPhone 16', label: '16 Pro', w: 1206, h: 2622 },
  { id: 'ip16plus', kind: 'iphone', group: 'iPhone 16', label: '16 Plus', w: 1290, h: 2796 },
  { id: 'ip16', kind: 'iphone', group: 'iPhone 16', label: '16', w: 1179, h: 2556 },
  { id: 'ip15pm', kind: 'iphone', group: 'iPhone 15', label: '15 Pro Max · 15 Plus', w: 1290, h: 2796 },
  { id: 'ip15', kind: 'iphone', group: 'iPhone 15', label: '15 · 15 Pro', w: 1179, h: 2556 },
]

export const MODELS: Record<DeviceKind, DeviceModel[]> = { mac: MACS, iphone: IPHONES }

export const DEFAULT_MODEL: Record<DeviceKind, string> = { mac: 'mba15', iphone: 'ip18p' }

export const CUSTOM_ID = 'custom'
export interface CustomSize { w: number; h: number }

const clampPx = (n: number) => Math.min(8192, Math.max(64, Math.round(Number(n) || 0)))

/** Resolves a model id (or a custom size) to concrete pixel dimensions. */
export function resolveModel(kind: DeviceKind, id: string, custom: CustomSize): DeviceModel {
  if (id === CUSTOM_ID) return { id, kind, group: 'Custom', label: 'Custom size', w: clampPx(custom.w), h: clampPx(custom.h) }
  return findModel(kind, id)
}

export function findModel(kind: DeviceKind, id: string): DeviceModel {
  return MODELS[kind].find((m) => m.id === id) ?? MODELS[kind][0]
}

export function groupModels(kind: DeviceKind): [string, DeviceModel[]][] {
  const map = new Map<string, DeviceModel[]>()
  for (const m of MODELS[kind]) map.set(m.group, [...(map.get(m.group) ?? []), m])
  return [...map.entries()]
}

export interface Zone { x0: number; x1: number; y0: number; y1: number }

/**
 * Where the lock screen clock + date sit, as fractions of the screen.
 * Mirrors the overlay components (their layout is in container-width units).
 */
export function clockZone(kind: DeviceKind, w: number, h: number): Zone {
  const H = (100 * h) / w // screen height in container-width units
  return kind === 'iphone'
    ? { x0: 0.12, x1: 0.88, y0: 19 / H, y1: Math.min(1, 56 / H) }
    : { x0: 0.3, x1: 0.7, y0: 6 / H, y1: Math.min(1, 21 / H) }
}
