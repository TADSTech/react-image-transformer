import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { settingsFeatures } from '../features'

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  onPreferencesChange?: (prefs: settingsFeatures.AppPreferences) => void
}

export function PreferencesModal({ isOpen, onClose, onPreferencesChange }: PreferencesModalProps) {
  const [prefs, setPrefs] = useState<settingsFeatures.AppPreferences>(settingsFeatures.loadPreferences())

  useEffect(() => {
    if (isOpen) {
      setPrefs(settingsFeatures.loadPreferences())
    }
  }, [isOpen])

  const handleSave = () => {
    settingsFeatures.savePreferences(prefs)
    settingsFeatures.applyTheme(prefs.theme)
    settingsFeatures.applyFontSize(prefs.fontSize)
    
    if (onPreferencesChange) {
      onPreferencesChange(prefs)
    }
    
    onClose()
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
        className="bg-(--color-bg) rounded-lg p-6 max-w-md w-full shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-xl font-semibold text-(--color-text) mb-6">Preferences</h2>

        <div className="space-y-5 mb-6">
          {/* Undo Limit */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">
              Undo/Redo History Limit
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={prefs.undoLimit}
                onChange={(e) => setPrefs({ ...prefs, undoLimit: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-(--color-text) min-w-12 text-right">{prefs.undoLimit}</span>
            </div>
            <p className="text-xs text-(--color-text-secondary) mt-1">
              Number of actions you can undo/redo
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    prefs.theme === theme
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                  }`}
                  onClick={() => setPrefs({ ...prefs, theme })}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">Font Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    prefs.fontSize === size
                      ? 'bg-(--color-primary) text-white'
                      : 'bg-(--color-bg-secondary) text-(--color-text) hover:bg-(--color-border)'
                  }`}
                  onClick={() => setPrefs({ ...prefs, fontSize: size })}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-accent" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
