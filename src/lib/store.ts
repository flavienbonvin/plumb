// Tiny IndexedDB wrapper to remember the last image across reloads.
const DB = 'wallpaper-fitter'
const STORE = 'kv'

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((res, rej) => {
    const r = fn(db.transaction(STORE, mode).objectStore(STORE))
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

export interface SavedImage { blob: Blob; name: string }

export const saveImage = (v: SavedImage) => tx('readwrite', (s) => s.put(v, 'image')).catch(() => {})
export const loadSavedImage = () => tx<SavedImage | undefined>('readonly', (s) => s.get('image')).catch(() => undefined)
export const clearSavedImage = () => tx('readwrite', (s) => s.delete('image')).catch(() => {})
