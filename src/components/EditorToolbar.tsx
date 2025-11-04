import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  File, 
  Edit3Icon, 
  Crop, 
  Palette, 
  Settings
} from 'lucide-react'
import { fileFeatures } from '../features'

export interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  items?: SubMenuItem[]
}

export interface SubMenuItem {
  id: string
  label: string
  action?: () => void
  divider?: boolean
}

interface EditorToolbarProps {
  onMenuAction?: (actionId: string) => void
  onExportRequested?: (format: 'png' | 'jpeg' | 'webp') => void
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
  fileName?: string
  canUndo?: boolean
  canRedo?: boolean
}
 
export function EditorToolbar({ onMenuAction, onExportRequested, canvasRef, fileName, canUndo, canRedo }: EditorToolbarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }

  const handleMenuItemClick = (item: SubMenuItem) => {
    if (['save', 'export-png', 'export-jpg', 'export-webp', 'upload-new'].includes(item.id)) {
      handleFileAction(item.id)
    } else if (onMenuAction) {
      onMenuAction(item.id)
    }
    if (item.action) {
      item.action()
    }
    setActiveMenu(null)
  }

  const handleBackdropClick = () => {
    setActiveMenu(null)
  }

  const handleFileAction = async (actionId: string) => {
    const canvas = canvasRef?.current
    if (!canvas && actionId !== 'upload-new') {
      console.warn('No canvas available for export')
      return
    }

    try {
      switch (actionId) {
        case 'save':
          if (canvas) await fileFeatures.saveCanvasAs(canvas, fileName || 'image.png')
          break
        case 'export-png':
          if (onExportRequested) onExportRequested('png')
          break
        case 'export-jpg':
          if (onExportRequested) onExportRequested('jpeg')
          break
        case 'export-webp':
          if (onExportRequested) onExportRequested('webp')
          break
        case 'upload-new':
          fileFeatures.triggerUpload(() => {
            if (onMenuAction) onMenuAction('upload-new')
          })
          break
      }
    } catch (e) {
      console.error('File action error:', e)
    }
  }

  const TOOLBAR_MENUS: MenuItem[] = [
    { 
      id: 'file', 
      label: 'File', 
      icon: <File className="w-5 h-5" />,
      items: [
        { id: 'save', label: 'Save Image' },
        { id: 'export-png', label: 'Export as PNG' },
        { id: 'export-jpg', label: 'Export as JPG' },
        { id: 'export-webp', label: 'Export as WebP' },
        { id: 'div1', label: '', divider: true },
        { id: 'upload-new', label: 'Upload New' },
      ]
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Edit3Icon className="w-5 h-5" />,
      items: [
        { id: 'undo', label: 'Undo' },
        { id: 'redo', label: 'Redo' },
        { id: 'div1', label: '', divider: true },
        { id: 'rotate-left', label: 'Rotate Left' },
        { id: 'rotate-right', label: 'Rotate Right' },
        { id: 'flip-h', label: 'Flip Horizontal' },
        { id: 'flip-v', label: 'Flip Vertical' },
        { id: 'div2', label: '', divider: true },
        { id: 'reset', label: 'Reset All' },
      ]
    },
    { 
      id: 'filters', 
      label: 'Filters', 
      icon: <Palette className="w-5 h-5" />,
      items: [
        { id: 'filters-panel', label: 'Adjust Filters' },
        { id: 'div1', label: '', divider: true },
        { id: 'vintage', label: 'Vintage' },
        { id: 'pixelate', label: 'Pixelate' },
        { id: 'edge-detect', label: 'Edge Detection' },
        { id: 'emboss', label: 'Emboss' },
        { id: 'sharpen', label: 'Sharpen' },
      ]
    },
    { 
      id: 'tools', 
      label: 'Tools', 
      icon: <Crop className="w-5 h-5" />,
      items: [
        { id: 'draw', label: 'Draw / Pen' },
        { id: 'div1', label: '', divider: true },
        { id: 'crop', label: 'Crop' },
        { id: 'resize', label: 'Resize' },
        { id: 'compress', label: 'Compress' },
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" />,
      items: [
        { id: 'preferences', label: 'Preferences' },
        { id: 'quality', label: 'Export Quality' },
        { id: 'div1', label: '', divider: true },
        { id: 'about', label: 'About' },
      ]
    },
  ]

  return (
    <>
      <AnimatePresence>
        {activeMenu && (
          <motion.div 
            className="fixed inset-0 z-40 bg-transparent" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleBackdropClick} 
          />
        )}
      </AnimatePresence>
      
      <motion.nav 
        initial={{ y: 100 }} 
        animate={{ y: 0 }} 
        transition={{ type: 'spring', stiffness: 100, damping: 20 }} 
        className="fixed bottom-0 left-0 right-0 z-50 bg-(--color-bg) border-t border-(--color-border) shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-full">
          {TOOLBAR_MENUS.map((menu) => (
            <div key={menu.id} className="relative flex-1 max-w-32">
              <motion.button 
                className={`flex flex-col items-center gap-1 w-full px-2 py-2 rounded-lg transition-colors duration-150 ${
                  activeMenu === menu.id ? 'bg-(--color-bg-secondary) text-(--color-primary)' : 'text-(--color-text-secondary)'
                }`}
                onClick={() => handleMenuClick(menu.id)}
                whileHover={{ backgroundColor: 'var(--color-bg-secondary)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {menu.icon}
                <span className="text-xs font-medium">{menu.label}</span>
              </motion.button>
              
              <AnimatePresence>
                {activeMenu === menu.id && menu.items && (
                  <motion.div 
                    className="absolute bottom-full mb-2 min-w-48 max-w-xs bg-(--color-bg) border border-(--color-border) rounded-lg shadow-xl p-1.5 z-50"
                    style={{
                      ...(menu.id === 'tools' && { left: '-35%'}),
                      ...(menu.id === 'settings' && { right: '0' }),
                      ...(menu.id === 'file' && { left: '0' }),
                      ...(['edit', 'filters'].includes(menu.id) && { left: '50%', transform: 'translateX(-50%)' }),
                    }}
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }} 
                    transition={{ duration: 0.15 }}
                  >
                    {menu.items.map((item) => 
                      item.divider ? (
                        <div key={item.id} className="h-px bg-(--color-border) my-1" />
                      ) : (
                        <motion.button 
                          key={item.id} 
                          className={`flex items-center w-full px-3 py-2 bg-transparent rounded-md text-sm cursor-pointer text-left transition-colors duration-100 ${
                            ((item.id === 'undo' && !canUndo) || (item.id === 'redo' && !canRedo))
                              ? 'text-(--color-text-secondary) opacity-40 cursor-not-allowed'
                              : 'text-(--color-text) hover:bg-(--color-primary) hover:text-white'
                          }`}
                          onClick={() => handleMenuItemClick(item)}
                          disabled={(item.id === 'undo' && !canUndo) || (item.id === 'redo' && !canRedo)}
                          whileHover={
                            !((item.id === 'undo' && !canUndo) || (item.id === 'redo' && !canRedo))
                              ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                              : {}
                          }
                          transition={{ duration: 0.1 }}
                        >
                          <span>{item.label}</span>
                        </motion.button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.nav>
    </>
  )
}
