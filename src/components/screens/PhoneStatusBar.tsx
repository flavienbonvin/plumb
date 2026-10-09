import { Battery, Signal, Wifi } from './icons'

const shadow = { textShadow: '0 1px 10px rgba(0,0,0,.22)' }

/** Status bar with Dynamic Island. The lock screen leaves the left side empty; the home screen shows the time. */
interface Props {
  time?: string
  pt?: number
  island?: { w: number; h: number }
  notch?: { w: number; h: number }
}

export function PhoneStatusBar({ time, pt = 393, island = { w: 126, h: 37 }, notch }: Props) {
  const c = (v: number) => `${(v / pt) * 100}cqw` // points → container width units
  return (
    <div className="absolute inset-x-0 top-0 h-[14cqw] text-white" style={shadow}>
      {notch ? (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black" style={{ width: c(notch.w), height: c(notch.h), borderRadius: `0 0 ${c(20)} ${c(20)}` }} />
      ) : (
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black" style={{ top: c(11), width: c(island.w), height: c(island.h) }} />
      )}
      {time && <span className="absolute top-[4.6cqw] left-[9.5cqw] w-[16cqw] text-center text-[4.5cqw] leading-none font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>}
      <span className="absolute top-[5.2cqw] right-[8cqw] flex items-center gap-[1.5cqw]">
        <Signal className="h-[3cqw]" />
        <Wifi className="h-[3.2cqw]" />
        <Battery className="h-[3.2cqw]" level={0.82} />
      </span>
    </div>
  )
}
