import type { Step } from '../lib/state'

export const STEPS: { id: Step; label: string }[] = [
  { id: 'place', label: 'Place' },
  { id: 'style', label: 'Style' },
  { id: 'export', label: 'Export' },
]

/** Three steps, all reachable at any time. The marker glides to the current one. */
export function Stepper({ step, onStep }: { step: Step; onStep: (s: Step) => void }) {
  const i = STEPS.findIndex((s) => s.id === step)
  return (
    <nav aria-label="Steps" className="relative grid grid-cols-3 rounded-full border border-stone-200 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
      <span aria-hidden className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-stone-900 transition-transform duration-300 ease-out dark:bg-white" style={{ transform: `translateX(${i * 100}%)` }} />
      {STEPS.map((s, n) => {
        const on = s.id === step
        return (
          <button
            key={s.id}
            type="button"
            aria-current={on ? 'step' : undefined}
            onClick={() => onStep(s.id)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white ${
              on ? 'text-white dark:text-stone-900' : 'text-stone-500 hover:text-stone-900 dark:text-white/50 dark:hover:text-white'
            }`}
          >
            <span className="text-xs tabular-nums opacity-60">{n + 1}</span>
            {s.label}
          </button>
        )
      })}
    </nav>
  )
}
