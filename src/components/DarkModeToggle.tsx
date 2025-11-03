import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isLight, setIsLight] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'light'
    } catch (e) {}
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isLight) {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    try {
      localStorage.setItem('theme', isLight ? 'light' : 'dark')
    } catch (e) {}
  }, [isLight])

  return (
    <button
      onClick={() => setIsLight(v => !v)}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {isLight ? 'Light' : 'Dark'}
    </button>
  )
}
