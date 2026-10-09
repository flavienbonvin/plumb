import { useClock } from '../hooks/useClock'

const shadow = { textShadow: '0 1px 14px rgba(0,0,0,.28)' }

export function MacLockOverlay({ notch }: { notch: boolean }) {
  const now = useClock()
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: false }).format(now)
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  const menuTime = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(now)
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      {/* menu bar (lock screen shows only status items) */}
      <div className="absolute inset-x-0 top-0 flex h-[2.3cqw] items-center justify-end gap-[1.2cqw] px-[1.6cqw] text-[1.1cqw] font-medium" style={shadow}>
        <span>{menuTime}</span>
      </div>
      {notch && <div className="absolute top-0 left-1/2 h-[2.3cqw] w-[10.5cqw] -translate-x-1/2 rounded-b-[0.9cqw] bg-black" />}
      <div className="absolute inset-x-0 top-[7cqw] text-center" style={shadow}>
        <div className="text-[1.9cqw] font-medium opacity-90">{date}</div>
        <div className="-mt-[0.4cqw] text-[11cqw] leading-none font-semibold tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</div>
      </div>
      <div className="absolute inset-x-0 bottom-[4.5cqw] flex flex-col items-center gap-[0.9cqw]">
        <div className="grid h-[5.2cqw] w-[5.2cqw] place-items-center rounded-full bg-white/25 backdrop-blur-xl">
          <svg viewBox="0 0 24 24" className="h-[3cqw]" fill="currentColor" opacity=".9"><circle cx="12" cy="8.5" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
        </div>
        <div className="text-[1.3cqw] font-medium" style={shadow}>Your Name</div>
        <div className="rounded-full bg-white/20 px-[1.4cqw] py-[0.5cqw] text-[1cqw] backdrop-blur-xl">Touch ID or Enter Password</div>
      </div>
    </div>
  )
}
