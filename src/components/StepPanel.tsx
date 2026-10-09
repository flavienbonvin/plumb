import type { ReactNode } from 'react'

interface Props {
  title: string
  hint: string
  children: ReactNode
  footer: ReactNode
}

/** The card on the right: a heading, the step's controls, and a footer with Back / Next. */
export function StepPanel({ title, hint, children, footer }: Props) {
  return (
    <section aria-labelledby="step-title" className="rounded-2xl border border-stone-200 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div className="grid gap-5 p-5">
        <header>
          <h2 id="step-title" tabIndex={-1} className="font-display text-lg font-semibold tracking-tight outline-none">{title}</h2>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-white/50">{hint}</p>
        </header>
        {children}
      </div>
      <footer className="flex items-center gap-2 border-t border-stone-200 p-4 dark:border-white/10">{footer}</footer>
    </section>
  )
}
