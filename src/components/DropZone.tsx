import { useRef } from 'react'
import type { DeviceKind } from '../lib/devices'
import { SAMPLES, sampleThumb, type Sample } from '../lib/samples'
import { DeviceSwitch } from './DeviceSwitch'
import { PaintingCandidates } from './PaintingCandidates'

function Thumb({ sample, onPick }: { sample: Sample; onPick: (s: Sample) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(sample)}
      title={`Photo by ${sample.credit} · CC0`}
      className="group relative overflow-hidden rounded-xl text-left ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:ring-white/10 dark:focus-visible:outline-white"
    >
      <img src={sampleThumb(sample)} alt="" loading="lazy" width={480} height={320} className="block aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pt-6 pb-2 text-xs font-medium text-white">{sample.label}</span>
      <span className="sr-only">Try with {sample.label}</span>
    </button>
  )
}

export function DropZone({ kind, onKind, onFile, onSample, error }: { kind: DeviceKind; onKind: (k: DeviceKind) => void; onFile: (f: File) => void; onSample: (s: Sample) => void; error?: string | null }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex flex-col items-center gap-2">
        <span className="text-sm text-stone-500 dark:text-white/50">What is it for?</span>
        <DeviceSwitch value={kind} onChange={onKind} />
      </div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="group relative flex w-full flex-col items-center gap-5 rounded-[2rem] border border-dashed border-stone-300 bg-white/60 px-8 py-20 transition hover:border-stone-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-white/30 dark:hover:bg-white/[0.06] dark:focus-visible:outline-white"
      >
        <div className="flex items-end gap-3 text-stone-400 transition group-hover:text-stone-600 dark:text-white/30 dark:group-hover:text-white/60">
          <svg width="76" height="52" viewBox="0 0 76 52" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={`transition-opacity duration-200 ${kind === 'mac' ? '' : 'hidden'}`}>
            <rect x="3" y="3" width="70" height="42" rx="5" />
            <path d="M20 49h36" strokeLinecap="round" />
          </svg>
          <svg width="26" height="52" viewBox="0 0 26 52" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={kind === 'iphone' ? '' : 'hidden'}>
            <rect x="2" y="2" width="22" height="48" rx="6" />
            <rect x="9" y="6" width="8" height="3" rx="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Fit any image to your lock screen</h1>
          <p className="mt-3 text-base text-stone-500 dark:text-white/55">
            Drop an image here, click to browse, or paste. Preview it behind the clock on your {kind === 'mac' ? 'Mac' : 'iPhone'}, then export at native resolution.
          </p>
        </div>
        <span className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-stone-900">Choose image</span>
      </button>
      {error && <p role="alert" className="mt-5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-8 w-full">
        <p className="mb-3 text-sm text-stone-500 dark:text-white/50">No image handy? Try a sample.</p>
        <div className="grid grid-cols-3 gap-3">
          {SAMPLES.map((s) => <Thumb key={s.id} sample={s} onPick={onSample} />)}
        </div>
      </div>
      <ul className="mt-12 grid w-full gap-6 text-left sm:grid-cols-3">
        {[
          ['See it before you set it', 'Live lock screen, desktop and home screen previews for recent Macs and iPhones.'],
          ['Frame it, give it a look', 'Gallery frames with a paper mat, and film looks inspired by Fujifilm.'],
          ['Export it exactly', 'Native resolution in Display P3, one file for each device.'],
        ].map(([title, text]) => (
          <li key={title}>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-white/50">{text}</p>
          </li>
        ))}
      </ul>
      <PaintingCandidates />
      <p className="mt-10 text-xs text-stone-400 dark:text-white/35">Everything stays in your browser. Nothing is uploaded.</p>
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
