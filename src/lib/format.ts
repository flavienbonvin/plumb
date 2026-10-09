// Clock text the way the system shows it (locale order and 12/24 h), without AM/PM on lock screens.
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(undefined, o).formatToParts(d)

export function lockTime(d: Date) {
  return fmt(d, { hour: 'numeric', minute: '2-digit' })
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim()
}

export function lockDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(d)
}

/** "Fri Oct 9 4:45 PM", as the Mac menu bar writes it. */
export function menuDate(d: Date) {
  return fmt(d, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    .map((p) => (p.type === 'literal' ? p.value.replace(/,/g, '') : p.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}
