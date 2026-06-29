import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeLangProvider } from './context/ThemeLangProvider'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeLangProvider>
      <App />
    </ThemeLangProvider>
  </StrictMode>,
)
