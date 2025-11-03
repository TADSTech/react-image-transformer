import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'

interface CropModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (x: number, y: number, w: number, h: number) => void
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function CropModal({ isOpen, onClose, onApply, canvasRef }: CropModalProps) {
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && canvasRef.current && previewRef.current) {
      // Copy canvas to preview
      const ctx = previewRef.current.getContext('2d')!
      previewRef.current.width = canvasRef.current.width
      previewRef.current.height = canvasRef.current.height
      ctx.drawImage(canvasRef.current, 0, 0)

      // Initialize crop box to center of canvas
      const w = Math.min(200, canvasRef.current.width * 0.8)
      const h = Math.min(200, canvasRef.current.height * 0.8)
      setCropBox({
        x: (canvasRef.current.width - w) / 2,
        y: (canvasRef.current.height - h) / 2,
        w,
        h,
      })
    }
  }, [isOpen, canvasRef])

  const handleMouseDown = (_e: React.MouseEvent, handle?: string) => {
    setIsDragging(true)
    setDragHandle(handle || 'move')
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return

    const rect = previewRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (dragHandle === 'move') {
      const offsetX = x - cropBox.x
      const offsetY = y - cropBox.y
      setCropBox({
        ...cropBox,
        x: Math.max(0, Math.min(offsetX, previewRef.current.width - cropBox.w)),
        y: Math.max(0, Math.min(offsetY, previewRef.current.height - cropBox.h)),
      })
    } else if (dragHandle === 'se') {
      setCropBox({
        ...cropBox,
        w: Math.max(50, Math.min(x - cropBox.x, previewRef.current.width - cropBox.x)),
        h: Math.max(50, Math.min(y - cropBox.y, previewRef.current.height - cropBox.y)),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle(null)
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-(--color-bg) rounded-lg p-6 max-w-2xl w-full shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-semibold text-(--color-text) mb-4">Crop Image</h2>

        <div
          className="relative inline-block mb-4 border border-(--color-border) rounded overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={previewRef}
            className="max-w-full max-h-96 display-block"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
          <div
            className="absolute border-2 border-(--color-primary) bg-transparent cursor-grab"
            style={{
              left: `${cropBox.x}px`,
              top: `${cropBox.y}px`,
              width: `${cropBox.w}px`,
              height: `${cropBox.h}px`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
          >
            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-(--color-primary) cursor-se-resize transform translate-x-1/2 translate-y-1/2"
              onMouseDown={(e) => {
                e.stopPropagation()
                handleMouseDown(e, 'se')
              }}
            />
          </div>
        </div>

        <p className="text-sm text-(--color-text-secondary) mb-4">
          Drag to move, drag bottom-right corner to resize
        </p>

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
      </motion.div>
    </motion.div>
  )
}
