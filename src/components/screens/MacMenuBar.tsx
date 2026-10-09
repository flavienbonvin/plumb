import { useClock } from '../../hooks/useClock'
import { menuDate } from '../../lib/format'
import { Battery, Controls, Search, Wifi } from './icons'

interface Props {
  notch: boolean
  /** Lock screen: only status items. Desktop: app menus as well. */
  desktop: boolean
  /** Dark text for bright wallpapers, like macOS picks automatically. */
  dark?: boolean
}

export function MacMenuBar({ notch, desktop, dark = false }: Props) {
  const now = useClock()
  const h = notch ? 2.4 : 1.8
  const tone = dark ? 'text-black/85' : 'text-white'
  const shadow = dark ? undefined : { textShadow: '0 1px 8px rgba(0,0,0,.3)' }
  return (
    <>
      <div className={`absolute inset-x-0 top-0 flex items-center justify-between px-[1.1cqw] ${tone}`} style={{ height: `${h}cqw`, fontSize: '1cqw', ...shadow }}>
        <div className="flex items-center gap-[1.6cqw] font-medium">
          {desktop && (
            <>
              <svg viewBox="0 0 16 16" className="h-[1.15cqw]" fill="currentColor" aria-hidden><path d="M8 1.2 14.8 8 8 14.8 1.2 8z" opacity=".9" /></svg>
              <span className="font-bold">Plumb</span>
              {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((m) => <span key={m}>{m}</span>)}
            </>
          )}
        </div>
        <div className="flex items-center gap-[1.1cqw] font-medium">
          <Battery className="h-[1cqw]" level={0.8} />
          <Wifi className="h-[1cqw]" />
          {desktop && <Search className="h-[1cqw]" />}
          {desktop && <Controls className="h-[1.1cqw]" />}
          {desktop && <span className="ml-[0.2cqw]" style={{ fontVariantNumeric: 'tabular-nums' }}>{menuDate(now)}</span>}
        </div>
      </div>
      {notch && <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[0.9cqw] bg-black" style={{ height: `${h}cqw`, width: '10.4cqw' }} />}
    </>
  )
}
