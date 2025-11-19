import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { checkAuth } from './utils/authUtils.js'

// Check auth on app load
checkAuth().catch(err => console.error('Auth check error:', err));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
