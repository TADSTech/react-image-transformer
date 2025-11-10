import { useLocation } from 'react-router-dom'
import { AppWindow, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

interface TopBarProps {
  fileName?: string
  onFileNameChange?: (newName: string) => void
}

export default function TopBar({ fileName: propFileName, onFileNameChange }: TopBarProps) {
  const { state } = useLocation() as unknown as { state?: { previewUrl?: string; fileName?: string } }
  const currentFileName = propFileName || state?.fileName
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(currentFileName || '')

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== currentFileName) {
      onFileNameChange?.(editedName.trim())
    }
    setIsEditing(false)
    setEditedName(currentFileName || '')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName(currentFileName || '')
  }

  return (
    <header className="flex items-center justify-between py-4 px-6 bg-(--color-bg) border-b border-(--color-border) shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-(--color-text)">RI Transform</h1>
        {currentFileName && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-sm bg-(--color-bg-secondary) text-(--color-text) border border-(--color-primary) rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 hover:bg-(--color-bg-secondary) rounded transition-colors text-(--color-primary)"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-(--color-bg-secondary) rounded transition-colors text-(--color-text-secondary)"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-(--color-text-secondary)">
                  Editing: <span className="text-(--color-text) font-medium">{currentFileName}</span>
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-(--color-bg-secondary) rounded transition-colors text-(--color-text-secondary) hover:text-(--color-primary)"
                  title="Edit filename"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <AppWindow
          className="hidden lg:inline-flex lg:w-5 lg:h-5 lg:text-(--color-text) lg:cursor-pointer"
          onClick={async () => {
        try {
          const doc: any = document
          const isFullscreen =
        !!(document.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement)

          if (isFullscreen) {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen()
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen()
        else if (doc.msExitFullscreen) await doc.msExitMsFullscreen()
          } else {
        const el: any = document.documentElement
        if (el.requestFullscreen) await el.requestFullscreen()
        else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
        else if (el.msRequestFullscreen) await el.msRequestFullscreen()
          }
        } catch (err) {
          console.error('Failed to toggle fullscreen', err)
        }
          }}
        />
      </div>
    </header>
  )
}