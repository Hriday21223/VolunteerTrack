import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { applyStoredTheme } from './hooks/useTheme.js'

applyStoredTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/VolunteerTrack">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)