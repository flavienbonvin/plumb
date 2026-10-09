import { useRef, type ReactNode } from 'react'

interface Props {
  show: boolean
  /** Spacing the parent adds between children (its `gap`). Cancelled while hidden so nothing is left behind. */
  gap?: string
  /** Space above, when this sits in a plain block and not a grid. */
  space?: string
  children: ReactNode
}

/**
 * Shows and hides content by growing and shrinking it, instead of popping in and shifting the page.
 * The last content stays in place while it collapses, so text does not vanish mid-animation.
 */
export function Reveal({ show, gap = '0px', space = '0px', children }: Props) {
  const last = useRef(children)
  if (show) last.current = children
  return (
    <div
      aria-hidden={!show}
      className={`grid transition-[grid-template-rows,opacity,margin,visibility] duration-200 ease-out ${show ? 'visible' : 'invisible'}`}
      style={{ gridTemplateRows: show ? '1fr' : '0fr', opacity: show ? 1 : 0, marginTop: show ? space : `calc(${gap} * -1)` }}
    >
      <div className="-m-1 min-h-0 overflow-hidden p-1">{show ? children : last.current}</div>
    </div>
  )
}
