import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { settingsFeatures } from '../features'

interface ExportQualityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportQualityModal({ isOpen, onClose }: ExportQualityModalProps) {
  const [settings, setSettings] = useState<settingsFeatures.ExportSettings>(settingsFeatures.loadExportSettings())

  useEffect(() => {
    if (isOpen) {
      setSettings(settingsFeatures.loadExportSettings())
    }
  }, [isOpen])

  const handleSave = () => {
    settingsFeatures.saveExportSettings(settings)
    onClose()
  }

  const presets = [
    { label: 'High Quality', quality: 1.0, format: 'png' as const },
    { label: 'Balanced', quality: 0.92, format: 'png' as const },
    { label: 'Web Optimized', quality: 0.85, format: 'jpeg' as const },
    { label: 'Small Size', quality: 0.7, format: 'jpeg' as const },
  ]

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-(--color-bg) rounded-lg p-6 max-w-md w-full shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-semibold text-(--color-text) mb-6">Export Quality Settings</h2>

        <div className="space-y-5 mb-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Default Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((format) => (
                <button
                  key={format}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors uppercase ${
                    settings.format === format
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                  }`}
                  onClick={() => setSettings({ ...settings, format })}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">
              Quality: {Math.round(settings.quality * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={settings.quality}
              onChange={(e) => setSettings({ ...settings, quality: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-(--color-text-secondary) mt-1">
              <span>Smaller</span>
              <span>Better</span>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  className="px-3 py-2 rounded-lg text-xs bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border) transition-colors"
                  onClick={() => setSettings({ format: preset.format, quality: preset.quality })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-(--color-bg-secondary) rounded text-xs text-(--color-text-secondary)">
            <p className="mb-1">
              <strong className="text-(--color-text)">PNG:</strong> Lossless, larger files, best for graphics
            </p>
            <p className="mb-1">
              <strong className="text-(--color-text)">JPEG:</strong> Lossy, smaller files, best for photos
            </p>
            <p>
              <strong className="text-(--color-text)">WebP:</strong> Modern format, good compression
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-accent" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
