import { useCallback, useEffect, useRef, useState } from 'react'
import { Controls } from './components/Controls'
import { DeviceStage } from './components/DeviceStage'
import { DropZone } from './components/DropZone'
import { ImageChip } from './components/ImageChip'
import { btnSecondary, iconProps } from './components/ui'
import { ModeSwitch, type Mode } from './components/ModeSwitch'
import { ThemeToggle } from './components/ThemeToggle'
import { useHistory } from './hooks/useHistory'
import { useTheme } from './hooks/useTheme'
import { DEFAULT_ADJUST, DEFAULT_FINISH, type Finish, DEFAULT_FRAME, type DeviceSettings } from './lib/draw'
import { DEFAULT_MODEL, MODELS, CUSTOM_ID, resolveModel, type CustomSize, type DeviceKind, type ScreenView } from './lib/devices'
import { canShareFiles, download, filename, renderBlob, shareFiles, sleep, upscaleFactor, type Format } from './lib/export'
import type { Legibility } from './lib/legibility'
import { closeImage, imageFromDataTransfer, loadImageFile, type LoadedImage } from './lib/image'
import { sampleFile, type Sample } from './lib/samples'
import { clearSavedImage, loadSavedImage, saveImage } from './lib/store'

interface DeviceState {
  modelId: string
  custom: CustomSize
  settings: DeviceSettings
  view: ScreenView
  /** iPhone home screen only: blur the wallpaper behind the icons, like the iOS setting. */
  homeBlur: boolean
}
type Devices = Record<DeviceKind, DeviceState>

const initial = (kind: DeviceKind): DeviceState => ({
  modelId: DEFAULT_MODEL[kind],
  custom: kind === 'mac' ? { w: 2560, h: 1440 } : { w: 1170, h: 2532 },
  settings: { adjust: DEFAULT_ADJUST, frame: DEFAULT_FRAME, scrim: 0, finish: DEFAULT_FINISH },
  view: 'lock',
  homeBlur: false,
})
const initialDevices = (): Devices => ({ mac: initial('mac'), iphone: initial('iphone') })

const LS = 'plumb:v1'

interface Saved { mode: Mode; format: Format; devices: Devices; linkLook: boolean }

function readSaved(): Partial<Saved> {
  try {
    const raw = JSON.parse(localStorage.getItem(LS) ?? '{}') as Partial<Saved>
    const base = initialDevices()
    const devices = {} as Devices
    for (const k of ['mac', 'iphone'] as DeviceKind[]) {
      const d = raw.devices?.[k]
      const known = d && (d.modelId === CUSTOM_ID || MODELS[k].some((m) => m.id === d.modelId))
      const old = d as unknown as { overlay?: boolean }
      if (d && !d.view) d.view = old.overlay === false ? 'off' : 'lock'
      devices[k] = known ? { ...base[k], ...d, settings: { ...base[k].settings, ...d.settings, frame: { ...DEFAULT_FRAME, ...d.settings?.frame }, finish: { ...DEFAULT_FINISH, ...d.settings?.finish } } } : base[k]
    }
    return { mode: raw.mode, format: raw.format, devices, linkLook: raw.linkLook }
  } catch {
    return {}
  }
}

export default function App() {
  const [theme, setTheme] = useTheme()
  const saved = useRef(readSaved()).current
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>(saved.mode ?? 'both')
  const hist = useHistory<Devices>(saved.devices ?? initialDevices())
  const devices = hist.state
  const [linkLook, setLinkLook] = useState(saved.linkLook ?? true)
  const [format, setFormat] = useState<Format>(saved.format ?? 'png')
  const [busy, setBusy] = useState<DeviceKind | 'both' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [exported, setExported] = useState<Record<DeviceKind, boolean>>({ mac: false, iphone: false })
  const [canShare] = useState(canShareFiles)
  const [legibility, setLegibility] = useState<Record<DeviceKind, Legibility | null>>({ mac: null, iphone: null })

  const open = useCallback(async (file: Blob & { name?: string }, opts: { restore?: boolean } = {}) => {
    try {
      const img = await loadImageFile(file as File)
      setError(null)
      setImage((prev) => {
        closeImage(prev)
        return img
      })
      if (!opts.restore) {
        hist.reset(initialDevices())
        setExported({ mac: false, iphone: false })
        saveImage({ blob: img.file, name: (file as File).name ?? img.name })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // restore the last session's image
  useEffect(() => {
    let live = true
    loadSavedImage().then(async (s) => {
      if (s && live) await open(new File([s.blob], s.name, { type: s.blob.type }), { restore: true })
      if (live) setRestoring(false)
    })
    return () => { live = false }
  }, [open])

  // only show the loader if restoring takes noticeable time
  useEffect(() => {
    const t = setTimeout(() => setShowLoader(true), 200)
    return () => clearTimeout(t)
  }, [])

  // persist settings
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(LS, JSON.stringify({ mode, format, devices, linkLook })) } catch { /* quota */ }
    }, 300)
    return () => clearTimeout(t)
  }, [mode, format, devices, linkLook])

  // full-page drop + paste
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const enter = (e: DragEvent) => { if (hasFiles(e)) { depth++; setDragging(true) } }
    const leave = (e: DragEvent) => { if (hasFiles(e) && --depth <= 0) { depth = 0; setDragging(false) } }
    const over = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault() }
    const drop = (e: DragEvent) => {
      e.preventDefault()
      depth = 0
      setDragging(false)
      const f = imageFromDataTransfer(e.dataTransfer)
      if (f) open(f)
      else setError('That file is not an image.')
    }
    const paste = (e: ClipboardEvent) => {
      const f = imageFromDataTransfer(e.clipboardData)
      if (f) open(f)
    }
    addEventListener('dragenter', enter)
    addEventListener('dragleave', leave)
    addEventListener('dragover', over)
    addEventListener('drop', drop)
    addEventListener('paste', paste)
    return () => {
      removeEventListener('dragenter', enter)
      removeEventListener('dragleave', leave)
      removeEventListener('dragover', over)
      removeEventListener('drop', drop)
      removeEventListener('paste', paste)
    }
  }, [open])

  // undo / redo shortcuts
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const t = e.target as HTMLElement
      if (t instanceof HTMLInputElement && t.type !== 'range' && t.type !== 'checkbox') return
      const k = e.key.toLowerCase()
      if (k === 'z') { e.preventDefault(); e.shiftKey ? hist.redo() : hist.undo() }
      else if (k === 'y') { e.preventDefault(); hist.redo() }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [hist])

  const patch = (k: DeviceKind, p: Partial<DeviceState>) => hist.set((d) => ({ ...d, [k]: { ...d[k], ...p } }))

  const linked = linkLook && mode === 'both'
  /** Look changes mirror to the other device while linked, so both screens share one style. */
  const setFinish = (k: DeviceKind, finish: Finish) =>
    hist.set((d) => {
      const next = { ...d, [k]: { ...d[k], settings: { ...d[k].settings, finish } } }
      if (linked) {
        const o: DeviceKind = k === 'mac' ? 'iphone' : 'mac'
        next[o] = { ...d[o], settings: { ...d[o].settings, finish } }
      }
      return next
    })
  const toggleLink = (on: boolean, from: DeviceKind) => {
    setLinkLook(on)
    if (on) hist.set((d) => {
      const o: DeviceKind = from === 'mac' ? 'iphone' : 'mac'
      return { ...d, [o]: { ...d[o], settings: { ...d[o].settings, finish: d[from].settings.finish } } }
    })
  }

  const renderFile = async (k: DeviceKind) => {
    const d = devices[k]
    const blob = await renderBlob(image!.bitmap, resolveModel(k, d.modelId, d.custom), d.settings, format)
    return new File([blob], filename(image!.name, k, format), { type: blob.type })
  }
  const run = async (which: DeviceKind | 'both', share = false) => {
    if (!image) return
    setBusy(which)
    try {
      const kinds: DeviceKind[] = which === 'both' ? ['mac', 'iphone'] : [which]
      if (share) {
        const files = await Promise.all(kinds.map(renderFile))
        if (!(await shareFiles(files))) return
      } else {
        for (const [i, k] of kinds.entries()) {
          if (i) await sleep(400)
          const f = await renderFile(k)
          download(f, f.name)
        }
      }
      setExported((e) => ({ ...e, ...Object.fromEntries(kinds.map((k) => [k, true])) }))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.')
    } finally {
      setBusy(null)
    }
  }

  const pickSample = async (s: Sample) => open(await sampleFile(s))
  const clear = () => {
    closeImage(image)
    setImage(null)
    clearSavedImage()
  }

  const kinds: DeviceKind[] = mode === 'both' ? ['mac', 'iphone'] : [mode]
  const primary =
    'rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white'

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-8 sm:py-4">
        <span className="order-1 flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight">
          <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden>
            <rect width="64" height="64" rx="15" className="fill-stone-900 dark:fill-stone-100" />
            <line x1="32" y1="9" x2="32" y2="37" strokeWidth="2.6" strokeLinecap="round" className="stroke-white dark:stroke-stone-900" />
            <path d="M32 56 24 44.500a9.200 9.200 0 1 1 16 0z" className="fill-white dark:fill-stone-900" />
          </svg>
          Plumb
        </span>
        {image && (
          <div className="order-3 flex w-full items-center gap-2 sm:order-2 sm:ml-auto sm:w-auto sm:gap-3">
              <button type="button" className={btnSecondary} onClick={hist.undo} disabled={!hist.canUndo} title="Undo (⌘Z)">
                <svg {...iconProps}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
                Undo
              </button>
              <button type="button" className={btnSecondary} onClick={hist.redo} disabled={!hist.canRedo} title="Redo (⇧⌘Z)">
                <svg {...iconProps}><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></svg>
                Redo
              </button>
              <ModeSwitch value={mode} onChange={setMode} />
          </div>
        )}
        <div className="order-2 ml-auto sm:order-3 sm:ml-0">
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      {!image ? (
        <main>
          {restoring ? (
            showLoader && <p role="status" className="grid min-h-[60vh] animate-pulse place-items-center text-sm text-stone-400 dark:text-white/40">Restoring your last image…</p>
          ) : (
            <DropZone onFile={open} onSample={pickSample} error={error} />
          )}
        </main>
      ) : (
        <main className="mx-auto max-w-[1500px] px-4 pb-32 sm:px-8 lg:pb-16">
          <h1 className="sr-only">Wallpaper preview and export</h1>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <ImageChip image={image.preview} width={image.bitmap.width} height={image.bitmap.height} onReplace={open} onRemove={clear} />
            <div className="hidden items-center gap-3 lg:flex">
              <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-white/50">
                Format
                <select name="format" value={format} onChange={(e) => setFormat(e.target.value as Format)} className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm text-stone-900 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </label>
              {mode === 'both' && (
                <button type="button" onClick={() => run('both')} disabled={busy !== null} className={primary}>
                  {busy === 'both' ? 'Exporting…' : 'Download both'}
                </button>
              )}
            </div>
          </div>
          {error && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className={`grid items-start gap-10 ${mode === 'both' ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]' : ''}`}>
            {kinds.map((k) => {
              const d = devices[k]
              const model = resolveModel(k, d.modelId, d.custom)
              return (
                <section key={k} aria-label={k === 'mac' ? 'Mac wallpaper' : 'iPhone wallpaper'} className={`flex min-w-0 flex-col items-center gap-6 ${mode !== 'both' ? 'lg:flex-row lg:items-start lg:justify-center' : ''}`}>
                  <div className={`flex w-full justify-center ${mode !== 'both' ? 'lg:w-auto lg:flex-1' : ''}`}>
                    <DeviceStage model={model} image={image.preview} settings={d.settings} view={d.view} blur={d.homeBlur} onChange={(settings) => patch(k, { settings })} onLegibility={(l) => setLegibility((p) => (p[k] === l ? p : { ...p, [k]: l }))} />
                  </div>
                  <div className="w-full max-w-md shrink-0">
                    <Controls
                      kind={k}
                      image={image.preview}
                      modelId={d.modelId}
                      model={model}
                      custom={d.custom}
                      onCustom={(custom) => patch(k, { custom })}
                      settings={d.settings}
                      view={d.view}
                      busy={busy !== null}
                      legibility={legibility[k]}
                      upscale={upscaleFactor(image.bitmap, model, d.settings)}
                      onModel={(modelId) => patch(k, { modelId })}
                      onSettings={(settings) => patch(k, { settings })}
                      onFinish={(f) => setFinish(k, f)}
                      lookLinked={mode === 'both' ? linkLook : undefined}
                      onLookLinked={(on) => toggleLink(on, k)}
                      onView={(view) => patch(k, { view })}
                      homeBlur={d.homeBlur}
                      onHomeBlur={(homeBlur) => patch(k, { homeBlur })}
                      onDownload={() => run(k)}
                      onShare={canShare ? () => run(k, true) : undefined}
                      exported={exported[k]}
                    />
                  </div>
                </section>
              )
            })}
          </div>

          {/* mobile action bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-stone-200 bg-stone-100/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden dark:border-white/10 dark:bg-neutral-950/90">
            <select aria-label="Format" name="format-mobile" value={format} onChange={(e) => setFormat(e.target.value as Format)} className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm dark:border-white/10 dark:bg-neutral-900">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
            {canShare && (
              <button type="button" onClick={() => run(mode === 'both' ? 'both' : mode, true)} disabled={busy !== null} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium dark:border-white/20">
                Share
              </button>
            )}
            <button type="button" onClick={() => run(mode === 'both' ? 'both' : mode)} disabled={busy !== null} className={`${primary} flex-1 py-3`}>
              {busy ? 'Exporting…' : mode === 'both' ? 'Download both' : `Download ${mode === 'mac' ? 'Mac' : 'iPhone'}`}
            </button>
          </div>
        </main>
      )}

      {dragging && (
        <div className="pointer-events-none fixed inset-3 z-50 grid place-items-center rounded-[2rem] border-2 border-dashed border-stone-900/40 bg-stone-100/80 text-lg font-medium backdrop-blur dark:border-white/40 dark:bg-neutral-950/80">
          Drop to use this image
        </div>
      )}
    </div>
  )
}
