import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Editor from './pages/editor'
import About from './pages/about'
import App from './App'
import { UnsavedProvider } from './contexts/UnsavedContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnsavedProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<div className="p-4">404 - Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </UnsavedProvider>
  </StrictMode>,
)
