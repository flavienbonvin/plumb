import { useEffect, useRef } from 'react'
import { SAMPLES, renderSample, type Sample } from '../lib/samples'

function Thumb({ sample, onPick }: { sample: Sample; onPick: (s: Sample) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.getContext('2d')!.drawImage(renderSample(sample, 240, 160), 0, 0)
  }, [sample])
  return (
    <button
      type="button"
      onClick={() => onPick(sample)}
      className="group overflow-hidden rounded-xl text-left ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:ring-white/10 dark:focus-visible:outline-white"
    >
      <canvas ref={ref} width={240} height={160} className="block h-auto w-full" />
      <span className="sr-only">Try with {sample.label}</span>
    </button>
  )
}

export function DropZone({ onFile, onSample, error }: { onFile: (f: File) => void; onSample: (s: Sample) => void; error?: string | null }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="group relative flex w-full flex-col items-center gap-5 rounded-[2rem] border border-dashed border-stone-300 bg-white/60 px-8 py-20 transition hover:border-stone-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-white/30 dark:hover:bg-white/[0.06] dark:focus-visible:outline-white"
      >
        <div className="flex items-end gap-3 text-stone-400 transition group-hover:text-stone-600 dark:text-white/30 dark:group-hover:text-white/60">
          <svg width="76" height="52" viewBox="0 0 76 52" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="3" width="70" height="42" rx="5" />
            <path d="M20 49h36" strokeLinecap="round" />
          </svg>
          <svg width="26" height="52" viewBox="0 0 26 52" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="2" y="2" width="22" height="48" rx="6" />
            <rect x="9" y="6" width="8" height="3" rx="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Fit any image to your lock screen</h1>
          <p className="mt-3 text-base text-stone-500 dark:text-white/55">
            Drop an image here, click to browse, or paste. Preview it behind the clock on Mac and iPhone, then export at native resolution.
          </p>
        </div>
        <span className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-stone-900">Choose image</span>
      </button>
      {error && <p role="alert" className="mt-5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-8 w-full">
        <p className="mb-3 text-sm text-stone-500 dark:text-white/50">No image handy? Try a sample.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SAMPLES.map((s) => <Thumb key={s.id} sample={s} onPick={onSample} />)}
        </div>
      </div>
      <p className="mt-6 text-xs text-stone-400 dark:text-white/35">Everything stays in your browser. Nothing is uploaded.</p>
      <input
        ref={input}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
