import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Menangkap `beforeinstallprompt` sedini mungkin, sebelum halaman mana pun dimuat.
import './lib/pwa-install'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
