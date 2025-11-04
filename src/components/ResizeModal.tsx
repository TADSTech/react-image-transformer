import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface ResizeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (width: number, height: number) => void
  currentWidth: number
  currentHeight: number
}

export function ResizeModal({ isOpen, onClose, onApply, currentWidth, currentHeight }: ResizeModalProps) {
  const [width, setWidth] = useState(currentWidth)
  const [height, setHeight] = useState(currentHeight)
  const [lockAspect, setLockAspect] = useState(true)
  const aspectRatio = currentWidth / currentHeight

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (lockAspect) {
      setHeight(Math.round(newWidth / aspectRatio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (lockAspect) {
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  useEffect(() => {
    setWidth(currentWidth)
    setHeight(currentHeight)
  }, [currentWidth, currentHeight, isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pb-20 sm:pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-(--color-bg) rounded-lg p-6 max-w-md w-full shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-semibold text-(--color-text) mb-4">Resize Canvas</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              min="1"
              max="4000"
              className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded text-(--color-text)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              min="1"
              max="4000"
              className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded text-(--color-text)"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-(--color-text)">Lock aspect ratio</span>
          </label>
        </div>

        <div className="text-xs text-(--color-text-secondary) mb-6">
          Current: {width} × {height} px
        </div>

        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-accent"
            onClick={() => {
              onApply(width, height)
              onClose()
            }}
          >
            Apply Resize
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
