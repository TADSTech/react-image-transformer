import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, RotateCcw } from 'lucide-react'
import { filterFeatures } from '../features'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: filterFeatures.FilterSettings) => void
  currentFilters: filterFeatures.FilterSettings
}

export function FilterPanel({ isOpen, onClose, onFilterChange, currentFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<filterFeatures.FilterSettings>(currentFilters)

  // Sync with prop changes
  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters])

  // Apply filters instantly as user adjusts sliders
  const handleFilterChange = (key: keyof filterFeatures.FilterSettings, value: number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: filterFeatures.FilterSettings = {
      brightness: 1,
      contrast: 1,
      saturation: 1,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      blur: 0,
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center pb-16 sm:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-(--color-bg) rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl sm:w-full shadow-xl max-h-[calc(100vh-8rem)] flex flex-col"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-(--color-border) shrink-0">
            <h2 className="text-xl font-semibold text-(--color-text)">Filters</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-(--color-bg-secondary) hover:bg-(--color-border) text-(--color-text) rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-(--color-bg-secondary) rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-(--color-text)" />
              </button>
            </div>
          </div>

          {/* Filters Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Brightness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Brightness</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-(--color-text-secondary) mt-1">
                  <span>Dark</span>
                  <span>Normal</span>
                  <span>Bright</span>
                </div>
              </div>

              {/* Contrast */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Contrast</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.contrast * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-(--color-text-secondary) mt-1">
                  <span>Low</span>
                  <span>Normal</span>
                  <span>High</span>
                </div>
              </div>

              {/* Saturation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Saturation</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.saturation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={filters.saturation}
                  onChange={(e) => handleFilterChange('saturation', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-(--color-text-secondary) mt-1">
                  <span>Grayscale</span>
                  <span>Normal</span>
                  <span>Vivid</span>
                </div>
              </div>

              <div className="border-t border-(--color-border) my-4" />

              {/* Grayscale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Grayscale</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.grayscale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={filters.grayscale}
                  onChange={(e) => handleFilterChange('grayscale', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sepia */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Sepia</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.sepia * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={filters.sepia}
                  onChange={(e) => handleFilterChange('sepia', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Invert */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Invert</label>
                  <span className="text-sm text-(--color-text-secondary)">{Math.round(filters.invert * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={filters.invert}
                  onChange={(e) => handleFilterChange('invert', Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-(--color-text)">Blur</label>
                  <span className="text-sm text-(--color-text-secondary)">{filters.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={filters.blur}
                  onChange={(e) => handleFilterChange('blur', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-(--color-border) shrink-0">
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
