import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

createRoot(document.getElementById("root")!).render(<App>());

// Service worker powers the installable PWA (offline shell). Registered only
// in production so it never caches dev-server assets.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is a progressive enhancement; never block the app.
    });
  });
}
