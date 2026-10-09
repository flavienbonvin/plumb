import { useEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem('theme') as ThemePref) || 'system')

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', pref === 'dark' || (pref === 'system' && mq.matches))
    apply()
    localStorage.setItem('theme', pref)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [pref])

  return [pref, setPref] as const
}
