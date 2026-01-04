import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs'
import { join } from 'path'

// Plugin to copy data files
const copyDataFiles = () => {
  return {
    name: 'copy-data-files',
    buildStart() {
      // Copy data files to public for dev server
      const dataFiles = [
        { from: 'data/entries.json', to: 'public/data/entries.json' },
        { from: 'data/stats.json', to: 'public/data/stats.json' },
        { from: 'data/weeks.json', to: 'public/data/weeks.json' },
        { from: 'config/books.json', to: 'public/config/books.json' }
      ]
      
      dataFiles.forEach(({ from, to }) => {
        const fromPath = join(process.cwd(), from)
        const toPath = join(process.cwd(), to)
        if (existsSync(fromPath)) {
          mkdirSync(join(toPath, '..'), { recursive: true })
          copyFileSync(fromPath, toPath)
        }
      })
    },
    closeBundle() {
      // Copy data and config directories to dist after build
      const distPath = join(process.cwd(), 'dist')
      if (existsSync('data')) {
        cpSync('data', join(distPath, 'data'), { recursive: true })
      }
      if (existsSync('config')) {
        cpSync('config', join(distPath, 'config'), { recursive: true })
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyDataFiles()],
  base: '/journal/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
})

