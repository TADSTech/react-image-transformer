import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Pen, Eraser, RotateCcw, Check } from 'lucide-react'

interface DrawingToolProps {
  isOpen: boolean
  onClose: () => void
  onApply: (drawingCanvas: HTMLCanvasElement) => void
  sourceCanvas: HTMLCanvasElement | null
}

export function DrawingTool({ isOpen, onClose, onApply, sourceCanvas }: DrawingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#FF0000')
  const [brushSize, setBrushSize] = useState(5)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

  // Initialize canvas with source image
  useEffect(() => {
    if (isOpen && sourceCanvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!
      canvasRef.current.width = sourceCanvas.width
      canvasRef.current.height = sourceCanvas.height
      ctx.drawImage(sourceCanvas, 0, 0)
    }
  }, [isOpen, sourceCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const syntheticEvent = e as unknown as React.TouchEvent<HTMLCanvasElement>
      startDrawing(syntheticEvent)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const syntheticEvent = e as unknown as React.TouchEvent<HTMLCanvasElement>
      draw(syntheticEvent)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      stopDrawing()
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, isDrawing, lastPos, brushSize, color, tool])

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number, clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('button' in e && e.button !== 0) return // Only handle left mouse button
    const pos = getCanvasCoordinates(e)
    if (!pos) return

    setIsDrawing(true)
    setLastPos(pos)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const pos = getCanvasCoordinates(e)
    if (!pos || !lastPos) return

    const ctx = canvasRef.current.getContext('2d')!
    
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'pen') {
      ctx.strokeStyle = color
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.globalCompositeOperation = 'destination-out'
    }

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setLastPos(pos)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
  }

  const handleClear = () => {
    if (canvasRef.current && sourceCanvas) {
      const ctx = canvasRef.current.getContext('2d')!
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(sourceCanvas, 0, 0)
    }
  }

  const handleApply = () => {
    if (canvasRef.current) {
      onApply(canvasRef.current)
      onClose()
    }
  }

  if (!isOpen) return null

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000']

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 pb-20 sm:pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-(--color-bg) rounded-lg w-full max-w-5xl max-h-[calc(100vh-8rem)] flex flex-col shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-(--color-border) shrink-0">
            <h2 className="text-xl font-semibold text-(--color-text)">Draw on Image</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-(--color-bg-secondary) rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-(--color-text)" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-(--color-border) shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              {/* Tool Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'pen'
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                  }`}
                >
                  <Pen className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'eraser'
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                  }`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              {/* Brush Size */}
              <div className="flex items-center gap-2 flex-1 min-w-40">
                <label className="text-sm text-(--color-text) whitespace-nowrap">Size: {brushSize}px</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1"
                />
              </div>

              {/* Color Palette */}
              {tool === 'pen' && (
                <div className="flex flex-wrap gap-2 max-w-full">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${
                        color === c ? 'border-(--color-primary) scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer shrink-0"
                  />
                </div>
              )}

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-(--color-bg-secondary) hover:bg-(--color-border) text-(--color-text) rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4 bg-(--color-bg-secondary) flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="max-w-full max-h-full border-2 border-(--color-border) rounded cursor-crosshair touch-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-(--color-border) shrink-0">
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-accent flex items-center gap-2" onClick={handleApply}>
                <Check className="w-4 h-4" />
                Apply Drawing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
