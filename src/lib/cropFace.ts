/**
 * Client-side face detection and head cropping for player photo uploads.
 *
 * Uses the browser FaceDetector API (Chrome/Edge) when available.
 * Falls back to a top-center crop (assumes the head is in the upper-center
 * portion of a typical portrait photo).
 *
 * Returns a square JPEG Blob cropped around the detected (or estimated) face.
 */

const OUTPUT_SIZE = 400 // px — final square image dimension
const FACE_PADDING = 1.8 // multiplier around detected face bounding box

/** Load an image file into an HTMLImageElement */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/** Attempt browser-native face detection (Chrome 70+, Edge) */
async function detectFace(
  img: HTMLImageElement,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  // FaceDetector is not in the TS lib types but exists in Chromium browsers
  const FD = (globalThis as unknown as Record<string, unknown>).FaceDetector as
    | (new () => { detect(source: ImageBitmapSource): Promise<Array<{ boundingBox: DOMRectReadOnly }>> })
    | undefined

  if (!FD) return null

  try {
    const detector = new FD()
    const faces = await detector.detect(img)
    if (faces.length === 0) return null

    // Use the largest detected face
    const biggest = faces.reduce((a, b) =>
      b.boundingBox.width * b.boundingBox.height > a.boundingBox.width * a.boundingBox.height ? b : a,
    )
    const bb = biggest.boundingBox
    return { x: bb.x, y: bb.y, width: bb.width, height: bb.height }
  } catch {
    return null
  }
}

/** Crop and resize an image around a center point, returning a square JPEG blob */
function cropToSquare(
  img: HTMLImageElement,
  cx: number,
  cy: number,
  cropSize: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas not supported'))

    // Clamp crop region to image bounds
    let sx = cx - cropSize / 2
    let sy = cy - cropSize / 2
    sx = Math.max(0, Math.min(sx, img.naturalWidth - cropSize))
    sy = Math.max(0, Math.min(sy, img.naturalHeight - cropSize))

    ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/jpeg',
      0.9,
    )
  })
}

/**
 * Crop a player photo to a square headshot.
 * Returns a new File with the cropped image, or the original file if cropping
 * isn't possible (e.g. image is already small enough or canvas fails).
 */
export async function cropFaceFromImage(file: File): Promise<File> {
  const img = await loadImage(file)
  const { naturalWidth: w, naturalHeight: h } = img

  // If the image is already roughly square and small, skip cropping
  const ratio = Math.max(w, h) / Math.min(w, h)
  if (ratio < 1.15 && w <= OUTPUT_SIZE * 1.5) {
    URL.revokeObjectURL(img.src)
    return file
  }

  // Try face detection
  const face = await detectFace(img)

  let cx: number
  let cy: number
  let cropSize: number

  if (face) {
    // Center on detected face with padding
    cx = face.x + face.width / 2
    cy = face.y + face.height / 2
    cropSize = Math.max(face.width, face.height) * FACE_PADDING
    // Ensure crop is square and fits within image
    cropSize = Math.min(cropSize, w, h)
  } else {
    // Fallback: assume head is in the top-center third of the image
    cx = w / 2
    cy = h * 0.3 // head is typically in upper 30% of a portrait
    cropSize = Math.min(w, h * 0.65) // crop a generous upper portion
    cropSize = Math.min(cropSize, w, h)
  }

  try {
    const blob = await cropToSquare(img, cx, cy, cropSize)
    URL.revokeObjectURL(img.src)
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  } catch {
    URL.revokeObjectURL(img.src)
    return file // fallback: return original
  }
}
