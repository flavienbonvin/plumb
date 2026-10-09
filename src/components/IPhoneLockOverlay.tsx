import { useClock } from '../hooks/useClock'

const shadow = { textShadow: '0 1px 12px rgba(0,0,0,.25)' }

export function IPhoneLockOverlay() {
  const now = useClock()
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: false }).format(now)
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      {/* status bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[9cqw] pt-[4.4cqw] text-[4.4cqw] font-semibold" style={shadow}>
        <span className="invisible">0:00</span>
        <div className="absolute left-1/2 top-[3.3cqw] h-[7.2cqw] w-[27cqw] -translate-x-1/2 rounded-full bg-black" />
        <span className="flex items-center gap-[1.4cqw]">
          <svg viewBox="0 0 18 12" className="h-[3.2cqw]" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
          <svg viewBox="0 0 27 13" className="h-[3.4cqw]"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.6" fill="currentColor"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5"/></svg>
        </span>
      </div>
      {/* date + clock */}
      <div className="absolute inset-x-0 top-[21cqw] text-center" style={shadow}>
        <div className="text-[5.4cqw] font-medium opacity-90">{date}</div>
        <div className="-mt-[1cqw] text-[27cqw] leading-none font-semibold tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</div>
      </div>
      {/* bottom controls */}
      <div className="absolute inset-x-0 bottom-[11cqw] flex justify-between px-[11cqw]">
        {[
          <path key="f" d="M9 3h6l-1 6h-4zM10 9v3l-1 2v7h6v-7l-1-2V9" />,
          <g key="c"><rect x="3" y="7" width="18" height="12" rx="3" /><circle cx="12" cy="13" r="3.2" /><path d="M8.5 7l1-2h5l1 2" /></g>,
        ].map((icon, i) => (
          <div key={i} className="grid h-[15cqw] w-[15cqw] place-items-center rounded-full bg-black/30 backdrop-blur-xl">
            <svg viewBox="0 0 24 24" className="h-[6.5cqw]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">{icon}</svg>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[3cqw] left-1/2 h-[1.3cqw] w-[34cqw] -translate-x-1/2 rounded-full bg-white/90" />
    </div>
  )
}
