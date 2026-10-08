import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

export function mount(el: HTMLElement) {
  //  The canon's two theme axes. Light + blue is the pane and hue v1 used.
  document.documentElement.dataset.theme = 'light'
  document.documentElement.dataset.brand = 'blue'
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
