import { useClock } from '../hooks/useClock'
import { lockDate, lockTime } from '../lib/format'
import { Fingerprint } from './screens/icons'
import { MacMenuBar } from './screens/MacMenuBar'

const shadow = { textShadow: '0 1px 14px rgba(0,0,0,.28)' }

/** `dark`: dark menu bar text, for a light frame behind it. */
export function MacLockOverlay({ notch, dark = false }: { notch: boolean; dark?: boolean }) {
  const now = useClock()
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      <MacMenuBar notch={notch} desktop={false} dark={dark} />
      <div className="absolute inset-x-0 top-[6.6cqw] text-center" style={shadow}>
        <div className="text-[1.9cqw] leading-none font-semibold opacity-90">{lockDate(now)}</div>
        <div className="mt-[0.5cqw] text-[10.5cqw] leading-none font-semibold tracking-[-0.02em]" style={{ fontVariantNumeric: 'tabular-nums' }}>{lockTime(now)}</div>
      </div>
      <div className="absolute inset-x-0 bottom-[4.2cqw] flex flex-col items-center">
        <div className="grid h-[5.4cqw] w-[5.4cqw] place-items-center rounded-full bg-gradient-to-b from-white/35 to-white/15 ring-1 ring-white/30 backdrop-blur-xl">
          <svg viewBox="0 0 24 24" className="h-[3.4cqw]" fill="currentColor" opacity=".92"><circle cx="12" cy="8.6" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
        </div>
        <div className="mt-[0.9cqw] text-[1.45cqw] leading-none font-semibold" style={shadow}>Your Name</div>
        <div className="mt-[0.9cqw] flex h-[2.5cqw] w-[15.5cqw] items-center justify-between rounded-full bg-white/18 px-[1.1cqw] ring-1 ring-white/25 backdrop-blur-xl">
          <span className="text-[1.1cqw] opacity-85">Enter Password</span>
          <Fingerprint className="h-[1.5cqw] opacity-85" />
        </div>
        <div className="mt-[0.8cqw] text-[0.95cqw] opacity-75" style={shadow}>Touch ID or Enter Password</div>
      </div>
    </div>
  )
}
