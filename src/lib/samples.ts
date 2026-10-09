// Sample photos for first-time visitors. All are CC0 (public domain dedication), found on Wikimedia Commons.
// Files live in /public/samples and are only downloaded when someone picks one.

export interface Sample {
  id: string
  label: string
  /** Photographer, shown as a tooltip. */
  credit: string
  source: string
}

export const SAMPLES: Sample[] = [
  { id: 'aurora', label: 'Aurora', credit: 'Johannes Groll followhansi', source: 'https://commons.wikimedia.org/wiki/File:Lofoten,_Norway_(Unsplash).jpg' },
  { id: 'glacier', label: 'Glacier', credit: 'adrian aows', source: 'https://commons.wikimedia.org/wiki/File:Glacier_Sunrise_(Unsplash).jpg' },
  { id: 'dunes', label: 'Dunes', credit: 'Breanna Galley breannagalley', source: 'https://commons.wikimedia.org/wiki/File:Desert_Dunes_in_New_Mexico_(Unsplash).jpg' },
  { id: 'fog', label: 'Fog', credit: 'Mar Mkrtchyan', source: 'https://commons.wikimedia.org/wiki/File:Foggy_forest_hillside.jpg' },
  { id: 'sunset', label: 'Sunset', credit: 'Arnaud Mesureur tbzr', source: 'https://commons.wikimedia.org/wiki/File:Gunnamatta_Sunset_(Unsplash).jpg' },
  { id: 'summit', label: 'Summit', credit: 'Victor Filippov victorf', source: 'https://commons.wikimedia.org/wiki/File:Sea_of_snowy_peaks_(Unsplash).jpg' },
]

export const sampleThumb = (s: Sample) => `/samples/${s.id}-thumb.jpg`

export async function sampleFile(s: Sample): Promise<File> {
  const res = await fetch(`/samples/${s.id}.jpg`)
  if (!res.ok) throw new Error('Couldn’t load the sample photo. Check your connection and try again.')
  return new File([await res.blob()], `${s.id}.jpg`, { type: 'image/jpeg' })
}
