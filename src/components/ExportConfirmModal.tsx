import { motion, AnimatePresence } from 'motion/react'
import { Download, AlertCircle } from 'lucide-react'

interface ExportConfirmModalProps {
  isOpen: boolean
  format: 'png' | 'jpeg' | 'webp'
  fileName?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ExportConfirmModal({ 
  isOpen, 
  format, 
  fileName,
  onConfirm, 
  onCancel 
}: ExportConfirmModalProps) {
  if (!isOpen) return null

  const formatMap = {
    png: { label: 'PNG', desc: 'Lossless, best for images with transparency' },
    jpeg: { label: 'JPEG', desc: 'Lossy compression, smaller file size' },
    webp: { label: 'WebP', desc: 'Modern format, best compression' }
  }

  const info = formatMap[format]
  const defaultName = fileName ? fileName.replace(/\.[^.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`) : `export.${format === 'jpeg' ? 'jpg' : format}`

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
            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-(--color-text) mb-2">Export as {info.label}?</h2>
              <p className="text-sm text-(--color-text-secondary) mb-3">
                {info.desc}
              </p>
              <div className="flex items-center gap-2 p-3 bg-(--color-bg-secondary) rounded-lg">
                <AlertCircle className="w-4 h-4 text-(--color-text-secondary) shrink-0" />
                <p className="text-xs text-(--color-text-secondary)">
                  File: <span className="font-mono text-blue-500">{defaultName}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-accent" onClick={onConfirm}>
              Export
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
