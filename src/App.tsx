import './App.css'
import { useEffect, useState } from 'react'
import { FileUploader } from './components/Dropzone'
import { useNavigate } from 'react-router-dom'
import { UnsavedProvider, useUnsaved } from './contexts/UnsavedContext'
import { Dialog } from './components/Dialog'
import { motion } from 'motion/react'
import { Sparkles, Zap, ImageIcon, Wand2, Crop, Paintbrush, UploadCloud, Download } from 'lucide-react'
import { useScrollbarStyles } from 'stylisticscroll/react';

function InnerApp() {

  useScrollbarStyles({ color: '#6366f1', width: '8px'});
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
    <main className="min-h-screen px-4 relative overflow-hidden">
      <div className="w-full max-w-5xl relative z-10 mx-auto py-12">
        <motion.header 
          className="flex items-center justify-between py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <motion.h1 
              className="text-4xl font-bold text-(--color-primary)"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% auto' }}
            >
              React Image Transform
            </motion.h1>
            <p className="text-sm text-(--color-text-secondary) mt-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Upload, edit, and transform your images with powerful tools
            </p>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-(--color-primary) rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Upload image</h2>
            </div>
            <p className="text-(--color-text-secondary) mb-6">
              Drop a single image file or click to select one. Supported formats include PNG, JPG, JPEG, HEIF, WEBP and GIF.
            </p>
            <FileUploader onFileUpload={handleFileUpload} />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card p-6 border-2 border-transparent hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-(--color-primary)/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <strong><p className="font-semibold text-lg">Selected file</p></strong>
                </div>
                
                <div className="flex gap-3 mt-3">
                  <motion.button 
                    className="btn-secondary flex-1"
                    onClick={() => { setFileName(null); setPreviewUrl(null); setDirty(false); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Selection
                  </motion.button>
                  <motion.button
                    className="btn-accent flex-1 relative overflow-hidden group"
                    onClick={() => requestNavigation(() => navigate('/editor', { state: { previewUrl, fileName } }))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      Edit Image
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-(--color-primary)"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                </div>
                
                {fileName ? (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-(--color-text-secondary) text-sm mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {fileName}
                    </p>
                    {previewUrl ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative group"
                      >
                        <img 
                          src={previewUrl} 
                          alt="preview" 
                          className="mt-3 w-full h-auto max-h-80 object-contain rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300" 
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      </motion.div>
                    ) : null}
                  </motion.div>
                ) : (
                  <div className="mt-4 p-8 border-2 border-dashed border-(--color-border) rounded-lg text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-(--color-text-secondary) opacity-50 mb-2" />
                    <p className="text-(--color-text-secondary)">No file selected</p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </section>

        <motion.section
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div 
            className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-(--color-primary) rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Advanced Filters</h3>
            <p className="text-sm text-(--color-text-secondary)">
              Apply vintage, pixelate, edge detection, emboss, and sharpen effects
            </p>
          </motion.div>

          <motion.div 
            className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-(--color-primary) rounded-xl flex items-center justify-center">
              <Crop className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Powerful Tools</h3>
            <p className="text-sm text-(--color-text-secondary)">
              Crop, resize, rotate, flip, and compress your images with ease
            </p>
          </motion.div>

          <motion.div 
            className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-(--color-primary) rounded-xl flex items-center justify-center">
              <Paintbrush className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Drawing Tools</h3>
            <p className="text-sm text-(--color-text-secondary)">
              Annotate images with pen, eraser, custom colors, and brush sizes
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-2">1. Upload</h3>
              <p className="text-sm text-(--color-text-secondary)">
                Drag and drop your image file or click to select one from your device.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-2">2. Edit</h3>
              <p className="text-sm text-(--color-text-secondary)">
                Use the powerful tools to crop, filter, annotate, and transform your image in real-time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-xl mb-2">3. Export</h3>
              <p className="text-sm text-(--color-text-secondary)">
                Once you're happy, export your masterpiece in PNG, JPEG, or WebP format.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-lg mb-2">What file formats do you support?</h3>
              <p className="text-sm text-(--color-text-secondary) mb-0">
                We currently support PNG, JPG, JPEG, HEIF, WEBP, and GIF. We are always working to add more formats.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
              <p className="text-sm text-(--color-text-secondary) mb-0">
                Absolutely. All image processing is done 100% in your browser. Your files are never uploaded to any server, ensuring your data remains private.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-lg mb-2">Is this tool really free?</h3>
              <p className="text-sm text-(--color-text-secondary) mb-0">
                Yes. This tool is completely free to use. No subscriptions, no watermarks, and no hidden fees.
              </p>
            </div>
          </div>
        </motion.section>

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