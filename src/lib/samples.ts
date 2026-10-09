// Procedurally drawn sample images so first-time visitors can try the tool instantly.
// Everything is a function of (w, h), so thumbnails and full-size renders match.

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

function ridge(ctx: CanvasRenderingContext2D, w: number, h: number, base: number, amp: number, seed: number, fill: string | CanvasGradient) {
  ctx.beginPath()
  ctx.moveTo(0, h)
  for (let x = 0; x <= w; x += w / 240) {
    const t = x / w
    const y =
      base * h -
      amp * h * (0.55 * Math.sin(t * 5 + seed) + 0.3 * Math.sin(t * 11 + seed * 2.3) + 0.15 * Math.sin(t * 27 + seed * 4.1))
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

const dusk: Draw = (ctx, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#2b2a6b')
  sky.addColorStop(0.35, '#b4507f')
  sky.addColorStop(0.62, '#f5976a')
  sky.addColorStop(0.8, '#ffd29a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  const sx = w * 0.62, sy = h * 0.55
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.6)
  glow.addColorStop(0, 'rgba(255,240,200,0.95)')
  glow.addColorStop(0.12, 'rgba(255,214,160,0.55)')
  glow.addColorStop(1, 'rgba(255,170,120,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff3d6'
  ctx.beginPath(); ctx.arc(sx, sy, h * 0.045, 0, 7); ctx.fill()
  const layers = [
    { b: 0.72, a: 0.1, c: '#d98a86' },
    { b: 0.78, a: 0.11, c: '#a9577d' },
    { b: 0.85, a: 0.1, c: '#6a3a73' },
    { b: 0.93, a: 0.08, c: '#2d1f52' },
  ]
  layers.forEach((l, i) => ridge(ctx, w, h, l.b, l.a, i * 1.7 + 0.4, l.c))
}

const aurora: Draw = (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#04060f')
  bg.addColorStop(1, '#0b1630')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'lighter'
  const blobs: [number, number, number, string][] = [
    [0.25, 0.45, 0.5, 'rgba(40,220,170,0.55)'],
    [0.55, 0.35, 0.55, 'rgba(70,130,255,0.5)'],
    [0.8, 0.5, 0.45, 'rgba(190,80,255,0.45)'],
    [0.45, 0.65, 0.4, 'rgba(60,255,150,0.3)'],
    [0.15, 0.2, 0.3, 'rgba(255,90,170,0.25)'],
  ]
  for (const [x, y, r, c] of blobs) {
    const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * h)
    g.addColorStop(0, c)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.translate(x * w, y * h)
    ctx.scale(1.8, 1)
    ctx.translate(-x * w, -y * h)
    ctx.fillStyle = g
    ctx.fillRect(-w, 0, w * 3, h)
    ctx.restore()
  }
  ctx.globalCompositeOperation = 'source-over'
  for (let i = 0; i < 160; i++) {
    const x = ((Math.sin(i * 91.7) + 1) / 2) * w
    const y = ((Math.sin(i * 53.3 + 2) + 1) / 2) * h * 0.7
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * ((Math.sin(i * 7.7) + 1) / 2)})`
    ctx.beginPath(); ctx.arc(x, y, h * 0.0016 * (1 + (i % 3)), 0, 7); ctx.fill()
  }
  ridge(ctx, w, h, 0.92, 0.05, 2.2, '#050810')
}

const dunes: Draw = (ctx, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7)
  sky.addColorStop(0, '#f6e7d4')
  sky.addColorStop(1, '#f3c9a3')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  const cols = ['#eab98a', '#dc9c6c', '#c97f5a', '#a9604a', '#7c4440']
  cols.forEach((c, i) => {
    const g = ctx.createLinearGradient(0, h * (0.45 + i * 0.1), 0, h)
    g.addColorStop(0, c)
    g.addColorStop(1, cols[Math.min(i + 1, cols.length - 1)])
    ridge(ctx, w, h, 0.55 + i * 0.1, 0.07 - i * 0.008, i * 2.9 + 1, g)
  })
}

const contour: Draw = (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#10243f')
  bg.addColorStop(1, '#0a0f1c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.lineWidth = Math.max(1, h * 0.0022)
  const n = 56
  for (let i = 0; i < n; i++) {
    const t = i / n
    ctx.strokeStyle = `rgba(${120 + 100 * t},${190 + 40 * t},255,${0.08 + 0.4 * Math.sin(t * Math.PI)})`
    ctx.beginPath()
    for (let x = 0; x <= w; x += w / 300) {
      const u = x / w
      const y = h * (0.1 + 0.8 * t) + h * 0.12 * Math.sin(u * 6 + t * 5) * Math.sin(t * 3.1 + u * 2) + h * 0.05 * Math.sin(u * 15 - t * 9)
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

export interface Sample { id: string; label: string; draw: Draw }

export const SAMPLES: Sample[] = [
  { id: 'dusk', label: 'Dusk', draw: dusk },
  { id: 'aurora', label: 'Aurora', draw: aurora },
  { id: 'dunes', label: 'Dunes', draw: dunes },
  { id: 'contour', label: 'Contour', draw: contour },
]

export function renderSample(s: Sample, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  s.draw(c.getContext('2d')!, w, h)
  return c
}

export async function sampleFile(s: Sample): Promise<File> {
  const c = renderSample(s, 3600, 2400)
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.93))
  if (!blob) throw new Error('Couldn’t create the sample image.')
  return new File([blob], `${s.id}.jpg`, { type: 'image/jpeg' })
}
