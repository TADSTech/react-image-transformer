import { useLocation } from 'react-router-dom'
import { AppWindow } from 'lucide-react';

export default function TopBar() {
  const { state } = useLocation() as unknown as { state?: { previewUrl?: string; fileName?: string } }
  const fileName = state?.fileName

  return (
    <header className="flex items-center justify-between py-4 px-6 bg-(--color-bg) border-b border-(--color-border) shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-(--color-text)">RI-Transformer</h1>
        {fileName && (
          <span className="text-sm text-(--color-text-secondary)">
            Editing: {fileName}
          </span>
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