import { AppIcon } from './screens/icons'
import { MacMenuBar } from './screens/MacMenuBar'

const DOCK = [0, 1, 2, 3, 4, 5, 6, 7, 2, 5]
const RUNNING = new Set([0, 1])

export function MacDesktopOverlay({ notch, dark }: { notch: boolean; dark: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 text-white" style={{ containerType: 'inline-size' }} aria-hidden>
      <MacMenuBar notch={notch} desktop dark={dark} />
      <div className="absolute bottom-[0.9cqw] left-1/2 flex -translate-x-1/2 items-end gap-[0.65cqw] rounded-[1.7cqw] bg-white/20 px-[0.75cqw] py-[0.65cqw] ring-1 ring-white/30 backdrop-blur-2xl shadow-[0_1cqw_3cqw_rgba(0,0,0,.2)]">
        {DOCK.map((n, i) => (
          <div key={i} className="relative">
            <AppIcon n={n} className="w-[4.3cqw]" />
            {RUNNING.has(i) && <span className="absolute -bottom-[0.55cqw] left-1/2 h-[0.3cqw] w-[0.3cqw] -translate-x-1/2 rounded-full bg-white/90" />}
          </div>
        ))}
        <span className="mx-[0.1cqw] h-[4cqw] w-px self-center bg-white/35" />
        <AppIcon n={2} className="w-[4.3cqw]" />
      </div>
    </div>
  )
}
