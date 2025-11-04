import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmFilterModalProps {
  isOpen: boolean
  filterName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmFilterModal({ isOpen, filterName, onConfirm, onCancel }: ConfirmFilterModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pb-20 sm:pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="bg-(--color-bg) rounded-lg p-6 max-w-md w-full shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-(--color-text) mb-2">Apply {filterName} Filter?</h2>
              <p className="text-sm text-(--color-text-secondary)">
                This will apply the <strong>{filterName}</strong> effect to your image. This action cannot be undone using the undo button.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-accent" onClick={onConfirm}>
              Apply Filter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
