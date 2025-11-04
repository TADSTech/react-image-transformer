export interface FilterSettings {
  brightness: number // 0..2 (1 default)
  contrast: number // 0..2 (1 default)
  saturation: number // 0..2 (1 default)
  grayscale: number // 0..1
  sepia: number // 0..1
  invert: number // 0..1
  blur: number // px
} 

export function cssFilterString(settings: Partial<FilterSettings>) {
  const s = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    blur: 0,
    ...settings,
  }
  return `brightness(${s.brightness}) contrast(${s.contrast}) saturate(${s.saturation}) grayscale(${s.grayscale}) sepia(${s.sepia}) invert(${s.invert}) blur(${s.blur}px)`
}

// Advanced canvas-based filters using pixel manipulation
export function applyPixelateEffect(canvas: HTMLCanvasElement, pixelSize: number): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  
  // Create temporary canvas
  const temp = document.createElement('canvas')
  temp.width = width
  temp.height = height
  const tempCtx = temp.getContext('2d')!
  tempCtx.drawImage(canvas, 0, 0)
  
  // Pixelate
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const pixelData = tempCtx.getImageData(x, y, 1, 1).data
      ctx.fillStyle = `rgb(${pixelData[0]},${pixelData[1]},${pixelData[2]})`
      ctx.fillRect(x, y, pixelSize, pixelSize)
    }
  }
  
  return canvas
}

export function applyVintageEffect(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Vintage formula
    data[i] = r * 0.9 + g * 0.5 + b * 0.1
    data[i + 1] = r * 0.3 + g * 0.8 + b * 0.1
    data[i + 2] = r * 0.2 + g * 0.3 + b * 0.5
  }
  
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export function applyEdgeDetection(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  const grayscale = new Uint8ClampedArray(data.length)
  
  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    grayscale[i] = grayscale[i + 1] = grayscale[i + 2] = avg
    grayscale[i + 3] = data[i + 3]
  }
  
  // Sobel edge detection
  const output = new Uint8ClampedArray(data.length)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      const gx = 
        -grayscale[((y - 1) * width + (x - 1)) * 4] +
        grayscale[((y - 1) * width + (x + 1)) * 4] +
        -2 * grayscale[(y * width + (x - 1)) * 4] +
        2 * grayscale[(y * width + (x + 1)) * 4] +
        -grayscale[((y + 1) * width + (x - 1)) * 4] +
        grayscale[((y + 1) * width + (x + 1)) * 4]
      
      const gy =
        -grayscale[((y - 1) * width + (x - 1)) * 4] +
        -2 * grayscale[((y - 1) * width + x) * 4] +
        -grayscale[((y - 1) * width + (x + 1)) * 4] +
        grayscale[((y + 1) * width + (x - 1)) * 4] +
        2 * grayscale[((y + 1) * width + x) * 4] +
        grayscale[((y + 1) * width + (x + 1)) * 4]
      
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const value = magnitude > 128 ? 255 : 0
      
      output[idx] = output[idx + 1] = output[idx + 2] = value
      output[idx + 3] = 255
    }
  }
  
  ctx.putImageData(new ImageData(output, width, height), 0, 0)
  return canvas
}

export function applyEmbossEffect(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const output = new Uint8ClampedArray(data.length)
  
  // Emboss kernel
  const kernel = [
    -2, -1, 0,
    -1,  1, 1,
     0,  1, 2
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const weight = kernel[(ky + 1) * 3 + (kx + 1)]
          
          r += data[idx] * weight
          g += data[idx + 1] * weight
          b += data[idx + 2] * weight
        }
      }
      
      const idx = (y * width + x) * 4
      output[idx] = Math.min(255, Math.max(0, r + 128))
      output[idx + 1] = Math.min(255, Math.max(0, g + 128))
      output[idx + 2] = Math.min(255, Math.max(0, b + 128))
      output[idx + 3] = 255
    }
  }
  
  ctx.putImageData(new ImageData(output, width, height), 0, 0)
  return canvas
}

export function applySharpenEffect(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const output = new Uint8ClampedArray(data.length)
  
  // Sharpen kernel
  const kernel = [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const weight = kernel[(ky + 1) * 3 + (kx + 1)]
          
          r += data[idx] * weight
          g += data[idx + 1] * weight
          b += data[idx + 2] * weight
        }
      }
      
      const idx = (y * width + x) * 4
      output[idx] = Math.min(255, Math.max(0, r))
      output[idx + 1] = Math.min(255, Math.max(0, g))
      output[idx + 2] = Math.min(255, Math.max(0, b))
      output[idx + 3] = data[idx + 3]
    }
  }
  
  ctx.putImageData(new ImageData(output, width, height), 0, 0)
  return canvas
}
