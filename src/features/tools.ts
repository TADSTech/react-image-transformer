export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const tmp = document.createElement('canvas')
  tmp.width = width
  tmp.height = height
  const ctx = tmp.getContext('2d')!
  ctx.drawImage(canvas, 0, 0, width, height)
  return tmp
}

export function cropCanvas(canvas: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const tmp = document.createElement('canvas')
  tmp.width = w
  tmp.height = h
  const ctx = tmp.getContext('2d')!
  ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h)
  return tmp
}

export async function compressCanvas(canvas: HTMLCanvasElement, quality = 0.8) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', quality))
}

// Store canvas data as a state snapshot for undo/redo
export interface CanvasSnapshot {
  imageData: ImageData
  width: number
  height: number
}

export function createSnapshot(canvas: HTMLCanvasElement): CanvasSnapshot {
  const ctx = canvas.getContext('2d')!
  return {
    imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
    width: canvas.width,
    height: canvas.height,
  }
}

export function restoreSnapshot(canvas: HTMLCanvasElement, snapshot: CanvasSnapshot) {
  canvas.width = snapshot.width
  canvas.height = snapshot.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(snapshot.imageData, 0, 0)
}
