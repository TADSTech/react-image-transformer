// Small helpers for file/export related operations
export async function saveCanvasAs(canvas: HTMLCanvasElement, fileName = 'image.png') {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to create blob'))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      resolve()
    })
  })
}

export async function exportCanvasAs(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' | 'webp' = 'png', quality = 0.92, fileName?: string) {
  const mime = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp'
  const name = fileName ?? `export.${format}`
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to create export blob'))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      resolve()
    }, mime, quality)
  })
}

export function triggerUpload(callback: (file: File) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const f = input.files?.[0]
    if (f) callback(f)
  }
  input.click()
}
