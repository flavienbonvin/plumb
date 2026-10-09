// Sample paintings for first-time visitors. All are in the public domain, scanned and shared on Wikimedia Commons.
// Files live in /public/samples and are only downloaded when someone picks one. They are WebP, sized for the
// largest screen of their device (iPhone: 2700 px tall, Mac: up to 3456 px wide). Rename a file when you change it,
// because /samples is cached for a year.

import type { DeviceKind } from './devices'

export interface Sample {
  id: string
  /** The device it is cropped for. Portrait paintings for iPhone, landscape for Mac. */
  kind: DeviceKind
  /** Short name for the tile. */
  label: string
  title: string
  artist: string
  year: string
  source: string
}

export const SAMPLES: Sample[] = [
  { id: 'wanderer', kind: 'iphone', label: 'Wanderer', title: 'Wanderer above the Sea of Fog', artist: 'Caspar David Friedrich', year: '1818', source: 'https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpeg' },
  { id: 'chalk', kind: 'iphone', label: 'Chalk Cliffs', title: 'Chalk Cliffs on Rügen', artist: 'Caspar David Friedrich', year: 'c. 1818', source: 'https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Kreidefelsen_auf_R%C3%BCgen_(1818).jpg' },
  { id: 'cafe', kind: 'iphone', label: 'Café Terrace', title: 'Café Terrace at Night', artist: 'Vincent van Gogh', year: '1888', source: 'https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Terrace_of_a_Caf%C3%A9_at_Night_(Place_du_Forum)_1888.jpg' },
  { id: 'ninth', kind: 'mac', label: 'The Ninth Wave', title: 'The Ninth Wave', artist: 'Ivan Aivazovsky', year: '1850', source: 'https://commons.wikimedia.org/wiki/File:Aivazovsky,_Ivan_-_The_Ninth_Wave.jpg' },
  { id: 'haywain', kind: 'mac', label: 'The Hay Wain', title: 'The Hay Wain', artist: 'John Constable', year: '1821', source: 'https://commons.wikimedia.org/wiki/File:John_Constable_-_The_Hay_Wain_(1821).jpg' },
  { id: 'sunrise', kind: 'mac', label: 'Impression, Sunrise', title: 'Impression, Sunrise', artist: 'Claude Monet', year: '1872', source: 'https://commons.wikimedia.org/wiki/File:Monet_-_Impression,_Sunrise.jpg' },
  { id: 'ophelia', kind: 'mac', label: 'Ophelia', title: 'Ophelia', artist: 'John Everett Millais', year: '1851–1852', source: 'https://commons.wikimedia.org/wiki/File:John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg' },
  { id: 'athens', kind: 'mac', label: 'School of Athens', title: 'The School of Athens', artist: 'Raphael', year: '1509–1511', source: 'https://commons.wikimedia.org/wiki/File:La_scuola_di_Atene.jpg' },
]

export const samplesFor = (kind: DeviceKind) => SAMPLES.filter((s) => s.kind === kind)
export const sampleThumb = (s: Sample) => `/samples/${s.id}-thumb.webp`
export const sampleCredit = (s: Sample) => `${s.title}, ${s.artist}, ${s.year}`

export async function sampleFile(s: Sample): Promise<File> {
  const res = await fetch(`/samples/${s.id}.webp`)
  if (!res.ok) throw new Error('Couldn’t load the painting. Check your connection and try again.')
  return new File([await res.blob()], `${s.id}.webp`, { type: 'image/webp' })
}
