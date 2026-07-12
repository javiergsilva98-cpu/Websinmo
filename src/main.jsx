import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.jsx'
import './styles/global.css'

// Registro único para toda la app (antes se repetía, de forma inofensiva
// pero redundante, en cada archivo que usaba ScrollTrigger).
gsap.registerPlugin(ScrollTrigger)
// La barra de URL de iOS/Android dispara resize al colapsar; sin esto
// ScrollTrigger recalcula todo en pleno scroll y la página "salta".
ScrollTrigger.config({ ignoreMobileResize: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
