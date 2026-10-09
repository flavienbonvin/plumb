import { useRef, type ReactNode } from 'react'

interface Props {
  show: boolean
  /** Space above while shown. It collapses to nothing with the content, so hidden rows leave no gap. */
  space?: string
  children: ReactNode
}

/**
 * Shows and hides content by growing and shrinking it, instead of popping in and shifting the page.
 * The last content stays in place while it collapses, so text does not vanish mid-animation.
 * The parent must not use a `gap`: spacing between siblings has to come from margins, like this one.
 */
export function Reveal({ show, space = '0px', children }: Props) {
  const last = useRef(children)
  if (show) last.current = children
  return (
    <div
      aria-hidden={!show}
      className={`grid transition-[grid-template-rows,opacity,margin,visibility] duration-200 ease-out ${show ? 'visible' : 'invisible'}`}
      style={{ gridTemplateRows: show ? '1fr' : '0fr', opacity: show ? 1 : 0, marginTop: show ? space : '0px' }}
    >
      <div className="-m-1 min-h-0 overflow-hidden p-1">{show ? children : last.current}</div>
    </div>
  )
}
