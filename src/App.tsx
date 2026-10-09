import { useCallback, useEffect, useRef, useState } from 'react'
import { DropZone } from './components/DropZone'
import { btnSecondary, iconProps } from './components/ui'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Wizard } from './components/Wizard'
import { ThemeToggle } from './components/ThemeToggle'
import { useHistory } from './hooks/useHistory'
import { useTheme } from './hooks/useTheme'
import type { Finish } from './lib/draw'
import { carryOver } from './lib/carry'
import { initialDevices, LS, readSaved, type DeviceState, type Devices, type Step } from './lib/state'
import { resolveModel, type DeviceKind } from './lib/devices'
import { canShareFiles, download, filename, renderBlob, shareFiles, sleep, upscaleFactor, type Format } from './lib/export'
import type { Legibility } from './lib/legibility'
import { closeImage, imageFromDataTransfer, loadImageFile, type LoadedImage } from './lib/image'
import { sampleFile, type Sample } from './lib/samples'
import { clearSavedImage, loadSavedImage, saveImage } from './lib/store'

export default function App() {
  const [theme, setTheme] = useTheme()
  const saved = useRef(readSaved()).current
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [restoring, setRestoring] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kind, setKind] = useState<DeviceKind>(saved.kind ?? 'iphone')
  const [step, setStep] = useState<Step>('place')
  const hist = useHistory<Devices>(saved.devices ?? initialDevices())
  const devices = hist.state
  const [format, setFormat] = useState<Format>(saved.format ?? 'png')
  const [busy, setBusy] = useState<DeviceKind | null>(null)
  const [dragging, setDragging] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [carried, setCarried] = useState<DeviceKind | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
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
      try { localStorage.setItem(LS, JSON.stringify({ kind, format, devices })) } catch { /* quota */ }
    }, 300)
    return () => clearTimeout(t)
  }, [kind, format, devices])

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
      if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      else if (k === 'y') { e.preventDefault(); redo() }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [hist])

  const patch = (k: DeviceKind, p: Partial<DeviceState>) => hist.set((d) => ({ ...d, [k]: { ...d[k], ...p } }))

  const setFinish = (k: DeviceKind, finish: Finish) => hist.set((d) => ({ ...d, [k]: { ...d[k], settings: { ...d[k].settings, finish } } }))
  /** Starts the other device from this device's look, then shows it. */
  const createFor = (to: DeviceKind) => {
    hist.set((d) => carryOver(d, kind, to))
    setKind(to)
    setStep('export')
    setCarried(kind)
  }
  /** Undo and redo cover both devices. If the change was on the other device, switch to it so it is visible. */
  const follow = (c: { from: Devices; to: Devices } | undefined) => {
    if (!c) return
    const changed = (['mac', 'iphone'] as DeviceKind[]).filter((k) => c.from[k] !== c.to[k])
    if (changed.length && !changed.includes(kind)) switchKind(changed[0])
  }
  const undo = () => follow(hist.undo())
  const redo = () => follow(hist.redo())
  /** Back to the start screen with a clean slate. The chosen device is kept. */
  const reset = () => {
    setConfirmReset(false)
    clear()
    hist.reset(initialDevices())
    setStep('place')
    setCarried(null)
    setExported({ mac: false, iphone: false })
    setError(null)
  }
  const goStep = (s: Step) => {
    setStep(s)
    if (s !== 'export') setCarried(null)
  }
  const switchKind = (k: DeviceKind) => {
    setKind(k)
    setCarried(null)
  }

  const renderFile = async (k: DeviceKind) => {
    const d = devices[k]
    const blob = await renderBlob(image!.bitmap, resolveModel(k, d.modelId, d.custom), d.settings, format)
    return new File([blob], filename(k, format), { type: blob.type })
  }
  const run = async (which: DeviceKind, share = false) => {
    if (!image) return
    setBusy(which)
    try {
      const kinds: DeviceKind[] = [which]
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
      setJustSaved(true)
      clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setJustSaved(false), 1500)
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

  const d = devices[kind]
  const model = resolveModel(kind, d.modelId, d.custom)

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-8 sm:py-4">
        <span className="flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight">
          <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden>
            <rect width="64" height="64" rx="15" className="fill-stone-900 dark:fill-stone-100" />
            <line x1="32" y1="9" x2="32" y2="37" strokeWidth="2.6" strokeLinecap="round" className="stroke-white dark:stroke-stone-900" />
            <path d="M32 56 24 44.500a9.200 9.200 0 1 1 16 0z" className="fill-white dark:fill-stone-900" />
          </svg>
          Plumb
        </span>
        {image && (
          <div className="ml-auto flex items-center gap-2">
            <button type="button" className={btnSecondary} onClick={undo} disabled={!hist.canUndo} title="Undo (⌘Z)">
              <svg {...iconProps}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
              <span className="max-sm:sr-only">Undo</span>
            </button>
            <button type="button" className={btnSecondary} onClick={redo} disabled={!hist.canRedo} title="Redo (⇧⌘Z)">
              <svg {...iconProps}><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></svg>
              <span className="max-sm:sr-only">Redo</span>
            </button>
            <button type="button" className={btnSecondary} onClick={() => setConfirmReset(true)} title="Start over">
              <svg {...iconProps}><path d="M3 11 12 4l9 7" /><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" /></svg>
              <span className="max-sm:sr-only">Reset</span>
            </button>
          </div>
        )}
        <div className={image ? '' : 'ml-auto'}>
          <ThemeToggle value={theme} onChange={setTheme} />
        </div>
      </header>

      {!image ? (
        <main>
          {restoring ? (
            showLoader && <p role="status" className="grid min-h-[60vh] animate-pulse place-items-center text-sm text-stone-400 dark:text-white/40">Restoring your last image…</p>
          ) : (
            <DropZone kind={kind} onKind={setKind} onFile={open} onSample={pickSample} error={error} />
          )}
        </main>
      ) : (
        <main className="mx-auto max-w-[1500px] px-4 pb-28 sm:px-8 lg:pb-16">
          <h1 className="sr-only">Wallpaper preview and export</h1>
          {error && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Wizard
            kind={kind}
            onKind={switchKind}
            step={step}
            onStep={goStep}
            image={image}
            d={d}
            model={model}
            onPatch={(p) => patch(kind, p)}
            onFinish={(f) => setFinish(kind, f)}
            level={legibility[kind]}
            onLevel={(l) => setLegibility((p) => (p[kind] === l ? p : { ...p, [kind]: l }))}
            upscale={upscaleFactor(image.bitmap, model, d.settings)}
            busy={busy !== null}
            exported={exported[kind]}
            format={format}
            onFormat={setFormat}
            onDownload={() => run(kind)}
            onShare={canShare ? () => run(kind, true) : undefined}
            onReplace={open}
            onRemove={clear}
            saved={justSaved}
            carriedFrom={carried}
            onCreateOther={() => createFor(kind === 'mac' ? 'iphone' : 'mac')}
          />
        </main>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Start over?"
        body="This clears your image and all settings. It can't be undone."
        confirmLabel="Start over"
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />

      {dragging && (
        <div className="pointer-events-none fixed inset-3 z-50 grid place-items-center rounded-[2rem] border-2 border-dashed border-stone-900/40 bg-stone-100/80 text-lg font-medium backdrop-blur dark:border-white/40 dark:bg-neutral-950/80">
          Drop to use this image
        </div>
      )}
    </div>
  )
}
