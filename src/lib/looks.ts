// Film-style colour looks. Each look is a tone curve + per-channel balance + saturation + split toning,
// applied per pixel. They are named after the Fujifilm film simulations they take inspiration from;
// these are approximations, not Fujifilm's own recipes.

export interface Finish {
  /** Look id ('none' = untouched). */
  look: string
  /** 0..1 how strongly the look is applied. */
  intensity: number
  /** 0..1 film grain. */
  grain: number
  /** 0..1 darkening towards the corners. */
  vignette: number
}

export const DEFAULT_FINISH: Finish = { look: 'none', intensity: 1, grain: 0, vignette: 0 }
export const hasFinish = (f: Finish) => f.look !== 'none' || f.grain > 0 || f.vignette > 0

type RGB = [number, number, number]

export interface Look {
  id: string
  label: string
  note: string
  /** S-curve strength, -1..1. */
  contrast: number
  /** Lifts the blacks, 0..0.15. */
  fade: number
  sat: number
  /** Per-channel midtone gamma (>1 darkens that channel). */
  gamma: RGB
  /** Per-channel gain. */
  gain: RGB
  /** Added in shadows / highlights, in 0..1 units. */
  shadow: RGB
  highlight: RGB
  /** Black & white: channel mix. */
  mono?: RGB
  /** Suggested grain / vignette when the look is picked. */
  grain: number
  vignette: number
}

const flat: Omit<Look, 'id' | 'label' | 'note'> = {
  contrast: 0, fade: 0, sat: 1, gamma: [1, 1, 1], gain: [1, 1, 1], shadow: [0, 0, 0], highlight: [0, 0, 0], grain: 0, vignette: 0,
}

export const LOOKS: Look[] = [
  { id: 'none', label: 'Original', note: 'No colour change', ...flat },
  { id: 'standard', label: 'Provia', note: 'Balanced, with a little punch. The all-round Fujifilm look.', ...flat, contrast: 0.2, sat: 1.1, grain: 0.08, vignette: 0.1 },
  {
    id: 'vivid', label: 'Velvia', note: 'Deep, saturated slide film with rich blues and greens.', ...flat,
    contrast: 0.42, sat: 1.5, gamma: [0.98, 0.96, 0.93], shadow: [-0.01, 0, 0.02], grain: 0.1, vignette: 0.18,
  },
  {
    id: 'soft', label: 'Astia', note: 'Gentle contrast and flattering warmth.', ...flat,
    contrast: 0.04, fade: 0.025, sat: 0.96, gain: [1.02, 1, 0.97], highlight: [0.016, 0.008, -0.012], grain: 0.1, vignette: 0.08,
  },
  {
    id: 'chrome', label: 'Classic Chrome', note: 'Muted and moody, with a documentary feel.', ...flat,
    contrast: 0.34, fade: 0.035, sat: 0.7, gamma: [1, 1, 0.94], shadow: [-0.025, 0, 0.04], highlight: [0.014, 0.009, -0.006], grain: 0.22, vignette: 0.28,
  },
  {
    id: 'negative', label: 'Classic Neg.', note: 'Cinematic: warm highlights and teal shadows.', ...flat,
    contrast: 0.3, fade: 0.055, sat: 0.94, gain: [1.02, 1, 0.96], shadow: [-0.035, 0.02, 0.04], highlight: [0.045, 0.016, -0.035], grain: 0.26, vignette: 0.22,
  },
  {
    id: 'cinema', label: 'Eterna', note: 'Calm, lifted shadows and low saturation.', ...flat,
    contrast: 0.1, fade: 0.07, sat: 0.78, shadow: [-0.01, 0.01, 0.028], highlight: [0.012, 0.006, 0], grain: 0.16, vignette: 0.2,
  },
  {
    id: 'mono', label: 'Acros', note: 'Rich black and white with fine grain.', ...flat,
    contrast: 0.42, fade: 0.015, mono: [0.34, 0.52, 0.14], grain: 0.38, vignette: 0.26,
  },
]

export const findLook = (id: string) => LOOKS.find((l) => l.id === id) ?? LOOKS[0]

const smooth = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function buildLuts(l: Look): Uint8ClampedArray[] {
  return [0, 1, 2].map((ch) => {
    const lut = new Uint8ClampedArray(256)
    for (let i = 0; i < 256; i++) {
      let x = i / 255
      x = x + l.contrast * (smooth(x) - x)
      x = l.fade + x * (1 - l.fade)
      x = Math.pow(clamp01(x), l.gamma[ch]) * l.gain[ch]
      lut[i] = Math.round(clamp01(x) * 255)
    }
    return lut
  })
}

const lutCache = new Map<string, Uint8ClampedArray[]>()

type Rect = { x: number; y: number; w: number; h: number }

const lumLut = (() => {
  const t = new Float32Array(256)
  for (let i = 0; i < 256; i++) t[i] = i / 255
  return t
})()

/**
 * Colour grade: tone curve, balance, saturation and split toning, applied per pixel to a canvas rect.
 * Vignette and grain are separate (overlayFinish) so they stay cheap.
 */
export function applyGrade(ctx: CanvasRenderingContext2D, rect: Rect, f: Pick<Finish, 'look' | 'intensity'>) {
  const look = findLook(f.look)
  if (look.id === 'none' || f.intensity <= 0) return
  const x0 = Math.max(0, Math.floor(rect.x))
  const y0 = Math.max(0, Math.floor(rect.y))
  const w = Math.min(ctx.canvas.width, Math.ceil(rect.x + rect.w)) - x0
  const h = Math.min(ctx.canvas.height, Math.ceil(rect.y + rect.h)) - y0
  if (w <= 0 || h <= 0) return

  const img = ctx.getImageData(x0, y0, w, h)
  const d = img.data
  const luts = lutCache.get(look.id) ?? (lutCache.set(look.id, buildLuts(look)), lutCache.get(look.id)!)
  const [lr, lg, lb] = luts
  const k = f.intensity
  const sat = look.sat
  const mono = look.mono
  const [sr, sg, sb] = look.shadow.map((v) => v * 255)
  const [hr, hg, hb] = look.highlight.map((v) => v * 255)
  // weights for shadow / highlight toning, by luminance
  const ws = new Float32Array(256)
  const wh = new Float32Array(256)
  for (let i = 0; i < 256; i++) {
    const l = lumLut[i]
    ws[i] = (1 - l) * (1 - l)
    wh[i] = l * l
  }
  const full = k >= 0.999

  for (let i = 0, n = d.length; i < n; i += 4) {
    const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2]
    let r = lr[r0], g = lg[g0], b = lb[b0]
    if (mono) {
      r = g = b = r * mono[0] + g * mono[1] + b * mono[2]
    } else if (sat !== 1) {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
      r = l + (r - l) * sat
      g = l + (g - l) * sat
      b = l + (b - l) * sat
    }
    const li = (0.2126 * r + 0.7152 * g + 0.0722 * b) | 0
    const s = ws[li > 255 ? 255 : li < 0 ? 0 : li]
    const hh = wh[li > 255 ? 255 : li < 0 ? 0 : li]
    r += sr * s + hr * hh
    g += sg * s + hg * hh
    b += sb * s + hb * hh
    if (!full) {
      r = r0 + (r - r0) * k
      g = g0 + (g - g0) * k
      b = b0 + (b - b0) * k
    }
    d[i] = r < 0 ? 0 : r > 255 ? 255 : r
    d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g
    d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b
  }
  ctx.putImageData(img, x0, y0)
}

let grainTile: HTMLCanvasElement | null = null

function getGrainTile() {
  if (grainTile) return grainTile
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const d = g.createImageData(256, 256)
  let seed = 1337
  const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (rnd() + rnd() - 1) * 127 // triangular noise around mid grey
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v
    d.data[i + 3] = 255
  }
  g.putImageData(d, 0, 0)
  return (grainTile = c)
}

/** Vignette and grain as canvas operations (fast, GPU friendly). `short` keeps grain size consistent across resolutions. */
export function overlayFinish(ctx: CanvasRenderingContext2D, r: Rect, f: Pick<Finish, 'grain' | 'vignette'>, short: number) {
  if (f.vignette <= 0 && f.grain <= 0) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(r.x, r.y, r.w, r.h)
  ctx.clip()

  if (f.vignette > 0) {
    // elliptical: unit space where the corners sit at distance sqrt(2)
    ctx.save()
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2)
    ctx.scale(r.w / 2, r.h / 2)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.SQRT2)
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      const u = clamp01((t - 0.3) / 0.7)
      g.addColorStop(t, `rgba(0,0,0,${(f.vignette * 0.6 * smooth(u)).toFixed(4)})`)
    }
    ctx.fillStyle = g
    ctx.fillRect(-1.01, -1.01, 2.02, 2.02)
    ctx.restore()
  }

  if (f.grain > 0) {
    const pat = ctx.createPattern(getGrainTile(), 'repeat')
    if (pat) {
      const cell = Math.max(1, (short / 1100) * 1.4)
      ctx.save()
      ctx.globalCompositeOperation = 'soft-light'
      ctx.globalAlpha = Math.min(1, f.grain * 1.15)
      ctx.translate(r.x, r.y)
      ctx.scale(cell, cell)
      ctx.fillStyle = pat
      ctx.fillRect(0, 0, r.w / cell + 1, r.h / cell + 1)
      ctx.restore()
    }
  }
  ctx.restore()
}
