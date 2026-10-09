// Shared class names so buttons look and behave the same everywhere.
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:focus-visible:outline-white'

/** Dark filled button: the one main action on a screen. */
export const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 ${focus}`

/** Outlined button with enough contrast to read as a button. */
export const btnSecondary = `inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:bg-white/[0.07] dark:text-white dark:shadow-none dark:hover:bg-white/15 ${focus}`

export const iconProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
