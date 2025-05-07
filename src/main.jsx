import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Disable StrictMode temporarily to avoid double-rendering in development
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
