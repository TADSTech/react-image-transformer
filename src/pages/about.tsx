import { useNavigate } from 'react-router-dom'
import { Github, Globe, ArrowLeft } from 'lucide-react'
import { useScrollbarStyles } from 'stylisticscroll/react';

export default function About() {
    useScrollbarStyles({ hideScrollbar: true });
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-(--color-bg) flex flex-col">
      <header className="border-b border-(--color-border) p-4 sticky top-0 z-40 bg-(--color-bg)">
        <div className="max-w-3xl mx-2 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-(--color-text) hover:text-(--color-primary) transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
         </div>
      </header>

      <div className="flex-1 p-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-8">
        
          <section className="text-center py-8">
            <h2 className="text-4xl font-bold text-(--color-primary) mb-2">RI-Transformer</h2>
            <p className="text-lg text-(--color-text-secondary)">Reactive Image Transformer</p>
            <p className="text-sm text-(--color-text-secondary) mt-1">Version 1.0.0</p>
          </section>


          <section className="p-6 bg-(--color-bg-secondary) rounded-lg">
            <h3 className="text-xl font-semibold text-(--color-text) mb-3">About</h3>
            <p className="text-(--color-text-secondary) leading-relaxed">
              A modern, web-based image editor built with React and TypeScript. Transform, edit, and export
              your images with an intuitive interface and powerful tools. RI-Transformer is designed to be
              fast, responsive, and easy to use, whether you're working on a desktop or mobile device.
            </p>
          </section>

          <section className="p-6 bg-(--color-bg-secondary) rounded-lg">
            <h3 className="text-xl font-semibold text-(--color-text) mb-4">Features</h3>
            <ul className="text-(--color-text-secondary) space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Real-time image transformations with instant preview</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Undo/Redo with configurable history management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Crop, Resize, and Compress tools with interactive controls</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Multiple export formats (PNG, JPEG, WebP) with quality control</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Dark/Light theme support with persistent preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-(--color-primary) font-bold mt-1">✓</span>
                <span>Fully responsive design for desktop, tablet, and mobile</span>
              </li>
            </ul>
          </section>

          <section className="p-6 bg-(--color-bg-secondary) rounded-lg">
            <h3 className="text-xl font-semibold text-(--color-text) mb-4">Technologies</h3>
            <div className="flex flex-wrap gap-3">
              {['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Canvas API', 'React Router'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-(--color-bg) text-(--color-text) rounded-lg text-sm font-medium border border-(--color-border)"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>


          <section className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/tadstech/react-image-transformer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-(--color-primary) text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Github className="w-5 h-5" />
              GitHub Repository
            </a>
            <a
              href="https://tadstech.web.app"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-(--color-secondary) text-primary rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Globe className="w-5 h-5" />
              Visit Website
            </a>
          </section>

          <section className="text-center py-2 border-t border-(--color-border)">
            <p className="text-xs text-(--color-text-secondary)">
              © 2025 Reactive Image Transformer. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
