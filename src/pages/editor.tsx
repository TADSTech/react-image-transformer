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
import { FilterPanel } from '../components/FilterPanel'
import { DrawingTool } from '../components/DrawingTool'
import { ConfirmFilterModal } from '../components/ConfirmFilterModal'
import { ExportConfirmModal } from '../components/ExportConfirmModal'
import TopBar from '../components/TopBar'
import { editFeatures, toolFeatures, settingsFeatures, filterFeatures, fileFeatures } from '../features'
import { useScrollbarStyles } from 'stylisticscroll/react';

export default function Editor() {
  const { state } = useLocation() as unknown as { state?: { previewUrl?: string; fileName?: string } }
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)
  useScrollbarStyles({ color: '#6366f1', width: '8px'});

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
  const [fileName, setFileName] = useState(savedEditorState?.fileName || state?.fileName)

  const { setDirty, consumePending } = useUnsaved()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  
  // Combined editor state for undo/redo
  interface EditorState {
    transform: editFeatures.TransformState
    filters: filterFeatures.FilterSettings
    canvasDataUrl?: string // Store canvas state for advanced filters
  }
  
  const defaultFilters: filterFeatures.FilterSettings = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    blur: 0,
  }
  
  const [transform, setTransform] = useState<editFeatures.TransformState>(editFeatures.resetTransform())
  const [filters, setFilters] = useState<filterFeatures.FilterSettings>(defaultFilters)
  const [history, setHistory] = useState<editFeatures.HistoryManager<EditorState> | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [resizeModalOpen, setResizeModalOpen] = useState(false)
  const [compressModalOpen, setCompressModalOpen] = useState(false)
  const [drawingToolOpen, setDrawingToolOpen] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false)
  const [exportQualityModalOpen, setExportQualityModalOpen] = useState(false)
  const [confirmFilterModalOpen, setConfirmFilterModalOpen] = useState(false)
  const [pendingFilterType, setPendingFilterType] = useState<string>('')
  const [pendingFilterName, setPendingFilterName] = useState<string>('')
  const [undoLimit, setUndoLimit] = useState(10)
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false)
  const [pendingExportFormat, setPendingExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png')

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
        const initialState: EditorState = {
          transform: editFeatures.resetTransform(),
          filters: defaultFilters,
        }
        const historyManager = new editFeatures.HistoryManager(initialState, undoLimit)
        setHistory(historyManager)
        setTransform(initialState.transform)
        setFilters(initialState.filters)
        setCanUndo(false)
        setCanRedo(false)
        
        // Draw initial image
        editFeatures.applyTransform(canvasRef.current!, initialState.transform, img)
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

  // Apply CSS filters when filter state changes
  useEffect(() => {
    if (canvasRef.current && filters) {
      const filterString = filterFeatures.cssFilterString(filters)
      canvasRef.current.style.filter = filterString
    }
  }, [filters])

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

  const handleExportRequested = (format: 'png' | 'jpeg' | 'webp') => {
    setPendingExportFormat(format)
    setExportConfirmOpen(true)
  }

  const handleExportConfirm = async () => {
    const canvas = canvasRef?.current
    if (!canvas) return

    try {
      const exportSettings = settingsFeatures.loadExportSettings()
      let finalFileName = fileName || 'export'

      switch (pendingExportFormat) {
        case 'png':
          finalFileName = finalFileName.replace(/\.[^.]+$/, '.png') || 'export.png'
          await fileFeatures.exportCanvasAs(canvas, 'png', exportSettings.quality, finalFileName)
          break
        case 'jpeg':
          finalFileName = finalFileName.replace(/\.[^.]+$/, '.jpg') || 'export.jpg'
          await fileFeatures.exportCanvasAs(canvas, 'jpeg', exportSettings.quality, finalFileName)
          break
        case 'webp':
          finalFileName = finalFileName.replace(/\.[^.]+$/, '.webp') || 'export.webp'
          await fileFeatures.exportCanvasAs(canvas, 'webp', exportSettings.quality, finalFileName)
          break
      }
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExportConfirmOpen(false)
    }
  }

  const handleUploadNew = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result && canvasRef.current) {
        const img = new Image()
        img.onload = () => {
          originalImageRef.current = img
          canvasRef.current!.width = img.width
          canvasRef.current!.height = img.height
          
          const ctx = canvasRef.current!.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          
          // Reset state for new image
          const initialState: EditorState = {
            transform: editFeatures.resetTransform(),
            filters: defaultFilters,
          }
          const historyManager = new editFeatures.HistoryManager(initialState, undoLimit)
          setHistory(historyManager)
          setTransform(initialState.transform)
          setFilters(initialState.filters)
          setCanUndo(false)
          setCanRedo(false)
          setDirty(true)
        }
        img.src = result
      }
    }
    reader.readAsDataURL(file)
  }

  const handleToolbarAction = (actionId: string) => {
    if (!history) return

    switch (actionId) {
      case 'undo':
        if (history.canUndo()) {
          const prev = history.undo()
          if (prev) {
            setTransform(prev.transform)
            setFilters(prev.filters)
            // Restore canvas state if it was saved (for advanced filters)
            if (prev.canvasDataUrl && canvasRef.current) {
              const img = new Image()
              img.onload = () => {
                originalImageRef.current = img
                editFeatures.applyTransform(canvasRef.current!, prev.transform, img)
              }
              img.src = prev.canvasDataUrl
            }
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        break
      case 'redo':
        if (history.canRedo()) {
          const next = history.redo()
          if (next) {
            setTransform(next.transform)
            setFilters(next.filters)
            // Restore canvas state if it was saved (for advanced filters)
            if (next.canvasDataUrl && canvasRef.current) {
              const img = new Image()
              img.onload = () => {
                originalImageRef.current = img
                editFeatures.applyTransform(canvasRef.current!, next.transform, img)
              }
              img.src = next.canvasDataUrl
            }
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        break
      case 'rotate-left':
        {
          const newTransform = editFeatures.rotate(transform, -90)
          const newState: EditorState = { transform: newTransform, filters }
          setTransform(newTransform)
          history.push(newState)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'rotate-right':
        {
          const newTransform = editFeatures.rotate(transform, 90)
          const newState: EditorState = { transform: newTransform, filters }
          setTransform(newTransform)
          history.push(newState)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'flip-h':
        {
          const newTransform = editFeatures.flipHorizontal(transform)
          const newState: EditorState = { transform: newTransform, filters }
          setTransform(newTransform)
          history.push(newState)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'flip-v':
        {
          const newTransform = editFeatures.flipVertical(transform)
          const newState: EditorState = { transform: newTransform, filters }
          setTransform(newTransform)
          history.push(newState)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'reset':
        {
          const newTransform = editFeatures.resetTransform()
          const newState: EditorState = { transform: newTransform, filters: defaultFilters }
          setTransform(newTransform)
          setFilters(defaultFilters)
          history.push(newState)
          setCanUndo(history.canUndo())
          setCanRedo(history.canRedo())
        }
        break
      case 'draw':
        setDrawingToolOpen(true)
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
      // Filter panel for adjustable filters
      case 'filters-panel':
        setFilterPanelOpen(true)
        break
      // Advanced canvas-based filters
      case 'vintage':
        requestFilterConfirmation('vintage', 'Vintage')
        break
      case 'pixelate':
        requestFilterConfirmation('pixelate', 'Pixelate')
        break
      case 'edge-detect':
        requestFilterConfirmation('edge-detect', 'Edge Detection')
        break
      case 'emboss':
        requestFilterConfirmation('emboss', 'Emboss')
        break
      case 'sharpen':
        requestFilterConfirmation('sharpen', 'Sharpen')
        break
      // Filter menu items - open filter panel
      case 'brightness':
      case 'contrast':
      case 'saturation':
      case 'grayscale':
      case 'sepia':
      case 'invert':
      case 'blur':
        setFilterPanelOpen(true)
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
      const currentState: EditorState = { transform, filters }
      const newHistory = new editFeatures.HistoryManager(currentState, prefs.undoLimit)
      setHistory(newHistory)
      setCanUndo(newHistory.canUndo())
      setCanRedo(newHistory.canRedo())
    }
  }

  const requestFilterConfirmation = (filterType: string, filterName: string) => {
    setPendingFilterType(filterType)
    setPendingFilterName(filterName)
    setConfirmFilterModalOpen(true)
  }

  const confirmApplyFilter = () => {
    setConfirmFilterModalOpen(false)
    if (pendingFilterType) {
      handleAdvancedFilter(pendingFilterType)
    }
    setPendingFilterType('')
    setPendingFilterName('')
  }

  const handleAdvancedFilter = (filterType: string) => {
    if (!canvasRef.current) return

    // Create a copy of canvas for manipulation
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasRef.current.width
    tempCanvas.height = canvasRef.current.height
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.drawImage(canvasRef.current, 0, 0)

    // Apply the filter
    switch (filterType) {
      case 'vintage':
        filterFeatures.applyVintageEffect(tempCanvas)
        break
      case 'pixelate':
        filterFeatures.applyPixelateEffect(tempCanvas, 10)
        break
      case 'edge-detect':
        filterFeatures.applyEdgeDetection(tempCanvas)
        break
      case 'emboss':
        filterFeatures.applyEmbossEffect(tempCanvas)
        break
      case 'sharpen':
        filterFeatures.applySharpenEffect(tempCanvas)
        break
    }

    // Update canvas
    const ctx = canvasRef.current.getContext('2d')!
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.drawImage(tempCanvas, 0, 0)

    // Save the filtered canvas as the new base image
    const canvasDataUrl = tempCanvas.toDataURL('image/png')
    originalImageRef.current = tempCanvas as any
    const newTransform = editFeatures.resetTransform()
    const newFilters = defaultFilters // Reset filters since they're now baked in
    
    setTransform(newTransform)
    setFilters(newFilters)
    
    if (history) {
      const newState: EditorState = { 
        transform: newTransform, 
        filters: newFilters,
        canvasDataUrl 
      }
      history.push(newState)
      setCanUndo(history.canUndo())
      setCanRedo(history.canRedo())
    }
  }

  const handleDrawingApply = (drawingCanvas: HTMLCanvasElement) => {
    if (!canvasRef.current) return

    // Update canvas with drawing
    const ctx = canvasRef.current.getContext('2d')!
    canvasRef.current.width = drawingCanvas.width
    canvasRef.current.height = drawingCanvas.height
    ctx.drawImage(drawingCanvas, 0, 0)

    // Update original reference
    originalImageRef.current = drawingCanvas as any

    // Reset transform and add to history
    const newTransform = editFeatures.resetTransform()
    setTransform(newTransform)
    if (history) {
      const newState: EditorState = { transform: newTransform, filters }
      history.push(newState)
      setCanUndo(history.canUndo())
      setCanRedo(history.canRedo())
    }
  }

  const handleFilterChange = (newFilters: filterFeatures.FilterSettings) => {
    setFilters(newFilters)
    if (history) {
      const newState: EditorState = { transform, filters: newFilters }
      history.push(newState)
      setCanUndo(history.canUndo())
      setCanRedo(history.canRedo())
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
      const newState: EditorState = { transform: newTransform, filters }
      history.push(newState)
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
      const newState: EditorState = { transform: newTransform, filters }
      history.push(newState)
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
            const newState: EditorState = { transform: newTransform, filters }
            history.push(newState)
            setCanUndo(history.canUndo())
            setCanRedo(history.canRedo())
          }
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
  }

  const handleFileNameChange = (newFileName: string) => {
    setFileName(newFileName)
  }

  return (
    <div className="h-screen flex flex-col bg-(--color-bg)">
      <TopBar fileName={fileName} onFileNameChange={handleFileNameChange} />
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
        <aside className="hidden lg:flex flex-col w-64 bg-(--color-bg-secondary) border-l border-(--color-border) overflow-y-auto pb-20">
          <div className="p-4 border-b border-(--color-border)">
            <h2 className="text-lg font-semibold text-(--color-text) mb-3">Image Details</h2>
            <div className="space-y-2 text-sm text-(--color-text-secondary)">
              <div>
                <span className="font-medium text-(--color-text)">File:</span>
                <p className="truncate">{fileName || 'untitled'}</p>
              </div>
              {canvasRef.current && (
                <>
                  <div>
                    <span className="font-medium text-(--color-text)">Dimensions:</span>
                    <p>{canvasRef.current.width} × {canvasRef.current.height}px</p>
                  </div>
                  <div>
                    <span className="font-medium text-(--color-text)">Aspect Ratio:</span>
                    <p>{(canvasRef.current.width / canvasRef.current.height).toFixed(2)}:1</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 border-b border-(--color-border)">
            <h3 className="text-sm font-semibold text-(--color-text) mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToolbarAction('undo')}
                disabled={!canUndo}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="text-xs">Undo</span>
              </button>
              <button
                onClick={() => handleToolbarAction('redo')}
                disabled={!canRedo}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
                <span className="text-xs">Redo</span>
              </button>
            </div>
            <p className="text-xs text-(--color-text-secondary) mt-2 text-center">
              {history && canUndo ? `${history.getState().past.length - 1} change${history.getState().past.length - 1 !== 1 ? 's' : ''}` : 'No changes yet'}
            </p>
          </div>

          <div className="p-4 border-b border-(--color-border)">
            <h3 className="text-sm font-semibold text-(--color-text) mb-3">Transform</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToolbarAction('rotate-left')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
                title="Rotate Left 90°"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="text-xs">Rotate ↶</span>
              </button>
              <button
                onClick={() => handleToolbarAction('rotate-right')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
                title="Rotate Right 90°"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
                <span className="text-xs">Rotate ↷</span>
              </button>
              <button
                onClick={() => handleToolbarAction('flip-h')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
                title="Flip Horizontal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-xs">Flip H</span>
              </button>
              <button
                onClick={() => handleToolbarAction('flip-v')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
                title="Flip Vertical"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-xs">Flip V</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-(--color-border)">
            <h3 className="text-sm font-semibold text-(--color-text) mb-3">Quick Export</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExportRequested('png')}
                className="w-full p-2 text-sm rounded bg-(--color-primary) text-white hover:opacity-90 transition-opacity"
              >
                Export as PNG
              </button>
              <button
                onClick={() => handleExportRequested('jpeg')}
                className="w-full p-2 text-sm rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
              >
                Export as JPEG
              </button>
              <button
                onClick={() => handleExportRequested('webp')}
                className="w-full p-2 text-sm rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
              >
                Export as WebP
              </button>
            </div>
          </div>

          <div className="p-4 mt-auto">
            <div className="space-y-2">
              <button
                onClick={() => handleToolbarAction('reset')}
                className="w-full p-2 text-sm rounded bg-(--color-bg) border border-(--color-border) hover:bg-(--color-bg-secondary) transition-colors"
              >
                Reset All Changes
              </button>
              <button
                onClick={() => { setDirty(false); navigate('/') }}
                className="w-full p-2 text-sm rounded bg-(--color-accent) text-white hover:opacity-90 transition-opacity"
              >
                Finish & Return Home
              </button>
            </div>
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
        <DrawingTool isOpen={drawingToolOpen} onClose={() => setDrawingToolOpen(false)} onApply={handleDrawingApply} sourceCanvas={canvasRef.current} />
        <FilterPanel isOpen={filterPanelOpen} onClose={() => setFilterPanelOpen(false)} onFilterChange={handleFilterChange} currentFilters={filters} />
        <PreferencesModal isOpen={preferencesModalOpen} onClose={() => setPreferencesModalOpen(false)} onPreferencesChange={handlePreferencesChange} />
        <ExportQualityModal isOpen={exportQualityModalOpen} onClose={() => setExportQualityModalOpen(false)} />
        <ConfirmFilterModal 
          isOpen={confirmFilterModalOpen} 
          filterName={pendingFilterName}
          onConfirm={confirmApplyFilter}
          onCancel={() => {
            setConfirmFilterModalOpen(false)
            setPendingFilterType('')
            setPendingFilterName('')
          }}
        />
        <ExportConfirmModal
          isOpen={exportConfirmOpen}
          format={pendingExportFormat}
          fileName={fileName}
          onConfirm={handleExportConfirm}
          onCancel={() => setExportConfirmOpen(false)}
        />
        
        <EditorToolbar onMenuAction={handleToolbarAction} onExportRequested={handleExportRequested} onUploadRequested={handleUploadNew} canvasRef={canvasRef} fileName={fileName} canUndo={canUndo} canRedo={canRedo} />
      </main>
    </div>
  )
}