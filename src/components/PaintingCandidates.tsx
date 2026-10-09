import { LANDSCAPE, PORTRAIT, searchUrl, type Candidate } from '../lib/candidates'

const dot = { good: 'bg-emerald-500', fair: 'bg-amber-400', poor: 'bg-red-500' } as const

function Row({ c }: { c: Candidate }) {
  return (
    <li className="py-2.5">
      <a href={searchUrl(c)} target="_blank" rel="noreferrer" className="font-medium underline-offset-2 hover:underline">{c.title}</a>
      <span className="text-stone-500 dark:text-white/50"> · {c.artist}, {c.year}</span>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 dark:text-white/50">
        <span className="tabular-nums">{c.w.toLocaleString()} × {c.h.toLocaleString()} px</span>
        <span className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${dot[c.iphone]}`} />iPhone clock</span>
        <span className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-full ${dot[c.mac]}`} />Mac clock</span>
      </div>
      {c.note && <p className="mt-0.5 text-xs text-stone-500 dark:text-white/50">{c.note}</p>}
    </li>
  )
}

/** Temporary: painting candidates to choose the samples from. Remove once the samples are picked. */
export function PaintingCandidates() {
  return (
    <section className="mt-14 w-full text-left" aria-labelledby="candidates-title">
      <h2 id="candidates-title" className="font-display text-lg font-semibold tracking-tight">Painting candidates</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-white/50">
        Temporary. Each link opens a Google search. Sizes are the largest public-domain file on Wikimedia Commons. The dots show how the clock reads on the default crop.
      </p>
      <div className="mt-5 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Portrait · best on iPhone</h3>
          <ul className="mt-1 divide-y divide-stone-200 text-sm dark:divide-white/10">{PORTRAIT.map((c) => <Row key={c.title} c={c} />)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Landscape · best on Mac</h3>
          <ul className="mt-1 divide-y divide-stone-200 text-sm dark:divide-white/10">{LANDSCAPE.map((c) => <Row key={c.title} c={c} />)}</ul>
        </div>
      </div>
    </section>
  )
}
