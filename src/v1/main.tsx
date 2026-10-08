import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

export function mount(el: HTMLElement) {
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
