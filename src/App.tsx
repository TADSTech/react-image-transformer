import './App.css'
import { useEffect, useState } from 'react'
import { FileUploader } from './components/Dropzone'
import DarkModeToggle from './components/DarkModeToggle'
import { useNavigate } from 'react-router-dom'
import { UnsavedProvider, useUnsaved } from './contexts/UnsavedContext'
import { Dialog } from './components/Dialog'

function InnerApp() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { setDirty, requestNavigation, consumePending } = useUnsaved()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const p = consumePending()
    if (p) {
      setPendingAction(() => p)
      setIsDialogOpen(true)
    }
  }, [consumePending])

  const handleFileUpload = (file: File, _fileType: string, preview?: string) => {
    setFileName(file.name)
    setPreviewUrl(preview || null)
    setDirty(true)
  }

  const confirmLeave = (allow: boolean) => {
    setIsDialogOpen(false)
    if (allow && pendingAction) pendingAction()
    setPendingAction(null)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl">
        <header className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-semibold">React Image Transform</h1>
            <p className="text-sm text-(--color-text-secondary)">Upload an image to preview or prepare it for processing</p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-4">Upload image</h2>
            <p className="text-(--color-text-secondary) mb-6">Drop a single image file or click to select one. Supported formats include PNG, JPG, JPEG, HEIF, WEBP and GIF.</p>
            <FileUploader onFileUpload={handleFileUpload} />
          </div>

          <aside>
            <div className="card p-4">
              <p className="font-medium">Selected file</p>
              <div className="flex gap-3 mt-3">
                <button className="btn-primary" onClick={() => { setFileName(null); setPreviewUrl(null); setDirty(false); }}>
                  Clear Selection
                </button>
                <button
                  className="btn-accent"
                  onClick={() => requestNavigation(() => navigate('/editor', { state: { previewUrl, fileName } }))}
                >
                  Edit Image
                </button>
              </div>
              
              {fileName ? (
                <div className="mt-3">
                  <p className="text-(--color-text-secondary)">{fileName}</p>
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="mt-3 w-full h-auto max-h-80 object-contain rounded" />
                  ) : null}
                </div>
              ) : (
                <p className="text-(--color-text-secondary) mt-3">No file selected</p>
              )}
            </div>
          </aside>
        </section>

        <Dialog isOpen={isDialogOpen} onClose={() => confirmLeave(false)} title="Leave page?">
          <p className="mb-4">You have unsaved changes. If you leave now, changes will be lost.</p>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => confirmLeave(false)}>Cancel</button>
            <button className="btn-accent" onClick={() => confirmLeave(true)}>Leave</button>
          </div>
        </Dialog>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <UnsavedProvider>
      <InnerApp />
    </UnsavedProvider>
  )
}