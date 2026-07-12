import { useEffect, useRef } from 'react'
import ScrollVideo from '../components/ScrollVideo.jsx'
import HomeOverlay from './HomeOverlay.jsx'
import { initSmoothScroll } from '../lib/smoothScroll.js'
import {
  HOME_VIDEO_SRC,
  HOME_VIDEO_POSTER,
  HOME_SCROLL_LENGTH_LVH,
} from '../config/home.js'

/** / — índice de categorías, con scroll-scrubbing sobre el vídeo del portátil */
export default function Home() {
  const trackRef = useRef(null)

  useEffect(() => {
    // La experiencia es una secuencia: siempre empieza por el principio,
    // sin que el navegador restaure el scroll a mitad al recargar.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    // Dos únicos puntos de imán: arriba (intro) y abajo (categorías reveladas).
    const getSnapPoints = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return []
      return [0, max]
    }
    const { destroy } = initSmoothScroll(getSnapPoints)
    return destroy
  }, [])

  return (
    <>
      <ScrollVideo src={HOME_VIDEO_SRC} poster={HOME_VIDEO_POSTER} trackRef={trackRef} />
      <HomeOverlay trackRef={trackRef} />
      {/* Track invisible: su altura define la longitud (y lentitud) del scrubbing */}
      <div
        ref={trackRef}
        className="scroll-track"
        style={{ height: `${HOME_SCROLL_LENGTH_LVH}lvh` }}
      />
    </>
  )
}
