import { useEffect, useRef } from 'react'
import ScrollVideo from '../components/ScrollVideo.jsx'
import Scenes from '../components/Scenes.jsx'
import { initSmoothScroll } from '../lib/smoothScroll.js'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import {
  VIDEO_SRC,
  VIDEO_POSTER,
  SCENES,
  SCROLL_LENGTH_LVH,
} from '../config/content.js'

/** /inmobiliario/una-casa-frente-al-mar */
export default function CasaFrenteAlMar() {
  const trackRef = useRef(null)
  // Coincide con el <title>/OG por defecto de index.html (la página que
  // más se comparte): se fija aquí también para que quede correcto
  // aunque el usuario llegue navegando desde otra ruta de la SPA.
  useDocumentTitle('Una casa frente al mar — Proyecto de interiorismo')

  useEffect(() => {
    // La experiencia es una secuencia: siempre empieza por el principio,
    // sin que el navegador restaure el scroll a mitad al recargar.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const getSnapPoints = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return []
      return SCENES.map((s) => s.snap * max)
    }
    const { destroy } = initSmoothScroll(getSnapPoints)
    return destroy
  }, [])

  return (
    <>
      <ScrollVideo src={VIDEO_SRC} poster={VIDEO_POSTER} trackRef={trackRef} />
      <Scenes scenes={SCENES} trackRef={trackRef} />
      {/* Track invisible: su altura define la longitud (y lentitud) del scrubbing */}
      <div
        ref={trackRef}
        className="scroll-track"
        style={{ height: `${SCROLL_LENGTH_LVH}lvh` }}
      />
    </>
  )
}
