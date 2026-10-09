export interface LoadedImage {
  /** Full-resolution image, used for export. */
  bitmap: ImageBitmap
  /** Smaller copy with the same aspect ratio, used for the live preview. */
  preview: ImageBitmap
  name: string
  /** Original file, kept so the session can be restored. */
  file: Blob
}

const PREVIEW_MAX = 3000

export function closeImage(img: LoadedImage | null) {
  if (!img) return
  if (img.preview !== img.bitmap) img.preview.close()
  img.bitmap.close()
}

export async function loadImageFile(file: File): Promise<LoadedImage> {
  const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)
  if (!file.type.startsWith('image/') && !isHeic) throw new Error('That file is not an image.')
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const name = (file.name || 'wallpaper').replace(/\.[^.]+$/, '') || 'wallpaper'
    const long = Math.max(bitmap.width, bitmap.height)
    let preview = bitmap
    if (long > PREVIEW_MAX) {
      const k = PREVIEW_MAX / long
      preview = await createImageBitmap(bitmap, { resizeWidth: Math.round(bitmap.width * k), resizeHeight: Math.round(bitmap.height * k), resizeQuality: 'high' })
    }
    return { bitmap, preview, name, file }
  } catch {
    throw new Error(
      isHeic
        ? 'Your browser can’t read HEIC files. Export it as JPEG or PNG first (or open this page in Safari).'
        : 'Couldn’t decode this image. Try a JPEG, PNG or WebP.',
    )
  }
}

export function imageFromDataTransfer(dt: DataTransfer | null): File | null {
  if (!dt) return null
  for (const f of Array.from(dt.files)) if (f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)) return f
  return null
}
