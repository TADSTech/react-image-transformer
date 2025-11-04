import { useState } from 'react'
import { motion } from 'motion/react'

interface CompressModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (quality: number) => void
}

export function CompressModal({ isOpen, onClose, onApply }: CompressModalProps) {
  const [quality, setQuality] = useState(0.8)

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
        <h2 className="text-xl font-semibold text-(--color-text) mb-4">Compress Image</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-3">
              Quality: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-(--color-text-secondary) mt-2">
              <span>Low (smaller file)</span>
              <span>High (better quality)</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-(--color-text-secondary) mb-6 p-3 bg-(--color-bg-secondary) rounded">
          <p>
            Note: Compression uses JPEG format. Higher quality means larger file sizes, lower quality means smaller
            files with some visual loss.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-accent"
            onClick={() => {
              onApply(quality)
              onClose()
            }}
          >
            Apply Compression
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
