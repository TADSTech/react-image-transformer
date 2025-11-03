import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useUnsaved } from '../contexts/UnsavedContext'
import { Dialog } from '../components/Dialog'
import { EditorToolbar } from '../components/EditorToolbar'
import { CropModal } from '../components/CropModal'
import { ResizeModal } from '../components/ResizeModal'
import { CompressModal } from '../components/CompressModal'
import { PreferencesModal } from '../components/PreferencesModal'
import { ExportQualityModal } from '../components/ExportQualityModal'
import TopBar from '../components/TopBar'
import { editFeatures, toolFeatures, settingsFeatures } from '../features'

export default function Editor() {
  const { state } = useLocation() as unknown as { state?: { previewUrl?: string; fileName?: string } }
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)

  // Check for saved editor state from About page navigation
  const savedEditorState = (() => {
    try {
      const saved = sessionStorage.getItem('editorState')
      if (saved) {
        sessionStorage.removeItem('editorState')
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to restore editor state:', e)
    }
    return null
  })()

  const previewUrl = savedEditorState?.canvasDataUrl || state?.previewUrl
  const fileName = savedEditorState?.fileName || state?.fileName

  const { setDirty, consumePending } = useUnsaved()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [transform, setTransform] = useState<editFeatures.TransformState>(editFeatures.resetTransform())
  const [history, setHistory] = useState<editFeatures.HistoryManager<editFeatures.TransformState> | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [resizeModalOpen, setResizeModalOpen] = useState(false)
  const [compressModalOpen, setCompressModalOpen] = useState(false)
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false)
  const [exportQualityModalOpen, setExportQualityModalOpen] = useState(false)
  const [undoLimit, setUndoLimit] = useState(10)

  useEffect(() => {
    if (previewUrl) {
      setDirty(true)
    }
    return () => {
      setDirty(false)
    }
  }, [previewUrl, setDirty])

  // Load preferences on mount
  useEffect(() => {
    const prefs = settingsFeatures.loadPreferences()
    setUndoLimit(prefs.undoLimit)
    settingsFeatures.applyTheme(prefs.theme)
    settingsFeatures.applyFontSize(prefs.fontSize)
  }, [])

  // Initialize image and history on load
  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const img = new Image() 
      img.onload = () => {
        originalImageRef.current = img
        const initialTransform = editFeatures.resetTransform()
        const historyManager = new editFeatures.HistoryManager(initialTransform, undoLimit)
        setHistory(historyManager)
        setTransform(initialTransform)
        setCanUndo(false)
        setCanRedo(false)
        
        // Draw initial image
        editFeatures.applyTransform(canvasRef.current!, initialTransform, img)
      }
      img.src = previewUrl
    }
  }, [previewUrl, undoLimit])

  // Update canvas when transform changes
  useEffect(() => {
    if (originalImageRef.current && canvasRef.current && transform) {
      editFeatures.applyTransform(canvasRef.current, transform, originalImageRef.current)
    }
  }, [transform])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleToolbarAction('undo')
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleToolbarAction('redo')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, transform])

  useEffect(() => {
    const p = consumePending()
    if (p) {
      setPendingAction(() => p)
      setIsDialogOpen(true)
    }
  }, [consumePending])

  const confirmLeave = (allow: boolean) => {
    setIsDialogOpen(false)
    if (allow && pendingAction) pendingAction()
    setPendingAction(null)
  }

  const handleToolbarAction = (actionId: string) => {
    if (!history) return

    switch (actionId) {
      case 'undo':
        if (history.canUndo()) {
          const prev = history.undo()
          if (prev) {
            setTransform(prev)
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        break
      case 'redo':
        if (history.canRedo()) {
          const next = history.redo()
          if (next) {
            setTransform(next)
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        break
      case 'rotate-left':
        {
          const newTransform = editFeatures.rotate(transform, -90)
          setTransform(newTransform)
          history.push(newTransform)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'rotate-right':
        {
          const newTransform = editFeatures.rotate(transform, 90)
          setTransform(newTransform)
          history.push(newTransform)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'flip-h':
        {
          const newTransform = editFeatures.flipHorizontal(transform)
          setTransform(newTransform)
          history.push(newTransform)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'flip-v':
        {
          const newTransform = editFeatures.flipVertical(transform)
          setTransform(newTransform)
          history.push(newTransform)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'reset':
        {
          const newTransform = editFeatures.resetTransform()
          setTransform(newTransform)
          history.push(newTransform)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'crop':
        setCropModalOpen(true)
        break
      case 'resize':
        setResizeModalOpen(true)
        break
      case 'compress':
        setCompressModalOpen(true)
        break
      case 'preferences':
        setPreferencesModalOpen(true)
        break
      case 'quality':
        setExportQualityModalOpen(true)
        break
      case 'about':
        // Save editor state to sessionStorage before navigating
        const canvasDataUrl = canvasRef.current?.toDataURL('image/png') || previewUrl
        sessionStorage.setItem('editorState', JSON.stringify({
          canvasDataUrl: canvasDataUrl || previewUrl,
          fileName: fileName,
          transform: transform
        }))
        navigate('/about')
        break
      default:
        console.log('Toolbar action:', actionId)
    }
  }

  const handlePreferencesChange = (prefs: settingsFeatures.AppPreferences) => {
    setUndoLimit(prefs.undoLimit)
    // Recreate history manager with new limit
    if (history) {
      const newHistory = new editFeatures.HistoryManager(transform, prefs.undoLimit)
      setHistory(newHistory)
      setCanUndo(newHistory.canUndo())
      setCanRedo(newHistory.canRedo())
    }
  }

  const handleCropApply = (x: number, y: number, w: number, h: number) => {
    if (!canvasRef.current) return

    const cropped = toolFeatures.cropCanvas(canvasRef.current, x, y, w, h)

    // Update display
    canvasRef.current.width = cropped.width
    canvasRef.current.height = cropped.height
    const ctx = canvasRef.current.getContext('2d')!
    ctx.drawImage(cropped, 0, 0)

    // Update original image reference to the cropped version
    originalImageRef.current = cropped as any

    // Reset transform and add to history
    const newTransform = editFeatures.resetTransform()
    setTransform(newTransform)
    if (history) {
      history.push(newTransform)
      setCanUndo(history.canUndo())
      setCanRedo(history.canRedo())
    }
  }

  const handleResizeApply = (width: number, height: number) => {
    if (!canvasRef.current) return

    const resized = toolFeatures.resizeCanvas(canvasRef.current, width, height)

    // Update display
    canvasRef.current.width = resized.width
    canvasRef.current.height = resized.height
    const ctx = canvasRef.current.getContext('2d')!
    ctx.drawImage(resized, 0, 0)

    // Update original image reference to the resized version
    originalImageRef.current = resized as any

    // Reset transform and add to history
    const newTransform = editFeatures.resetTransform()
    setTransform(newTransform)
    if (history) {
      history.push(newTransform)
      setCanUndo(history.canUndo())
      setCanRedo(history.canRedo())
    }
  }

  const handleCompressApply = async (quality: number) => {
    if (!canvasRef.current) return

    const blob = await toolFeatures.compressCanvas(canvasRef.current, quality)
    if (blob) {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          const ctx = canvasRef.current.getContext('2d')!
          ctx.drawImage(img, 0, 0)

          // Update original image reference to the compressed version
          originalImageRef.current = img

          // Reset transform and add to history
          const newTransform = editFeatures.resetTransform()
          setTransform(newTransform)
          if (history) {
            history.push(newTransform)
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  return (
    <div className="h-screen flex flex-col bg-(--color-bg)">
      <TopBar />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex items-center justify-center p-4 pb-20 relative">
          {previewUrl ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain block rounded"
            />
          ) : (
            <p className="text-(--color-text-secondary)">No image provided. Return to upload and select an image first.</p>
          )}
        </div>
        
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-(--color-bg-secondary) border-l border-(--color-border) p-4">
            <h2 className="text-lg font-medium text-(--color-text) mb-4">Image Details</h2>
            <p className="text-sm text-(--color-text-secondary) mb-4">
              <strong>File:</strong> {fileName || 'No file selected'}
            </p>
          <div className="flex flex-col gap-3">
            <button className="btn-primary" onClick={() => navigate(-1)}>Back</button>
            <button className="btn-accent" onClick={() => { setDirty(false); navigate('/') }}>Finish</button>
          </div>
        </aside>

        <Dialog isOpen={isDialogOpen} onClose={() => confirmLeave(false)} title="Leave page?">
          <p className="mb-4">You have unsaved changes. If you leave now, changes will be lost.</p>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => confirmLeave(false)}>Cancel</button>
            <button className="btn-accent" onClick={() => confirmLeave(true)}>Leave</button>
          </div>
        </Dialog>

        <CropModal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} onApply={handleCropApply} canvasRef={canvasRef} />
        <ResizeModal isOpen={resizeModalOpen} onClose={() => setResizeModalOpen(false)} onApply={handleResizeApply} currentWidth={canvasRef.current?.width || 0} currentHeight={canvasRef.current?.height || 0} />
        <CompressModal isOpen={compressModalOpen} onClose={() => setCompressModalOpen(false)} onApply={handleCompressApply} />
        <PreferencesModal isOpen={preferencesModalOpen} onClose={() => setPreferencesModalOpen(false)} onPreferencesChange={handlePreferencesChange} />
        <ExportQualityModal isOpen={exportQualityModalOpen} onClose={() => setExportQualityModalOpen(false)} />
        
        <EditorToolbar onMenuAction={handleToolbarAction} canvasRef={canvasRef} fileName={fileName} canUndo={canUndo} canRedo={canRedo} />
      </main>
    </div>
  )
}