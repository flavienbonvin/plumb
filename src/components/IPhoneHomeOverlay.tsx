import { useClock } from '../hooks/useClock'
import { lockTime } from '../lib/format'
import { AppIcon, Search } from './screens/icons'
import { PhoneStatusBar } from './screens/PhoneStatusBar'

export function IPhoneHomeOverlay({ pt, island }: { pt?: number; island?: { w: number; h: number } }) {
  const now = useClock()
  const grid = [0, 1, 2, 3, 4, 5, 6, 7, 2, 5] // 10 tiles: two full rows and a partial one, like a real page
  const dock = [3, 6, 0, 4]
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      <PhoneStatusBar time={lockTime(now)} pt={pt} island={island} />
      <div className="absolute inset-x-0 top-[19cqw] grid grid-cols-4 gap-y-[5.2cqw] px-[7.8cqw]">
        {grid.map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-[1.8cqw]">
            <AppIcon n={n} className="w-[15.3cqw]" />
            <span className="h-[1.3cqw] w-[8cqw] rounded-full bg-white/45" />
          </div>
        ))}
      </div>
      {/* search pill and page dots */}
      <div className="absolute inset-x-0 bottom-[34cqw] flex flex-col items-center gap-[3cqw]">
        <div className="flex items-center gap-[1.4cqw] rounded-full bg-black/25 px-[4cqw] py-[1.6cqw] text-[3.2cqw] backdrop-blur-2xl ring-1 ring-white/15">
          <Search className="h-[3.2cqw]" /> Search
        </div>
        <div className="flex gap-[1.6cqw]">
          {[0, 1, 2].map((i) => <span key={i} className={`h-[1.5cqw] w-[1.5cqw] rounded-full bg-white ${i ? 'opacity-40' : ''}`} />)}
        </div>
      </div>
      <div className="absolute inset-x-[3cqw] bottom-[2.8cqw] flex justify-around rounded-[9cqw] bg-white/20 px-[4cqw] py-[3.6cqw] ring-1 ring-white/20 backdrop-blur-2xl">
        {dock.map((n, i) => <AppIcon key={i} n={n} className="w-[15.3cqw]" />)}
      </div>
    </div>
  )
}
