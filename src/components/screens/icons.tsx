
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const Wifi = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 20 15" className={className} fill="currentColor" aria-hidden>
    <path d="M10 12.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" transform="translate(0 -1.4)" />
    <path d="M5.6 8.6a6.2 6.2 0 0 1 8.8 0l-1.3 1.4a4.3 4.3 0 0 0-6.2 0z" />
    <path d="M2.4 5.2a10.7 10.7 0 0 1 15.2 0l-1.3 1.4a8.8 8.8 0 0 0-12.6 0z" />
  </svg>
)

export const Signal = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 18 12" className={className} fill="currentColor" aria-hidden>
    <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" />
    <rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" />
  </svg>
)

export const Battery = ({ className = '', level = 0.8 }: { className?: string; level?: number }) => (
  <svg viewBox="0 0 27 13" className={className} aria-hidden>
    <rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" />
    <rect x="2" y="2" width={20 * level} height="9" rx="2.6" fill="currentColor" />
    <rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" />
  </svg>
)

export const Padlock = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M7 10V8a5 5 0 0 1 10 0v2h.5A2.5 2.5 0 0 1 20 12.5v6a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-6A2.5 2.5 0 0 1 6.5 10zm2 0h6V8a3 3 0 0 0-6 0z" />
  </svg>
)

export const Search = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
)

export const Controls = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
    <rect x="3" y="4" width="18" height="7" rx="3.5" /><circle cx="7" cy="7.5" r="1.4" fill="currentColor" />
    <rect x="3" y="13" width="18" height="7" rx="3.5" /><circle cx="17" cy="16.5" r="1.4" fill="currentColor" />
  </svg>
)

export const Fingerprint = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
    <path d="M12 4a8 8 0 0 0-8 8M12 4a8 8 0 0 1 8 8M8 12a4 4 0 0 1 8 0c0 3 .5 5-1 7M12 12c0 3 0 5-1.5 7.5M5.5 17c.8-1.6 1-3 1-5" />
  </svg>
)

// ---- placeholder app icons ----
// Plain frosted tiles: no glyphs, so nobody mistakes them for real apps and the wallpaper stays visible.
// A few tint levels keep a page of them from looking like a flat grid.
const TINTS = ['from-white/38 to-white/16', 'from-white/30 to-white/10', 'from-white/44 to-white/22', 'from-white/34 to-white/13']

/** `n` only picks a tint; any number works. */
export function AppIcon({ n = 0, className = '' }: { n?: number; className?: string }) {
  return (
    <span
      className={`block aspect-square rounded-[22.5%] bg-gradient-to-b ${TINTS[n % TINTS.length]} shadow-[0_0.3cqw_1cqw_rgba(0,0,0,.16),inset_0_0.1cqw_0_rgba(255,255,255,.45),inset_0_0_0_0.1cqw_rgba(255,255,255,.22)] backdrop-blur-xl ${className}`}
      aria-hidden
    />
  )
}
