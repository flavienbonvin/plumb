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
  { id: 'dunes', label: 'Dunes', credit: 'Breanna Galley', source: 'https://commons.wikimedia.org/wiki/File:Desert_Dunes_in_New_Mexico_(Unsplash).jpg' },
  { id: 'fog', label: 'Fog', credit: 'Mar Mkrtchyan', source: 'https://commons.wikimedia.org/wiki/File:Foggy_forest_hillside.jpg' },
  { id: 'ridges', label: 'Ridges', credit: 'simon from Austria', source: 'https://commons.wikimedia.org/wiki/File:Rocky_ride._-_Flickr_-_simon_berger.jpg' },
  { id: 'gold', label: 'Golden hour', credit: 'Johannes Plenio', source: 'https://commons.wikimedia.org/wiki/File:Beautiful_mountain_reflection_(Unsplash).jpg' },
  { id: 'snow', label: 'Snow', credit: 'Bonnie Moreland', source: 'https://commons.wikimedia.org/wiki/File:Winter_snow_Mt_Hood_Oregon_(32345403681).jpg' },
  { id: 'lake', label: 'Lake', credit: 'Ales Krivec', source: 'https://commons.wikimedia.org/wiki/File:Clouds_mirrored_in_a_mountain_lake_(Unsplash).jpg' },
]

export const sampleThumb = (s: Sample) => `/samples/${s.id}-thumb.jpg`

export async function sampleFile(s: Sample): Promise<File> {
  const res = await fetch(`/samples/${s.id}.jpg`)
  if (!res.ok) throw new Error('Couldn’t load the sample photo. Check your connection and try again.')
  return new File([await res.blob()], `${s.id}.jpg`, { type: 'image/jpeg' })
}
