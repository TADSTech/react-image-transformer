import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Crop, Lock, Unlock } from 'lucide-react'

interface CropModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (x: number, y: number, w: number, h: number) => void
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null

export function CropModal({ isOpen, onClose, onApply, canvasRef }: CropModalProps) {
  const previewRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cropBoxRef = useRef<HTMLDivElement>(null)
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<DragHandle>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (isOpen && canvasRef.current && previewRef.current) {
      const ctx = previewRef.current.getContext('2d')!
      previewRef.current.width = canvasRef.current.width
      previewRef.current.height = canvasRef.current.height
      ctx.drawImage(canvasRef.current, 0, 0)

      const w = Math.min(300, canvasRef.current.width * 0.7)
      const h = Math.min(300, canvasRef.current.height * 0.7)
      const crop = {
        x: (canvasRef.current.width - w) / 2,
        y: (canvasRef.current.height - h) / 2,
        w,
        h,
      }
      setCropBox(crop)
      setAspectRatio(w / h)
    }
  }, [isOpen, canvasRef])

  // Add touch event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault()
        const touch = e.touches[0]
        handleDrag(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setDragHandle(null)
    }

    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragStart, initialCrop, aspectRatioLocked, aspectRatio, dragHandle])

  // Add touch start listeners to crop box and handles
  useEffect(() => {
    const cropBoxElement = cropBoxRef.current
    if (!cropBoxElement || !isOpen) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 0) return
      const touch = e.touches[0]
      const target = e.target as HTMLElement
      const handle = target.dataset.handle as DragHandle || 'move'
      startDrag(touch.clientX, touch.clientY, handle)
    }

    cropBoxElement.addEventListener('touchstart', handleTouchStart, { passive: false })

    return () => {
      cropBoxElement.removeEventListener('touchstart', handleTouchStart)
    }
  }, [isOpen, dragStart, initialCrop])

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!previewRef.current) return null
    const rect = previewRef.current.getBoundingClientRect()
    const scaleX = previewRef.current.width / rect.width
    const scaleY = previewRef.current.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDrag = (clientX: number, clientY: number, handle: DragHandle) => {
    const coords = getCanvasCoordinates(clientX, clientY)
    if (!coords) return

    setIsDragging(true)
    setDragHandle(handle)
    setDragStart(coords)
    setInitialCrop({ ...cropBox })
  }

  const handleDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !previewRef.current || !dragHandle) return

    const coords = getCanvasCoordinates(clientX, clientY)
    if (!coords) return

    const dx = coords.x - dragStart.x
    const dy = coords.y - dragStart.y
    const canvasWidth = previewRef.current.width
    const canvasHeight = previewRef.current.height

    let newCrop = { ...initialCrop }

    if (dragHandle === 'move') {
      newCrop.x = Math.max(0, Math.min(initialCrop.x + dx, canvasWidth - initialCrop.w))
      newCrop.y = Math.max(0, Math.min(initialCrop.y + dy, canvasHeight - initialCrop.h))
    } else {
      // Resize handles
      const minSize = 50

      if (dragHandle.includes('w')) {
        const maxDx = initialCrop.w - minSize
        const clampedDx = Math.max(-initialCrop.x, Math.min(dx, maxDx))
        newCrop.x = initialCrop.x + clampedDx
        newCrop.w = initialCrop.w - clampedDx
      }
      if (dragHandle.includes('e')) {
        newCrop.w = Math.max(minSize, Math.min(initialCrop.w + dx, canvasWidth - initialCrop.x))
      }
      if (dragHandle.includes('n')) {
        const maxDy = initialCrop.h - minSize
        const clampedDy = Math.max(-initialCrop.y, Math.min(dy, maxDy))
        newCrop.y = initialCrop.y + clampedDy
        newCrop.h = initialCrop.h - clampedDy
      }
      if (dragHandle.includes('s')) {
        newCrop.h = Math.max(minSize, Math.min(initialCrop.h + dy, canvasHeight - initialCrop.y))
      }

      if (aspectRatioLocked && dragHandle !== 'n' && dragHandle !== 's') {
        const targetHeight = newCrop.w / aspectRatio
        if (targetHeight <= canvasHeight - newCrop.y) {
          newCrop.h = targetHeight
        } else {
          newCrop.h = canvasHeight - newCrop.y
          newCrop.w = newCrop.h * aspectRatio
        }
      }
    }

    setCropBox(newCrop)
  }

  const handleMouseDown = (e: React.MouseEvent, handle: DragHandle) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY, handle)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDrag(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle(null)
  }

  const setPresetRatio = (ratio: number | null) => {
    if (ratio === null) {
      setAspectRatioLocked(false)
      return
    }
    
    setAspectRatioLocked(true)
    setAspectRatio(ratio)
    
    let newW = cropBox.w
    let newH = cropBox.w / ratio
    
    if (newH > previewRef.current!.height - cropBox.y) {
      newH = previewRef.current!.height - cropBox.y
      newW = newH * ratio
    }
    
    setCropBox({ ...cropBox, w: newW, h: newH })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 pb-24 sm:pb-4 md:mb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-(--color-bg) rounded-lg w-full max-w-6xl h-[calc(100vh-4rem)] flex flex-col shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-(--color-border) shrink-0">
            <div className="flex items-center gap-3">
              <Crop className="w-5 h-5 text-(--color-primary)" />
              <h2 className="text-xl font-semibold text-(--color-text)">Crop Image</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-(--color-bg-secondary) rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-(--color-text)" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-3 border-b border-(--color-border) shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm ${
                  aspectRatioLocked
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                }`}
              >
                {aspectRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Lock</span>
              </button>
              
              <div className="h-4 w-px bg-(--color-border)" />
              
              <button
                onClick={() => setPresetRatio(null)}
                className="px-2.5 py-1.5 text-sm rounded bg-(--color-bg-secondary) hover:bg-(--color-border) transition-colors"
              >
                Free
              </button>
              <button
                onClick={() => setPresetRatio(1)}
                className="px-2.5 py-1.5 text-sm rounded bg-(--color-bg-secondary) hover:bg-(--color-border) transition-colors"
              >
                1:1
              </button>
              <button
                onClick={() => setPresetRatio(16 / 9)}
                className="px-2.5 py-1.5 text-sm rounded bg-(--color-bg-secondary) hover:bg-(--color-border) transition-colors"
              >
                16:9
              </button>
              <button
                onClick={() => setPresetRatio(4 / 3)}
                className="px-2.5 py-1.5 text-sm rounded bg-(--color-bg-secondary) hover:bg-(--color-border) transition-colors"
              >
                4:3
              </button>
              <button
                onClick={() => setPresetRatio(3 / 2)}
                className="px-2.5 py-1.5 text-sm rounded bg-(--color-bg-secondary) hover:bg-(--color-border) transition-colors"
              >
                3:2
              </button>

              <div className="h-4 w-px bg-(--color-border) ml-auto" />
              
              <span className="text-xs text-(--color-text-secondary)">
                {Math.round(cropBox.w)} × {Math.round(cropBox.h)}px
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto p-4 bg-(--color-bg-secondary) flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="relative inline-block">
              <canvas
                ref={previewRef}
                className="max-w-full max-h-[60vh] block border border-(--color-border) rounded"
              />
              
              {/* Overlay dimmed areas */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <rect
                        x={`${(cropBox.x / (previewRef.current?.width || 1)) * 100}%`}
                        y={`${(cropBox.y / (previewRef.current?.height || 1)) * 100}%`}
                        width={`${(cropBox.w / (previewRef.current?.width || 1)) * 100}%`}
                        height={`${(cropBox.h / (previewRef.current?.height || 1)) * 100}%`}
                        fill="black"
                      />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
                </svg>
              </div>

              {/* Crop box */}
              <div
                ref={cropBoxRef}
                className="absolute border-2 border-(--color-primary) pointer-events-auto cursor-move touch-none"
                style={{
                  left: `${(cropBox.x / (previewRef.current?.width || 1)) * 100}%`,
                  top: `${(cropBox.y / (previewRef.current?.height || 1)) * 100}%`,
                  width: `${(cropBox.w / (previewRef.current?.width || 1)) * 100}%`,
                  height: `${(cropBox.h / (previewRef.current?.height || 1)) * 100}%`,
                }}
                data-handle="move"
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>

                {/* Corner handles */}
                <div
                  className="absolute -top-1 -left-1 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-nw-resize"
                  data-handle="nw"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'nw') }}
                />
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-ne-resize"
                  data-handle="ne"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'ne') }}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-sw-resize"
                  data-handle="sw"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'sw') }}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-se-resize"
                  data-handle="se"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'se') }}
                />

                {/* Edge handles */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-n-resize"
                  data-handle="n"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'n') }}
                />
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-s-resize"
                  data-handle="s"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 's') }}
                />
                <div
                  className="absolute top-1/2 -left-1 -translate-y-1/2 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-w-resize"
                  data-handle="w"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'w') }}
                />
                <div
                  className="absolute top-1/2 -right-1 -translate-y-1/2 w-4 h-4 bg-(--color-primary) border-2 border-white rounded-full cursor-e-resize"
                  data-handle="e"
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'e') }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-(--color-border) shrink-0">
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-accent"
                onClick={() => {
                  onApply(Math.round(cropBox.x), Math.round(cropBox.y), Math.round(cropBox.w), Math.round(cropBox.h))
                  onClose()
                }}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
