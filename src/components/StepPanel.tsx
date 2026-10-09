import type { ReactNode } from 'react'

export type StepDir = 'fwd' | 'back' | 'none'

interface Props {
  /** Which way the user moved, so the content slides in from the right place. */
  dir: StepDir
  title: string
  hint: string
  children: ReactNode
  footer: ReactNode
}

/** The card on the right: a heading, the step's controls, and a footer with Back / Next. */
export function StepPanel({ dir, title, hint, children, footer }: Props) {
  return (
    <section aria-labelledby="step-title" className="rounded-2xl border border-stone-200 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]">
      <div className={`grid gap-5 p-5 ${dir === 'fwd' ? 'step-in-fwd' : dir === 'back' ? 'step-in-back' : ''}`}>
        <header>
          <h2 id="step-title" tabIndex={-1} className="font-display text-lg font-semibold tracking-tight outline-none">{title}</h2>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-white/50">{hint}</p>
        </header>
        {children}
      </div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-stone-200 p-4 max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:bg-stone-100/95 max-lg:px-4 max-lg:pt-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-lg:backdrop-blur dark:border-white/10 dark:max-lg:bg-neutral-950/95">{footer}</footer>
    </section>
  )
}
