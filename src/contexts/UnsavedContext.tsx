import { createContext, useContext, useState, type ReactNode } from 'react'
import { useEffect } from 'react'

interface UnsavedContextValue {
  isDirty: boolean
  setDirty: (v: boolean) => void
  requestNavigation: (onConfirm: () => void) => void
  consumePending: () => (() => void) | null
}

const UnsavedContext = createContext<UnsavedContextValue | null>(null)

export function UnsavedProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  const [pending, setPending] = useState<(() => void) | null>(null)

  const requestNavigation = (onConfirm: () => void) => {
    if (!isDirty) return onConfirm()
    setPending(() => onConfirm)
  }

  const consumePending = () => {
    const p = pending
    setPending(null)
    return p
  }

  // Centralized native beforeunload registration so every page shares the same behavior
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', onBefore)
    return () => window.removeEventListener('beforeunload', onBefore)
  }, [isDirty])

  return (
    <UnsavedContext.Provider value={{ isDirty, setDirty: setIsDirty, requestNavigation, consumePending }}>
      {children}
    </UnsavedContext.Provider>
  )
}

export function useUnsaved() {
  const ctx = useContext(UnsavedContext)
  if (!ctx) throw new Error('useUnsaved must be used within UnsavedProvider')
  return ctx
}
