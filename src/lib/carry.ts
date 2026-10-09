import type { DeviceKind } from './devices'
import type { Devices } from './state'

/**
 * Starts the `to` device from the look of the `from` device: film look, grain, vignette, clock shade,
 * frame, zoom and position. Model, custom size and preview view stay as they were.
 * Zoom and position are copied as they are; drawing clamps them to the new aspect ratio.
 */
export function carryOver(d: Devices, from: DeviceKind, to: DeviceKind): Devices {
  const { finish, scrim, frame, adjust } = d[from].settings
  return { ...d, [to]: { ...d[to], settings: { ...d[to].settings, finish, scrim, frame, adjust } } }
}
