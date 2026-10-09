import type { KeyboardEvent } from 'react'

/** Arrow-key navigation for a role="radiogroup": moves focus to the neighbour and selects it. */
export function radioKeys(e: KeyboardEvent<HTMLElement>) {
  const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown'
  const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
  if (!forward && !back) return
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'))
  const i = radios.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  e.preventDefault()
  const next = radios[(i + (forward ? 1 : radios.length - 1)) % radios.length]
  next.focus()
  next.click()
}
