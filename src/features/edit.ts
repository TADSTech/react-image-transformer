export interface TransformState {
  rotate: number // degrees
  flipH: boolean
  flipV: boolean
}

export interface EditorState {
  transform: TransformState
  timestamp: number
}

// Universal history manager - works with any state
export class HistoryManager<T> {
  private past: T[] = []
  private future: T[] = []
  private maxSize: number

  constructor(initialState: T, maxSize: number = 10) {
    this.maxSize = maxSize
    this.past = [initialState]
  }

  push(state: T) {
    this.past.push(state)
    if (this.past.length > this.maxSize) {
      this.past.shift()
    }
    this.future = [] // Clear future on new action
  }

  undo(): T | null {
    if (this.past.length <= 1) return null
    this.future.push(this.past.pop()!)
    return this.getCurrent()
  }

  redo(): T | null {
    if (this.future.length === 0) return null
    this.past.push(this.future.pop()!)
    return this.getCurrent()
  }

  getCurrent(): T {
    return this.past[this.past.length - 1]
  }

  canUndo(): boolean {
    return this.past.length > 1
  }

  canRedo(): boolean {
    return this.future.length > 0
  }

  reset(initialState: T) {
    this.past = [initialState]
    this.future = []
  }

  getState() {
    return {
      past: this.past,
      future: this.future,
      current: this.getCurrent(),
    }
  }
}

export function rotate(state: TransformState, degrees = 90): TransformState {
  return { ...state, rotate: (state.rotate + degrees) % 360 }
}

export function flipHorizontal(state: TransformState): TransformState {
  return { ...state, flipH: !state.flipH }
}

export function flipVertical(state: TransformState): TransformState {
  return { ...state, flipV: !state.flipV }
}

export function resetTransform(): TransformState {
  return { rotate: 0, flipH: false, flipV: false }
}

// Apply transform to canvas
export function applyTransform(canvas: HTMLCanvasElement, transform: TransformState, originalImage: HTMLImageElement) {
  const ctx = canvas.getContext('2d')!
  
  // Determine final dimensions based on rotation
  const isRotated90or270 = transform.rotate === 90 || transform.rotate === 270
  const width = isRotated90or270 ? originalImage.height : originalImage.width
  const height = isRotated90or270 ? originalImage.width : originalImage.height
  
  canvas.width = width
  canvas.height = height
  
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((transform.rotate * Math.PI) / 180)
  
  if (transform.flipH) ctx.scale(-1, 1)
  if (transform.flipV) ctx.scale(1, -1)
  
  ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2)
  ctx.restore()
}
