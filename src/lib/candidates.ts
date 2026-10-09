// TEMPORARY: painting candidates for the sample photos. Shown on the start screen so they can be
// checked and chosen, then this file and its list on the home page get removed.
// w/h are the largest public-domain file found on Wikimedia Commons. `iphone` and `mac` are the
// app's clock check on the default crop (iPhone 18 Pro, MacBook Air 15″).

export interface Candidate {
  title: string
  artist: string
  year: string
  w: number
  h: number
  iphone: 'good' | 'fair' | 'poor'
  mac: 'good' | 'fair' | 'poor'
  note?: string
}

export const PORTRAIT: Candidate[] = [
  { title: 'Wanderer above the Sea of Fog', artist: 'Caspar David Friedrich', year: '1818', w: 5256, h: 6742, iphone: 'fair', mac: 'poor', note: 'Pale fog behind the clock. A shade will help.' },
  { title: 'The Swing', artist: 'Jean-Honoré Fragonard', year: 'c. 1767', w: 4280, h: 5373, iphone: 'good', mac: 'good', note: 'Dark foliage at the top suits the clock.' },
  { title: 'Bridge over a Pond of Water Lilies', artist: 'Claude Monet', year: '1899', w: 2966, h: 3722, iphone: 'good', mac: 'good', note: 'The Met copy, CC0. A little small for a 16″ Mac.' },
  { title: 'Woman with a Parasol', artist: 'Claude Monet', year: '1875', w: 6001, h: 7455, iphone: 'good', mac: 'fair' },
  { title: 'Café Terrace at Night', artist: 'Vincent van Gogh', year: '1888', w: 6415, h: 8000, iphone: 'good', mac: 'good', note: 'Dark sky above, warm light below.' },
  { title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: 'c. 1665', w: 12285, h: 14550, iphone: 'good', mac: 'good', note: 'Dark background, ideal behind a clock.' },
  { title: 'Lady with an Ermine', artist: 'Leonardo da Vinci', year: 'c. 1490', w: 30894, h: 41545, iphone: 'good', mac: 'good', note: 'Dark background, ideal behind a clock.' },
  { title: 'Napoleon Crossing the Alps', artist: 'Jacques-Louis David', year: '1801', w: 4897, h: 5850, iphone: 'good', mac: 'good' },
  { title: 'Chalk Cliffs on Rügen', artist: 'Caspar David Friedrich', year: 'c. 1818', w: 4237, h: 5465, iphone: 'good', mac: 'fair' },
  { title: 'The Kiss', artist: 'Gustav Klimt', year: '1907–1908', w: 7376, h: 7401, iphone: 'good', mac: 'fair', note: 'Almost square, so it crops on both devices.' },
]

export const LANDSCAPE: Candidate[] = [
  { title: 'The School of Athens', artist: 'Raphael', year: '1509–1511', w: 3196, h: 2277, iphone: 'good', mac: 'good', note: 'Only a 3196 px public-domain scan. Larger files are CC BY photos of the fresco, which need credit.' },
  { title: 'The Sea of Ice', artist: 'Caspar David Friedrich', year: '1823–1824', w: 5209, h: 3473, iphone: 'fair', mac: 'fair' },
  { title: 'Impression, Sunrise', artist: 'Claude Monet', year: '1872', w: 5773, h: 4478, iphone: 'good', mac: 'good' },
  { title: 'The Birth of Venus', artist: 'Sandro Botticelli', year: 'c. 1485', w: 9360, h: 5581, iphone: 'poor', mac: 'poor', note: 'Bright sky behind the clock. A shade will help.' },
  { title: 'The Hay Wain', artist: 'John Constable', year: '1821', w: 6128, h: 4226, iphone: 'good', mac: 'good' },
  { title: 'The Fighting Temeraire', artist: 'J. M. W. Turner', year: '1839', w: 5684, h: 4226, iphone: 'good', mac: 'good' },
  { title: 'The Ninth Wave', artist: 'Ivan Aivazovsky', year: '1850', w: 5815, h: 3840, iphone: 'good', mac: 'good' },
  { title: 'Among the Sierra Nevada, California', artist: 'Albert Bierstadt', year: '1868', w: 10500, h: 6298, iphone: 'good', mac: 'fair' },
  { title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889', w: 44567, h: 35291, iphone: 'good', mac: 'good', note: 'Dark sky at the top, ideal behind a clock.' },
  { title: 'Hunters in the Snow', artist: 'Pieter Bruegel the Elder', year: '1565', w: 6819, h: 4853, iphone: 'good', mac: 'good' },
  { title: 'Rain, Steam and Speed', artist: 'J. M. W. Turner', year: '1844', w: 14429, h: 10833, iphone: 'fair', mac: 'fair' },
  { title: 'Ophelia', artist: 'John Everett Millais', year: '1851–1852', w: 7087, h: 4820, iphone: 'good', mac: 'good' },
]

export const searchUrl = (c: Candidate) => `https://www.google.com/search?q=${encodeURIComponent(`${c.title} ${c.artist} painting`)}`
