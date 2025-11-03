// Settings and preferences management with localStorage persistence

export interface AppPreferences {
  undoLimit: number
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp'
  quality: number
}

const STORAGE_KEYS = {
  PREFERENCES: 'ri-transformer-preferences',
  EXPORT: 'ri-transformer-export',
}

// Default values
const DEFAULT_PREFERENCES: AppPreferences = {
  undoLimit: 10,
  theme: 'dark',
  fontSize: 'medium',
}

const DEFAULT_EXPORT: ExportSettings = {
  format: 'png',
  quality: 0.92,
}

// Load preferences from localStorage
export function loadPreferences(): AppPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e)
  }
  return DEFAULT_PREFERENCES
}

// Save preferences to localStorage
export function savePreferences(prefs: AppPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs))
  } catch (e) {
    console.error('Failed to save preferences:', e)
  }
}

// Load export settings from localStorage
export function loadExportSettings(): ExportSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPORT)
    if (stored) {
      return { ...DEFAULT_EXPORT, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.warn('Failed to load export settings:', e)
  }
  return DEFAULT_EXPORT
}

// Save export settings to localStorage
export function saveExportSettings(settings: ExportSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPORT, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save export settings:', e)
  }
}

// Apply theme to document
export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('light', !prefersDark)
  } else {
    root.classList.toggle('light', theme === 'light')
  }
}

// Apply font size to document
export function applyFontSize(size: 'small' | 'medium' | 'large'): void {
  const root = document.documentElement
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }
  root.style.fontSize = sizes[size]
}
