import { useClock } from '../hooks/useClock'
import { lockDate, lockTime } from '../lib/format'
import { Padlock } from './screens/icons'
import { PhoneStatusBar } from './screens/PhoneStatusBar'

const glass =
  'grid h-[12.7cqw] w-[12.7cqw] place-items-center rounded-full bg-black/25 text-white ring-1 ring-white/20 backdrop-blur-2xl shadow-[0_1cqw_3cqw_rgba(0,0,0,.18)]'

export function IPhoneLockOverlay({ pt, island }: { pt?: number; island?: { w: number; h: number } }) {
  const now = useClock()
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      <PhoneStatusBar pt={pt} island={island} />
      <Padlock className="absolute top-[15.6cqw] left-1/2 h-[4cqw] -translate-x-1/2 opacity-90 drop-shadow-[0_1px_6px_rgba(0,0,0,.25)]" />
      <div className="absolute inset-x-0 top-[22cqw] text-center drop-shadow-[0_0.4cqw_2cqw_rgba(0,0,0,.2)]">
        <div className="text-[5.5cqw] leading-none font-semibold opacity-90">{lockDate(now)}</div>
        <div
          className="mt-[1.5cqw] text-[27cqw] leading-[0.95] font-semibold tracking-[-0.02em]"
          style={{ fontVariantNumeric: 'tabular-nums', background: 'linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.78))', WebkitBackgroundClip: 'text', color: 'transparent' }}
        >
          {lockTime(now)}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-[11.7cqw] flex justify-between px-[11.7cqw]">
        <div className={glass}>
          <svg viewBox="0 0 24 24" className="h-[6cqw]" fill="currentColor"><path d="M8.5 2.5h7v3.2l-1.1 1.6V20a2 2 0 0 1-2 2h-.8a2 2 0 0 1-2-2V7.3L8.5 5.7z" /><rect x="11" y="9" width="2" height="3.4" rx="1" fill="#2a2a2e" /></svg>
        </div>
        <div className={glass}>
          <svg viewBox="0 0 24 24" className="h-[6.4cqw]" fill="currentColor"><path d="M4 9a3 3 0 0 1 3-3h1.1l1-1.6a1 1 0 0 1 .9-.4h4a1 1 0 0 1 .9.4l1 1.6H17a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /><circle cx="12" cy="12.8" r="3.4" fill="#2a2a2e" /></svg>
        </div>
      </div>
      <div className="absolute bottom-[2cqw] left-1/2 h-[1.3cqw] w-[34cqw] -translate-x-1/2 rounded-full bg-white/90" />
    </div>
  )
}
